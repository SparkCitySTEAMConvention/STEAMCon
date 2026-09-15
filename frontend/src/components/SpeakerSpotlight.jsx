import SpeakerPortrait from './SpeakerPortrait.jsx'

const speakerHighlights = [
  { name: 'Kris Younger', initials: 'KY', track: 'Science', session: 'Opening keynote', tone: 'science' },
  { name: 'Jordan Lee', initials: 'JL', track: 'Technology', session: 'Creative code workshop', tone: 'technology' },
  { name: 'Dr. Nia Brooks', initials: 'NB', track: 'Mathematics', session: 'The mathematics inside music', tone: 'mathematics' },
  { name: 'Maya Chen', initials: 'MC', track: 'Art', session: 'Making data feel human', tone: 'art' },
]

export default function SpeakerSpotlight() {
  return (
    <section className="section speaker-spotlight" id="speakers" aria-labelledby="speaker-spotlight-heading">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">03 / Meet the minds</p>
            <h2 id="speaker-spotlight-heading">Big questions.<br />Generous voices.</h2>
          </div>
          <p>Meet a few of the people helping every discipline collide, connect, and become something new.</p>
        </div>

        <ul className="speaker-grid">
          {speakerHighlights.map(speaker => (
            <li className="speaker-card" key={speaker.name}>
              <SpeakerPortrait {...speaker} />
              <div className="speaker-card-copy">
                <p>{speaker.track}</p>
                <h3>{speaker.name}</h3>
                <span>{speaker.session}</span>
              </div>
            </li>
          ))}
        </ul>

        <p className="speaker-placeholder-note">Illustrated placeholders shown until approved speaker photography is available.</p>
      </div>
    </section>
  )
}
