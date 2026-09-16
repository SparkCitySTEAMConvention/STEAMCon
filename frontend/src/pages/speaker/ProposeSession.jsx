import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import AccountNavigation from '../../auth/AccountNavigation.jsx'
import { speakerRepository } from '../../services/speakerRepository.js'
import { eventRepository } from '../../services/eventRepository.js'
import { getSpeakerProposalSource, validateProposal, proposalTextLimit } from '../../services/speakerProposalSource.js'
import useSpeakerResource from '../../hooks/useSpeakerResource.js'
import './SpeakerDashboard.css'

export default function ProposeSession() {
  const { user, authSource, hasBackendSession } = useAuth()
  const source = useMemo(() => getSpeakerProposalSource(speakerRepository, eventRepository, user, authSource, hasBackendSession), [user, authSource, hasBackendSession])
  return <ProposalForm key={`${authSource}-${user?.id}-${hasBackendSession}`} source={source} />
}

function ProposalForm({ source }) {
  const loader = useCallback(() => source.available ? source.getTracks() : [], [source])
  const resource = useSpeakerResource(loader, source)
  const [values, setValues] = useState({ title: '', description: '', trackId: '' })
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const [sending, setSending] = useState(false)
  const [saved, setSaved] = useState(false)
  const pending = useRef(false)
  const form = useRef(null)
  async function submit(event) {
    event.preventDefault()
    if (pending.current || saved || !source.available) return
    const invalid = validateProposal(values)
    setErrors(invalid)
    setFailure('')
    if (Object.keys(invalid).length) {
      form.current.elements.namedItem(Object.keys(invalid)[0]).focus()
      return
    }
    if (resource.status !== 'ready' || !resource.data?.length) return
    pending.current = true
    setSending(true)
    try { await source.createProposal(values); setSaved(true) }
    catch (error) { setFailure(`${error.message || 'Submission failed.'} Your entries are still here; please try again.`) }
    finally { pending.current = false; setSending(false) }
  }
  function change(event) { setValues(previous => ({ ...previous, [event.target.name]: event.target.value })) }
  return <div className="speaker-portal">
    <header className="container portal-header"><Link className="portal-home" to="/speaker">Speaker Portal</Link><AccountNavigation /></header>
    <main className="container portal-main portal-proposal-main" tabIndex={-1}>
      <Link className="portal-home" to="/speaker">← Back to Speaker Portal</Link>
      <h1>Propose a Session</h1>
      {source.demo && <p className="portal-demo">Speaker preview. Submissions are saved locally for this application session and never sent to the backend. Bill Nye is a proposed participant example, not a confirmed participant.</p>}
      {!source.available && <p role="alert">Proposal submission is unavailable. A verified backend speaker identity, SPEAKER role and active session are required. Sign in again or use the speaker preview. Backend login currently does not supply roles.</p>}
      {source.available && <>
        {resource.status === 'loading' && <p role="status">Loading tracks…</p>}
        {resource.status === 'error' && <div role="alert"><p>Unable to load tracks.</p><button type="button" className="button button-paper" onClick={resource.retry}>Retry loading tracks</button></div>}
        {resource.status === 'ready' && !resource.data.length && <p role="alert">No tracks are available. Please try again later.</p>}
        <div aria-live="polite">{sending && <p>Submitting proposal…</p>}{saved && <p>{source.demo ? 'Your preview proposal was saved locally for this application session. Nothing was sent to the backend.' : 'Your proposal was submitted successfully to the backend. Live proposal reads are not yet available in the Speaker Portal.'}</p>}</div>
        {saved ? <Link className="button button-dark" to="/speaker">Back to Speaker Portal</Link> : <form ref={form} className="portal-editor portal-create-form" noValidate onSubmit={submit} aria-busy={sending}>
          <p>Title and description must each be {proposalTextLimit} characters or fewer.</p>
          {['title', 'description', 'trackId'].map(field => <div key={field}>
            <label htmlFor={`proposal-${field}`}>{field === 'title' ? 'Session title' : field === 'description' ? 'Description / abstract' : 'Primary track'}</label>
            {field === 'trackId' ? <select id={`proposal-${field}`} name={field} value={values[field]} onChange={change} required disabled={sending || resource.status !== 'ready'} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `${field}-error` : undefined}><option value="">Choose a track</option>{resource.data?.map(track => <option key={track.id} value={track.id}>{track.name}</option>)}</select> : field === 'description' ? <textarea id={`proposal-${field}`} name={field} rows={6} value={values[field]} onChange={change} required disabled={sending} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `${field}-error` : undefined} /> : <input id={`proposal-${field}`} name={field} value={values[field]} onChange={change} required disabled={sending} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `${field}-error` : undefined} />}
            {errors[field] && <p id={`${field}-error`} role="alert">{errors[field]}</p>}
          </div>)}
          {failure && <p role="alert">{failure}</p>}
          <div className="portal-actions"><button type="submit" className="button button-dark" disabled={sending || resource.status !== 'ready' || !resource.data?.length}>{sending ? 'Submitting…' : 'Submit proposal'}</button><Link className="button button-paper" to="/speaker">Cancel</Link></div>
        </form>}
      </>}
    </main>
  </div>
}
