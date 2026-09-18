import usePublicProgram from '../hooks/usePublicProgram.js'
import TrackGrid from './TrackGrid.jsx'
import FeaturedSessions from './FeaturedSessions.jsx'
import ScheduleByDay from './ScheduleByDay.jsx'

export default function PublicProgram() {
  const { source, resource } = usePublicProgram()
  return <>
    <div className="container" aria-label="Program data source">
      <p role="status">{source.mode === 'live' ? 'Live program · Backend B event data' : source.mode === 'preview' ? 'Program preview · Development demonstration data' : 'Live program unavailable · Sign in with a valid backend session'}</p>
      {resource.status === 'loading' && <p role="status">Loading program…</p>}
      {resource.status === 'error' && <div role="alert"><p>Unable to load the program. Please retry.</p><button className="button button-paper" type="button" onClick={resource.retry}>Retry program</button></div>}
    </div>
    {resource.status === 'ready' && <>
      <TrackGrid tracks={resource.data.tracks} />
      <FeaturedSessions sessions={resource.data.sessions} live={source.mode === 'live'} />
      <ScheduleByDay key={source.mode} sessions={resource.data.schedule || resource.data.sessions} tracks={resource.data.trackNames} live={source.mode === 'live'} />
    </>}
  </>
}
