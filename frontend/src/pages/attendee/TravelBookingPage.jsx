import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BookingPageHeader from '../../components/attendee/BookingPageHeader.jsx'
import TravelBookingNav from '../../components/attendee/TravelBookingNav.jsx'
import { formatBookingDate, formatBookingTime } from '../../utils/travelBookings.js'
import { bookingRepository } from '../../services/bookingRepository.js'
import './TravelBooking.css'

const emptyTravel = {
  mode: 'Flight',
  origin: '',
  destination: '',
  departureDate: '',
  departureTime: '',
  returnDate: '',
  returnTime: '',
}

const emptyCar = {
  pickupLocation: '',
  pickupDate: '',
  pickupTime: '',
  dropoffLocation: '',
  dropoffDate: '',
  dropoffTime: '',
  vehicle: 'Compact car',
}

export default function TravelBookingPage({ kind }) {
  const isCar = kind === 'car'
  const [booking, setBooking] = useState(null)
  const [formData, setFormData] = useState(isCar ? emptyCar : emptyTravel)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        if (isCar) {
          const rows = await bookingRepository.getCarRentals()
          const item = rows[0]
          if (active && item) {
            const pickup = new Date(item.pickupAt); const dropoff = new Date(item.dropoffAt)
            const model = { pickupLocation: item.pickupLocation, pickupDate: pickup.toISOString().slice(0,10), pickupTime: pickup.toISOString().slice(11,16), dropoffLocation: item.dropoffLocation, dropoffDate: dropoff.toISOString().slice(0,10), dropoffTime: dropoff.toISOString().slice(11,16), vehicle: 'Rental car', confirmationCode: item.id.slice(0,8).toUpperCase() }
            setBooking(model); setFormData(model); setShowConfirmation(true)
          }
        } else {
          const rows = await bookingRepository.getTravelLegs()
          if (active && rows.length) {
            const out = rows[0]; const back = rows[1] || rows[0]
            const dep = new Date(out.departureAt); const ret = new Date(back.departureAt)
            const model = { mode: 'Travel', origin: out.origin, destination: out.destination, departureDate: dep.toISOString().slice(0,10), departureTime: dep.toISOString().slice(11,16), returnDate: ret.toISOString().slice(0,10), returnTime: ret.toISOString().slice(11,16), confirmationCode: out.id.slice(0,8).toUpperCase() }
            setBooking(model); setFormData(model); setShowConfirmation(true)
          }
        }
      } catch { /* form remains available for a new booking */ }
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, [isCar])
  const [error, setError] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setFormData(current => ({ ...current, [name]: value }))
  }

  async function submitBooking(event) {
    event.preventDefault()
    const startDate = isCar ? formData.pickupDate : formData.departureDate
    const endDate = isCar ? formData.dropoffDate : formData.returnDate

    if (endDate < startDate) {
      setError(`${isCar ? 'Drop-off' : 'Return'} must be after your ${isCar ? 'pickup' : 'departure'} date.`)
      return
    }

    try {
      const saved = isCar ? await bookingRepository.bookCar(formData) : await bookingRepository.bookRoundTrip(formData)
      const id = isCar ? saved.id : saved.outbound.id
      const confirmedBooking = { ...formData, confirmationCode: id.slice(0, 8).toUpperCase() }
      setBooking(confirmedBooking)
      setShowConfirmation(true)
      setError('')
    } catch {
      setError('Booking could not be saved to the STEAM Con database. Please try again.')
    }
  }

  function changeBooking() {
    setShowConfirmation(false)
  }

  const pageLabel = isCar ? 'Ground Travel' : 'Travel Booking'
  const heading = isCar ? 'Reserve your ride.' : 'Book your way there and back.'

  return (
    <div className="travel-booking-page">
      <a className="skip-link" href="#travel-booking-main">Skip to booking</a>
      <BookingPageHeader label={pageLabel} />

      <main className="container travel-booking-main" id="travel-booking-main" tabIndex={-1}>
        <TravelBookingNav active={kind} />
        {loading && <p role="status">Loading saved booking…</p>}

        {showConfirmation && booking ? (
          <section className="booking-confirmation" aria-labelledby="booking-confirmation-heading" aria-live="polite">
            <div className="booking-confirmation-art" aria-hidden="true">
              <span>{isCar ? '⌁' : booking.mode === 'Train' ? '▰' : '✈'}</span>
            </div>
            <div className="booking-confirmation-copy">
              <p className="eyebrow">Booking confirmed</p>
              <h1 id="booking-confirmation-heading">Your {isCar ? 'rental car' : 'travel'} is booked.</h1>
              <p>The details below are saved to your attendee itinerary.</p>

              <dl className="booking-confirmation-details">
                {isCar ? (
                  <>
                    <div><dt>Vehicle</dt><dd>{booking.vehicle}</dd></div>
                    <div><dt>Pickup</dt><dd>{formatBookingDate(booking.pickupDate)} at {formatBookingTime(booking.pickupTime)}</dd></div>
                    <div><dt>Pickup location</dt><dd>{booking.pickupLocation}</dd></div>
                    <div><dt>Drop-off</dt><dd>{formatBookingDate(booking.dropoffDate)} at {formatBookingTime(booking.dropoffTime)}</dd></div>
                    <div><dt>Drop-off location</dt><dd>{booking.dropoffLocation}</dd></div>
                  </>
                ) : (
                  <>
                    <div><dt>Travel type</dt><dd>{booking.mode}</dd></div>
                    <div><dt>Departure</dt><dd>{formatBookingDate(booking.departureDate)} at {formatBookingTime(booking.departureTime)}</dd></div>
                    <div><dt>Route</dt><dd>{booking.origin} → {booking.destination}</dd></div>
                    <div><dt>Return</dt><dd>{formatBookingDate(booking.returnDate)} at {formatBookingTime(booking.returnTime)}</dd></div>
                  </>
                )}
                <div><dt>Confirmation</dt><dd>{booking.confirmationCode}</dd></div>
              </dl>

              <div className="booking-confirmation-actions">
                <Link className="button button-dark" to="/attendee">View updated itinerary <span aria-hidden="true">→</span></Link>
                <button className="booking-secondary-action" type="button" onClick={changeBooking}>Change booking</button>
              </div>
            </div>
          </section>
        ) : (
          <div className="travel-booking-layout">
            <section className="travel-booking-intro" aria-labelledby="travel-booking-heading">
              <p className="eyebrow">{isCar ? 'Pickup to drop-off' : 'Home to STEAM Con'}</p>
              <h1 id="travel-booking-heading">{heading}</h1>
              <p>{isCar
                ? 'Choose where and when you need the car. Both pickup and return will appear in your itinerary.'
                : 'Add both legs of the trip now so your departure, arrival, and return details stay in one place.'}</p>
              <div className="travel-route-art" aria-hidden="true">
                <span className="travel-route-point">A</span>
                <span className="travel-route-line" />
                <span className="travel-route-icon">{isCar ? '⌁' : '✈'}</span>
                <span className="travel-route-line" />
                <span className="travel-route-point">B</span>
              </div>
            </section>

            <form className="travel-booking-form" onSubmit={submitBooking}>
              <p className="eyebrow">Finish your booking</p>
              <h2>{isCar ? 'Rental details' : 'Trip details'}</h2>

              {!isCar && (
                <fieldset className="travel-mode-picker">
                  <legend>How are you traveling?</legend>
                  {['Flight', 'Train'].map(mode => (
                    <label className={formData.mode === mode ? 'is-active' : ''} key={mode}>
                      <input type="radio" name="mode" value={mode} checked={formData.mode === mode} onChange={updateField} />
                      <span aria-hidden="true">{mode === 'Flight' ? '✈' : '▰'}</span>
                      <strong>{mode}</strong>
                    </label>
                  ))}
                </fieldset>
              )}

              <div className="travel-field-grid">
                {isCar ? (
                  <>
                    <label className="travel-field-wide"><span>Pickup location</span><input name="pickupLocation" value={formData.pickupLocation} onChange={updateField} placeholder="Airport, station, or address" required /></label>
                    <label><span>Pickup date</span><input name="pickupDate" type="date" value={formData.pickupDate} onChange={updateField} required /></label>
                    <label><span>Pickup time</span><input name="pickupTime" type="time" value={formData.pickupTime} onChange={updateField} required /></label>
                    <label className="travel-field-wide"><span>Drop-off location</span><input name="dropoffLocation" value={formData.dropoffLocation} onChange={updateField} placeholder="Airport, station, or address" required /></label>
                    <label><span>Drop-off date</span><input name="dropoffDate" type="date" value={formData.dropoffDate} onChange={updateField} required /></label>
                    <label><span>Drop-off time</span><input name="dropoffTime" type="time" value={formData.dropoffTime} onChange={updateField} required /></label>
                    <label className="travel-field-wide"><span>Vehicle</span><select name="vehicle" value={formData.vehicle} onChange={updateField}><option>Compact car</option><option>Midsize SUV</option><option>Electric vehicle</option><option>Accessible van</option></select></label>
                  </>
                ) : (
                  <>
                    <label><span>Leaving from</span><input name="origin" value={formData.origin} onChange={updateField} placeholder="City or station" required /></label>
                    <label><span>Arriving at</span><input name="destination" value={formData.destination} onChange={updateField} placeholder="City or station" required /></label>
                    <label><span>Departure date</span><input name="departureDate" type="date" value={formData.departureDate} onChange={updateField} required /></label>
                    <label><span>Departure time</span><input name="departureTime" type="time" value={formData.departureTime} onChange={updateField} required /></label>
                    <label><span>Return date</span><input name="returnDate" type="date" value={formData.returnDate} onChange={updateField} required /></label>
                    <label><span>Return time</span><input name="returnTime" type="time" value={formData.returnTime} onChange={updateField} required /></label>
                  </>
                )}
              </div>

              <p className="travel-form-error" aria-live="polite">{error}</p>
              <button className="button button-dark travel-booking-submit" type="submit">Book {isCar ? 'rental car' : 'travel'} <span aria-hidden="true">→</span></button>
              <p className="travel-demo-note">Saved to your STEAM Con account. No outside airline, rail, or rental provider is contacted.</p>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
