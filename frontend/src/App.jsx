import { useEffect, useRef } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import SpeakerDirectory from './pages/SpeakerDirectory.jsx'
import HomePage from './pages/HomePage.jsx'
import RegistrationPage from './pages/RegistrationPage.jsx'
import AttendeeDashboard from './pages/attendee/AttendeeDashboard.jsx'
import HotelBookingPage from './pages/attendee/HotelBookingPage.jsx'
import TravelBookingPage from './pages/attendee/TravelBookingPage.jsx'
import ProposalDetails from './pages/speaker/ProposalDetails.jsx'
import SpeakerDashboard from './pages/speaker/SpeakerDashboard.jsx'

import LoginPage from './pages/LoginPage.jsx'
import AccessDenied from './pages/AccessDenied.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import RoleRoute from './auth/RoleRoute.jsx'

export default function App() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)

  useEffect(() => {
    const pageTitles = {
      '/': 'STEAM Con',
      '/login': 'Log in | STEAM Con',
      '/access-denied': 'Access denied | STEAM Con',
      '/register': 'Register | STEAM Con',
      '/attendee': 'Attendee Portal | STEAM Con',
      '/attendee/travel': 'Book Travel | STEAM Con',
      '/attendee/hotel': 'Book a Hotel | STEAM Con',
      '/attendee/car': 'Reserve a Car | STEAM Con',
      '/speakers': 'Proposed speakers | STEAM Con',
      '/speaker': 'Speaker Portal | STEAM Con',
    }
    document.title = pathname.startsWith('/speaker/proposals/')
      ? 'Proposal details | STEAM Con'
      : pageTitles[pathname] || 'Page not found | STEAM Con'
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="/speakers" element={<SpeakerDirectory />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute role="ATTENDEE" />}>
          <Route path="/attendee" element={<AttendeeDashboard />} />
          <Route path="/attendee/travel" element={<TravelBookingPage kind="travel" />} />
          <Route path="/attendee/hotel" element={<HotelBookingPage />} />
          <Route path="/attendee/car" element={<TravelBookingPage kind="car" />} />
        </Route>
        <Route element={<RoleRoute role="SPEAKER" />}>
          <Route path="/speaker/proposals/:proposalId" element={<ProposalDetails />} />
          <Route path="/speaker" element={<SpeakerDashboard />} />
        </Route>
      </Route>
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
