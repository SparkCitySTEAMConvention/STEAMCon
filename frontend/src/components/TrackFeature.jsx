import { useId } from 'react'
import { featuredTrackSession, featuredSessionSchedule, trackTreatment } from '../utils/trackFeature.js'
import './TrackFeature.css'
import TrackVisual from './TrackVisual.jsx'

export default function TrackFeature({ track, sessions = [] }) {
  const headingId = useId()
  const session = featuredTrackSession(track, sessions)
  return <section className={`track-feature track-feature-${trackTreatment(track)}`} aria-labelledby={headingId}>
    <TrackVisual track={track} />
    <div className="track-feature-copy">
      <p className="eyebrow">Featured track</p>
      <h2 id={headingId}>{track?.name || 'Explore the tracks'}</h2>
      <p className="track-feature-description">{track?.description || 'Discover the ideas and sessions in this track.'}</p>
      {session ? <article className="track-feature-session">
        <p className="eyebrow">Session spotlight</p>
        <h3>{session.title}</h3>
        <p>{session.description || 'Session details will be announced soon.'}</p>
        {session.mandatory && <p className="track-feature-mandatory">Mandatory session</p>}
        <p className="track-feature-schedule">{featuredSessionSchedule(session)}</p>
      </article> : <div className="track-feature-session">
        <h3>{track ? 'More ideas are on the way.' : 'Choose a track to get started.'}</h3>
        <p>{track ? 'No sessions have been published for this track yet. Explore another track or check back for program updates.' : 'When tracks are published, their sessions will appear here.'}</p>
      </div>}
    </div>
  </section>
}
