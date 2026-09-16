import { useMemo, useState } from 'react'
import AttendeeHeader from '../../components/attendee/AttendeeHeader.jsx'
import AttendeeSummary from '../../components/attendee/AttendeeSummary.jsx'
import BookingCard from '../../components/attendee/BookingCard.jsx'
import ItineraryItem from '../../components/attendee/ItineraryItem.jsx'
import SessionCard from '../../components/attendee/SessionCard.jsx'
import { attendeeRepository } from '../../services/attendeeRepository.js'
import { buildTravelItinerary, getBookingCards, loadTravelBookings } from '../../utils/travelBookings.js'
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

  const bookingCards = useMemo(
    () => getBookingCards(data.bookings, savedTravelBookings),
    [data.bookings, savedTravelBookings],
  )

  const confirmedBookings = bookingCards.filter(booking => booking.status === 'Booked').length

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
    <div className="attendee-portal">
      <a className="skip-link" href="#attendee-main">Skip to content</a>
      <AttendeeHeader attendee={data.attendee} admission={data.admission} />

      <main className="container attendee-main" id="attendee-main" tabIndex={-1}>
        <section className="attendee-welcome" aria-labelledby="attendee-welcome-heading">
          <div>
            <p className="eyebrow">Your curiosity has a schedule</p>
            <h1 id="attendee-welcome-heading">Welcome back, {data.attendee.firstName}.</h1>
            <p>Build your STEAM Con experience, handle the trip, and see every plan in one place.</p>
          </div>
          <a className="button button-dark" href="#discover">Find a session <span aria-hidden="true">↓</span></a>
        </section>

        <p className="attendee-demo-note"><strong>Attendee workspace preview</strong> · Names, schedules, rooms, and confirmation numbers are demonstration data.</p>
        <p className="attendee-live-notice" id="attendee-notice" aria-live="polite">{notice}</p>

        <AttendeeSummary
          admission={data.admission}
          sessionCount={selectedSessions.length}
          confirmedBookings={confirmedBookings}
        />

        <section className="attendee-section attendee-section-priority" id="bookings" aria-labelledby="bookings-heading">
          <div className="attendee-section-heading">
            <div><p className="eyebrow">01 / Make the trip</p><h2 id="bookings-heading">Your travel, handled.</h2></div>
            <p>Book each part separately. We’ll bring the details together on your itinerary.</p>
          </div>
          <ul className="attendee-booking-grid">
            {bookingCards.map(booking => <BookingCard key={booking.id} booking={booking} />)}
          </ul>
        </section>

        <section className="attendee-section attendee-itinerary" id="itinerary" aria-labelledby="itinerary-heading">
          <div className="attendee-section-heading">
            <div><p className="eyebrow">02 / One clear plan</p><h2 id="itinerary-heading">Your itinerary.</h2></div>
            <p>Sessions and confirmed bookings appear together in chronological order.</p>
          </div>
          <ol className="attendee-itinerary-list">
            {itinerary.map((item, index) => <ItineraryItem key={item.id} item={item} index={index} />)}
          </ol>
        </section>

        <div className="attendee-primary-grid">
          <section id="schedule" aria-labelledby="schedule-heading">
            <div className="attendee-section-heading">
              <div><p className="eyebrow">03 / My schedule</p><h2 id="schedule-heading">What you’re showing up for.</h2></div>
              <span>{selectedSessions.length} sessions</span>
            </div>
            <ul className="attendee-session-list">
              {selectedSessions.map(session => (
                <SessionCard key={session.id} session={session} selected onToggle={toggleSession} compact />
              ))}
            </ul>
          </section>

          <aside className="attendee-admission" id="admission" aria-labelledby="admission-heading">
            <p className="eyebrow">Admission</p>
            <h2 id="admission-heading">{data.admission.type}</h2>
            <p className="attendee-admission-status"><span aria-hidden="true">✓</span> {data.admission.status}</p>
            <dl>
              <div><dt>Pass holder</dt><dd>{data.attendee.name}</dd></div>
              <div><dt>Confirmation</dt><dd>{data.admission.confirmationCode}</dd></div>
              <div><dt>Access</dt><dd>All five STEAM tracks</dd></div>
            </dl>
            <p className="attendee-admission-note">Keep this screen handy when you arrive. Your QR admission code will live here.</p>
          </aside>
        </div>

        <section className="attendee-section" id="discover" aria-labelledby="discover-heading">
          <div className="attendee-section-heading">
            <div><p className="eyebrow">04 / Follow your curiosity</p><h2 id="discover-heading">Find your next session.</h2></div>
            <p>Choose a track or explore the full preview schedule.</p>
          </div>
          <div className="attendee-filters" aria-label="Filter sessions by track">
            {['All', ...data.tracks].map(track => (
              <button
                className={activeTrack === track ? 'is-active' : ''}
                type="button"
                aria-pressed={activeTrack === track}
                onClick={() => setActiveTrack(track)}
                key={track}
              >
                {track}
              </button>
            ))}
          </div>
          <ul className="attendee-discover-grid">
            {visibleSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                selected={selectedSessionIds.includes(session.id)}
                onToggle={toggleSession}
              />
            ))}
          </ul>
        </section>

      </main>

      <footer className="container attendee-footer">
        <p>STEAM Con · A place for curious minds.</p>
        <p>Attendee Portal / Preview</p>
      </footer>
    </div>
  )
}
