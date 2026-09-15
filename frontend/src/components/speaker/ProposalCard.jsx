export default function ProposalCard({ proposal }) {
  return (
    <li className={`portal-proposal portal-track-${proposal.track.toLowerCase()}`}>
      <article aria-labelledby={`${proposal.id}-title`}>
        <div className="portal-card-meta">
          <span className="portal-track-label">{proposal.track}</span>
          <span className={`portal-status portal-status-${proposal.status.toLowerCase()}`}>{proposal.status}</span>
        </div>
        <h3 id={`${proposal.id}-title`}>{proposal.title}</h3>
        <p className="portal-muted">{proposal.type}</p>
        <p className="portal-schedule">{proposal.schedule ? `${proposal.schedule.date} · ${proposal.schedule.time}` : 'Not scheduled'}</p>
        <details className="portal-details">
          <summary>View details<span className="portal-sr-only"> for {proposal.title}</span></summary>
          <p>Full proposal details and editing are coming soon.</p>
        </details>
      </article>
    </li>
  )
}
