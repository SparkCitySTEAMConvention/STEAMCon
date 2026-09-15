import { Link } from 'react-router-dom'
import ScheduleActions from './ScheduleActions.jsx'
import TrackBadge from './TrackBadge.jsx'
import { scheduleLabel, roomLabel } from '../../utils/proposalPresentation.js'
export default function UpcomingSessionCard({ session }) {
  return (
    <li className="portal-session">
      <article aria-labelledby={`${session.id}-title`}>
        <p className="eyebrow">On your horizon</p>
        <h3 id={`${session.id}-title`}>{session.title}</h3>
        <p className="portal-muted">{session.format} · {session.durationMinutes} minutes · {session.status}</p>
        <div className="portal-profile-tracks">{[session.trackId, ...(session.additionalTrackIds || [])].map(trackId => <TrackBadge key={trackId} trackId={trackId} />)}</div>
        <dl className="portal-session-facts">
          <div><dt>Schedule</dt><dd>{scheduleLabel(session)}</dd></div>
          <div><dt>Room</dt><dd>{roomLabel(session)}</dd></div>
        </dl>
        <h4>Sharing the stage</h4>
        <ul className="portal-speaker-names" aria-label="Session speakers" role="list">{session.speakers.map(speaker => <li key={speaker.id}>{speaker.name}</li>)}</ul>
        <Link className="portal-home" to={`/speaker/proposals/${session.proposalId}`}>View Details<span className="portal-sr-only">: {session.title}</span></Link>
        <ScheduleActions session={session} />
      </article>
    </li>
  )
}
