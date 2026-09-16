import { scheduleLabel } from '../../utils/proposalPresentation.js'
export default function UpcomingSessionCard({ session }) {
  return (
    <li className="portal-session">
      <article aria-labelledby={`${session.id}-title`}>
        <p className="eyebrow">On your horizon</p>
        <h3 id={`${session.id}-title`}>{session.title}</h3>
        <dl className="portal-session-facts">
          <div><dt>Schedule</dt><dd>{scheduleLabel(session)}</dd></div>
          <div><dt>Location</dt><dd>{session.room || 'Room to be announced'}</dd></div>
        </dl>
        <h4>Sharing the stage</h4>
        <ul className="portal-speaker-names">{session.speakers.map(speaker => <li key={speaker.id}>{speaker.name}</li>)}</ul>
      </article>
    </li>
  )
}
