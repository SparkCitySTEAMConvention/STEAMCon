import { useEffect, useState } from 'react'
import SpeakerPortrait from './SpeakerPortrait.jsx'

export default function SpeakerSpotlight() {
  const [speakers, setSpeakers] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([fetch('/api/speakers'), fetch('/api/tracks')])
      .then(async ([speakerResponse, trackResponse]) => {
        if (!speakerResponse.ok || !trackResponse.ok) throw new Error()
        const [speakerRows, trackRows] = await Promise.all([speakerResponse.json(), trackResponse.json()])
        if (!active) return
        setSpeakers(speakerRows.slice(0, 4).map((speaker, index) => ({
          ...speaker,
          initials: (speaker.name || 'Speaker').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(),
          track: trackRows.find(track => track.id === speaker.trackIds?.[0])?.name || 'STEAM',
          session: speaker.approvedProposalTitles?.[0] || 'Session to be announced',
          tone: ['science', 'technology', 'engineering', 'art'][index % 4],
        })))
      })
      .catch(() => { if (active) setSpeakers([]) })
    return () => { active = false }
  }, [])

  return (
    <section className="section speaker-spotlight" id="speakers" aria-labelledby="speaker-spotlight-heading">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">04 / Meet the minds</p>
            <h2 id="speaker-spotlight-heading">Big questions.<br />Generous voices.</h2>
          </div>
          <p>Meet a few of the people helping every discipline collide, connect, and become something new.</p>
        </div>

        {speakers.length ? <ul className="speaker-grid">
          {speakers.map(speaker => (
            <li className="speaker-card" key={speaker.speakerId}>
              <SpeakerPortrait {...speaker} />
              <div className="speaker-card-copy">
                <p>{speaker.track}</p>
                <h3>{speaker.name}</h3>
                <span>{speaker.session}</span>
              </div>
            </li>
          ))}
        </ul> : <p role="status">Speaker highlights will appear when approved speaker records are available.</p>}

        <p className="speaker-placeholder-note">Illustrated placeholders shown until approved speaker photography is available.</p>
      </div>
    </section>
  )
}
