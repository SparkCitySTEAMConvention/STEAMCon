import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './RegistrationPage.css'

const tracks = ['Science', 'Technology', 'Engineering', 'Art', 'Mathematics']

const roles = {
  attendee: {
    label: 'Attendee',
    eyebrow: 'I want to attend',
    heading: 'Build your STEAM Con experience.',
    description: 'Create your account, choose a pass, and get ready to make a personal schedule across all five tracks.',
    submit: 'Create attendee account',
    portal: '/attendee',
    portalLabel: 'Open attendee preview',
  },
  speaker: {
    label: 'Speaker',
    eyebrow: 'I want to speak',
    heading: 'Bring your idea to the room.',
    description: 'Tell us who you are and what you want to share. The program team can review session details after signup.',
    submit: 'Start speaker registration',
    portal: '/speaker',
    portalLabel: 'Open speaker preview',
  },
}

export default function RegistrationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedRole = searchParams.get('role')
  const [role, setRole] = useState(requestedRole === 'speaker' ? 'speaker' : 'attendee')
  const [submitted, setSubmitted] = useState(false)
  const roleCopy = roles[role]

  function chooseRole(nextRole) {
    setRole(nextRole)
    setSubmitted(false)
    setSearchParams({ role: nextRole }, { replace: true })
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="registration-page">
      <a className="skip-link" href="#registration-main">Skip to registration</a>
      <header className="registration-header">
        <div className="container registration-header-inner">
          <Link className="wordmark" to="/" aria-label="STEAM Con home">STEAM <span>Con</span><span className="brand-dot" aria-hidden="true" /></Link>
          <span className="registration-header-label">Registration</span>
          <Link className="registration-back-link" to="/">← Back to homepage</Link>
        </div>
      </header>

      <main className="container registration-main" id="registration-main" tabIndex={-1}>
        <section className="registration-intro" aria-labelledby="registration-heading">
          <p className="eyebrow">Join STEAM Con</p>
          <h1 id="registration-heading">Choose how you’ll show up.</h1>
          <p>One shared registration path for attendees and speakers, designed to get you to the right next step.</p>
        </section>

        <div className="registration-layout">
          <aside className="registration-track-panel" aria-labelledby="registration-tracks-heading">
            <p className="eyebrow">Five disciplines</p>
            <h2 id="registration-tracks-heading">One curious community.</h2>
            <p>Your registration connects you to ideas and people across every STEAM track.</p>
            <ol>
              {tracks.map((track, index) => (
                <li className={`registration-track registration-track-${track.toLowerCase()}`} key={track}>
                  <span>0{index + 1}</span>
                  <strong>{track}</strong>
                </li>
              ))}
            </ol>
            <p className="registration-preview-note"><strong>Prototype note:</strong> this screen validates the form in your browser. Account creation will connect to the team’s API next.</p>
          </aside>

          <section className="registration-form-shell" aria-labelledby="registration-form-heading">
            <div className="role-switcher" aria-label="Choose registration type">
              {Object.entries(roles).map(([roleKey, option]) => (
                <button
                  className={role === roleKey ? 'is-active' : ''}
                  type="button"
                  aria-pressed={role === roleKey}
                  onClick={() => chooseRole(roleKey)}
                  key={roleKey}
                >
                  <span>{option.eyebrow}</span>
                  <strong>{option.label}</strong>
                </button>
              ))}
            </div>

            {submitted ? (
              <div className="registration-success" aria-live="polite">
                <span className="registration-success-mark" aria-hidden="true">✓</span>
                <p className="eyebrow">Form preview complete</p>
                <h2 id="registration-form-heading">Your {roleCopy.label.toLowerCase()} details look good.</h2>
                <p>Nothing was sent yet. This front-end flow is ready to connect to the registration API when the backend endpoint is available.</p>
                <div className="registration-success-actions">
                  <Link className="button button-dark" to={roleCopy.portal}>{roleCopy.portalLabel} <span aria-hidden="true">↗</span></Link>
                  <button className="registration-text-button" type="button" onClick={() => setSubmitted(false)}>Edit my details</button>
                </div>
              </div>
            ) : (
              <form className="registration-form" onSubmit={handleSubmit}>
                <div className="registration-form-heading">
                  <p className="eyebrow">{roleCopy.label} registration</p>
                  <h2 id="registration-form-heading">{roleCopy.heading}</h2>
                  <p>{roleCopy.description}</p>
                </div>

                <fieldset>
                  <legend>About you</legend>
                  <div className="registration-field-grid">
                    <label>
                      <span>First name</span>
                      <input name="firstName" autoComplete="given-name" required />
                    </label>
                    <label>
                      <span>Last name</span>
                      <input name="lastName" autoComplete="family-name" required />
                    </label>
                    <label>
                      <span>Email address</span>
                      <input name="email" type="email" autoComplete="email" required />
                    </label>
                    <label>
                      <span>Phone number</span>
                      <input name="phone" type="tel" autoComplete="tel" required />
                    </label>
                  </div>
                </fieldset>

                {role === 'attendee' ? (
                  <fieldset>
                    <legend>Your event</legend>
                    <div className="registration-field-grid">
                      <label>
                        <span>Primary track</span>
                        <select name="track" defaultValue="" required>
                          <option value="" disabled>Choose a track</option>
                          {tracks.map(track => <option key={track}>{track}</option>)}
                        </select>
                      </label>
                      <label>
                        <span>Pass type</span>
                        <select name="passType" defaultValue="All-Access Pass" required>
                          <option>All-Access Pass</option>
                          <option>Single-Day Pass</option>
                          <option>Student Pass</option>
                        </select>
                      </label>
                    </div>
                  </fieldset>
                ) : (
                  <fieldset>
                    <legend>Your session idea</legend>
                    <div className="registration-field-grid">
                      <label>
                        <span>Organization <small>Optional</small></span>
                        <input name="organization" autoComplete="organization" />
                      </label>
                      <label>
                        <span>Session track</span>
                        <select name="track" defaultValue="" required>
                          <option value="" disabled>Choose a track</option>
                          {tracks.map(track => <option key={track}>{track}</option>)}
                        </select>
                      </label>
                      <label className="registration-field-wide">
                        <span>Working session title</span>
                        <input name="sessionTitle" required />
                      </label>
                      <label>
                        <span>Session format</span>
                        <select name="sessionFormat" defaultValue="" required>
                          <option value="" disabled>Choose a format</option>
                          <option>Talk</option>
                          <option>Panel</option>
                          <option>Workshop</option>
                          <option>Performance</option>
                        </select>
                      </label>
                      <label className="registration-field-wide">
                        <span>What will the audience take away?</span>
                        <textarea name="sessionSummary" rows="4" required />
                      </label>
                    </div>
                  </fieldset>
                )}

                <fieldset>
                  <legend>Secure your account</legend>
                  <label>
                    <span>Password <small>At least 8 characters</small></span>
                    <input name="password" type="password" minLength="8" autoComplete="new-password" required />
                  </label>
                </fieldset>

                <label className="registration-consent">
                  <input name="eventUpdates" type="checkbox" />
                  <span>Send me useful program and registration updates. I can unsubscribe at any time.</span>
                </label>

                <button className="button button-dark registration-submit" type="submit">
                  {roleCopy.submit} <span aria-hidden="true">↗</span>
                </button>

                <p className="registration-portal-link">Already registered? <Link to={roleCopy.portal}>Open the {roleCopy.label.toLowerCase()} portal.</Link></p>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
