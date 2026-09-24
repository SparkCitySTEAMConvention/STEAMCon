import TrackCard from './TrackCard.jsx'

export default function TrackGrid({ tracks = [], compact = false }) {
  return (
    <section className="section tracks-section" id="tracks" aria-labelledby="tracks-heading">
      <div className="container">
        <div className="section-heading">
          <div><p className="eyebrow">01 / Find your spark</p><h2 id="tracks-heading">Explore the five tracks.</h2></div>
        </div>
        {!tracks.length && <p role="status">No tracks have been published yet.</p>}
        <ul className="track-grid">
          {tracks.map((track, index) => <TrackCard key={track.id || track.slug} {...track} compact={compact} number={`0${index + 1}`} />)}
        </ul>
      </div>
    </section>
  )
}
