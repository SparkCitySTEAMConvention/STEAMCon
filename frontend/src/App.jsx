import { useEffect, useRef } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import SpeakerDirectory from './pages/SpeakerDirectory.jsx'
import HomePage from './pages/HomePage.jsx'
import ProposalDetails from './pages/speaker/ProposalDetails.jsx'
import SpeakerDashboard from './pages/speaker/SpeakerDashboard.jsx'

export default function App() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)

  useEffect(() => {
    document.title = pathname === '/' ? 'STEAM Con' : pathname === '/speakers' ? 'Proposed speakers | STEAM Con' : pathname === '/attendee' ? 'Attendee Portal | STEAM Con' : pathname === '/speaker' ? 'Speaker Portal | STEAM Con' : pathname.startsWith('/speaker/proposals/') ? 'Proposal details | STEAM Con' : 'Page not found | STEAM Con'
    if (previousPath.current !== pathname) {
      window.scrollTo(0, 0)
      document.querySelector('main')?.focus({ preventScroll: true })
    }
    previousPath.current = pathname
  }, [pathname])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/speakers" element={<SpeakerDirectory />} />
      <Route path="/speaker/proposals/:proposalId" element={<ProposalDetails />} />
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
