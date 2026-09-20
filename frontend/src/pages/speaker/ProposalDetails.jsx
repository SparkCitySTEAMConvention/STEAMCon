import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SpeakerHeader from '../../components/speaker/SpeakerHeader.jsx'
import TrackBadge from '../../components/speaker/TrackBadge.jsx'
import { speakerRepository } from '../../services/speakerRepository.js'
import useSpeakerResource from '../../hooks/useSpeakerResource.js'
import ScheduleActions from '../../components/speaker/ScheduleActions.jsx'
import { roomLabel, locationLabel, scheduleLabel } from '../../utils/proposalPresentation.js'
import { useAuth } from '../../auth/useAuth.js'
import { getSpeakerProposalSource, canManageLiveProposal } from '../../services/speakerProposalSource.js'
import { eventRepository } from '../../services/eventRepository.js'
import { liveSpeaker } from '../../services/speakerPresentation.js'
import './SpeakerDashboard.css'

export default function ProposalDetails({ repository = speakerRepository }) {
  const { user, authSource, hasBackendSession } = useAuth()
  const proposalSource = useMemo(() => getSpeakerProposalSource(repository, eventRepository, user, authSource, hasBackendSession), [repository, user, authSource, hasBackendSession])
  const { proposalId } = useParams()
  const scenario = null
  const source = proposalSource
  const loader = useCallback(() => source.getProposal(proposalId), [source, proposalId])
  const resource = useSpeakerResource(loader, loader)
  const primary = resource.data?.speakers?.find(person => person.id === resource.data.primarySpeakerId)
  return <div className="speaker-portal">
    <a className="skip-link" href="#proposal-main">Skip to content</a>
    <SpeakerHeader speaker={primary || liveSpeaker(user)} />
    <main className="container portal-main portal-proposal-main" id="proposal-main" tabIndex={-1}>
      <Link className="portal-home" to="/speaker">← Back to Speaker Portal</Link>
      <p className="portal-demo">Live proposal · Loaded from the STEAM Con backend.</p>
      {scenario && <p className="portal-demo"><strong>Isolated UI test: {scenario}.</strong> Any date, time, room or identity in this test belongs to a fictional test event, not STEAM Con.</p>}
      {resource.status === 'loading' && <><h1>Proposal details</h1><p role="status">Loading proposal…</p></>}
      {resource.status === 'error' && <><h1>Proposal unavailable</h1><p role="alert">Unable to load this proposal. Please try again.</p><button type="button" className="button button-paper" onClick={resource.retry}>Try again</button></>}
      {resource.status === 'ready' && (resource.data ? <ProposalContent key={`${proposalId}:${scenario}`} initialProposal={resource.data} repository={proposalSource} /> : <><h1>Proposal not found</h1><p>This proposal may no longer be available. Return to your dashboard to select another.</p></>)}
    </main>
    <footer className="container portal-footer"><p>STEAM Con · Speaker Portal{proposalSource.demo ? ' / Preview' : ''}</p></footer>
  </div>
}

function ProposalContent({ initialProposal, repository }) {
  const [proposal, setProposal] = useState(initialProposal)
  const [withdrawn, setWithdrawn] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const withdrawalLock = useRef(false)
  const restoreWithdrawalFocus = useRef(false)
  const successHeading = useRef(null)
  const [withdrawError, setWithdrawError] = useState('')
  async function withdraw(event) {
    event.preventDefault()
    if (withdrawalLock.current) return
    const name = new FormData(event.currentTarget).get('confirmation')
    if (name !== proposal.title) { setWithdrawError('Enter the proposal title to confirm withdrawal.'); return }
    withdrawalLock.current = true; setWithdrawing(true); setWithdrawError('')
    try { await repository.withdrawProposal(proposal.id, name); setWithdrawn(true); setMessage('Proposal withdrawn successfully.'); requestAnimationFrame(() => successHeading.current?.focus()) }
    catch (error) { setWithdrawError(error.message) }
    finally { withdrawalLock.current = false; setWithdrawing(false) }
  }
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')
  const restoreEditFocus = useRef(false)
  const closeEditor = () => { restoreEditFocus.current = true; setEditing(false) }
  const primary = proposal.speakers.find(person => person.id === proposal.primarySpeakerId)
  const others = proposal.speakers.filter(person => person.id !== proposal.primarySpeakerId)
  if (withdrawn) return <><h1 ref={successHeading} tabIndex={-1}>Proposal withdrawn</h1><p role="status">{message}</p><Link to="/speaker">Back to Speaker Portal</Link></>
  return <>
    <div className="portal-card-meta"><TrackBadge trackId={proposal.trackId} /><span className={`portal-status portal-status-${proposal.status.toLowerCase()}`}>{proposal.status}</span></div>
    <h1>{proposal.title}</h1>
    {editing ? <DraftEditor proposal={proposal} repository={repository} onCancel={closeEditor} onSave={saved => { setProposal(saved); closeEditor(); setMessage(repository.demo ? 'Draft saved for this preview session. Changes are lost on refresh; nothing was submitted.' : 'Proposal saved.') }} /> : <>
      <section className="portal-detail-section" aria-labelledby="abstract-heading"><h2 id="abstract-heading">Abstract</h2><p>{proposal.abstract}</p></section>
      <dl className="portal-detail-facts">
        <div><dt>STEAM track</dt><dd><TrackBadge trackId={proposal.trackId} />{proposal.additionalTrackIds?.map(trackId => <TrackBadge key={trackId} trackId={trackId} />)}</dd></div>
        <div><dt>Session format</dt><dd>{proposal.format || 'Format unavailable'}</dd></div>
        <div><dt>Duration</dt><dd>{proposal.durationMinutes ? `${proposal.durationMinutes} minutes` : 'Duration to be announced'}</dd></div>
        <div><dt>Schedule</dt><dd>{scheduleLabel(proposal)}</dd></div>
        <div><dt>Room</dt><dd>{roomLabel(proposal)}</dd></div>
        <div><dt>Convention location</dt><dd>{repository.demo ? locationLabel() : 'Location to be announced'}</dd></div>
      </dl>
      <section className="portal-detail-section" aria-labelledby="primary-heading"><h2 id="primary-heading">Primary speaker</h2><h3>{primary?.name || 'Speaker to be announced'}</h3><p>{primary?.bio}</p></section>
      <section className="portal-detail-section" aria-labelledby="others-heading"><h2 id="others-heading">{proposal.format === 'Panel' ? 'Co-panelists' : 'Co-speakers'}</h2>{others.length ? <ul className="portal-list" aria-label="Co-speakers" role="list">{others.map(person => <li key={person.id}><h3>{person.name}</h3><p>{person.bio}</p></li>)}</ul> : <p>{repository.demo ? 'No co-speakers listed.' : 'Speaker relationships unavailable.'}</p>}</section>
      <section className="portal-detail-section" aria-labelledby="feedback-heading"><h2 id="feedback-heading">Admin feedback</h2><p>{proposal.adminFeedback || 'No admin feedback yet.'}</p></section>
      <div className="portal-actions">
        {(repository.demo ? proposal.status === 'Draft' : canManageLiveProposal(proposal)) && <button disabled={confirming} ref={node => { if (node && restoreEditFocus.current) { node.focus(); restoreEditFocus.current = false } }} id="edit-draft" className="button button-dark" type="button" onClick={() => { setMessage(''); setEditing(true) }}>{repository.demo ? 'Edit draft' : 'Edit proposal'}</button>}
        {repository.demo ? <ScheduleActions session={proposal} /> : canManageLiveProposal(proposal) ? <button ref={node => { if (node && restoreWithdrawalFocus.current) { node.focus(); restoreWithdrawalFocus.current = false } }} disabled={confirming} type="button" className="button button-paper" onClick={() => setConfirming(true)}>Withdraw proposal</button> : <p>Editing and withdrawal are available only for draft or submitted proposals.</p>}
      </div>
    </>}
    {confirming && <p>Finish or cancel withdrawal confirmation before editing this proposal.</p>}
    {confirming && <form className="portal-editor" onSubmit={withdraw} aria-busy={withdrawing}>
      <h2>Withdraw proposal</h2><p>Type “{proposal.title}” to confirm withdrawal.</p>
      <label>Proposal title confirmation<input autoFocus name="confirmation" disabled={withdrawing} required /></label>
      {withdrawError && <p role="alert">{withdrawError}</p>}
      <button type="submit" disabled={withdrawing}>{withdrawing ? 'Withdrawing…' : 'Confirm withdrawal'}</button>
      <button type="button" disabled={withdrawing} onClick={() => { restoreWithdrawalFocus.current = true; setConfirming(false) }}>Cancel</button>
      <p role="status">{withdrawing ? 'Withdrawing proposal…' : ''}</p>
    </form>}
    <p role="status" className="portal-action-status">{message}</p>
  </>
}

function DraftEditor({ proposal, repository, onSave, onCancel }) {
  const savingLock = useRef(false)
  const loader = useCallback(() => repository.getTracks(), [repository])
  const trackResource = useSpeakerResource(loader, repository)
  const [selectedTrack, setSelectedTrack] = useState(proposal.trackId || '')
  const options = trackResource.data || []
  const tracksReady = repository.demo || (trackResource.status === 'ready' && options.length > 0)
  const validTrack = options.some(track => track.id === selectedTrack)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (savingLock.current || !tracksReady || !validTrack) return
    savingLock.current = true
    const values = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      const changes = { title: values.get('title'), abstract: values.get('abstract'), trackId: values.get('trackId') }
      if (repository.demo) Object.assign(changes, { format: values.get('format'), durationMinutes: Number(values.get('durationMinutes')) })
      onSave(await repository.saveDraft(proposal.id, changes))
    } catch (error) {
      setError(`${error.message || 'Unable to save this proposal.'} Your entries are still here; please try again.`)
    } finally { savingLock.current = false; setSaving(false) }
  }
  return <form className="portal-editor" onSubmit={submit} aria-busy={saving}>
    <h2>{repository.demo ? 'Edit draft' : 'Edit proposal'}</h2>{repository.demo && <p>Preview only. Changes last until refresh and are not submitted.</p>}
    <label>Proposal title<input autoFocus name="title" disabled={saving} required maxLength={200} defaultValue={proposal.title} /></label>
    <label>{repository.demo ? 'Abstract' : 'Description'}<textarea name="abstract" disabled={saving} required rows={6} maxLength={repository.demo ? 5000 : 2000} defaultValue={proposal.abstract} /></label>
    <label>STEAM track<select name="trackId" required disabled={saving || !tracksReady} value={selectedTrack} onChange={event => setSelectedTrack(event.target.value)}>
      {!validTrack && <option value={selectedTrack}>{selectedTrack ? 'Current track unavailable — choose an available track' : 'Choose a track'}</option>}
      {options.map(track => <option key={track.id} value={track.id}>{track.name}</option>)}
    </select></label>
    {repository.demo && <><label>Session format<select name="format" disabled={saving} defaultValue={proposal.format}>{['Talk', 'Workshop', 'Panel'].map(format => <option key={format}>{format}</option>)}</select></label>
    <label>Duration in minutes<input name="durationMinutes" disabled={saving} type="number" min={1} max={480} required defaultValue={proposal.durationMinutes} /></label></>}
    {!repository.demo && trackResource.status === 'loading' && <p role="status">Loading tracks before saving…</p>}
    {!repository.demo && trackResource.status === 'error' && <p role="alert">Unable to load tracks. <button type="button" onClick={trackResource.retry}>Retry</button></p>}
    {!repository.demo && trackResource.status === 'ready' && !options.length && <p role="status">No tracks are available. Saving is unavailable until tracks load. <button type="button" onClick={trackResource.retry}>Retry</button></p>}
    {!repository.demo && tracksReady && !validTrack && <p role="status">Choose an available track before saving.</p>}
    <p role="status">{saving ? 'Saving proposal…' : ''}</p>
    {error && <p role="alert">{error}</p>}
    <div className="portal-actions"><button className="button button-dark" disabled={saving || !tracksReady || !validTrack} type="submit">{saving ? 'Saving…' : repository.demo ? 'Save preview draft' : 'Save proposal'}</button><button className="button button-paper" disabled={saving} type="button" onClick={onCancel}>Cancel</button></div>
  </form>
}
