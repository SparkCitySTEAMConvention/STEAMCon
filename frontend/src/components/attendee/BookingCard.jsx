export default function BookingCard({ booking, onOpen }) {
  return (
    <li className="attendee-booking-card">
      <article aria-labelledby={`${booking.id}-booking-title`}>
        <div className="attendee-booking-top">
          <p className="eyebrow">{booking.label}</p>
          <span className={`attendee-booking-status is-${booking.tone}`}>{booking.status}</span>
        </div>
        <h3 id={`${booking.id}-booking-title`}>{booking.title}</h3>
        <p>{booking.detail}</p>
        <button className="attendee-text-action" type="button" onClick={() => onOpen(booking)}>
          {booking.action} <span aria-hidden="true">→</span>
        </button>
      </article>
    </li>
  )
}
