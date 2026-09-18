import { useMemo, useState } from 'react'
import AttendeeHeader from '../../components/attendee/AttendeeHeader.jsx'
import ItineraryItem from '../../components/attendee/ItineraryItem.jsx'
import SessionCard from '../../components/attendee/SessionCard.jsx'
import { attendeeRepository } from '../../services/attendeeRepository.js'
import { buildTravelItinerary, loadTravelBookings } from '../../utils/travelBookings.js'
import './AttendeeDashboard.css'

const attendeePreview = attendeeRepository.getPreview()

export default function AttendeeDashboard({ data = attendeePreview }) {
  const [selectedSessionIds, setSelectedSessionIds] = useState(
    () => data.sessions.filter(session => session.enrolled).map(session => session.id),
  )
  const [activeTrack, setActiveTrack] = useState('All')
  const [notice, setNotice] = useState('')
  const [savedTravelBookings] = useState(() => loadTravelBookings())

  const selectedSessions = useMemo(
    () => data.sessions.filter(session => selectedSessionIds.includes(session.id)),
    [data.sessions, selectedSessionIds],
  )

  const visibleSessions = activeTrack === 'All'
    ? data.sessions
    : data.sessions.filter(session => session.track === activeTrack)

  const itinerary = useMemo(
    () => [...data.itinerary, ...buildTravelItinerary(savedTravelBookings), ...selectedSessions]
      .sort((first, second) => first.order - second.order),
    [data.itinerary, savedTravelBookings, selectedSessions],
  )

  const days = [...new Set(data.sessions.map(session => session.day))]
  const [activeDay, setActiveDay] = useState(() => days[0] || 'Day 1')
  const calendarSessions = selectedSessions.filter(session => session.day === activeDay).sort((a, b) => a.order - b.order)

  function toggleSession(session) {
    if (session.mandatory) return

    const isSelected = selectedSessionIds.includes(session.id)
    setSelectedSessionIds(current => isSelected
      ? current.filter(id => id !== session.id)
      : [...current, session.id])
    setNotice(isSelected
      ? `${session.title} was removed from your schedule.`
      : `${session.title} was added to your schedule.`)
  }

  return (
    <div className="attendee-portal attendee-workspace">
      <a className="skip-link" href="#attendee-main">Skip to content</a>
      <AttendeeHeader attendee={data.attendee} admission={data.admission} />
      <main className="container attendee-main" id="attendee-main" tabIndex={-1}>
        <div className="workspace-intro">
          <div><p className="eyebrow">Your STEAM Con</p><h1>Welcome back, {data.attendee.firstName}.</h1></div>
          <p>{selectedSessions.length} sessions in your plan</p>
        </div>
        <p className="workspace-demo">Preview data · Session changes last until you leave this dashboard. Travel bookings are saved on this device.</p>
        <p className="workspace-notice" aria-live="polite">{notice}</p>
        <div className="workspace-panels">
          <section className="workspace-panel calendar-panel" id="schedule" aria-labelledby="schedule-heading">
            <header className="workspace-panel-heading"><p className="eyebrow">01 / Your days</p><h2 id="schedule-heading">Calendar</h2></header>
            <div className="workspace-day-picker" aria-label="Calendar day">
              {days.map(day => <button type="button" key={day} aria-pressed={activeDay === day} onClick={() => setActiveDay(day)}>{day}</button>)}
            </div>
            <div className="workspace-panel-content" role="region" aria-label="Calendar events" tabIndex={0}>
              {calendarSessions.length ? <ol className="workspace-calendar">
                {calendarSessions.map(session => <li key={session.id} className={`attendee-track-${session.track.toLowerCase()}`}>
                  <p className="calendar-time">{session.time}</p>
                  <h3>{session.title}</h3>
                  <p>{session.track} · {session.location}</p>
                  <span>{session.mandatory ? 'Required event' : 'In your schedule'}</span>
                </li>)}
              </ol> : <p className="workspace-empty">No sessions planned for {activeDay}. Add one from Tracks &amp; events.</p>}
            </div>
          </section>
          <section className="workspace-panel itinerary-panel" id="itinerary" aria-labelledby="itinerary-heading">
            <header className="workspace-panel-heading"><p className="eyebrow">02 / All your plans</p><h2 id="itinerary-heading">Itinerary</h2><p>Sessions and travel together.</p></header>
            <div className="workspace-panel-content" role="region" aria-label="Combined itinerary" tabIndex={0}>
              {itinerary.length ? <ol className="attendee-itinerary-list">{itinerary.map((item, index) => <ItineraryItem key={item.id} item={item} index={index} />)}</ol> : <p className="workspace-empty">Your sessions and saved travel will appear here.</p>}
            </div>
          </section>
          <section className="workspace-panel tracks-panel" id="discover" aria-labelledby="discover-heading">
            <header className="workspace-panel-heading"><p className="eyebrow">03 / Explore the program</p><h2 id="discover-heading">Tracks &amp; events</h2></header>
            <div className="workspace-track-picker"><label htmlFor="attendee-track">Choose a track</label><select id="attendee-track" value={activeTrack} onChange={event => setActiveTrack(event.target.value)}>
              {['All', ...data.tracks].map(track => <option key={track} value={track}>{track === 'All' ? 'All five tracks' : track}</option>)}
            </select></div>
            <div className="workspace-panel-content" role="region" aria-label="Track events" tabIndex={0}>
              <ul className="attendee-session-list">{visibleSessions.map(session => <SessionCard key={session.id} session={session} selected={selectedSessionIds.includes(session.id)} onToggle={toggleSession} />)}</ul>
              {!visibleSessions.length && <p className="workspace-empty">No events are available for this track yet.</p>}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
