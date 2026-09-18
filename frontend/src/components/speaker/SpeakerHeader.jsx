import { Link } from 'react-router-dom'
import TrackBadge from './TrackBadge.jsx'

// Compact page identity/actions. PortalShell owns navigation and logout.
export default function SpeakerHeader({ speaker }) {
  return (
    <section className="container portal-profile" id="speaker-profile" tabIndex={-1} aria-label="Speaker profile and actions">
      <div className="portal-person">
        <p className="portal-profile-name">{speaker.name}</p>
        {(speaker.organization || speaker.role) && <p className="portal-muted">{[speaker.organization, speaker.role].filter(Boolean).join(' · ')}</p>}
        {speaker.trackIds?.length > 0 && <div className="portal-profile-tracks">{speaker.trackIds.map(trackId => <TrackBadge key={trackId} trackId={trackId} />)}</div>}
        {speaker.profileEditable === false && <p className="portal-muted">Profile editing is currently unavailable.</p>}
      </div>
      <div className="portal-header-actions">
        {speaker.profileEditable !== false && <Link className="button button-paper" to="/speaker/profile/edit">Edit Profile</Link>}
        <Link className="button button-dark" to="/speaker/proposals/new">Propose a Session <span aria-hidden="true">＋</span></Link>
      </div>
    </section>
  )
}
