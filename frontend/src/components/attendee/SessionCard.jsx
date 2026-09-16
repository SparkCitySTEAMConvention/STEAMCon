const trackSlugs = {
  Science: 'science',
  Technology: 'technology',
  Engineering: 'engineering',
  Art: 'art',
  Mathematics: 'mathematics',
}

export default function SessionCard({ session, selected, onToggle, compact = false }) {
  const buttonLabel = session.mandatory ? 'Required event' : selected ? 'Remove from schedule' : 'Add to schedule'

  return (
    <li className={`attendee-session attendee-track-${trackSlugs[session.track]}${compact ? ' is-compact' : ''}`}>
      <article aria-labelledby={`${session.id}-${compact ? 'saved' : 'discover'}-title`}>
        <div className="attendee-session-meta">
          <span>{session.track}</span>
          <span>{session.format}</span>
        </div>
        <h3 id={`${session.id}-${compact ? 'saved' : 'discover'}-title`}>{session.title}</h3>
        {!compact && <p className="attendee-session-description">{session.description}</p>}
        <dl className="attendee-session-facts">
          <div><dt>When</dt><dd>{session.day} · {session.time}</dd></div>
          <div><dt>Where</dt><dd>{session.location}</dd></div>
          {!compact && <div><dt>With</dt><dd>{session.speaker}</dd></div>}
        </dl>
        <button
          className={`attendee-session-action${selected ? ' is-selected' : ''}`}
          type="button"
          disabled={session.mandatory}
          onClick={() => onToggle(session)}
        >
          {buttonLabel}
          <span aria-hidden="true">{session.mandatory ? '◆' : selected ? '✓' : '+'}</span>
        </button>
      </article>
    </li>
  )
}
