import { locationLabel } from '../utils/proposalPresentation.js'
import { conventionConfig } from '../mocks/conventionConfig.js'
import { conventionDayLabel } from '../utils/conventionCalendar.js'
import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
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
            <p className="events-intro">Explore the ideas, people, and disciplines that bring STEAM Con together. Find your spark, browse the program, and plan your experience.</p>
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
          {events.map(event => <article key={event.id} data-event-id={event.id}>
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
      <section id="plan-your-experience" className="container section" aria-labelledby="events-plan-heading">
        <div className="section-heading"><div><p className="eyebrow">Your next steps</p><h2 id="events-plan-heading">Build your STEAM Con experience.</h2></div><p>From your first session to your arrival in New York, start planning here.</p></div>
        <aside className="events-overview" aria-labelledby="events-overview-heading">
          <p className="eyebrow">Stay curious. Come together.</p>
          <h2 id="events-overview-heading">One convention.<br />Five ways to explore.</h2>
          <p>Science · Technology · Engineering · Art · Mathematics</p>
          <dl>
            <div><dt>Destination</dt><dd>New York</dd></div>
            <div><dt>Dates & venue</dt><dd>{conventionDayLabel(conventionConfig.startsOn)} – {conventionDayLabel(conventionConfig.endsOn)}, {conventionConfig.startsOn.slice(0, 4)}. {locationLabel()}.</dd></div>
          </dl>
          <Link to="/travel">Plan your New York visit <span aria-hidden="true">↗</span></Link>
        </aside>
        <div className="events-plan-grid">
          <article><p className="eyebrow">01 / The program</p><h3>Follow your curiosity.</h3><p>Explore session descriptions and find the track that speaks to you.</p><Link to="/tracks">Explore all tracks <span aria-hidden="true">↗</span></Link></article>
          <article><p className="eyebrow">02 / Your pass</p><h3>Be part of it.</h3><p>Choose your pass and register to join the STEAM Con community.</p><Link to="/register?role=attendee">Register as an attendee <span aria-hidden="true">↗</span></Link></article>
          <article><p className="eyebrow">03 / Your visit</p><h3>Find your way here.</h3><p>Explore transportation, neighborhoods, and practical tips for New York.</p><Link to="/travel">Plan your travel <span aria-hidden="true">↗</span></Link></article>
        </div>
      </section>
    </main>
    <Footer />
  </>
}
