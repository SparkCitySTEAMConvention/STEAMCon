import { useSearchParams } from 'react-router-dom'
import { previewRepository } from '../../mocks/previewScenarios.js'
import { useCallback, useMemo, useState } from 'react'
import { speakers } from '../../mocks/speakers.js'
import { speakerRepository } from '../../services/speakerRepository.js'
import useSpeakerResource from '../../hooks/useSpeakerResource.js'
import TrackFilters from '../../components/speaker/TrackFilters.jsx'
import SpeakerHeader from '../../components/speaker/SpeakerHeader.jsx'
import ProposalSummary from '../../components/speaker/ProposalSummary.jsx'
import ProposalCard from '../../components/speaker/ProposalCard.jsx'
import UpcomingSessionCard from '../../components/speaker/UpcomingSessionCard.jsx'
import SpeakerFeedback from '../../components/speaker/SpeakerFeedback.jsx'
import EmptyState from '../../components/speaker/EmptyState.jsx'
import { speakerData, developmentDisclaimer } from '../../mocks/speakerData.js'
import { conventionScheduleLabel, locationLabel, hasSchedule } from '../../utils/proposalPresentation.js'
import './SpeakerDashboard.css'

export default function SpeakerDashboard({ repository = speakerRepository }) {
  const [speakerId, setSpeakerId] = useState('speaker-bill-nye')
  const [params] = useSearchParams()
  const scenario = import.meta.env.DEV ? params.get('preview') : null
  const source = useMemo(() => previewRepository(repository, scenario), [repository, scenario])
  const loader = useCallback(() => source.getDashboard(speakerId), [source, speakerId])
  const resource = useSpeakerResource(loader, `${speakerId}:${scenario}`)
  return <SpeakerDashboardView key={speakerId} data={resource.data || { ...speakerData, speaker: speakers.find(person => person.id === speakerId), proposals: [], sessions: [], feedback: [] }} resource={resource} speakerId={speakerId} onSpeakerChange={setSpeakerId} />
}

function SpeakerDashboardView({ data, resource, speakerId, onSpeakerChange }) {
  const [trackId, setTrackId] = useState('all')
  const { speaker, convention, proposals, sessions, feedback } = data
  const filtered = proposals.filter(proposal => trackId === 'all' || proposal.trackId === trackId || proposal.additionalTrackIds?.includes(trackId))

  return (
    <div className="speaker-portal">
      <a className="skip-link" href="#speaker-main">Skip to content</a>
      <SpeakerHeader speaker={speaker} />
      <main className="container portal-main" id="speaker-main" tabIndex={-1}>
        <div className="portal-welcome">
          <p className="eyebrow">Your perspective belongs here</p>
          <h1>Welcome back, {speaker.firstName}.</h1>
          <p>Keep an eye on your proposals, upcoming sessions, and organizer feedback. Your next great conversation starts here.</p>
        </div>
        <p className="portal-demo">{developmentDisclaimer}</p>
        {import.meta.env.DEV && <label className="portal-preview-picker">Preview speaker workspace
          <select value={speakerId} onChange={event => onSpeakerChange(event.target.value)}>{speakers.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select>
        </label>}
        {resource.status === 'loading' && <p role="status">Loading proposals…</p>}
        {resource.status === 'error' && <div role="alert"><p>Unable to load proposals.</p><button type="button" onClick={resource.retry}>Try again</button></div>}
        {resource.status === 'ready' && <>
        <section className="portal-detail-section" aria-labelledby="experience-heading">
          <h2 id="experience-heading">Professional experience</h2>
          <p>{speaker.bio}</p>
        </section>
        <section className="portal-detail-section" aria-labelledby="event-heading">
          <h2 id="event-heading">{convention.name}</h2>
          <p>{conventionScheduleLabel(convention)}</p>
          <p>{locationLabel(convention)}</p>
        </section>
        <section className="portal-notifications" aria-labelledby="notifications-heading">
          <h2 id="notifications-heading">Notifications &amp; next steps</h2>
          <p>{sessions.some(session => !hasSchedule(session)) ? 'Scheduling is pending. Your approved proposals will show dates, times, and rooms here when assigned.' : 'No scheduling actions needed.'}</p>
          <p>{feedback.some(item => !item.read) ? 'You have unread organizer feedback below.' : 'No new organizer feedback.'}</p>
        </section>
        <ProposalSummary proposals={proposals} />
        <div className="portal-columns">
          <section aria-labelledby="proposals-heading">
            <div className="portal-section-heading"><h2 id="proposals-heading">Your Proposals</h2><span>{proposals.length} total</span></div>
            <TrackFilters value={trackId} onChange={setTrackId} />
            <p className="portal-result-count" role="status">{filtered.length} proposals shown</p>
            {filtered.length ? <ul className="portal-list portal-proposals">{filtered.map(proposal => <ProposalCard key={proposal.id} proposal={proposal} />)}</ul> : <EmptyState title={proposals.length ? "No proposals in this track." : "Make room for your first idea."}>{proposals.length ? 'Choose another track or return to All to explore your proposals.' : 'Your proposals will appear here. Proposal submissions are coming soon.'}</EmptyState>}
          </section>
          <div className="portal-sidebar">
            <section aria-labelledby="sessions-heading">
              <h2 id="sessions-heading">Upcoming speaking engagements</h2>
              {sessions.length ? <ul className="portal-list">{sessions.map(session => <UpcomingSessionCard key={session.id} session={session} />)}</ul> : <EmptyState title="Your stage is still taking shape.">Upcoming sessions will appear here when they are assigned.</EmptyState>}
            </section>
            <SpeakerFeedback feedback={feedback} />
          </div>
        </div>
        </>}
      </main>
      <footer className="container portal-footer"><p>STEAM Con · A place for curious minds.</p><p>Speaker Portal / Preview</p></footer>
    </div>
  )
}
