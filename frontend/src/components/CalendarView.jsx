import { useState } from 'react'
import { conventionConfig } from '../mocks/conventionConfig.js'
import { conventionDayLabel, programCalendar } from '../utils/conventionCalendar.js'
import { allCategoryCodes, steamCategories, trackCategoryCode, trackCategorySlug } from '../utils/trackCategory.js'
import './CalendarView.css'

export default function CalendarView({ sessions = [], live = false }) {
  const [activeCategories, setActiveCategories] = useState(allCategoryCodes)
  const allActive = activeCategories.size === steamCategories.length
  const days = conventionConfig.dates
  const calendar = programCalendar(sessions)

  function toggleCategory(code) {
    setActiveCategories(current => {
      const next = new Set(current)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const visibleSessions = calendar.filter(session => {
    const code = trackCategoryCode(session.track)
    return allActive || (code != null && activeCategories.has(code))
  })
  const unplaced = visibleSessions.filter(session => !days.includes(session.calendarDate)).length

  return (
    <div className="calendar-view">
      <div className="calendar-filters" role="group" aria-label="Filter the calendar by STEAM category">
        <button type="button" aria-pressed={allActive} onClick={() => setActiveCategories(allCategoryCodes())}>All</button>
        {steamCategories.map(category => (
          <button
            key={category.code}
            type="button"
            className={`calendar-category calendar-${category.slug}${activeCategories.has(category.code) ? ' is-active' : ''}`}
            aria-pressed={activeCategories.has(category.code)}
            aria-label={`Filter by ${category.name}`}
            title={category.name}
            onClick={() => toggleCategory(category.code)}
          >
            {category.code}
          </button>
        ))}
      </div>

      <p className="calendar-result-count" aria-live="polite">
        Showing {visibleSessions.length} {visibleSessions.length === 1 ? 'event' : 'events'} across {days.length} days
      </p>

      {visibleSessions.length === 0 ? (
        <div className="calendar-empty">
          <p className="eyebrow">No events match this filter</p>
          <h3>Try another category.</h3>
          <button type="button" onClick={() => setActiveCategories(allCategoryCodes())}>Show every category</button>
        </div>
      ) : (
        <div className="calendar-grid">
          {days.map(day => {
            const daySessions = visibleSessions
              .filter(session => session.calendarDate === day)
              .sort((a, b) => (Date.parse(a.scheduledAt) || 0) - (Date.parse(b.scheduledAt) || 0))
            return (
              <section key={day} className="calendar-day" aria-labelledby={`calendar-day-${day}`}>
                <h3 id={`calendar-day-${day}`}>{conventionDayLabel(day)}</h3>
                {daySessions.length === 0 ? (
                  <p className="calendar-day-empty">No events scheduled.</p>
                ) : (
                  <ol>
                    {daySessions.map(session => (
                      <li key={session.id} className={`calendar-event calendar-${trackCategorySlug(session.track)}`}>
                        <span className="calendar-event-time">{session.time}</span>
                        <span className="calendar-event-category" aria-hidden="true">{trackCategoryCode(session.track) || '—'}</span>
                        <h4>{session.title}</h4>
                        <p>{session.track || 'Track to be announced'}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            )
          })}
        </div>
      )}

      {unplaced > 0 && <p className="calendar-footnote">{unplaced} {unplaced === 1 ? 'event is' : 'events are'} awaiting a convention date.</p>}
      <p className="calendar-footnote">{live ? 'Live program · Only published relationships are shown.' : 'Program preview · Development demonstration data.'}</p>
    </div>
  )
}
