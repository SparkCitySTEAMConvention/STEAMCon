import { QRCodeSVG } from 'qrcode.react'
import RegistrationQrCard from '../components/RegistrationQrCard.jsx'
import './RegistrationQrSamples.css'

export default function RegistrationQrSamples() {
  const registrationUrl =
    import.meta.env.VITE_REGISTRATION_URL ||
    `${window.location.origin}/register?role=attendee&utm_source=qr`

  return (
    <main className="qr-samples-page" id="main-content" tabIndex={-1}>
      <header className="qr-samples-header">
        <div>
          <p className="eyebrow">STEAM Con / Registration assets</p>
          <h1>QR design samples.</h1>
          <p>
            Preview the compact registration graphic and the full standalone
            event flyer before preparing the final print files.
          </p>
        </div>

        <button
          className="button button-dark qr-print-button"
          type="button"
          onClick={() => window.print()}
        >
          Print or save as PDF
        </button>
      </header>

      <section
        className="qr-sample-section"
        aria-labelledby="compact-qr-heading"
      >
        <div className="qr-sample-label">
          <p className="eyebrow">Sample 01</p>
          <h2 id="compact-qr-heading">Flyer QR graphic</h2>
          <p>
            Use this compact graphic on posters, social designs, presentation
            slides, table signs, and existing event flyers.
          </p>
        </div>

        <RegistrationQrCard />
      </section>

      <section
        className="qr-sample-section"
        aria-labelledby="full-flyer-heading"
      >
        <div className="qr-sample-label">
          <p className="eyebrow">Sample 02</p>
          <h2 id="full-flyer-heading">Standalone registration flyer</h2>
          <p>
            A complete letter-sized flyer designed for printing or sharing as
            a digital event-registration graphic.
          </p>
        </div>

        <article className="steam-registration-flyer">
          <div className="steam-flyer-color-bar" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <header className="steam-flyer-header">
            <p className="steam-flyer-logo">
              STEAM Con<span aria-hidden="true">.</span>
            </p>
            <p className="steam-flyer-status">Registration now open</p>
          </header>

          <div className="steam-flyer-content">
            <div className="steam-flyer-copy">
              <p className="eyebrow">
                Five disciplines. Endless possibilities.
              </p>

              <h2>
                Where curiosity becomes collaboration.
              </h2>

              <p className="steam-flyer-lead">
                Meet the thinkers, makers, and creative minds shaping what
                comes next. Build your own experience across science,
                technology, engineering, art, and mathematics.
              </p>

              <div
                className="steam-flyer-tracks"
                aria-label="Conference disciplines"
              >
                <span>Science</span>
                <span>Technology</span>
                <span>Engineering</span>
                <span>Art</span>
                <span>Mathematics</span>
              </div>

              <div className="steam-flyer-highlights">
                <div>
                  <strong>2</strong>
                  <span>Days</span>
                </div>
                <div>
                  <strong>5</strong>
                  <span>Disciplines</span>
                </div>
                <div>
                  <strong>1</strong>
                  <span>Curious community</span>
                </div>
              </div>
            </div>

            <aside className="steam-flyer-registration">
              <p className="eyebrow">Build your STEAM Con experience</p>
              <h3>Scan to register.</h3>

              <div className="steam-flyer-qr">
                <QRCodeSVG
                  value={registrationUrl}
                  size={260}
                  level="H"
                  marginSize={4}
                  bgColor="#ffffff"
                  fgColor="#101418"
                  title="QR code for STEAM Con attendee registration"
                />
              </div>

              <p className="steam-flyer-scan">
                Open your phone camera and point it at the code.
              </p>

              <p className="steam-flyer-url">
                {registrationUrl}
              </p>
            </aside>
          </div>

          <footer className="steam-flyer-footer">
            <p>STEAM Con · A meeting place for curious minds.</p>
            <p>Choose your pass. Follow your curiosity. Find your people.</p>
          </footer>
        </article>
      </section>
    </main>
  )
}