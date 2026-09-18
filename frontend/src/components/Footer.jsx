import { conventionDateRange } from '../utils/conventionCalendar.js'
import { locationLabel } from '../utils/proposalPresentation.js'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div><a className="wordmark" href="#top">STEAM <span>Con</span></a><p>Stay curious.<br />Build something together.</p></div>
          <section id="register" aria-labelledby="register-heading"><h2 id="register-heading">See you at STEAM Con.</h2><p><Link to="/register">Register as an attendee or speaker.</Link><br />{conventionDateRange()}.</p></section>
          <section id="travel" aria-labelledby="travel-heading"><h2 id="travel-heading">Plan your visit</h2><p><Link to="/travel">Explore New York travel information.</Link><br />{locationLabel()}.</p></section>
        </div>
        <div className="footer-bottom"><p>© {new Date().getFullYear()} STEAM Con</p><a href="#top">Back to top <span aria-hidden="true">↑</span></a></div>
      </div>
    </footer>
  )
}
