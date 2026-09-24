import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import AccountNavigation from '../../auth/AccountNavigation.jsx'
import { forumRepository } from '../../services/forumRepository.js'
import logo from '../../assets/steamcon-logo.png'
import './AttendeeDashboard.css'
import './AttendeeForums.css'

const scopes = { TRACK: 'Track', ADMIN: 'Organizer', CONCIERGE: 'Concierge' }

export default function AttendeeForums({ repository = forumRepository }) {
  const { user } = useAuth()
  const [scope, setScope] = useState('')
  const [forums, setForums] = useState([])
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    let current = true
    setStatus('loading')
    repository.getForums(scope || undefined)
      .then(data => {
        if (!current) return
        if (!Array.isArray(data)) throw new Error('Invalid forum response.')
        setForums(data)
        setSelectedId(previous => data.some(forum => forum.id === previous) ? previous : (data[0]?.id ?? null))
        setStatus('ready')
      })
      .catch(() => {
        if (current) setStatus('error')
      })

    return () => { current = false }
  }, [repository, scope, attempt])

  const selected = forums.find(forum => forum.id === selectedId)

  function changeScope(nextScope) {
    setScope(nextScope)
    setSelectedId(null)
    setForums([])
  }

  return (
    <div className="attendee-portal attendee-forums">
      <a className="skip-link" href="#forums-main">Skip to content</a>

      <header className="attendee-header">
        <div className="container attendee-header-top">
          <div className="attendee-brand">
            <Link to="/" aria-label="STEAM Con home">
              <img src={logo} width="1828" height="860" alt="STEAM Con" />
            </Link>
            <span>Attendee Portal</span>
          </div>
          <nav className="attendee-nav" aria-label="Attendee navigation">
            <Link to="/attendee">Dashboard</Link>
            <Link to="/attendee/forums" aria-current="page">Forums &amp; Messaging</Link>
            <Link to="/events">Events</Link>
            <Link to="/">Homepage <span aria-hidden="true">↗</span></Link>
          </nav>
        </div>
        <div className="container"><AccountNavigation /></div>
      </header>

      <main id="forums-main" className="container attendee-main" tabIndex={-1}>
        <section className="attendee-welcome" aria-labelledby="forums-heading">
          <div>
            <p className="eyebrow">Community</p>
            <h1 id="forums-heading">Forums &amp; Messaging</h1>
            <p>Join track conversations, ask the concierge for help, and keep up with the STEAM Con community.</p>
          </div>
          <Link className="button button-paper" to="/attendee">Back to dashboard</Link>
        </section>

        <fieldset className="attendee-filters forum-scopes">
          <legend>Forum scope</legend>
          {[['', 'All forums'], ...Object.entries(scopes)].map(([value, label]) => (
            <button
              key={value}
              className={scope === value ? 'is-active' : ''}
              type="button"
              aria-pressed={scope === value}
              onClick={() => changeScope(value)}
            >
              {label}
            </button>
          ))}
        </fieldset>

        {status === 'loading' && <p role="status">Loading forums…</p>}

        {status === 'error' && (
          <div className="forum-alert" role="alert">
            <p>Unable to load forums from the backend.</p>
            <button className="button button-paper" type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button>
          </div>
        )}

        {status === 'ready' && (
          <div className="forum-layout">
            <nav className="forum-directory" aria-label="Forums">
              <h2>Forums</h2>
              {forums.length ? (
                <ul>
                  {forums.map(forum => (
                    <li key={forum.id}>
                      <button
                        type="button"
                        aria-current={selectedId === forum.id ? 'true' : undefined}
                        onClick={() => setSelectedId(forum.id)}
                      >
                        <span className="eyebrow">{scopes[forum.scope] || forum.scope}</span>
                        <strong>{forum.name}</strong>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p>No forums are available in this scope.</p>}
            </nav>

            {selected ? (
              <ForumConversation
                key={selected.id}
                forum={selected}
                currentUserId={user?.id}
                repository={repository}
              />
            ) : (
              <section className="forum-empty">
                <h2>Select a forum</h2>
                <p>Choose a conversation to read messages and join in.</p>
              </section>
            )}
          </div>
        )}
      </main>

      <footer className="container attendee-footer">
        <p>STEAM Con · A place for curious minds.</p>
        <p>Attendee Portal / Forums</p>
      </footer>
    </div>
  )
}

function ForumConversation({ forum, currentUserId, repository }) {
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const pending = useRef(false)

  useEffect(() => {
    let current = true
    setStatus('loading')
    setError('')

    repository.getMessages(forum.id)
      .then(data => {
        if (!current) return
        if (!Array.isArray(data)) throw new Error('Invalid message response.')
        setMessages(data
          .filter(message => message.status === 'ACTIVE')
          .sort((a, b) => Date.parse(a.postedAt) - Date.parse(b.postedAt)))
        setStatus('ready')
      })
      .catch(() => {
        if (current) setStatus('error')
      })

    return () => { current = false }
  }, [forum.id, repository, attempt])

  async function postMessage(event) {
    event.preventDefault()
    if (pending.current || !body.trim()) return

    pending.current = true
    setSending(true)
    setError('')
    setNotice('')

    try {
      const message = await repository.createMessage(forum.id, { body })
      if (!message?.id || message.forumId !== forum.id || typeof message.body !== 'string') {
        throw new Error('Invalid message response.')
      }
      setMessages(previous => [...previous.filter(item => item.id !== message.id), message])
      setBody('')
      setNotice('Message posted.')
    } catch {
      setError('Your message was not posted. This forum may be restricted, or the service may be unavailable. Your draft has been kept.')
    } finally {
      pending.current = false
      setSending(false)
    }
  }

  return (
    <section className="forum-conversation" aria-labelledby="conversation-heading">
      <p className="eyebrow">{scopes[forum.scope] || forum.scope} forum</p>
      <h2 id="conversation-heading">{forum.name}</h2>

      {status === 'loading' && <p role="status">Loading messages…</p>}

      {status === 'error' && (
        <div className="forum-alert" role="alert">
          <p>Unable to read this forum. Your account may not have access.</p>
          <button className="button button-paper" type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button>
        </div>
      )}

      {status === 'ready' && (
        <>
          {messages.length ? (
            <ol className="forum-messages">
              {messages.map(message => {
                const date = new Date(message.postedAt)
                return (
                  <li key={message.id} className="forum-message">
                    <div className="forum-message-meta">
                      <strong>{message.authorId === currentUserId ? 'You' : 'STEAM Con member'}</strong>
                      {Number.isFinite(date.getTime()) && <time dateTime={message.postedAt}>{date.toLocaleString()}</time>}
                    </div>
                    {message.speakerFlairId && <p className="forum-flair">Speaker</p>}
                    <p className="forum-message-body">{message.body}</p>
                  </li>
                )
              })}
            </ol>
          ) : (
            <div className="forum-empty">
              <h3>Start the conversation.</h3>
              <p>There are no active messages in this forum yet.</p>
            </div>
          )}

          <form className="forum-editor" onSubmit={postMessage} aria-busy={sending}>
            <label htmlFor="attendee-forum-message">
              Your message
              <textarea
                id="attendee-forum-message"
                rows={5}
                value={body}
                onChange={event => { setBody(event.target.value); setNotice(''); setError('') }}
                required
                disabled={sending}
              />
            </label>
            <div className="forum-editor-actions">
              <button className="button button-dark" type="submit" disabled={sending || !body.trim()}>
                {sending ? 'Posting…' : 'Post message'}
              </button>
            </div>
            {notice && <p className="forum-success" role="status">{notice}</p>}
            {error && <p role="alert">{error}</p>}
          </form>
        </>
      )}
    </section>
  )
}
