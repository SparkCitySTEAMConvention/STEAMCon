import { useId, useState } from 'react'
import { sessionsForTrack, filterTrackSessions } from '../utils/trackProgram.js'
import { scheduleLabel } from '../utils/proposalPresentation.js'
import './TrackProgram.css'

export default function TrackProgram({ track, sessions = [] }) {
  const headingId = useId()
  const searchId = useId()
  const [query, setQuery] = useState('')
  const [mandatoryOnly, setMandatoryOnly] = useState(false)
  const related = sessionsForTrack(track, sessions)
  const visible = filterTrackSessions(related, query, mandatoryOnly)
  return <section className="track-program" aria-labelledby={headingId}>
    <p className="eyebrow">Explore every session</p>
    <h2 id={headingId}>{track?.name ? `${track.name} program` : 'Track program'}</h2>
    <p>Browse session details and published occurrences. Times are displayed in UTC.</p>
    <div className="track-program-controls">
      <div><label htmlFor={searchId}>Search titles and descriptions</label>
        <input id={searchId} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search this track" /></div>
      <label><input type="checkbox" checked={mandatoryOnly} onChange={event => setMandatoryOnly(event.target.checked)} /> Mandatory sessions only</label>
    </div>
    <p role="status">{visible.length} of {related.length} sessions</p>
    {visible.length ? <div className="track-program-list">{visible.map(session => <article key={session.id} className="track-program-session">
      {session.mandatory === true && <p className="eyebrow">Mandatory session</p>}
      <h3>{session.title}</h3>
      <p>{session.description || 'Session description to be announced.'}</p>
      <details>
        <summary>Occurrence times{session.occurrences?.length ? ` (${session.occurrences.length})` : ''}</summary>
        {session.occurrences?.length ? <ul>{session.occurrences.map((occurrence, index) => <li key={occurrence.id ?? index}>
          {scheduleLabel({ scheduledAt: occurrence.scheduledAt, endsAt: occurrence.endsAt, timezone: 'UTC' }, { timezone: null })}
        </li>)}</ul> : <p>Date and time to be announced.</p>}
      </details>
    </article>)}</div> : <p>{related.length ? 'No sessions match these filters. Try another search or clear the filters.' : 'No sessions have been published for this track yet.'}</p>}
    {(query || mandatoryOnly) && <button type="button" className="button button-paper" onClick={() => { setQuery(''); setMandatoryOnly(false) }}>Clear session filters</button>}
  </section>
}
