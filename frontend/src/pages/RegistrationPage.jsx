import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './RegistrationPage.css'
import { submitRegistration } from '../services/registrationRepository'
import { validateRegistration } from '../utils/registrationValidation'

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

const initialValues = {
  firstName: '', lastName: '', email: '', phone: '', organization: '', track: '',
  passType: 'All-Access Pass', sessionTitle: '', sessionFormat: '', sessionSummary: '',
  password: '', eventUpdates: false,
}

export default function RegistrationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedRole = searchParams.get('role')
  const [role, setRole] = useState(requestedRole === 'speaker' ? 'speaker' : 'attendee')
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [requestError, setRequestError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const roleCopy = roles[role]

  function chooseRole(nextRole) {
    setRole(nextRole)
    setSubmitted(false)
    setErrors({})
    setRequestError('')
    setStatus('idle')
    setSearchParams({ role: nextRole }, { replace: true })
  }

  function updateField(event) {
    const { name, type, checked, value } = event.target
    setValues(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(current => ({ ...current, [name]: undefined }))
    if (requestError) setRequestError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (status === 'submitting') return

    const nextErrors = validateRegistration(values, role)
    setErrors(nextErrors)
    setRequestError('')
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setStatus('submitting')
    try {
      await submitRegistration({ ...values, role })
      setSubmitted(true)
      setStatus('success')
    } catch (error) {
      if (error.name !== 'AbortError') {
        setRequestError(error.message || 'Registration could not be completed. Please try again.')
        setStatus('error')
      }
    }
  }

  const fieldProps = name => ({
    name,
    value: values[name],
    onChange: updateField,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })

  const fieldError = name => errors[name] && <span className="registration-field-error" id={`${name}-error`} role="alert">{errors[name]}</span>

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
              <form className="registration-form" onSubmit={handleSubmit} noValidate aria-busy={status === 'submitting'}>
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
                      <input {...fieldProps('firstName')} autoComplete="given-name" required />
                      {fieldError('firstName')}
                    </label>
                    <label>
                      <span>Last name</span>
                      <input {...fieldProps('lastName')} autoComplete="family-name" required />
                      {fieldError('lastName')}
                    </label>
                    <label>
                      <span>Email address</span>
                      <input {...fieldProps('email')} type="email" autoComplete="email" required />
                      {fieldError('email')}
                    </label>
                    <label>
                      <span>Phone number</span>
                      <input {...fieldProps('phone')} type="tel" autoComplete="tel" required />
                      {fieldError('phone')}
                    </label>
                  </div>
                </fieldset>

                {role === 'attendee' ? (
                  <fieldset>
                    <legend>Your event</legend>
                    <div className="registration-field-grid">
                      <label>
                        <span>Primary track</span>
                        <select {...fieldProps('track')} required>
                          <option value="" disabled>Choose a track</option>
                          {tracks.map(track => <option key={track}>{track}</option>)}
                        </select>
                        {fieldError('track')}
                      </label>
                      <label>
                        <span>Pass type</span>
                        <select {...fieldProps('passType')} required>
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
                        <input {...fieldProps('organization')} autoComplete="organization" />
                      </label>
                      <label>
                        <span>Session track</span>
                        <select {...fieldProps('track')} required>
                          <option value="" disabled>Choose a track</option>
                          {tracks.map(track => <option key={track}>{track}</option>)}
                        </select>
                        {fieldError('track')}
                      </label>
                      <label className="registration-field-wide">
                        <span>Working session title</span>
                        <input {...fieldProps('sessionTitle')} required />
                        {fieldError('sessionTitle')}
                      </label>
                      <label>
                        <span>Session format</span>
                        <select {...fieldProps('sessionFormat')} required>
                          <option value="" disabled>Choose a format</option>
                          <option>Talk</option>
                          <option>Panel</option>
                          <option>Workshop</option>
                          <option>Performance</option>
                        </select>
                        {fieldError('sessionFormat')}
                      </label>
                      <label className="registration-field-wide">
                        <span>What will the audience take away?</span>
                        <textarea {...fieldProps('sessionSummary')} rows="4" required />
                        {fieldError('sessionSummary')}
                      </label>
                    </div>
                  </fieldset>
                )}

                <fieldset>
                  <legend>Secure your account</legend>
                  <label>
                    <span>Password <small>At least 8 characters</small></span>
                    <input {...fieldProps('password')} type="password" minLength="8" autoComplete="new-password" required />
                    {fieldError('password')}
                  </label>
                </fieldset>

                <label className="registration-consent">
                  <input name="eventUpdates" type="checkbox" checked={values.eventUpdates} onChange={updateField} />
                  <span>Send me useful program and registration updates. I can unsubscribe at any time.</span>
                </label>

                {requestError && (
                  <div className="registration-request-error" role="alert">
                    <strong>We couldn’t submit your registration.</strong>
                    <span>{requestError} Your entries are still here.</span>
                  </div>
                )}

                <button className="button button-dark registration-submit" type="submit" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Submitting…' : roleCopy.submit} <span aria-hidden="true">{status === 'submitting' ? '●' : '↗'}</span>
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
