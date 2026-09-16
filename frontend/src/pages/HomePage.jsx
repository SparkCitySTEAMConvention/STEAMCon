import AnnouncementBar from '../components/AnnouncementBar.jsx'
import Header from '../components/Header.jsx'
import Hero from '../components/Hero.jsx'
import PublicProgram from '../components/PublicProgram.jsx'
import SpeakerSpotlight from '../components/SpeakerSpotlight.jsx'
import SpeakerCallout from '../components/SpeakerCallout.jsx'
import Footer from '../components/Footer.jsx'

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <AnnouncementBar />
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <PublicProgram />
        <SpeakerSpotlight />
        <SpeakerCallout />
      </main>
      <Footer />
    </>
  )
}
