import { QRCodeSVG } from 'qrcode.react'
import './RegistrationQrCard.css'

export default function RegistrationQrCard() {
  const registrationUrl =
    import.meta.env.VITE_REGISTRATION_URL ||
    `${window.location.origin}/register?role=attendee&utm_source=qr`

  return (
    <section
      className="registration-qr-card"
      aria-labelledby="registration-qr-heading"
    >
      <div className="registration-qr-copy">
        <p className="registration-qr-logo">
          STEAM Con<span aria-hidden="true">.</span>
        </p>

        <p className="eyebrow">Five disciplines. Endless possibilities.</p>

        <h2 id="registration-qr-heading">
          Scan to join the curious.
        </h2>

        <p className="registration-qr-description">
          Create your attendee account, choose a pass, and start building your
          STEAM Con experience.
        </p>

        <div className="registration-qr-tracks" aria-label="STEAM disciplines">
          <span className="registration-qr-science">Science</span>
          <span className="registration-qr-technology">Technology</span>
          <span className="registration-qr-engineering">Engineering</span>
          <span className="registration-qr-art">Art</span>
          <span className="registration-qr-mathematics">Mathematics</span>
        </div>
      </div>

      <div className="registration-qr-code-panel">
        <div className="registration-qr-code">
          <QRCodeSVG
            value={registrationUrl}
            size={240}
            level="H"
            marginSize={4}
            bgColor="#ffffff"
            fgColor="#101418"
            title="QR code for STEAM Con attendee registration"
          />
        </div>

        <p className="registration-qr-action">Open your camera and scan</p>
        <p className="registration-qr-url">{registrationUrl}</p>
      </div>
    </section>
  )
}