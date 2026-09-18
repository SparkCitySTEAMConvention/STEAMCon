import { calendarRepository } from '../../services/calendarRepository.js'
import { createSpeakerCalendarSource } from '../../services/speakerCalendarSource.js'
import SpeakerItinerary from '../../components/speaker/SpeakerItinerary.jsx'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { previewRepository } from '../../mocks/previewScenarios.js'
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
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
import { useAuth } from '../../auth/useAuth.js'
import { notificationRepository } from '../../services/notificationRepository.js'
import { getSpeakerNotificationSource } from '../../services/speakerNotificationSource.js'
import SpeakerNotifications from '../../components/speaker/SpeakerNotifications.jsx'
import { eventRepository } from '../../services/eventRepository.js'
import { getSpeakerProposalSource } from '../../services/speakerProposalSource.js'
import { getSpeakerProfileSource } from '../../services/speakerProfileSource.js'
import PreviewProposalList from '../../components/speaker/PreviewProposalList.jsx'
import { liveSpeaker } from '../../services/speakerPresentation.js'
import './SpeakerDashboard.css'

export default function SpeakerDashboard({ repository = speakerRepository }) {
  const { user, authSource, hasBackendSession } = useAuth()
  const calendarSource = useMemo(() => createSpeakerCalendarSource(calendarRepository, user, authSource, hasBackendSession), [user, authSource, hasBackendSession])
  const notifications = useMemo(() => getSpeakerNotificationSource(notificationRepository, user, authSource, hasBackendSession), [user, authSource, hasBackendSession])
  const proposalSource = useMemo(() => getSpeakerProposalSource(repository, eventRepository, user, authSource, hasBackendSession), [repository, user, authSource, hasBackendSession])
  const [params] = useSearchParams()
  const scenario = authSource === 'demo' && import.meta.env.DEV ? params.get('preview') : null
  const source = useMemo(() => previewRepository(proposalSource, scenario), [proposalSource, scenario])
  const profileSource = useMemo(() => getSpeakerProfileSource(user, authSource, hasBackendSession), [user, authSource, hasBackendSession])
  const profileRevision = useSyncExternalStore(profileSource.subscribe, profileSource.getRevision, profileSource.getRevision)
  const loader = useCallback(async () => {
    const data = await source.getDashboard()
    return profileSource.demo ? { ...data, speaker: await profileSource.getProfile() } : data
  }, [source, profileSource])
  const resourceKey = useMemo(() => ({ loader, profileRevision }), [loader, profileRevision])
  const resource = useSpeakerResource(loader, resourceKey)
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    // Keep cross-page hash focus after App's route-change focus effect.
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1))
      target?.scrollIntoView?.({ behavior: 'instant', block: 'start' })
      // A mobile drawer dismissal keeps focus on Menu, including after loading.
      const menuFocused = document.activeElement?.getAttribute('aria-controls') === 'steam-portal-drawer'
      if (!menuFocused) target?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [hash, resource.status])
  return <SpeakerDashboardView calendarSource={calendarSource} proposalSource={proposalSource} data={resource.data || { speaker: proposalSource.demo ? speakerData.speaker : liveSpeaker(user), convention: {}, proposals: [], applications: [], sessions: [], feedback: [] }} resource={resource} notifications={notifications} notificationKey={`${authSource}-${user?.id}-${hasBackendSession}`} />
}

function SpeakerDashboardView({ calendarSource, proposalSource, data, resource, notifications, notificationKey }) {
  const [trackId, setTrackId] = useState('all')
  const { speaker, proposals, sessions, feedback } = data
  const filtered = proposals.filter(proposal => trackId === 'all' || proposal.trackId === trackId || proposal.additionalTrackIds?.includes(trackId))

  return (
    <div className="speaker-portal">
      <a className="skip-link" href="#speaker-main">Skip to content</a>
      <SpeakerHeader speaker={speaker} />
      <div className="container portal-main portal-dashboard-main" id="speaker-main" tabIndex={-1}>
        <details className="portal-updates-bar" id="speaker-updates" tabIndex={-1} aria-labelledby="speaker-updates-heading">
          <summary id="speaker-updates-heading">Organizer Updates <span className="portal-muted">Feedback, notifications &amp; next steps</span></summary>
          <div className="portal-updates-content">
            <div>
              {resource.status === 'ready' && <SpeakerFeedback feedback={feedback} />}
              {resource.status === 'loading' && <p role="status">Loading organizer feedback…</p>}
              {resource.status === 'error' && <p>Organizer feedback will appear when your workspace loads. Retry loading proposals below.</p>}
            </div>
            <SpeakerNotifications key={notificationKey} source={notifications} />
            <Link className="portal-home" to="/speaker/forums">Open Forum &amp; Messaging <span aria-hidden="true">↗</span></Link>
          </div>
        </details>
        <div className="portal-welcome">
          <h1>Speaker dashboard</h1>
          <p>Review proposals and plan your speaking schedule.</p>
        </div>
        <p className="portal-demo">{proposalSource.demo ? developmentDisclaimer : 'Live speaker workspace'}</p>
        {resource.status === 'loading' && <p role="status">Loading proposals…</p>}
        {resource.status === 'error' && <div role="alert"><p>Unable to load proposals.</p><button type="button" onClick={resource.retry}>Try again</button></div>}
        {resource.status === 'ready' && <ProposalSummary proposals={proposals} live={!proposalSource.demo} />}
        {resource.status !== 'ready' && <>
          <section className="portal-detail-section" id="speaker-proposals" tabIndex={-1} aria-labelledby="proposals-pending-heading"><h2 id="proposals-pending-heading">Your Proposals</h2><p>{resource.status === 'loading' ? 'Loading proposals…' : 'Retry loading proposals using the button above.'}</p></section>
          <section className="portal-detail-section" id="speaker-engagements" tabIndex={-1} aria-labelledby="engagements-pending-heading"><h2 id="engagements-pending-heading">Upcoming speaking engagements</h2><p>Speaking engagements will appear when your workspace loads.</p></section>
        </>}
        {resource.status === 'ready' && <>
        {proposalSource.demo ? <PreviewProposalList key={notificationKey} source={proposalSource} /> : <section aria-labelledby="applications-heading"><h2 id="applications-heading">Applications</h2>{data.applications.length ? <ul>{data.applications.map(item => <li key={item.id}>{item.status || 'Status unavailable'}</li>)}</ul> : <p>No applications yet.</p>}</section>}
        <div className="portal-columns">
          <section id="speaker-proposals" tabIndex={-1} aria-labelledby="proposals-heading">
            <div className="portal-section-heading"><div><p className="eyebrow">02 / Develop your ideas</p><h2 id="proposals-heading">Your Proposals</h2></div><span>{proposals.length} total</span></div>
            <details className="portal-details"><summary>Browse and filter proposals</summary>
            <TrackFilters value={trackId} onChange={setTrackId} options={proposalSource.demo ? undefined : [...new Set(proposals.map(item => item.trackId).filter(Boolean))].map((id, index) => ({ id, name: `Track ${index + 1} (name unavailable)` }))} />
            <p className="portal-result-count" role="status">{filtered.length} proposals shown</p>
            {filtered.length ? <ul className="portal-list portal-proposals">{filtered.map(proposal => <ProposalCard key={proposal.id} proposal={proposal} />)}</ul> : <EmptyState title={proposals.length ? "No proposals in this track." : "Make room for your first idea."}>{proposals.length ? 'Choose another track or return to All to explore your proposals.' : 'Use Propose a Session to submit your idea.'}</EmptyState>}
            </details>
          </section>
          <div className="portal-sidebar">
            <section id="speaker-engagements" tabIndex={-1} aria-labelledby="sessions-heading">
              <h2 id="sessions-heading">Upcoming speaking engagements</h2>
              <p className="portal-muted">{proposalSource.demo ? 'Preview schedule' : 'Scheduling unavailable'} · The backend does not expose a speaker proposal-to-session relationship.</p>
              {sessions.length ? <details className="portal-details"><summary>View speaking engagements · {sessions.length} sessions</summary><ul className="portal-list">{sessions.map(session => <UpcomingSessionCard key={session.id} session={session} />)}</ul></details> : <EmptyState title="Your stage is still taking shape.">Upcoming sessions will appear here when they are assigned.</EmptyState>}
            </section>
          </div>
        </div>
        </>}

        <SpeakerItinerary source={calendarSource} compact />
      </div>
      <footer className="container portal-footer"><p>STEAM Con · A place for curious minds.</p><p>Speaker Portal{proposalSource.demo ? ' / Preview' : ''}</p></footer>
    </div>
  )
}
