import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <Link className="wordmark" to="/" aria-label="STEAM Con home">STEAM <span>Con</span><span className="brand-dot" aria-hidden="true" /></Link>
        <nav aria-label="Main navigation">
          <a href="/#events">Events</a>
          <a href="/#tracks">Tracks</a>
          <Link to="/speakers">Speakers</Link>
          <a href="/#travel">Travel</a>
          <a className="nav-register" href="/#register">Register <span aria-hidden="true">↗</span></a>
          <details className="nav-login">
            <summary>Log in</summary>
            <ul>
              <li><Link to="/speaker">Speaker Portal</Link></li>
              <li><Link to="/attendee">Attendee Portal</Link></li>
            </ul>
          </details>
        </nav>
      </div>
    </header>
  )
}
