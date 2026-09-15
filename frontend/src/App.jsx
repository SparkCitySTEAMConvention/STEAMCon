import { useEffect, useRef } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage.jsx'
import RegistrationPage from './pages/RegistrationPage.jsx'
import AttendeeDashboard from './pages/attendee/AttendeeDashboard.jsx'
import SpeakerDashboard from './pages/speaker/SpeakerDashboard.jsx'

export default function App() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)

  useEffect(() => {
    const pageTitles = {
      '/': 'STEAM Con',
      '/register': 'Register | STEAM Con',
      '/attendee': 'Attendee Portal | STEAM Con',
      '/speaker': 'Speaker Portal | STEAM Con',
    }
    document.title = pageTitles[pathname] || 'Page not found | STEAM Con'
    if (previousPath.current !== pathname) {
      window.scrollTo(0, 0)
      document.querySelector('main')?.focus({ preventScroll: true })
    }
    previousPath.current = pathname
  }, [pathname])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/attendee" element={<AttendeeDashboard />} />
      <Route path="/speaker" element={<SpeakerDashboard />} />
      <Route path="*" element={
        <main className="container section" tabIndex={-1}>
          <p className="eyebrow">STEAM Con / 404</p>
          <h1>That page isn’t here.</h1>
          <p>Head home to explore STEAM Con.</p>
          <div className="button-group"><Link className="button button-dark" to="/">Back to homepage</Link></div>
        </main>
      } />
    </Routes>
  )
}
