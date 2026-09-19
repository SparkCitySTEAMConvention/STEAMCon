import useSpeakerResource from '../../hooks/useSpeakerResource.js'
import { scheduleLabel } from '../../utils/proposalPresentation.js'

const labels = { TRAVEL: 'Travel', HOTEL: 'Hotel stay', CAR_RENTAL: 'Car rental', SESSION: 'Enrolled session' }

export default function SpeakerItinerary({ source, compact = false }) {
  const resource = useSpeakerResource(source.load, source)
  return <section className="portal-itinerary portal-detail-section" id="speaker-itinerary" tabIndex={-1} aria-labelledby="speaker-itinerary-heading">
    <div className="portal-section-heading">
      <div><p className="eyebrow">01 / One clear plan</p><h2 id="speaker-itinerary-heading">Your personal itinerary</h2></div>
      {resource.status === 'ready' && <span>{resource.data.length} entries</span>}
    </div>
    <p>Travel, stays, car rentals, and enrolled sessions in chronological order · Eastern Time (America/New_York).</p>
    <p className="portal-muted">Enrolled sessions are attendance plans. Speaking assignments appear separately in your schedule. Titles and locations are to be announced.</p>
    {source.demo && <p className="portal-demo">Personal calendar preview · Your live itinerary is available when you sign in with a speaker account.</p>}
    {resource.status === 'loading' && <p role="status">Loading your itinerary…</p>}
    {resource.status === 'error' && <div role="alert"><p>Unable to load your itinerary.</p><button className="button button-paper" type="button" onClick={resource.retry}>Retry itinerary</button></div>}
    {resource.status === 'ready' && <details open={!compact}><summary>View itinerary · {resource.data.length} entries</summary>{(resource.data.length ? <ol className="portal-itinerary-list">
      {resource.data.map((entry, index) => <li key={`${entry.entryType}-${entry.sourceId}-${index}`}>
        <h3>{labels[entry.entryType] || 'Calendar entry'}</h3>
        <p>{scheduleLabel({ scheduledAt: entry.startsAt, endsAt: entry.endsAt })}</p>
        <p className="portal-muted">Reference: {entry.sourceId}</p>
      </li>)}
    </ol> : <p>{source.demo ? 'No personal itinerary entries in this preview.' : 'No personal itinerary entries yet. Bookings and enrolled sessions will appear here when available.'}</p>)}</details>}
  </section>
}
