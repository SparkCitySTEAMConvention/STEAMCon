export default function AttendeeSummary({ admission, sessionCount, confirmedBookings }) {
  const items = [
    { label: 'Admission', value: admission.status, detail: admission.type, tone: 'science' },
    { label: 'My sessions', value: sessionCount, detail: 'on your schedule', tone: 'technology' },
    { label: 'Bookings', value: `${confirmedBookings}/3`, detail: 'confirmed', tone: 'mathematics' },
  ]

  return (
    <section aria-labelledby="attendee-summary-heading">
      <h2 className="attendee-small-heading" id="attendee-summary-heading">Your plan at a glance</h2>
      <dl className="attendee-summary">
        {items.map(item => (
          <div className={`attendee-summary-card attendee-summary-${item.tone}`} key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
            <dd className="attendee-summary-detail">{item.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
