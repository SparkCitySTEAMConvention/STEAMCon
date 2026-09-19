import { Link } from 'react-router-dom'

const steps = [
  { href: '/attendee/travel', number: '01', label: 'Air or train', id: 'travel' },
  { href: '/attendee/hotel', number: '02', label: 'Hotel', id: 'hotel' },
  { href: '/attendee/car', number: '03', label: 'Rental car', id: 'car' },
]

export default function TravelBookingNav({ active }) {
  return (
    <nav className="travel-booking-nav" aria-label="Trip booking steps">
      {steps.map(step => (
        <Link className={active === step.id ? 'is-active' : ''} to={step.href} aria-current={active === step.id ? 'page' : undefined} key={step.id}>
          <span>{step.number}</span>
          <strong>{step.label}</strong>
        </Link>
      ))}
    </nav>
  )
}
