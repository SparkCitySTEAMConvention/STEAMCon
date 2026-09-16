import { Link } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import './TravelInfoPage.css'

const airports = [
  { code: 'LGA', name: 'LaGuardia Airport', note: 'Often the shortest trip into Manhattan and convenient for domestic flights.' },
  { code: 'JFK', name: 'John F. Kennedy International', note: 'A major international gateway with AirTrain connections to subway and rail.' },
  { code: 'EWR', name: 'Newark Liberty International', note: 'Serves the region from New Jersey with rail connections toward Manhattan.' },
]

const mapLocations = [
  { id: 'venue', marker: 'C', name: 'STEAM Con Conference Center', distance: 'Event venue', note: 'Final address to be announced.' },
  { id: 'hotel-one', marker: '1', name: 'Hotel One', distance: 'About a 4-minute walk', note: 'Closest example hotel.' },
  { id: 'hotel-two', marker: '2', name: 'Hotel Two', distance: 'About a 9-minute walk', note: 'Near subway connections.' },
  { id: 'hotel-three', marker: '3', name: 'Hotel Three', distance: 'About a 14-minute walk', note: 'Example lower-cost option.' },
]

export default function TravelInfoPage() {
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
              <p className="travel-guide-lede">STEAM Con is planned for New York City. Use this preview guide to compare arrival options and prepare for the neighborhood; the exact venue and event dates will be published after confirmation.</p>
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
            <p>This planning map uses placeholder locations and estimated walking times. We will replace them with confirmed hotel names, addresses, and distances when the venue is announced.</p>
          </div>
          <div className="travel-map-layout">
            <div className="travel-map" role="img" aria-label="Illustrative neighborhood map showing the STEAM Con Conference Center and three nearby hotels">
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
              <span className="map-scale" aria-hidden="true">5 min walk</span>
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
          <p className="map-disclaimer"><strong>Planning preview:</strong> These are demonstration locations—not bookable hotels or confirmed distances.</p>
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
            <div><strong>Venue update</strong><span>The exact New York venue, recommended hotel area, and dates are still to be announced.</span></div>
            <Link className="button button-dark" to="/register?role=attendee">Choose a pass <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
