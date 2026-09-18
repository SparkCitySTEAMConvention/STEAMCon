import { locationLabel } from '../utils/proposalPresentation.js'
import { conventionConfig } from '../mocks/conventionConfig.js'
import { conventionDayLabel, programCalendar } from '../utils/conventionCalendar.js'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { publicProgramPreview } from '../mocks/publicProgram.js'

function trackSlug(track) {
  return (track || 'unknown').toLowerCase().replaceAll(' ', '-')
}

export default function ScheduleByDay({ sessions = publicProgramPreview.schedule, tracks = publicProgramPreview.trackNames, live = false, date, selectedTrack, onDateChange, onTrackChange, publicOnly = false }) {
  const days = conventionConfig.dates
  const calendar = programCalendar(sessions)
  const unplaced = calendar.filter(session => !days.includes(session.calendarDate)).length
  const [localDay, setLocalDay] = useState(days[0] ?? '')
  const [localTrack, setLocalTrack] = useState('All tracks')
  const activeDay = date ?? localDay
  const activeTrack = selectedTrack ?? localTrack
  const setActiveDay = onDateChange ?? setLocalDay
  const setActiveTrack = onTrackChange ?? setLocalTrack

  const visibleSessions = calendar.filter(session => (
    session.calendarDate === activeDay && (activeTrack === 'All tracks' || session.track === activeTrack)
  ))

  return (
    <section className="section schedule-section" id="schedule-by-day" aria-labelledby="schedule-preview-heading">
      <div className="container">
        <div className="section-heading schedule-heading">
          <div>
            <p className="eyebrow">03 / Plan your days</p>
            <h2 id="schedule-preview-heading">See what’s happening,<br />day by day.</h2>
          </div>
          <p>{live ? 'Published session occurrences in Eastern Time (America/New_York). Rooms are to be announced.' : 'Browse a preview across all five tracks, then register to start building your own schedule.'}</p>
        </div>

        <div className="schedule-browser">
          <div className="schedule-toolbar">
            <div className="schedule-days" aria-label="Choose a conference day">
              {days.map((day, index) => (
                <button
                  className={activeDay === day ? 'is-active' : ''}
                  type="button"
                  aria-pressed={activeDay === day}
                  aria-current={activeDay === day ? 'date' : undefined}
                  onClick={() => setActiveDay(day)}
                  key={day}
                >
                  <span>{conventionDayLabel(day)}</span>
                  <small>{`Day ${index + 1}`}</small>
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
            Showing {visibleSessions.length} {visibleSessions.length === 1 ? 'event' : 'events'} for {conventionDayLabel(activeDay)}
          </p>

          {visibleSessions.length > 0 ? (
            <ol className="schedule-list">
              {visibleSessions.map(session => (
                <li className={`schedule-row schedule-${trackSlug(session.track)}`} key={session.id}>
                  <article>
                    <div className="schedule-time">
                      <span>{conventionDayLabel(activeDay)}</span>
                      <strong>{session.time}</strong>
                    </div>
                    <div className="schedule-session-copy">
                      <div className="schedule-tags">
                        <span className="schedule-track-tag">{session.track || 'Track to be announced'}</span>
                        {!publicOnly && <span>{session.format || 'Session'}</span>}
                        {!publicOnly && session.mandatory && <span>All attendees</span>}
                      </div>
                      <h3>{session.title}</h3>
                      {!publicOnly && <p>{session.speaker || 'Speaker to be announced'}</p>}
                    </div>
                    <div className="schedule-location">
                      <span>Location</span>
                      <strong>{'Room to be announced'}</strong>

                    </div>
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <div className="schedule-empty">
              <p className="eyebrow">No events in this view</p>
              <h3>{activeTrack !== 'All tracks' ? 'Try another track.' : 'No session occurrences are listed for this day yet.'}</h3>
              <button type="button" onClick={() => setActiveTrack('All tracks')}>Show every track</button>
            </div>
          )}

          <div className="schedule-footer">
            <p>Convention venue: {locationLabel()}</p>
            {unplaced > 0 && <p>{unplaced} {unplaced === 1 ? 'occurrence is' : 'occurrences are'} awaiting a convention date or scheduled outside the three convention days.</p>}
            <p>{live ? 'Live program · Only published relationships are shown. Speaker identities and rooms are not supplied by the event API.' : 'Program preview · Session times are demonstration data. Exact opening times and rooms remain unconfirmed.'}</p>
            <Link className="button button-dark" to="/register?role=attendee">Register to build your schedule <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </div>
    </section>
  )
}
