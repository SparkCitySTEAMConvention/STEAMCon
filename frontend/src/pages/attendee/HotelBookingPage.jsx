import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BookingPageHeader from '../../components/attendee/BookingPageHeader.jsx'
import TravelBookingNav from '../../components/attendee/TravelBookingNav.jsx'
import { formatBookingDate } from '../../utils/travelBookings.js'
import { bookingRepository } from '../../services/bookingRepository.js'
import './TravelBooking.css'

const hotelDefaults = { rate: null, area: 'New York City', distance: 'Near the Javits Center', tone: 'science', features: ['STEAM Con hotel option'] }


function countNights(checkIn, checkOut) {
  if (!checkIn || !checkOut || checkOut <= checkIn) return 0
  const millisecondsPerDay = 24 * 60 * 60 * 1000
  return Math.round((new Date(`${checkOut}T12:00:00`) - new Date(`${checkIn}T12:00:00`)) / millisecondsPerDay)
}

export default function HotelBookingPage() {
  const [hotels, setHotels] = useState([])
  const [booking, setBooking] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('1 guest')
  const [rooms, setRooms] = useState('1')
  const [selectedHotelId, setSelectedHotelId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([bookingRepository.getHotels(), bookingRepository.getHotelReservations()]).then(([hotelRows, reservations]) => {
      if (!active) return
      const models = hotelRows.map((hotel, index) => ({ ...hotelDefaults, ...hotel, tone: ['science','technology','art','mathematics'][index % 4], area: hotel.address || 'New York City' }))
      setHotels(models)
      const reservation = reservations[0]
      if (reservation) {
        const hotel = models.find(item => item.id === reservation.hotelId)
        const inDate = reservation.checkin?.slice(0,10) || ''
        const outDate = reservation.checkOut?.slice(0,10) || ''
        const nights = countNights(inDate, outDate)
        const model = { hotelId: reservation.hotelId, hotelName: hotel?.name || 'Hotel', checkIn: inDate, checkOut: outDate, guests: '1 guest', rooms: '1', nights, nightlyRate: null, total: null, confirmationCode: reservation.confirmationCode || reservation.id.slice(0,8).toUpperCase() }
        setBooking(model); setCheckIn(inDate); setCheckOut(outDate); setSelectedHotelId(reservation.hotelId); setShowConfirmation(true)
      }
    }).catch(() => setError('Unable to load hotel data from the backend.')).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const [error, setError] = useState('')

  const selectedHotel = hotels.find(hotel => hotel.id === selectedHotelId)
  const nights = countNights(checkIn, checkOut)
  const total = useMemo(
    () => selectedHotel?.rate && nights ? selectedHotel.rate * nights * Number(rooms) : null,
    [nights, rooms, selectedHotel],
  )

  async function reserveHotel(event) {
    event.preventDefault()

    if (!selectedHotel) {
      setError('Choose a hotel before reserving your room.')
      return
    }

    if (!nights) {
      setError('Check-out must be after your check-in date.')
      return
    }

    try {
      const saved = await bookingRepository.bookHotel(selectedHotel.id, checkIn, checkOut)
      const confirmedBooking = {
        hotelId: selectedHotel.id, hotelName: selectedHotel.name, checkIn, checkOut, guests, rooms, nights,
        nightlyRate: selectedHotel.rate, total, confirmationCode: saved.confirmationCode || saved.id.slice(0, 8).toUpperCase(),
      }
      setBooking(confirmedBooking)
      setShowConfirmation(true)
      setError('')
    } catch {
      setError('Reservation could not be saved to the STEAM Con database. Please try again.')
    }
  }

  return (
    <div className="travel-booking-page hotel-booking-page">
      <a className="skip-link" href="#hotel-booking-main">Skip to hotels</a>
      <BookingPageHeader label="Hotel Booking" />

      <main className="container travel-booking-main" id="hotel-booking-main" tabIndex={-1}>
        <TravelBookingNav active="hotel" />
        {loading && <p role="status">Loading hotels…</p>}

        {showConfirmation && booking ? (
          <section className="booking-confirmation hotel-confirmation" aria-labelledby="hotel-confirmation-heading" aria-live="polite">
            <div className="booking-confirmation-art hotel-confirmation-art" aria-hidden="true"><span>▦</span></div>
            <div className="booking-confirmation-copy">
              <p className="eyebrow">Room reserved</p>
              <h1 id="hotel-confirmation-heading">Your hotel is booked.</h1>
              <p>{booking.hotelName} is now part of your STEAM Con itinerary.</p>
              <dl className="booking-confirmation-details">
                <div><dt>Hotel</dt><dd>{booking.hotelName}</dd></div>
                <div><dt>Check-in</dt><dd>{formatBookingDate(booking.checkIn)} after 3:00 PM</dd></div>
                <div><dt>Check-out</dt><dd>{formatBookingDate(booking.checkOut)} by 11:00 AM</dd></div>
                <div><dt>Stay</dt><dd>{booking.nights} {booking.nights === 1 ? 'night' : 'nights'} · {booking.guests} · {booking.rooms} {booking.rooms === '1' ? 'room' : 'rooms'}</dd></div>
                <div><dt>Rate</dt><dd>{booking.total ? `$${booking.total.toLocaleString()}` : 'Not stored by STEAM Con'}</dd></div>
                <div><dt>Confirmation</dt><dd>{booking.confirmationCode}</dd></div>
              </dl>
              <div className="booking-confirmation-actions">
                <Link className="button button-dark" to="/attendee">View updated itinerary <span aria-hidden="true">→</span></Link>
                <button className="booking-secondary-action" type="button" onClick={() => setShowConfirmation(false)}>Change stay</button>
              </div>
            </div>
          </section>
        ) : (
          <form onSubmit={reserveHotel}>
            <section className="hotel-search-heading" aria-labelledby="hotel-booking-heading">
              <div>
                <p className="eyebrow">Stay close to the ideas</p>
                <h1 id="hotel-booking-heading">Find your STEAM Con stay.</h1>
              </div>
              <p>Compare nearby options, choose your dates, and keep the reservation with the rest of your trip.</p>
            </section>

            <div className="hotel-search-bar">
              <label><span>Check-in</span><input type="date" value={checkIn} onChange={event => setCheckIn(event.target.value)} required /></label>
              <label><span>Check-out</span><input type="date" value={checkOut} onChange={event => setCheckOut(event.target.value)} required /></label>
              <label><span>Guests</span><select value={guests} onChange={event => setGuests(event.target.value)}><option>1 guest</option><option>2 guests</option><option>3 guests</option><option>4 guests</option></select></label>
              <label><span>Rooms</span><select value={rooms} onChange={event => setRooms(event.target.value)}><option value="1">1 room</option><option value="2">2 rooms</option><option value="3">3 rooms</option></select></label>
            </div>

            <div className="hotel-results-heading">
              <div><p className="eyebrow">Nearby stays</p><h2>Choose what feels like home.</h2></div>
              <span>{hotels.length} available hotels</span>
            </div>

            <ul className="hotel-grid">
              {hotels.map(hotel => (
                <li className={`hotel-card ${selectedHotelId === hotel.id ? 'is-selected' : ''}`} key={hotel.id}>
                  <article>
                    <div className={`hotel-card-art hotel-card-art-${hotel.tone}`} aria-hidden="true">
                      <span className="hotel-art-sun" />
                      <span className="hotel-art-building" />
                      <span className="hotel-art-door" />
                    </div>
                    <div className="hotel-card-copy">
                      <p className="eyebrow">{hotel.area}</p>
                      <h3>{hotel.name}</h3>
                      <p className="hotel-distance">{hotel.distance}</p>
                      <ul>{hotel.features.map(feature => <li key={feature}>✓ {feature}</li>)}</ul>
                      <div className="hotel-rate"><span>Rate</span><strong>{hotel.rate ? `$${hotel.rate}` : 'TBD'}</strong><small>{hotel.rate ? '/ night' : ''}</small></div>
                      <button type="button" aria-pressed={selectedHotelId === hotel.id} onClick={() => setSelectedHotelId(hotel.id)}>
                        {selectedHotelId === hotel.id ? 'Selected' : 'Choose room'} <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>

            <section className="hotel-booking-summary" aria-labelledby="hotel-summary-heading">
              <div>
                <p className="eyebrow">Your selection</p>
                <h2 id="hotel-summary-heading">{selectedHotel ? selectedHotel.name : 'Choose a hotel to continue.'}</h2>
                <p>{selectedHotel && nights ? `${nights} ${nights === 1 ? 'night' : 'nights'} · ${guests} · ${rooms} ${rooms === '1' ? 'room' : 'rooms'}` : 'Add dates and select one of the nearby stays.'}</p>
              </div>
              <div className="hotel-summary-total">
                <span>Planning total</span>
                <strong>{total ? `$${total.toLocaleString()}` : 'Not stored'}</strong>
              </div>
              <button className="button button-dark" type="submit">Reserve this room <span aria-hidden="true">→</span></button>
              <p className="travel-form-error" aria-live="polite">{error}</p>
              <p className="travel-demo-note">Reservation is saved to your STEAM Con account. No outside hotel payment is processed.</p>
            </section>
          </form>
        )}
      </main>
    </div>
  )
}
