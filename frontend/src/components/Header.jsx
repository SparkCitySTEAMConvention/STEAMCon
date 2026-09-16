import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { portalFor, useAuth } from '../auth/useAuth.js'
import '../pages/Authentication.css'
import { eventExperiences, experienceDestination } from '../config/eventExperiences.js'
import { listenForDisclosureDismissal } from '../utils/disclosure.js'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const loginRef = useRef(null)
  const eventsRef = useRef(null)
  const [eventsOpen, setEventsOpen] = useState(false)

  useEffect(() => listenForDisclosureDismissal(eventsRef.current), [])

  useEffect(() => {
    const closeOutside = event => {
      if (loginRef.current && !loginRef.current.contains(event.target)) loginRef.current.open = false
    }
    const closeOnEscape = event => {
      if (event.key === 'Escape' && loginRef.current?.open) {
        loginRef.current.open = false
        loginRef.current.querySelector('summary').focus()
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const closeLogin = () => { loginRef.current.open = false }

  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <Link className="wordmark" to="/" aria-label="STEAM Con home">STEAM <span>Con</span><span className="brand-dot" aria-hidden="true" /></Link>
        <nav aria-label="Main navigation">
          <details className="nav-login" ref={eventsRef} onToggle={event => setEventsOpen(event.currentTarget.open)}>
            <summary aria-expanded={eventsOpen} aria-controls="events-disclosure">Events</summary>
            <ul id="events-disclosure">
              <li><Link to="/events" onClick={() => { eventsRef.current.open = false }}>All events</Link></li>
              {eventExperiences.map(item => <li key={item.key}><Link to={experienceDestination(item.key)} onClick={() => { eventsRef.current.open = false }}>{item.label}</Link></li>)}
            </ul>
          </details>
          <Link to="/tracks">Tracks</Link>
          <Link to="/speakers">Speakers</Link>
          <Link to="/travel">Travel</Link>
          {isAuthenticated ? <details className="nav-login" ref={loginRef} onToggle={event => setOpen(event.currentTarget.open)}>
            <summary aria-expanded={open} aria-controls="account-disclosure">{user.displayName || 'Account'}</summary>
            <ul id="account-disclosure">
              {portalFor(user.role) && <li><Link to={portalFor(user.role)} onClick={closeLogin}>{user.role === 'SPEAKER' ? 'Speaker Portal' : 'Attendee Portal'}</Link></li>}
              <li><button onClick={() => { closeLogin(); void logout() }}>Log out</button></li>
            </ul>
          </details> : <Link to="/login">Log in</Link>}
        </nav>
      </div>
    </header>
  )
}
