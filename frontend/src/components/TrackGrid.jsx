import TrackCard from './TrackCard.jsx'

const tracks = [
  { name: 'Science', slug: 'science', symbol: '◎', description: 'Ask bigger questions. Discover new perspectives.' },
  { name: 'Technology', slug: 'technology', symbol: '</>', description: 'Explore the tools changing how we connect and create.' },
  { name: 'Engineering', slug: 'engineering', symbol: '⌘', description: 'Turn bold ideas into things that work.' },
  { name: 'Art', slug: 'art', symbol: '✳', description: 'Challenge the familiar. Make room for imagination.' },
  { name: 'Mathematics', slug: 'mathematics', symbol: '∞', description: 'Find the patterns that open up new possibilities.' },
]

export default function TrackGrid() {
  return (
    <section className="section tracks-section" id="tracks" aria-labelledby="tracks-heading">
      <div className="container">
        <div className="section-heading">
          <div><p className="eyebrow">01 / Find your spark</p><h2 id="tracks-heading">Different disciplines.<br />Shared curiosity.</h2></div>
          <p>Start with what you love.<br />Leave with a whole new way of thinking.</p>
        </div>
        <ul className="track-grid">
          {tracks.map((track, index) => <TrackCard key={track.slug} {...track} number={`0${index + 1}`} />)}
        </ul>
      </div>
    </section>
  )
}
