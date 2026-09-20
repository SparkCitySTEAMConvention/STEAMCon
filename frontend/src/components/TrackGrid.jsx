import TrackCard from './TrackCard.jsx'

export default function TrackGrid({ tracks = [] }) {
  return (
    <section className="section tracks-section" id="tracks" aria-labelledby="tracks-heading">
      <div className="container">
        <div className="section-heading">
          <div><p className="eyebrow">01 / Find your spark</p><h2 id="tracks-heading">Different disciplines.<br />Shared curiosity.</h2></div>
          <p>Start with what you love.<br />Leave with a whole new way of thinking.</p>
        </div>
        {!tracks.length && <p role="status">No tracks have been published yet.</p>}
        <ul className="track-grid">
          {tracks.map((track, index) => <TrackCard key={track.id || track.slug} {...track} number={`0${index + 1}`} />)}
        </ul>
      </div>
    </section>
  )
}
