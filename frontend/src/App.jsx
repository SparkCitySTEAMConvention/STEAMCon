import { useEffect, useRef } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'

import ProtectedRoute from './auth/ProtectedRoute.jsx'
import RoleRoute from './auth/RoleRoute.jsx'
import ApplicationLayout from './components/layout/ApplicationLayout.jsx'
import AccessDenied from './pages/AccessDenied.jsx'
import HomePage from './pages/HomePage.jsx'
import TracksPage from './pages/TracksPage.jsx'
import EventsPage from './pages/EventsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegistrationPage from './pages/RegistrationPage.jsx'
import RegistrationQrSamples from './pages/RegistrationQrSamples.jsx'
import TravelInfoPage from './pages/TravelInfoPage.jsx'
import SpeakerDirectory from './pages/SpeakerDirectory.jsx'
import AttendeeDashboard from './pages/attendee/AttendeeDashboard.jsx'
import HotelBookingPage from './pages/attendee/HotelBookingPage.jsx'
import TravelBookingPage from './pages/attendee/TravelBookingPage.jsx'
import EditSpeakerProfile from './pages/speaker/EditSpeakerProfile.jsx'
import ProposeSession from './pages/speaker/ProposeSession.jsx'
import ProposalDetails from './pages/speaker/ProposalDetails.jsx'
import SpeakerDashboard from './pages/speaker/SpeakerDashboard.jsx'
import SpeakerForums from './pages/speaker/SpeakerForums.jsx'

export default function App() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)

  useEffect(() => {
    const pageTitles = {
      '/': 'STEAM Con',
      '/tracks': 'Tracks | STEAM Con',
      '/events': 'Events | STEAM Con',
      '/login': 'Log in | STEAM Con',
      '/access-denied': 'Access denied | STEAM Con',
      '/register': 'Register | STEAM Con',
      '/registration-qr': 'Registration QR Samples | STEAM Con',
      '/travel': 'Plan Your New York Visit | STEAM Con',
      '/attendee': 'Attendee Portal | STEAM Con',
      '/attendee/travel': 'Book Travel | STEAM Con',
      '/attendee/hotel': 'Book a Hotel | STEAM Con',
      '/attendee/car': 'Reserve a Car | STEAM Con',
      '/speakers': 'Proposed speakers | STEAM Con',
      '/speaker': 'Speaker Portal | STEAM Con',
      '/speaker/profile/edit': 'Edit Profile | STEAM Con',
      '/speaker/forums': 'Speaker Forum & Messaging | STEAM Con',
    }

    document.title =
      pathname === '/speaker/proposals/new'
        ? 'Propose a Session | STEAM Con'
        : pathname.startsWith('/speaker/proposals/')
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
      <Route path="/register" element={<RegistrationPage />} />
      <Route
        path="/registration-qr"
        element={<RegistrationQrSamples />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      <Route element={<ApplicationLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tracks" element={<TracksPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/travel" element={<TravelInfoPage />} />
        <Route path="/speakers" element={<SpeakerDirectory />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute role="ATTENDEE" />}>
            <Route path="/attendee" element={<AttendeeDashboard />} />
            <Route
              path="/attendee/travel"
              element={<TravelBookingPage key="travel" kind="travel" />}
            />
            <Route
              path="/attendee/hotel"
              element={<HotelBookingPage />}
            />
            <Route
              path="/attendee/car"
              element={<TravelBookingPage key="car" kind="car" />}
            />
          </Route>

          <Route element={<RoleRoute role="SPEAKER" />}>
            <Route
              path="/speaker/profile/edit"
              element={<EditSpeakerProfile />}
            />
            <Route
              path="/speaker/forums"
              element={<SpeakerForums />}
            />
            <Route
              path="/speaker/proposals/new"
              element={<ProposeSession />}
            />
            <Route
              path="/speaker/proposals/:proposalId"
              element={<ProposalDetails />}
            />
            <Route path="/speaker" element={<SpeakerDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <main className="container section" tabIndex={-1}>
            <p className="eyebrow">STEAM Con / 404</p>
            <h1>That page isn’t here.</h1>
            <p>Head home to explore STEAM Con.</p>

            <div className="button-group">
              <Link className="button button-dark" to="/">
                Back to homepage
              </Link>
            </div>
          </main>
        }
      />
    </Routes>
  )
}
