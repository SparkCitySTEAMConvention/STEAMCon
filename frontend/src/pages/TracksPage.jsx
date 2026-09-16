import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import TrackFeature from '../components/TrackFeature.jsx'
import usePublicProgram from '../hooks/usePublicProgram.js'
import { trackTreatment } from '../utils/trackFeature.js'
import { trackQuery, selectedTrack, programSummary } from '../utils/trackNavigation.js'

export default function TracksPage() {
  const { source, resource } = usePublicProgram()
  const [searchParams, setSearchParams] = useSearchParams()
  const tracks = resource.data?.tracks || []
  const track = selectedTrack(tracks, searchParams.get('track'))
  const summary = programSummary(resource.data, source.mode === 'preview')
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Header />
    <main id="main" tabIndex={-1} className="container section">
      <div className="track-page-heading">
        <div><p className="eyebrow">01 / EXPLORE THE PROGRAM</p><h1>Five disciplines.<br />One shared future.</h1></div>
        <div className="track-page-introduction">
          <p>Explore Science, Technology, Engineering, Art, and Mathematics programming. Follow a familiar interest or discover a new perspective on the ideas shaping our shared future.</p>
          {resource.status === 'ready' && <div className="track-program-summary" aria-label="Program summary">
            <p>{summary.status}</p>
            <dl><div><dt>Tracks</dt><dd>{summary.trackCount}</dd></div><div><dt>Sessions</dt><dd>{summary.sessionCount}</dd></div></dl>
          </div>}
        </div>
      </div>
      <p>{source.mode === 'preview' ? 'Program preview · Development demonstration data' : 'Live program'}</p>
      {resource.status === 'loading' && <p role="status">Loading tracks…</p>}
      {resource.status === 'error' && <div role="alert"><p>Unable to load tracks. Please retry.</p><button type="button" className="button button-paper" onClick={resource.retry}>Retry tracks</button></div>}
      {resource.status === 'ready' && <>
        <div className="track-page-filters" role="group" aria-label="Choose a track">
          {tracks.map(item => <button type="button" key={item.id || item.name} className={`track-${trackTreatment(item)}`} aria-pressed={track === item} onClick={() => {
            const next = new URLSearchParams(searchParams)
            next.set('track', trackQuery(item))
            setSearchParams(next)
          }}>{item.name}</button>)}
        </div>
        <TrackFeature track={track} sessions={resource.data.sessions} />
      </>}
    </main>
    <Footer />
  </>
}
