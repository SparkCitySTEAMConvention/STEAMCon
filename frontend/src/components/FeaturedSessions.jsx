export default function FeaturedSessions() {
  return (
    <section className="section sessions-section" id="events" aria-labelledby="sessions-heading">
      <div className="container">
        <div className="section-heading">
          <div><p className="eyebrow">02 / Featured science</p><h2 id="sessions-heading">Ideas worth showing up for.</h2></div>
          <span className="status-label">Science track</span>
        </div>
        <div className="sessions-placeholder">
          <div className="session-art" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="orbit orbit-three" /><span className="orbit-center">✳</span></div>
          <div className="session-copy">
            <p className="eyebrow">Opening keynote</p>
            <h3>The questions that<br />shape tomorrow.</h3>
            <p>Open STEAM Con with a shared challenge: stay curious enough to build what does not exist yet.</p>
            <span className="placeholder-note">Kris Younger · Main Stage · Day 1</span>
          </div>
        </div>
      </div>
    </section>
  )
}
