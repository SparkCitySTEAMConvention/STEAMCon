import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import { bookingRepository } from '../services/bookingRepository.js'
import './TravelInfoPage.css'
import { conventionConfig } from '../config/conventionConfig.js'

const sampleDepartures = [
  {
    time: '8:10 AM',
    service: 'NJ Transit',
    destination: 'Newark Penn Station',
    terminal: 'Penn Station',
    status: 'On time',
  },
  {
    time: '8:30 AM',
    service: 'Amtrak',
    destination: 'Washington, DC',
    terminal: 'Moynihan Train Hall',
    status: 'Boarding',
  },
  {
    time: '8:45 AM',
    service: 'Metro-North',
    destination: 'New Haven',
    terminal: 'Grand Central',
    status: 'On time',
  },
]

const airports = [
  { code: 'LGA', name: 'LaGuardia Airport', note: 'Often the shortest trip into Manhattan and convenient for domestic flights.' },
  { code: 'JFK', name: 'John F. Kennedy International', note: 'A major international gateway with AirTrain connections to subway and rail.' },
  { code: 'EWR', name: 'Newark Liberty International', note: 'Serves the region from New Jersey with rail connections toward Manhattan.' },
]

export default function TravelInfoPage() {
  const [hotels, setHotels] = useState([])
  useEffect(() => {
    let active = true
    bookingRepository.getHotels().then(data => { if (active) setHotels(data) }).catch(() => { })
    return () => { active = false }
  }, [])
  const mapLocations = useMemo(() => [
    { id: 'venue', marker: 'C', name: 'Jacob K. Javits Convention Center', distance: 'Event venue', note: '429 11th Ave, New York, NY 10001' },
    ...hotels.slice(0, 3).map((hotel, index) => ({ id: `hotel-${index + 1}`, marker: String(index + 1), name: hotel.name, distance: 'New York City hotel', note: hotel.address })),
  ], [hotels])

  return (
    <div className="travel-guide-page">
      <a className="skip-link" href="#travel-guide-main">Skip to travel information</a>
      <Header />
      <main id="travel-guide-main" tabIndex={-1}>
        <section className="travel-guide-hero">
          <div className="container travel-guide-hero-grid">
            <div>
              <p className="eyebrow">Plan your New York visit</p>
              <h1>Come curious.<br />Arrive prepared.</h1>
              <p className="travel-guide-lede">STEAM Con is at the Jacob K. Javits Convention Center in New York City. Compare arrival options and nearby hotels as you plan your visit.</p>
              <div className="button-group">
                <Link className="button button-dark" to="/register?role=attendee">Register for STEAM Con <span aria-hidden="true">→</span></Link>
                <a className="button button-paper" href="#stay-nearby">View venue map</a>
              </div>
            </div>
            <div className="nyc-illustration" role="img" aria-label="Graphic illustration of the New York City skyline">
              <span className="nyc-sun" />
              <span className="nyc-building nyc-building-one" />
              <span className="nyc-building nyc-building-two" />
              <span className="nyc-building nyc-building-three" />
              <span className="nyc-building nyc-building-four" />
              <strong>NYC</strong>
            </div>
          </div>
        </section>

        <section className="container travel-guide-section travel-map-section" id="stay-nearby" aria-labelledby="stay-nearby-heading">
          <div className="travel-guide-heading">
            <div><p className="eyebrow">01 / Stay nearby</p><h2 id="stay-nearby-heading">See what is within walking distance.</h2></div>
            <p>Hotel names and addresses below are loaded from the STEAM Con database alongside the confirmed Javits Center venue.</p>
          </div>
          <div className="travel-map-layout">
            <div className="travel-map" role="img" tabIndex={0} aria-label={`Illustrative planning map for ${conventionConfig.venueName} and three example hotels; locations and walking times are placeholders. Hover over or focus the map to watch a person walk the route.`}>
              <span className="map-water" aria-hidden="true" />
              <span className="map-park" aria-hidden="true">CITY PARK</span>
              <span className="map-road map-road-one" aria-hidden="true" />
              <span className="map-road map-road-two" aria-hidden="true" />
              <span className="map-road map-road-three" aria-hidden="true" />
              <span className="map-road map-road-four" aria-hidden="true" />
              {mapLocations.map(location => (
                <span className={`map-pin map-pin-${location.id}`} key={location.id} aria-hidden="true">
                  <b>{location.marker}</b><small>{location.id === 'venue' ? 'Conference center' : `Hotel ${location.marker}`}</small>
                </span>
              ))}
              <span className="map-walking-route" aria-hidden="true" />
              <span className="map-traveler" aria-hidden="true"><span>●</span></span>
              <span className="map-scale" aria-hidden="true">Hover to explore · 5 min walk</span>
            </div>
            <ol className="map-location-list">
              {mapLocations.map(location => (
                <li key={location.id}>
                  <span className={`map-key map-key-${location.id}`} aria-hidden="true">{location.marker}</span>
                  <div><strong>{location.name}</strong><span>{location.distance}</span><small>{location.note}</small></div>
                </li>
              ))}
            </ol>
          </div>
          <p className="map-disclaimer"><strong>Planning note:</strong> Hotel records come from the STEAM Con database; exact walking times are not calculated by the application.</p>
        </section>

        <section className="container travel-guide-section" id="getting-here" aria-labelledby="getting-here-heading">
          <div className="travel-guide-heading">
            <div><p className="eyebrow">02 / Getting here</p><h2 id="getting-here-heading">Three airports. One connected city.</h2></div>
            <p>Compare the total trip—not only the airfare. Ground transportation time and cost vary by airport and time of day.</p>
          </div>
          <div className="airport-grid">
            {airports.map(airport => (
              <article className="airport-card" key={airport.code}>
                <span>{airport.code}</span><h3>{airport.name}</h3><p>{airport.note}</p>
              </article>
            ))}
          </div>
          <div className="flight-booking-callout">
            <div>
              <p className="eyebrow">Pass first. Travel second.</p>
              <h3>Ready to plan your flight?</h3>
              <p>Choose your STEAM Con pass before adding flight or train details. Once registered, your travel plans stay with your attendee itinerary.</p>
            </div>
            <div className="flight-booking-actions">
              <Link className="button button-dark" to="/register?role=attendee">Choose a conference pass <span aria-hidden="true">→</span></Link>
              <Link className="flight-booking-link" to="/attendee/travel">Already registered? Book travel <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </section>

        <section className="travel-guide-transit" id="departures" aria-labelledby="transit-heading">
          <div className="container">
            <div className="travel-guide-transit-grid">
              <div><p className="eyebrow">03 / Moving around</p><h2 id="transit-heading">The subway keeps the city close.</h2></div>
              <ul>
                <li><strong>Subway and bus</strong><span>Best for flexible, lower-cost trips throughout the city.</span></li>
                <li><strong>Rail connections</strong><span>Useful for airport transfers and travel from the wider region.</span></li>
                <li><strong>Walking and rideshare</strong><span>Good for shorter trips; allow extra time during peak traffic.</span></li>
              </ul>
            </div>

            <div className="transit-departures" aria-labelledby="departures-heading">
              <div className="transit-departures-heading">
                <div><p className="eyebrow">Departures preview</p><h3 id="departures-heading">Know where to catch your ride.</h3></div>
                <p>Preview common New York transit hubs before you travel. These demonstration times show how a future live departures board could work.</p>
              </div>
              <div className="departures-board">
                <div className="departures-board-header">
                  <div><span className="status-light" aria-hidden="true" /><strong>NYC departures preview</strong></div>
                  <span>Demo data · Not live</span>
                </div>
                <div className="departures-columns" aria-hidden="true">
                  <span>Time</span><span>Service and destination</span><span>Terminal</span><span>Status</span>
                </div>
                <ol className="departures-list">
                  {sampleDepartures.map((departure, index) => (
                    <li key={`${departure.time}-${departure.service}`}>
                      <time>{departure.time}</time>
                      <div><strong>{departure.service}</strong><span>{departure.destination}</span></div>
                      <span className="terminal-label">{departure.terminal}</span>
                      <span className={`departure-status ${index === 1 ? 'is-boarding' : ''}`}>{departure.status}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="departures-note"><strong>Travel note:</strong> Port Authority is primarily a bus terminal. Penn Station and Grand Central are the major Manhattan rail hubs shown here.</p>
            </div>
          </div>
        </section>

        <section className="container travel-guide-section" aria-labelledby="before-heading">
          <div className="travel-guide-heading">
            <div><p className="eyebrow">04 / Before you book</p><h2 id="before-heading">Start with your event pass.</h2></div>
            <p>Register first. Your attendee portal keeps travel, hotel, car-rental, sessions, and the combined itinerary in one place.</p>
          </div>
          <div className="travel-guide-callout">
            <div><strong>Venue update</strong><span>STEAM Con is planned for the Jacob K. Javits Convention Center, 429 11th Ave, New York, NY 10001.</span></div>
            <Link className="button button-dark" to="/register?role=attendee">Choose a pass <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
