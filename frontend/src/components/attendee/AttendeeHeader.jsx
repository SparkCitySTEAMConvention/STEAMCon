import { useRef } from 'react'
import AccountNavigation from '../../auth/AccountNavigation.jsx'
import { Link } from 'react-router-dom'
import logo from '../../assets/steamcon-logo.png'

export default function AttendeeHeader({ attendee, admission }) {
  const passDialog = useRef(null)
  return <header className="attendee-header">
    <div className="container attendee-header-top">
      <div className="attendee-brand"><Link to="/" aria-label="STEAM Con home"><img src={logo} width="1828" height="860" alt="STEAM Con" /></Link><span>Attendee Portal</span></div>
      <nav className="attendee-nav" aria-label="Attendee navigation">
        <a href="#schedule">Calendar</a><a href="#itinerary">Itinerary</a><a href="#discover">Tracks</a>
        <Link to="/attendee/forums">Attendee forum</Link>
        <Link to="/attendee/travel">Travel</Link><Link to="/attendee/hotel">Hotels</Link><Link to="/attendee/car">Cars</Link>
      </nav>
    </div>
    <div className="container workspace-account-bar">
      <button className="workspace-pass-button" type="button" onClick={() => passDialog.current.showModal()}>{admission.type} · {admission.status} ↗</button>
      <AccountNavigation />
    </div>
    <dialog ref={passDialog} className="workspace-pass-dialog" aria-labelledby="pass-heading">
      <h2 id="pass-heading">Your admission</h2><p>{admission.type} · {admission.status}</p>
      <dl><dt>Pass holder</dt><dd>{attendee.name}</dd><dt>Confirmation</dt><dd>{admission.confirmationCode}</dd></dl>
      <p>Demonstration admission details.</p><form method="dialog"><button className="button button-dark">Close</button></form>
    </dialog>
  </header>
}
