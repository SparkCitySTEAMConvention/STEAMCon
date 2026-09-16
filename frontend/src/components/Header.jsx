import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <a className="wordmark" href="#top" aria-label="STEAM Con home">STEAM <span>Con</span><span className="brand-dot" aria-hidden="true" /></a>
        <nav aria-label="Main navigation">
          <a href="#events">Events</a>
          <a href="#tracks">Tracks</a>
          <Link to="/speaker">Speakers</Link>
          <a href="#travel">Travel</a>
          <a className="nav-register" href="#register">Register <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
    </header>
  )
}
