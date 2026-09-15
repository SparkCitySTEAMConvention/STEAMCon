import './App.css'
import AnnouncementBar from './components/AnnouncementBar.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import TrackGrid from './components/TrackGrid.jsx'
import FeaturedSessions from './components/FeaturedSessions.jsx'
import SpeakerCallout from './components/SpeakerCallout.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <AnnouncementBar />
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <TrackGrid />
        <FeaturedSessions />
        <SpeakerCallout />
      </main>
      <Footer />
    </>
  )
}
