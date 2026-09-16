import { Link } from 'react-router-dom'
import logo from '../../assets/steamcon-logo.png'

export default function BookingPageHeader({ label }) {
  return (
    <header className="booking-page-header">
      <div className="container booking-page-header-inner">
        <Link className="booking-page-brand" to="/" aria-label="STEAM Con home">
          <img src={logo} width="1828" height="860" alt="STEAM Con" />
          <span>{label}</span>
        </Link>
        <Link className="booking-page-back" to="/attendee">← Attendee dashboard</Link>
      </div>
    </header>
  )
}
