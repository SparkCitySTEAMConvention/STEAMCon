import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import { bookingRepository } from '../services/bookingRepository.js'
import './TravelInfoPage.css'

const airports = [
  { code: 'LGA', name: 'LaGuardia Airport', note: 'Often the shortest trip into Manhattan and convenient for domestic flights.' },
  { code: 'JFK', name: 'John F. Kennedy International', note: 'A major international gateway with AirTrain connections to subway and rail.' },
  { code: 'EWR', name: 'Newark Liberty International', note: 'Serves the region from New Jersey with rail connections toward Manhattan.' },
]



export default function TravelInfoPage() {
  const [hotels, setHotels] = useState([])
  useEffect(() => {
    let active = true
    bookingRepository.getHotels().then(data => { if (active) setHotels(data) }).catch(() => {})
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
            <div className="travel-map" role="img" tabIndex={0} aria-label="Illustrative neighborhood map showing the STEAM Con Conference Center and three nearby hotels. Hover over or focus the map to watch a person walk the route.">
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
        </section>

        <section className="travel-guide-transit" aria-labelledby="transit-heading">
          <div className="container travel-guide-transit-grid">
            <div><p className="eyebrow">03 / Moving around</p><h2 id="transit-heading">The subway keeps the city close.</h2></div>
            <ul>
              <li><strong>Subway and bus</strong><span>Best for flexible, lower-cost trips throughout the city.</span></li>
              <li><strong>Rail connections</strong><span>Useful for airport transfers and travel from the wider region.</span></li>
              <li><strong>Walking and rideshare</strong><span>Good for shorter trips; allow extra time during peak traffic.</span></li>
            </ul>
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
