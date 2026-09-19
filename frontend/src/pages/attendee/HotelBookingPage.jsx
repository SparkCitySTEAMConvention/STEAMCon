import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TravelBookingNav from '../../components/attendee/TravelBookingNav.jsx'
import {
  formatBookingDate,
  loadTravelBookings,
  makeConfirmationCode,
  saveTravelBooking,
} from '../../utils/travelBookings.js'
import './TravelBooking.css'

const hotels = [
  {
    id: 'staybridge',
    name: 'Staybridge Suites',
    area: 'Convention District',
    distance: '0.3 miles from STEAM Con',
    rate: 189,
    tone: 'science',
    features: ['Breakfast included', 'Kitchenette', 'Event shuttle'],
  },
  {
    id: 'riverside',
    name: 'Riverside Hotel',
    area: 'Riverfront',
    distance: '0.7 miles from STEAM Con',
    rate: 164,
    tone: 'technology',
    features: ['River views', 'Fitness center', 'Free Wi-Fi'],
  },
  {
    id: 'foundry',
    name: 'The Foundry',
    area: 'Arts District',
    distance: '1.1 miles from STEAM Con',
    rate: 142,
    tone: 'art',
    features: ['Boutique rooms', 'Cafe downstairs', 'Late checkout'],
  },
]

function countNights(checkIn, checkOut) {
  if (!checkIn || !checkOut || checkOut <= checkIn) return 0
  const millisecondsPerDay = 24 * 60 * 60 * 1000
  return Math.round((new Date(`${checkOut}T12:00:00`) - new Date(`${checkIn}T12:00:00`)) / millisecondsPerDay)
}

export default function HotelBookingPage() {
  const initialBooking = loadTravelBookings().hotel
  const [booking, setBooking] = useState(initialBooking || null)
  const [showConfirmation, setShowConfirmation] = useState(Boolean(initialBooking))
  const [checkIn, setCheckIn] = useState(initialBooking?.checkIn || '')
  const [checkOut, setCheckOut] = useState(initialBooking?.checkOut || '')
  const [guests, setGuests] = useState(initialBooking?.guests || '1 guest')
  const [rooms, setRooms] = useState(initialBooking?.rooms || '1')
  const [selectedHotelId, setSelectedHotelId] = useState(initialBooking?.hotelId || '')
  const [error, setError] = useState('')

  const selectedHotel = hotels.find(hotel => hotel.id === selectedHotelId)
  const nights = countNights(checkIn, checkOut)
  const total = useMemo(
    () => selectedHotel && nights ? selectedHotel.rate * nights * Number(rooms) : 0,
    [nights, rooms, selectedHotel],
  )

  function reserveHotel(event) {
    event.preventDefault()

    if (!selectedHotel) {
      setError('Choose a hotel before reserving your room.')
      return
    }

    if (!nights) {
      setError('Check-out must be after your check-in date.')
      return
    }

    const confirmedBooking = {
      hotelId: selectedHotel.id,
      hotelName: selectedHotel.name,
      checkIn,
      checkOut,
      guests,
      rooms,
      nights,
      nightlyRate: selectedHotel.rate,
      total,
      confirmationCode: initialBooking?.confirmationCode || makeConfirmationCode('HTL'),
    }
    saveTravelBooking('hotel', confirmedBooking)
    setBooking(confirmedBooking)
    setShowConfirmation(true)
    setError('')
  }

  return (
    <div className="travel-booking-page hotel-booking-page">
      <a className="skip-link" href="#hotel-booking-main">Skip to hotels</a>

      <div className="container travel-booking-main" id="hotel-booking-main" tabIndex={-1}>
        <TravelBookingNav active="hotel" />

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
                <div><dt>Demo total</dt><dd>${booking.total.toLocaleString()}</dd></div>
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
              <span>{hotels.length} demo hotels</span>
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
                      <div className="hotel-rate"><span>Demo rate</span><strong>${hotel.rate}</strong><small>/ night</small></div>
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
                <span>Demo total</span>
                <strong>{total ? `$${total.toLocaleString()}` : '—'}</strong>
              </div>
              <button className="button button-dark" type="submit">Reserve this room <span aria-hidden="true">→</span></button>
              <p className="travel-form-error" aria-live="polite">{error}</p>
              <p className="travel-demo-note">Demo reservation only. No payment is collected and no room is held with a real hotel.</p>
            </section>
          </form>
        )}
      </div>
    </div>
  )
}
