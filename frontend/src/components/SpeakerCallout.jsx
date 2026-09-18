import { Link } from 'react-router-dom'

export default function SpeakerCallout() {
  return (
    <section className="section speaker-section" id="speaker-registration" aria-labelledby="speaker-registration-heading">
      <div className="container speaker-inner">
        <div><p className="eyebrow">05 / Bring your perspective</p><h2 id="speaker-registration-heading">Join STEAM Con.</h2></div>
        <div className="speaker-copy">
          <Link className="button button-paper" to="/register?role=attendee">Register as an attendee <span aria-hidden="true">↗</span></Link>
          <Link className="button button-ice" to="/register?role=speaker">Register as a speaker <span aria-hidden="true">↗</span></Link>
          <p className="speaker-note"><Link to="/speakers">Explore proposed speakers.</Link> Already registered? <Link to="/speaker">Open the Speaker Portal.</Link></p>
        </div>
      </div>
    </section>
  )
}
