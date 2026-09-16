import { Link } from 'react-router-dom'

export default function BookingCard({ booking }) {
  return (
    <li className="attendee-booking-card">
      <article aria-labelledby={`${booking.id}-booking-title`}>
        <div className="attendee-booking-top">
          <p className="eyebrow">{booking.label}</p>
          <span className={`attendee-booking-status is-${booking.tone}`}>{booking.status}</span>
        </div>
        <h3 id={`${booking.id}-booking-title`}>{booking.title}</h3>
        <p>{booking.detail}</p>
        <Link className="attendee-text-action" to={booking.href}>
          {booking.action} <span aria-hidden="true">→</span>
        </Link>
      </article>
    </li>
  )
}
