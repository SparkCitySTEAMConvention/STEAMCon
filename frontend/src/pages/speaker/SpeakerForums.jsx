import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import AccountNavigation from '../../auth/AccountNavigation.jsx'
import { forumRepository } from '../../services/forumRepository.js'
import { createSpeakerForumSource } from '../../services/speakerForumSource.js'
import logo from '../../assets/steamcon-logo.png'
import './SpeakerDashboard.css'
import './SpeakerForums.css'

const scopes = { TRACK: 'Track', ADMIN: 'Admin', CONCIERGE: 'Concierge' }

export default function SpeakerForums({ repository = forumRepository }) {
  const { user, authSource } = useAuth()
  const source = useMemo(() => createSpeakerForumSource(repository, user, authSource), [repository, user, authSource])
  const [scope, setScope] = useState('')
  const [forums, setForums] = useState([])
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  useEffect(() => {
    let current = true
    source.getForums(scope || undefined).then(data => {
      if (!current) return
      if (!Array.isArray(data)) throw new Error('Invalid forum response.')
      setForums(data)
      setStatus('ready')
    }).catch(() => { if (current) setStatus('error') })
    return () => { current = false }
  }, [source, scope, attempt])
  const selected = forums.find(forum => forum.id === selectedId)
  function reload(nextScope = scope) {
    setScope(nextScope)
    setSelectedId(null)
    setForums([])
    setStatus('loading')
    setAttempt(value => value + 1)
  }
  return <div className="speaker-portal speaker-forums">
    <a className="skip-link" href="#forums-main">Skip to content</a>
    <header className="portal-header">
      <div className="container portal-header-inner">
        <div className="portal-brand"><Link to="/" aria-label="STEAM Con home"><img src={logo} width="1828" height="860" alt="STEAM Con" /></Link><span>Speaker Portal</span></div>
        <Link className="portal-home" to="/speaker">Back to speaker dashboard</Link>
      </div>
      <div className="container"><AccountNavigation /></div>
    </header>
    <main id="forums-main" className="container portal-main" tabIndex={-1}>
      <div className="portal-welcome"><p className="eyebrow">Keep the conversation going</p><h1>Speaker Forum &amp; Messaging</h1><p>Exchange ideas in track forums, connect with organizers, or ask the concierge for help.</p></div>
      {source.demo && <p className="portal-demo">Demo forum examples. Messages stay in memory until you leave this page. No forum requests are sent to the backend.</p>}
      {!source.available && <p role="alert">Forum access requires a backend-authenticated speaker with a valid user ID. The current backend login does not supply speaker roles.</p>}
      <fieldset className="portal-filters forum-scopes"><legend>Forum scope</legend>
        {[['', 'All forums'], ...Object.entries(scopes)].map(([value, label]) => <button key={value} type="button" aria-pressed={scope === value} onClick={() => reload(value)}>{label}</button>)}
      </fieldset>
      {status === 'loading' && <p role="status">Loading forums…</p>}
      {status === 'error' && <div role="alert"><p>Unable to load forums. The service may be unavailable.</p><button className="button button-paper" onClick={() => reload()}>Try again</button></div>}
      {status === 'ready' && <div className="forum-layout">
        <nav className="forum-directory" aria-label="Forums"><h2>Forums</h2>
          {forums.length ? <ul className="portal-list">{forums.map(forum => <li key={forum.id}><button type="button" aria-current={selectedId === forum.id ? 'true' : undefined} onClick={() => setSelectedId(forum.id)}><span className="eyebrow">{scopes[forum.scope] || forum.scope}</span><strong>{forum.name}</strong>{forum.trackId && <span className="portal-muted">Track ID: {forum.trackId}</span>}</button></li>)}</ul> : <p>No forums are available in this scope.</p>}
        </nav>
        {selected ? <ForumConversation key={`${selected.id}-${authSource}-${user?.id}`} forum={selected} user={user} repository={source} /> : <section className="portal-empty"><h2>Your next conversation starts here.</h2><p>Select a forum to read and post messages. Access depends on the forum’s permissions.</p></section>}
      </div>}
    </main>
    <footer className="container portal-footer"><p>STEAM Con · A place for curious minds.</p><p>Speaker Forum &amp; Messaging</p></footer>
  </div>
}

function ForumConversation({ forum, user, repository }) {
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const canPost = repository.available
  const pending = useRef(false)
  useEffect(() => {
    let current = true
    repository.getMessages(forum.id).then(data => {
      if (!current) return
      setMessages(data.filter(message => message.status === 'ACTIVE').sort((a, b) => Date.parse(a.postedAt) - Date.parse(b.postedAt)))
      setStatus('ready')
    }).catch(() => { if (current) setStatus('error') })
    return () => { current = false }
  }, [forum.id, repository, attempt])
  async function post(event) {
    event.preventDefault()
    if (pending.current || !canPost || !body.trim()) return
    pending.current = true
    setSending(true)
    setError('')
    setNotice('')
    try {
      const message = await repository.createMessage(forum.id, { body })
      if (!message?.id || message.forumId !== forum.id || typeof message.body !== 'string') throw new Error('Invalid message response.')
      setMessages(previous => [...previous.filter(item => item.id !== message.id), message])
      setBody('')
      setNotice(repository.demo ? 'Demo message posted locally.' : 'Message posted.')
    } catch { setError('Your message was not posted. Check your forum access or try again. Your draft has been kept.') }
    finally { pending.current = false; setSending(false) }
  }
  return <section className="forum-conversation" aria-labelledby="conversation-heading">
    <p className="eyebrow">{scopes[forum.scope] || forum.scope} forum</p><h2 id="conversation-heading">{forum.name}</h2>
    {status === 'loading' && <p role="status">Loading messages…</p>}
    {status === 'error' && <div role="alert"><p>Unable to load messages. This forum may require READ access, or the service may be unavailable.</p><button className="button button-paper" onClick={() => { setStatus('loading'); setAttempt(value => value + 1) }}>Try again</button></div>}
    {status === 'ready' && <>
      {messages.length ? <ol className="portal-list forum-messages">{messages.filter(message => message.status === 'ACTIVE').map(message => {
        const date = new Date(message.postedAt)
        return <li key={message.id} className="forum-message"><div className="forum-message-meta"><strong>{message.authorId === user.id ? 'You' : `Author ${message.authorId}`}</strong>{Number.isFinite(date.getTime()) && <time dateTime={message.postedAt}>{date.toLocaleString()}</time>}</div>{message.speakerFlairId && <p className="portal-muted">Speaker flair ID: {message.speakerFlairId}</p>}<p className="forum-message-body">{message.body}</p></li>
      })}</ol> : <div className="portal-empty"><h3>Start the conversation.</h3><p>There are no active messages in this forum yet.</p></div>}
      <form className="portal-editor" onSubmit={post} aria-busy={sending}>
        <label htmlFor="forum-message">Your message<textarea id="forum-message" rows={5} value={body} onChange={event => { setBody(event.target.value); setNotice('') }} required disabled={sending || !canPost} aria-describedby="forum-post-help" /></label>
        <p id="forum-post-help" className="portal-muted">{repository.demo ? 'This message will be added to the local demo conversation.' : canPost ? 'Posting requires POST permission for this forum.' : 'Posting requires a verified backend speaker account with a valid author ID.'}</p>
        <div><button className="button button-dark" type="submit" disabled={sending || !canPost || !body.trim()}>{sending ? 'Posting…' : 'Post message'}</button></div>
        <p role="status">{notice}</p>{error && <p role="alert">{error}</p>}
      </form>
    </>}
  </section>
}
