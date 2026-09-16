import AccountNavigation from '../../auth/AccountNavigation.jsx'
import { Link } from 'react-router-dom'
import TrackBadge from './TrackBadge.jsx'
import logo from '../../assets/steamcon-logo.png'

export default function SpeakerHeader({ speaker }) {
  return (
    <header className="portal-header">
      <div className="container portal-header-inner">
        <div className="portal-brand">
          <Link to="/" aria-label="STEAM Con home"><img src={logo} width="1828" height="860" alt="STEAM Con" /></Link>
          <span>Speaker Portal</span>
        </div>
        <Link className="portal-home" to="/">Back to homepage <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="container portal-profile">
        <div><p className="eyebrow">Speaker workspace</p><p className="portal-profile-name">{speaker.name}</p><p className="portal-muted">{speaker.organization}{speaker.role && ` · ${speaker.role}`}</p><div className="portal-profile-tracks">{speaker.trackIds?.map(trackId => <TrackBadge key={trackId} trackId={trackId} />)}</div></div>
        <div className="portal-propose">
          <div className="portal-actions">
          <button className="button button-dark" type="button" aria-disabled="true" aria-describedby="proposal-availability">Propose a Session <span aria-hidden="true">＋</span></button>
          <button className="button button-paper" type="button" aria-disabled="true" aria-describedby="profile-availability">Edit Profile</button>
          </div>
          <p id="profile-availability">Profile editing coming soon.</p>
          <p id="proposal-availability">Proposal submissions coming soon.</p>
        </div>
      </div>
      <div className="container"><AccountNavigation /></div>
    </header>
  )
}
