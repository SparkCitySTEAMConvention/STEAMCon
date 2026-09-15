import { Link } from 'react-router-dom'

export default function SpeakerCallout() {
  return (
    <section className="section speaker-section" id="speakers" aria-labelledby="speakers-heading">
      <div className="container speaker-inner">
        <div><p className="eyebrow">03 / Bring your perspective</p><h2 id="speakers-heading">Your ideas deserve<br />a room of curious minds.</h2></div>
        <div className="speaker-copy">
          <p>Have something to share? Help spark the conversations that connect science, technology, engineering, art, and mathematics.</p>
          <Link className="button button-ice" to="/speakers">Explore proposed speakers <span aria-hidden="true">↗</span></Link>
          <p className="speaker-note">Speaker submissions are not open yet. Details coming soon.</p>
        </div>
      </div>
    </section>
  )
}
