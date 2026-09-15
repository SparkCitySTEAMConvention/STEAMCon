export default function SpeakerCallout() {
  return (
    <section className="section speaker-section" id="speakers" aria-labelledby="speakers-heading">
      <div className="container speaker-inner">
        <div><p className="eyebrow">03 / Bring your perspective</p><h2 id="speakers-heading">Your ideas deserve<br />a room of curious minds.</h2></div>
        <div className="speaker-copy">
          <p>Have something to share? Help spark the conversations that connect science, technology, engineering, art, and mathematics.</p>
          <a className="button button-ice" href="#speaker-updates">Get speaker details <span aria-hidden="true">↗</span></a>
          <p className="speaker-note" id="speaker-updates">Speaker submissions are not open yet. Details coming soon.</p>
        </div>
      </div>
    </section>
  )
}
