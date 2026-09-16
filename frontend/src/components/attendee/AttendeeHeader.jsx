import AccountNavigation from '../../auth/AccountNavigation.jsx'
import { Link } from 'react-router-dom'
import logo from '../../assets/steamcon-logo.png'

export default function AttendeeHeader({ attendee, admission }) {
  return (
    <header className="attendee-header">
      <div className="container attendee-header-top">
        <div className="attendee-brand">
          <Link to="/" aria-label="STEAM Con home">
            <img src={logo} width="1828" height="860" alt="STEAM Con" />
          </Link>
          <span>Attendee Portal</span>
        </div>
        <nav className="attendee-nav" aria-label="Attendee navigation">
          <a href="#bookings">Travel</a>
          <a href="#itinerary">Itinerary</a>
          <a href="#schedule">My schedule</a>
          <a href="#discover">Find sessions</a>
          <Link to="/">Homepage <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
      <div className="container attendee-profile">
        <div className="attendee-person">
          <span className="attendee-avatar" aria-hidden="true">{attendee.firstName.charAt(0)}</span>
          <div>
            <p className="eyebrow">Attendee workspace</p>
            <p className="attendee-profile-name">{attendee.name}</p>
            <p className="attendee-muted">{attendee.email}</p>
          </div>
        </div>
        <a className="attendee-pass" href="#admission">
          <span><strong>{admission.type}</strong><small>{admission.status}</small></span>
          <span aria-hidden="true">→</span>
        </a>
      </div>
      <div className="container"><AccountNavigation /></div>
    </header>
  )
}
