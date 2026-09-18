import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import TrackBadge from './TrackBadge.jsx'
import logo from '../../assets/steamcon-logo.png'

export default function SpeakerHeader({ speaker }) {
  const { pathname } = useLocation()
  const { logout } = useAuth()
  const dashboard = pathname === '/speaker'
  const sectionLink = (id, label) => dashboard
    ? <a href={`#${id}`}>{label}</a>
    : <Link to={`/speaker#${id}`}>{label}</Link>
  return (
    <header className="portal-header">
      <div className="container portal-header-inner">
        <div className="portal-brand">
          <Link to="/" aria-label="STEAM Con home"><img src={logo} width="1828" height="860" alt="STEAM Con" /></Link>
          <span>Speaker Portal</span>
        </div>
        <nav className="portal-nav" aria-label="Speaker navigation">
          <Link to="/speaker" aria-current={dashboard ? 'page' : undefined}>Overview</Link>
          {sectionLink('speaker-proposals', 'Proposals')}
          {sectionLink('speaker-engagements', 'Speaking Schedule')}
          {sectionLink('speaker-itinerary', 'Itinerary')}
          <Link to="/speaker/forums">Forums</Link>
          {speaker.profileEditable === false
            ? sectionLink('speaker-profile', 'Profile')
            : <Link to="/speaker/profile/edit">Profile</Link>}
          <Link to="/">Homepage</Link>
        </nav>
      </div>
      <div className="container portal-profile" id="speaker-profile" tabIndex={-1}>
        <div className="portal-person">
          <p className="portal-profile-name">{speaker.name}</p>
          {(speaker.organization || speaker.role) && <p className="portal-muted">{[speaker.organization, speaker.role].filter(Boolean).join(' · ')}</p>}
          {speaker.trackIds?.length > 0 && <div className="portal-profile-tracks">{speaker.trackIds.map(trackId => <TrackBadge key={trackId} trackId={trackId} />)}</div>}
          {speaker.profileEditable === false && <p className="portal-muted">Profile editing is currently unavailable.</p>}
        </div>
        <div className="portal-header-actions">
          <Link className="button button-dark" to="/speaker/proposals/new">Propose a Session <span aria-hidden="true">＋</span></Link>
          <button className="button button-paper" type="button" onClick={logout}>Log out</button>
        </div>
      </div>
    </header>
  )
}
