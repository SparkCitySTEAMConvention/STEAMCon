import { Link } from 'react-router-dom'
import TrackBadge from './TrackBadge.jsx'
import { scheduleLabel, roomLabel } from '../../utils/proposalPresentation.js'
export default function ProposalCard({ proposal }) {
  return <li className={`portal-proposal portal-track-${proposal.trackId}`}><article aria-labelledby={`${proposal.id}-title`}>
    <div className="portal-card-meta"><TrackBadge trackId={proposal.trackId} />{proposal.additionalTrackIds?.map(trackId => <TrackBadge key={trackId} trackId={trackId} />)}<span className={`portal-status portal-status-${proposal.status.toLowerCase()}`}>{proposal.status}</span></div>
    <h3 id={`${proposal.id}-title`}><Link to={`/speaker/proposals/${proposal.id}`}>{proposal.title}</Link></h3>
    <p className="portal-muted">{proposal.format} · {proposal.durationMinutes} minutes</p>
    <p className="portal-schedule">{scheduleLabel(proposal)}</p><p className="portal-muted">{roomLabel(proposal)}</p>
    <Link className="portal-home" to={`/speaker/proposals/${proposal.id}`}>View Details<span className="portal-sr-only">: {proposal.title}</span></Link>
  </article></li>
}
