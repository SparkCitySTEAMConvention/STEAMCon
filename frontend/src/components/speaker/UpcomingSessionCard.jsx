export default function UpcomingSessionCard({ session }) {
  return (
    <li className="portal-session">
      <article aria-labelledby={`${session.id}-title`}>
        <p className="eyebrow">On your horizon</p>
        <h3 id={`${session.id}-title`}>{session.title}</h3>
        <dl className="portal-session-facts">
          <div><dt>Date</dt><dd>{session.date}</dd></div>
          <div><dt>Time</dt><dd>{session.time}</dd></div>
          <div><dt>Location</dt><dd>{session.room}</dd></div>
        </dl>
        <h4>Sharing the stage</h4>
        <ul className="portal-speaker-names">{session.speakers.map(speaker => <li key={speaker.id}>{speaker.name}</li>)}</ul>
      </article>
    </li>
  )
}
