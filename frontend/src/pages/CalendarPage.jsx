import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import CalendarView from '../components/CalendarView.jsx'
import usePublicProgram from '../hooks/usePublicProgram.js'
import './CalendarPage.css'

export default function CalendarPage() {
  const { source, resource } = usePublicProgram()
  const live = source.mode === 'live'

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Header />
    <main id="main" tabIndex={-1} className="calendar-page">
      <section className="calendar-hero" aria-labelledby="calendar-heading">
        <div className="container calendar-hero-inner">
          <p className="eyebrow">STEAM Con / Calendar</p>
          <h1 id="calendar-heading">The full program, day by day.</h1>
          <p className="calendar-intro">Browse every published session and filter by Science, Technology, Engineering, Art, and Mathematics.</p>
        </div>
      </section>
      <section className="container calendar-section">
        <p role="status">{live ? 'Live program · Published session times are displayed in UTC.' : source.mode === 'preview' ? 'Program preview · Times, rooms, and speakers are demonstration data.' : 'Live program unavailable · Sign in with a valid backend session.'}</p>
        {resource.status === 'loading' && <p role="status">Loading calendar…</p>}
        {resource.status === 'error' && <div role="alert"><p>Unable to load the calendar. Please retry.</p><button type="button" className="button button-paper" onClick={resource.retry}>Retry calendar</button></div>}
        {resource.status === 'ready' && <CalendarView sessions={resource.data.schedule || resource.data.sessions} live={live} />}
      </section>
      <nav className="events-navigation container" aria-label="Calendar navigation">
        <Link to="/events">Browse experiences <span aria-hidden="true">↗</span></Link>
        <Link to="/tracks">Explore tracks <span aria-hidden="true">↗</span></Link>
        <Link to="/register?role=attendee">Register to build your schedule <span aria-hidden="true">↗</span></Link>
      </nav>
    </main>
    <Footer />
  </>
}
