import { Link } from 'react-router-dom'

export default function SpeakerCallout() {
  return (
    <section className="section speaker-section" id="speaker-registration" aria-labelledby="speaker-registration-heading">
      <div className="container speaker-inner">
        <div><p className="eyebrow">05 / Bring your perspective</p><h2 id="speaker-registration-heading">Your ideas deserve<br />a room of curious minds.</h2></div>
        <div className="speaker-copy">
          <p>Have something to share? Help spark the conversations that connect science, technology, engineering, art, and mathematics.</p>
          <Link className="button button-ice" to="/register?role=speaker">Register as a speaker <span aria-hidden="true">↗</span></Link>
          <p className="speaker-note">Already registered? <Link to="/speaker">Open the Speaker Portal.</Link></p>
        </div>
      </div>
    </section>
  )
}
