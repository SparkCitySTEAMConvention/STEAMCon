import SpeakerHeader from '../../components/speaker/SpeakerHeader.jsx'
import ProposalSummary from '../../components/speaker/ProposalSummary.jsx'
import ProposalCard from '../../components/speaker/ProposalCard.jsx'
import UpcomingSessionCard from '../../components/speaker/UpcomingSessionCard.jsx'
import SpeakerFeedback from '../../components/speaker/SpeakerFeedback.jsx'
import EmptyState from '../../components/speaker/EmptyState.jsx'
import { speakerData } from '../../mocks/speakerData.js'
import './SpeakerDashboard.css'

export default function SpeakerDashboard({ data = speakerData }) {
  const { speaker, proposals, sessions, feedback } = data

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
        <p className="portal-demo"><strong>Speaker workspace</strong> · Participation and event details are not confirmed.</p>
        <ProposalSummary proposals={proposals} />
        <div className="portal-columns">
          <section aria-labelledby="proposals-heading">
            <div className="portal-section-heading"><h2 id="proposals-heading">Your Proposals</h2><span>{proposals.length} total</span></div>
            {proposals.length ? <ul className="portal-list portal-proposals">{proposals.map(proposal => <ProposalCard key={proposal.id} proposal={proposal} />)}</ul> : <EmptyState title="Make room for your first idea.">Your proposals will appear here once submissions are available.</EmptyState>}
          </section>
          <div className="portal-sidebar">
            <section aria-labelledby="sessions-heading">
              <h2 id="sessions-heading">Upcoming Sessions</h2>
              {sessions.length ? <ul className="portal-list">{sessions.map(session => <UpcomingSessionCard key={session.id} session={session} />)}</ul> : <EmptyState title="Your stage is still taking shape.">Upcoming sessions will appear here when they are assigned.</EmptyState>}
            </section>
            <SpeakerFeedback feedback={feedback} />
          </div>
        </div>
      </main>
      <footer className="container portal-footer"><p>STEAM Con · A place for curious minds.</p><p>Speaker Portal / Preview</p></footer>
    </div>
  )
}
