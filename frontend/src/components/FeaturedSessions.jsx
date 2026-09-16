export default function FeaturedSessions() {
  return (
    <section className="section sessions-section" id="events" aria-labelledby="sessions-heading">
      <div className="container">
        <div className="section-heading">
          <div><p className="eyebrow">02 / On the horizon</p><h2 id="sessions-heading">Ideas worth showing up for.</h2></div>
          <span className="status-label">Program coming soon</span>
        </div>
        <div className="sessions-placeholder">
          <div className="session-art" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="orbit orbit-three" /><span className="orbit-center">✳</span></div>
          <div className="session-copy">
            <p className="eyebrow">Featured sessions</p>
            <h3>A little space for<br />the next big idea.</h3>
            <p>Our program is taking shape. Check back for featured sessions, fresh perspectives, and opportunities to connect across disciplines.</p>
            <span className="placeholder-note">Session lineup to be announced</span>
          </div>
        </div>
      </div>
    </section>
  )
}
