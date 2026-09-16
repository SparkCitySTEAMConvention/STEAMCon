import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div><a className="wordmark" href="#top">STEAM <span>Con</span></a><p>Stay curious.<br />Build something together.</p></div>
          <section id="register" aria-labelledby="register-heading"><h2 id="register-heading">See you at STEAM Con.</h2><p><Link to="/register">Register as an attendee or speaker.</Link><br />Dates and location to be announced.</p></section>
          <section id="travel" aria-labelledby="travel-heading"><h2 id="travel-heading">Plan your visit</h2><p>Travel and accommodation information will be shared when event details are confirmed.</p></section>
        </div>
        <div className="footer-bottom"><p>© {new Date().getFullYear()} STEAM Con</p><a href="#top">Back to top <span aria-hidden="true">↑</span></a></div>
      </div>
    </footer>
  )
}
