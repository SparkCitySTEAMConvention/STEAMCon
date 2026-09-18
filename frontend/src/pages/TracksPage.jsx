import { sessionsForTrack } from '../utils/trackProgram.js'
import ScheduleByDay from '../components/ScheduleByDay.jsx'
import { selectedConventionDate } from '../utils/conventionCalendar.js'
import { Link, useSearchParams } from 'react-router-dom'
import { passRegistrationDestination } from '../utils/registrationQuery.js'
import { passes } from '../config/passes.js'
import './TracksPage.css'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import TrackFeature from '../components/TrackFeature.jsx'
import TrackProgram from '../components/TrackProgram.jsx'
import usePublicProgram from '../hooks/usePublicProgram.js'
import { trackTreatment } from '../utils/trackFeature.js'
import { trackQuery, selectedTrack, programSummary } from '../utils/trackNavigation.js'

export default function TracksPage() {
  const { source, resource } = usePublicProgram()
  const [searchParams, setSearchParams] = useSearchParams()
  const tracks = resource.data?.tracks || []
  const track = selectedTrack(tracks, searchParams.get('track'))
  const allTracks = searchParams.get('track') === 'all'
  const date = selectedConventionDate(searchParams.get('date'))
  function changeDate(value) {
    const next = new URLSearchParams(searchParams)
    next.set('date', value)
    next.set('track', allTracks ? 'all' : trackQuery(track || {}))
    setSearchParams(next)
  }
  function changeTrack(value) {
    const next = new URLSearchParams(searchParams)
    next.set('track', value)
    next.set('date', date)
    setSearchParams(next)
  }
  const summary = programSummary(resource.data, source.mode === 'preview')
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Header />
    <main id="main" tabIndex={-1} className="container section tracks-page">
      <div className="track-page-heading">
        <div><p className="eyebrow">01 / EXPLORE THE PROGRAM</p><h1>Five disciplines.<br />One shared future.</h1></div>
        <div className="track-page-introduction">
          <p>Choose a discipline, browse its sessions, and filter the three-day calendar.</p>
          {resource.status === 'ready' && <div className="track-program-summary" aria-label="Program summary">
            <p>{summary.status} · {source.mode === 'preview' ? 'Program preview · Development demonstration data' : 'Live program'}</p>
            <dl><div><dt>Tracks</dt><dd>{summary.trackCount}</dd></div><div><dt>Sessions</dt><dd>{summary.sessionCount}</dd></div></dl>
          </div>}
        </div>
      </div>
      {resource.status !== 'ready' && <p>{source.mode === 'preview' ? 'Program preview · Development demonstration data' : source.mode === 'live' ? 'Live program' : 'Live program unavailable · Sign in with a valid backend session'}</p>}
      {resource.status === 'loading' && <p role="status">Loading tracks…</p>}
      {resource.status === 'error' && <div role="alert"><p>Unable to load tracks. Please retry.</p><button type="button" className="button button-paper" onClick={resource.retry}>Retry tracks</button></div>}
      {resource.status === 'ready' && <>
        <div className="track-page-filters" role="group" aria-label="Choose a track">
          <button type="button" aria-pressed={allTracks} onClick={() => changeTrack('all')}>All tracks</button>
          {tracks.map(item => <button type="button" key={item.id || item.name} className={`track-${trackTreatment(item)}`} aria-pressed={track === item} onClick={() => changeTrack(trackQuery(item))}>{item.name}</button>)}
        </div>
        {allTracks ? <section className="track-all-summary" aria-labelledby="all-tracks-heading"><p className="eyebrow">Explore together</p><h2 id="all-tracks-heading">All tracks</h2><p>Browse published occurrences across every discipline in the three-day program.</p></section> : <TrackFeature track={track} sessions={resource.data.sessions} />}

        {!allTracks && <div className="track-program-layout">
          <TrackProgram key={track?.id ?? track?.name ?? 'empty'} track={track} sessions={resource.data.sessions} />
        </div>}
        <ScheduleByDay sessions={allTracks ? resource.data.schedule || [] : sessionsForTrack(track, resource.data.schedule || [])} tracks={resource.data.trackNames} live={source.mode === 'live'} publicOnly date={date} selectedTrack={allTracks ? 'All tracks' : track?.name || 'All tracks'} onDateChange={changeDate} onTrackChange={name => changeTrack(name === 'All tracks' ? 'all' : trackQuery({ name }))} />
        {!allTracks && <div className="track-program-layout">
          {track && <aside className="track-pass-section" aria-labelledby="track-pass-heading">
            <p className="eyebrow">Plan your visit</p>
            <h2 id="track-pass-heading">Choose your pass</h2>
            <p>Start your registration with {track.name} as your primary track.</p>
            <div className="track-pass-list">
              {Object.entries(passes).map(([name, pass]) => <article className="track-pass-card" key={pass.slug}>
                <h3>{name}</h3>
                <p className="track-pass-price">${pass.price}</p>
                <p>{pass.description}</p>
                <Link to={passRegistrationDestination(track, pass)} aria-label={`Choose this pass: ${name}`}>Choose this pass <span aria-hidden="true">↗</span></Link>
              </article>)}
            </div>
          </aside>}
        </div>}
      </>}
    </main>
    <Footer />
  </>
}
