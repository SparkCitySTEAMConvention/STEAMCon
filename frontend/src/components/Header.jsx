import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  const loginRef = useRef(null)

  useEffect(() => {
    const closeOutside = event => {
      if (!loginRef.current?.contains(event.target)) loginRef.current.open = false
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
          <a href="/#events">Events</a>
          <a href="/#tracks">Tracks</a>
          <Link to="/speakers">Speakers</Link>
          <a href="/#travel">Travel</a>
          <details className="nav-login" ref={loginRef}>
            <summary>Log in</summary>
            <ul>
              <li><Link to="/attendee" onClick={closeLogin}>Attendee Portal</Link></li>
              <li><Link to="/speaker" onClick={closeLogin}>Speaker Portal</Link></li>
            </ul>
          </details>
        </nav>
      </div>
    </header>
  )
}
