const statuses = ['Draft', 'Pending', 'Approved', 'Rejected']

export default function ProposalSummary({ proposals, live = false }) {
  return (
    <section aria-labelledby="proposal-summary-heading">
      <h2 className="portal-small-heading" id="proposal-summary-heading">Proposals at a glance</h2>
      <dl className="portal-summary">
        {(live ? ['Draft', 'Submitted', 'Approved', 'Rejected', 'Withdrawn'] : statuses).map(status => (
          <div key={status} className={`portal-summary-card portal-status-${status.toLowerCase()}`}>
            <dt>{status}</dt>
            <dd>{proposals.filter(proposal => proposal.status === status).length}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
