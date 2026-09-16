import { useSearchParams } from 'react-router-dom'
import { previewRepository } from '../../mocks/previewScenarios.js'
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
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
import { conventionScheduleLabel, locationLabel } from '../../utils/proposalPresentation.js'
import { useAuth } from '../../auth/useAuth.js'
import { notificationRepository } from '../../services/notificationRepository.js'
import { getSpeakerNotificationSource } from '../../services/speakerNotificationSource.js'
import SpeakerNotifications from '../../components/speaker/SpeakerNotifications.jsx'
import { eventRepository } from '../../services/eventRepository.js'
import { getSpeakerProposalSource } from '../../services/speakerProposalSource.js'
import { getSpeakerProfileSource } from '../../services/speakerProfileSource.js'
import PreviewProposalList from '../../components/speaker/PreviewProposalList.jsx'
import './SpeakerDashboard.css'

export default function SpeakerDashboard({ repository = speakerRepository }) {
  const { user, authSource, hasBackendSession } = useAuth()
  const notifications = useMemo(() => getSpeakerNotificationSource(notificationRepository, user, authSource, hasBackendSession), [user, authSource, hasBackendSession])
  const proposalSource = useMemo(() => getSpeakerProposalSource(repository, eventRepository, user, authSource, hasBackendSession), [repository, user, authSource, hasBackendSession])
  const [params] = useSearchParams()
  const scenario = import.meta.env.DEV ? params.get('preview') : null
  const source = useMemo(() => previewRepository(repository, scenario), [repository, scenario])
  const profileSource = useMemo(() => getSpeakerProfileSource(user, authSource, hasBackendSession), [user, authSource, hasBackendSession])
  const profileRevision = useSyncExternalStore(profileSource.subscribe, profileSource.getRevision, profileSource.getRevision)
  const loader = useCallback(async () => {
    const data = await source.getDashboard()
    return profileSource.demo ? { ...data, speaker: await profileSource.getProfile() } : data
  }, [source, profileSource])
  const resourceKey = useMemo(() => ({ loader, profileRevision }), [loader, profileRevision])
  const resource = useSpeakerResource(loader, resourceKey)
  return <SpeakerDashboardView proposalSource={proposalSource} data={resource.data || { ...speakerData, proposals: [], sessions: [], feedback: [] }} resource={resource} notifications={notifications} notificationKey={`${authSource}-${user?.id}-${hasBackendSession}`} />
}

function SpeakerDashboardView({ proposalSource, data, resource, notifications, notificationKey }) {
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
          <h1>Welcome back, {speaker.name}.</h1>
          <p>Keep an eye on your proposals, upcoming sessions, and organizer feedback. Your next great conversation starts here.</p>
        </div>
        <p className="portal-demo">{developmentDisclaimer}</p>
        {resource.status === 'loading' && <p role="status">Loading proposals…</p>}
        {resource.status === 'error' && <div role="alert"><p>Unable to load proposals.</p><button type="button" onClick={resource.retry}>Try again</button></div>}
        <SpeakerNotifications key={notificationKey} source={notifications} />
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
        {proposalSource.demo ? <PreviewProposalList key={notificationKey} source={proposalSource} /> : <p className="portal-demo">Proposal removal is unavailable until the backend provides a supported deletion or withdrawal contract.</p>}
        <ProposalSummary proposals={proposals} />
        <div className="portal-columns">
          <section aria-labelledby="proposals-heading">
            <div className="portal-section-heading"><h2 id="proposals-heading">Your Proposals</h2><span>{proposals.length} total</span></div>
            <TrackFilters value={trackId} onChange={setTrackId} />
            <p className="portal-result-count" role="status">{filtered.length} proposals shown</p>
            {filtered.length ? <ul className="portal-list portal-proposals">{filtered.map(proposal => <ProposalCard key={proposal.id} proposal={proposal} />)}</ul> : <EmptyState title={proposals.length ? "No proposals in this track." : "Make room for your first idea."}>{proposals.length ? 'Choose another track or return to All to explore your proposals.' : 'Use Propose a Session to submit your idea.'}</EmptyState>}
          </section>
          <div className="portal-sidebar">
            <section aria-labelledby="sessions-heading">
              <h2 id="sessions-heading">Upcoming speaking engagements</h2>
              <p className="portal-muted">Preview schedule · The backend does not expose a speaker proposal-to-session relationship.</p>
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
