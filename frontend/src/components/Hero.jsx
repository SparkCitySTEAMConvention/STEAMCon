import { Link } from 'react-router-dom'
import steamConLogo from '../assets/steamcon-logo.png'

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="container hero-inner">
        <p className="eyebrow">Five disciplines. Endless possibilities.</p>
        <img className="steamcon-logo" src={steamConLogo} alt="STEAM Con" width="1828" height="860" fetchPriority="high" />
        <h1 id="hero-heading">Where curiosity becomes collaboration.</h1>
        <p className="hero-description">A meeting place for the thinkers, makers, and creative minds shaping what comes next.</p>
        <div className="button-group">
          <a className="button button-dark" href="#events">Explore Events <span aria-hidden="true">↗</span></a>
          <Link className="button button-paper" to="/attendee">Attendee Portal <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="hero-note"><span aria-hidden="true">↓</span> Follow your curiosity. Find your people.</div>
      </div>
    </section>
  )
}
