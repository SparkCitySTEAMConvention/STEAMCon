import { useSearchParams } from 'react-router-dom'
import { previewRepository } from '../../mocks/previewScenarios.js'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SpeakerHeader from '../../components/speaker/SpeakerHeader.jsx'
import TrackBadge from '../../components/speaker/TrackBadge.jsx'
import { developmentDisclaimer, speakerData } from '../../mocks/speakerData.js'
import { tracks } from '../../mocks/tracks.js'
import { speakerRepository } from '../../services/speakerRepository.js'
import useSpeakerResource from '../../hooks/useSpeakerResource.js'
import ScheduleActions from '../../components/speaker/ScheduleActions.jsx'
import { roomLabel, locationLabel, scheduleLabel } from '../../utils/proposalPresentation.js'
import './SpeakerDashboard.css'

export default function ProposalDetails({ repository = speakerRepository }) {
  const { proposalId } = useParams()
  const [params] = useSearchParams()
  const scenario = import.meta.env.DEV ? params.get('preview') : null
  const source = useMemo(() => previewRepository(repository, scenario), [repository, scenario])
  const loader = useCallback(() => source.getProposal(proposalId), [source, proposalId])
  const resource = useSpeakerResource(loader, `${proposalId}:${scenario}`)
  const primary = resource.data?.speakers.find(person => person.id === resource.data.primarySpeakerId)
  return <div className="speaker-portal">
    <a className="skip-link" href="#proposal-main">Skip to content</a>
    <SpeakerHeader speaker={primary || speakerData.speaker} />
    <main className="container portal-main portal-proposal-main" id="proposal-main" tabIndex={-1}>
      <Link className="portal-home" to="/speaker">← Back to Speaker Portal</Link>
      <p className="portal-demo">{developmentDisclaimer}</p>
      {scenario && <p className="portal-demo"><strong>Isolated UI test: {scenario}.</strong> Any date, time, room or identity in this test belongs to a fictional test event, not STEAM Con.</p>}
      {resource.status === 'loading' && <><h1>Proposal details</h1><p role="status">Loading proposal…</p></>}
      {resource.status === 'error' && <><h1>Proposal unavailable</h1><p role="alert">Unable to load this proposal. Please try again.</p><button type="button" className="button button-paper" onClick={resource.retry}>Try again</button></>}
      {resource.status === 'ready' && (resource.data ? <ProposalContent key={`${proposalId}:${scenario}`} initialProposal={resource.data} repository={repository} /> : <><h1>Proposal not found</h1><p>This proposal may no longer be available. Return to your dashboard to select another.</p></>)}
    </main>
    <footer className="container portal-footer"><p>STEAM Con · Speaker Portal / Preview</p></footer>
  </div>
}

function ProposalContent({ initialProposal, repository }) {
  const [proposal, setProposal] = useState(initialProposal)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')
  const restoreEditFocus = useRef(false)
  const closeEditor = () => { restoreEditFocus.current = true; setEditing(false) }
  const primary = proposal.speakers.find(person => person.id === proposal.primarySpeakerId)
  const others = proposal.speakers.filter(person => person.id !== proposal.primarySpeakerId)
  return <>
    <div className="portal-card-meta"><TrackBadge trackId={proposal.trackId} /><span className={`portal-status portal-status-${proposal.status.toLowerCase()}`}>{proposal.status}</span></div>
    <h1>{proposal.title}</h1>
    {editing ? <DraftEditor proposal={proposal} repository={repository} onCancel={closeEditor} onSave={saved => { setProposal(saved); closeEditor(); setMessage('Draft saved for this preview session. Changes are lost on refresh; nothing was submitted.') }} /> : <>
      <section className="portal-detail-section" aria-labelledby="abstract-heading"><h2 id="abstract-heading">Abstract</h2><p>{proposal.abstract}</p></section>
      <dl className="portal-detail-facts">
        <div><dt>STEAM track</dt><dd><TrackBadge trackId={proposal.trackId} />{proposal.additionalTrackIds?.map(trackId => <TrackBadge key={trackId} trackId={trackId} />)}</dd></div>
        <div><dt>Session format</dt><dd>{proposal.format}</dd></div>
        <div><dt>Duration</dt><dd>{proposal.durationMinutes ? `${proposal.durationMinutes} minutes` : 'Duration to be announced'}</dd></div>
        <div><dt>Schedule</dt><dd>{scheduleLabel(proposal)}</dd></div>
        <div><dt>Room</dt><dd>{roomLabel(proposal)}</dd></div>
        <div><dt>Convention location</dt><dd>{locationLabel()}</dd></div>
      </dl>
      <section className="portal-detail-section" aria-labelledby="primary-heading"><h2 id="primary-heading">Primary speaker</h2><h3>{primary?.name || 'Speaker to be announced'}</h3><p>{primary?.bio}</p></section>
      <section className="portal-detail-section" aria-labelledby="others-heading"><h2 id="others-heading">{proposal.format === 'Panel' ? 'Co-panelists' : 'Co-speakers'}</h2>{others.length ? <ul className="portal-list" aria-label="Co-speakers" role="list">{others.map(person => <li key={person.id}><h3>{person.name}</h3><p>{person.bio}</p></li>)}</ul> : <p>No co-speakers listed.</p>}</section>
      <section className="portal-detail-section" aria-labelledby="feedback-heading"><h2 id="feedback-heading">Admin feedback</h2><p>{proposal.adminFeedback || 'No admin feedback yet.'}</p></section>
      <div className="portal-actions">
        {proposal.status === 'Draft' && <button ref={node => { if (node && restoreEditFocus.current) { node.focus(); restoreEditFocus.current = false } }} id="edit-draft" className="button button-dark" type="button" onClick={() => { setMessage(''); setEditing(true) }}>Edit draft</button>}
        <ScheduleActions session={proposal} />
      </div>
    </>}
    <p role="status" className="portal-action-status">{message}</p>
  </>
}

function DraftEditor({ proposal, repository, onSave, onCancel }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      onSave(await repository.saveDraft(proposal.id, { title: values.get('title'), abstract: values.get('abstract'), trackId: values.get('trackId'), format: values.get('format'), durationMinutes: Number(values.get('durationMinutes')) }))
    } catch {
      setError('Unable to save this draft. Your entries are still here; please try again.')
    } finally { setSaving(false) }
  }
  return <form className="portal-editor" onSubmit={submit} aria-busy={saving}>
    <h2>Edit draft</h2><p>Preview only. Changes last until refresh and are not submitted.</p>
    <label>Proposal title<input autoFocus name="title" required maxLength={200} defaultValue={proposal.title} /></label>
    <label>Abstract<textarea name="abstract" required rows={6} maxLength={5000} defaultValue={proposal.abstract} /></label>
    <label>STEAM track<select name="trackId" defaultValue={proposal.trackId}>{tracks.map(track => <option key={track.id} value={track.id}>{track.name}</option>)}</select></label>
    <label>Session format<select name="format" defaultValue={proposal.format}>{['Talk', 'Workshop', 'Panel'].map(format => <option key={format}>{format}</option>)}</select></label>
    <label>Duration in minutes<input name="durationMinutes" type="number" min={1} max={480} required defaultValue={proposal.durationMinutes} /></label>
    {error && <p role="alert">{error}</p>}
    <div className="portal-actions"><button className="button button-dark" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save preview draft'}</button><button className="button button-paper" disabled={saving} type="button" onClick={onCancel}>Cancel</button></div>
  </form>
}
