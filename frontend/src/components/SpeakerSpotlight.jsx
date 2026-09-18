import { speakers } from '../mocks/speakers.js'

const featured = [
  { id: 'speaker-bill-nye', track: 'Science', session: 'Science for everyone' },
  { id: 'speaker-fei-fei-li', track: 'Technology', session: 'Human-centered artificial intelligence' },
  { id: 'speaker-refik-anadol', track: 'Art', session: 'Making data feel human' },
  { id: 'speaker-hannah-fry', track: 'Mathematics', session: 'The mathematics inside everyday life' },
].map(feature => ({ ...speakers.find(speaker => speaker.id === feature.id), ...feature }))

export default function SpeakerSpotlight() {
  return (
    <section className="section speaker-spotlight" id="speakers" aria-labelledby="speaker-spotlight-heading">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">04 / Meet the minds</p>
            <h2 id="speaker-spotlight-heading">Big questions.<br />Generous voices.</h2>
          </div>
          <p>Preview proposed voices who could help every discipline collide, connect, and become something new.</p>
        </div>

        <p className="speaker-disclosure">Proposed speakers only. No named person is confirmed, affiliated with, or endorsing STEAM Con.</p>

        <ul className="speaker-grid">
          {featured.map(speaker => (
            <li className="speaker-card" key={speaker.id}>
              <figure className={`speaker-portrait speaker-portrait-${speaker.track.toLowerCase()}`}>
                <img src={speaker.portrait.url} alt={`Portrait of ${speaker.name}`} loading="lazy" />
              </figure>
              <div className="speaker-card-copy">
                <p>{speaker.track}</p>
                <h3>{speaker.name}</h3>
                <span>{speaker.session}</span>
                <a className="speaker-photo-credit" href={speaker.portrait.source} target="_blank" rel="noreferrer">
                  Photo: {speaker.portrait.credit} · {speaker.portrait.license}
                </a>
              </div>
            </li>
          ))}
        </ul>

        <p className="speaker-placeholder-note">Photography is licensed through Wikimedia Commons. Selection does not imply participation or endorsement.</p>
      </div>
    </section>
  )
}
