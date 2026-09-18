import ConventionCountdown from '../components/ConventionCountdown.jsx'
import Header from '../components/Header.jsx'
import Hero from '../components/Hero.jsx'
import PublicProgram from '../components/PublicProgram.jsx'
import SpeakerCallout from '../components/SpeakerCallout.jsx'
import Footer from '../components/Footer.jsx'

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}>
        <ConventionCountdown />
        <Hero />
        <PublicProgram />
        <SpeakerCallout />
      </main>
      <Footer />
    </>
  )
}
