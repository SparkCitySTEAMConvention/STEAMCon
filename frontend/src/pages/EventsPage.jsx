import { locationLabel } from '../utils/proposalPresentation.js'
import { conventionConfig } from '../mocks/conventionConfig.js'
import { conventionDayLabel } from '../utils/conventionCalendar.js'
import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/layout/PublicPageHeader.jsx'
import Footer from '../components/Footer.jsx'
import TrackGrid from '../components/TrackGrid.jsx'
import ScheduleByDay from '../components/ScheduleByDay.jsx'
import usePublicProgram from '../hooks/usePublicProgram.js'
import './EventsPage.css'
import { eventExperiences, eventsForExperience, experienceDestination, selectedExperience } from '../config/eventExperiences.js'

export default function EventsPage() {
  const { source, resource } = usePublicProgram()
  const live = source.mode === 'live'
  const [searchParams] = useSearchParams()
  const experience = selectedExperience(searchParams.get('experience'))
  const scheduleSelected = experience.key === 'schedule'
  const events = eventsForExperience(experience.key)
  const featuredEvent = events.find(event => event.featured)
  const headingRef = useRef(null)
  const query = searchParams.get('experience') || ''
  const previousQuery = useRef(query)

  useEffect(() => {
    if (previousQuery.current !== query) {
      const heading = headingRef.current
      heading?.focus({ preventScroll: true })
      const bounds = heading?.getBoundingClientRect()
      if (bounds && (bounds.top < 0 || bounds.bottom > window.innerHeight)) {
        heading.scrollIntoView({ behavior: 'instant', block: 'start' })
      }
    }
    previousQuery.current = query
  }, [query])

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Header />
    <main id="main" tabIndex={-1} className="events-page">
      <section className="events-hero" aria-labelledby="events-heading">
        <div className="container events-hero-inner">
          <div>
            <p className="eyebrow">STEAM Con / Events</p>
            <h1 id="events-heading">Make room for discovery.</h1>
            <p className="events-intro">Choose an experience and explore the program.</p>
          </div>
        </div>
      </section>
      <section className="container events-experience" aria-labelledby="experience-heading" data-experience={experience.key}>
        <nav aria-label="Choose an event experience" className="events-navigation">
          {eventExperiences.map(item => <Link key={item.key} to={experienceDestination(item.key)} aria-current={experience.key === item.key ? 'page' : undefined}>{item.label}</Link>)}
        </nav>
        <p className="eyebrow">Selected experience / {experience.label}</p>
        <h2 id="experience-heading" ref={headingRef} tabIndex={-1}>{experience.label}</h2>
        <p>{experience.description}</p>
        {!scheduleSelected && <p role="status">Programming preview · Proposed experience. Experience programming is not confirmed. Dates, rooms, and speakers are to be announced. These proposed concepts are separate from published session records.</p>}
        {scheduleSelected && <div className="events-program-status">
          <p role="status">{live ? 'Live program · Published session times are displayed in Eastern Time.' : source.mode === 'preview' ? 'Program preview · Times, rooms, and speakers are demonstration data. Convention dates are confirmed; opening times and rooms are to be announced.' : 'Live program unavailable · Sign in with a valid backend session.'}</p>
          {resource.status === 'loading' && <p role="status">Loading events…</p>}
          {resource.status === 'error' && <div role="alert"><p>Unable to load events. Please retry.</p><button type="button" className="button button-paper" onClick={resource.retry}>Retry events</button></div>}
        </div>}
        {featuredEvent && <article className="events-overview events-featured" aria-labelledby="featured-event-heading" data-event-id={featuredEvent.id}>
          <p className="eyebrow">Featured concept · Programming preview</p>
          <h3 id="featured-event-heading">{featuredEvent.title}</h3>
          <p>{featuredEvent.description}</p>
          <p>Proposed event · Date, room, and speaker to be announced.</p>
        </article>}
        {!scheduleSelected && <div className="events-plan-grid events-collection" aria-label={`${experience.label} events`}>
          {events.filter(event => event.id !== featuredEvent?.id).map(event => <article key={event.id} data-event-id={event.id}>
            <p className="eyebrow">Proposed event · Programming preview</p>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>Date, room, and speaker to be announced.</p>
          </article>)}
        </div>}
      </section>
      {scheduleSelected && (resource.status === 'ready' ? <>
        <ScheduleByDay key={source.mode} sessions={resource.data.schedule || resource.data.sessions} tracks={resource.data.trackNames} live={live} />
        <TrackGrid tracks={resource.data.tracks} />
      </> : <>
        <section id="schedule-by-day" className="container section"><h2>Browse the schedule</h2><p>The schedule will appear here when the program loads.</p></section>
        <section id="tracks" className="container section"><h2>Explore tracks</h2><p><Link to="/tracks">Visit the Tracks page</Link> to explore the program.</p></section>
      </>)}
      <nav className="events-navigation container" aria-label="Events navigation">
        <Link to="/tracks">Explore tracks <span aria-hidden="true">↗</span></Link>
        <Link to={experienceDestination('schedule')}>Browse schedule <span aria-hidden="true">↗</span></Link>
        <Link to="/speakers">Meet the speakers <span aria-hidden="true">↗</span></Link>
        <a href="#plan-your-experience">Plan your experience <span aria-hidden="true">↓</span></a>
      </nav>
      <details id="plan-your-experience" className="container section events-planning">
        <summary>Plan your experience</summary>
        <p>{conventionDayLabel(conventionConfig.startsOn)} – {conventionDayLabel(conventionConfig.endsOn)}, {conventionConfig.startsOn.slice(0, 4)} · New York · {locationLabel()}.</p>
        <nav className="events-navigation" aria-label="Planning links">
          <Link to="/tracks">Explore all tracks</Link>
          <Link to="/register?role=attendee">Register as an attendee</Link>
          <Link to="/travel">Plan your travel</Link>
        </nav>
      </details>
    </main>
    <Footer />
  </>
}
