import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { attendeeData } from '../mocks/attendeeData.js'

function trackSlug(track) {
  return (track || 'unknown').toLowerCase().replaceAll(' ', '-')
}

export default function ScheduleByDay({ sessions = attendeeData.sessions, tracks = attendeeData.tracks, live = false }) {
  const days = useMemo(() => [...new Set(sessions.map(session => session.day))], [sessions])
  const [activeDay, setActiveDay] = useState(days[0] ?? '')
  const [activeTrack, setActiveTrack] = useState('All tracks')

  const visibleSessions = sessions.filter(session => (
    session.day === (days.includes(activeDay) ? activeDay : days[0]) && (activeTrack === 'All tracks' || session.track === activeTrack)
  ))

  return (
    <section className="section schedule-section" id="schedule-by-day" aria-labelledby="schedule-preview-heading">
      <div className="container">
        <div className="section-heading schedule-heading">
          <div>
            <p className="eyebrow">03 / Plan your days</p>
            <h2 id="schedule-preview-heading">See what’s happening,<br />day by day.</h2>
          </div>
          <p>{live ? 'Published session occurrences. Times are displayed in UTC; the event timezone and rooms are not provided.' : 'Browse a preview across all five tracks, then register to start building your own schedule.'}</p>
        </div>

        <div className="schedule-browser">
          <div className="schedule-toolbar">
            <div className="schedule-days" aria-label="Choose a conference day">
              {days.map((day, index) => (
                <button
                  className={activeDay === day ? 'is-active' : ''}
                  type="button"
                  aria-pressed={activeDay === day}
                  onClick={() => setActiveDay(day)}
                  key={day}
                >
                  <span>{day}</span>
                  <small>{index === 0 ? 'Opening day' : 'Explore more'}</small>
                </button>
              ))}
            </div>

            <label className="schedule-track-filter">
              <span>Filter by track</span>
              <select value={activeTrack} onChange={event => setActiveTrack(event.target.value)}>
                <option>All tracks</option>
                {tracks.map(track => <option key={track}>{track}</option>)}
              </select>
            </label>
          </div>

          <p className="schedule-result-count" aria-live="polite">
            Showing {visibleSessions.length} {visibleSessions.length === 1 ? 'event' : 'events'} for {activeDay}
          </p>

          {visibleSessions.length > 0 ? (
            <ol className="schedule-list">
              {visibleSessions.map(session => (
                <li className={`schedule-row schedule-${trackSlug(session.track)}`} key={session.id}>
                  <article>
                    <div className="schedule-time">
                      <span>{session.day}</span>
                      <strong>{session.time}</strong>
                    </div>
                    <div className="schedule-session-copy">
                      <div className="schedule-tags">
                        <span className="schedule-track-tag">{session.track}</span>
                        <span>{session.format}</span>
                        {session.mandatory && <span>All attendees</span>}
                      </div>
                      <h3>{session.title}</h3>
                      <p>{session.speaker}</p>
                    </div>
                    <div className="schedule-location">
                      <span>Location</span>
                      <strong>{session.location || 'Room to be announced'}</strong>

                    </div>
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <div className="schedule-empty">
              <p className="eyebrow">No events in this view</p>
              <h3>{sessions.length ? 'Try another track.' : 'No session occurrences have been published yet.'}</h3>
              <button type="button" onClick={() => setActiveTrack('All tracks')}>Show every track</button>
            </div>
          )}

          <div className="schedule-footer">
            <p>{live ? 'Live program · Only published relationships are shown. Speaker identities and rooms are not supplied by the event API.' : 'Program preview · Times, rooms, and speakers are demonstration data while the team finalizes the event.'}</p>
            <Link className="button button-dark" to="/register?role=attendee">Register to build your schedule <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </div>
    </section>
  )
}
