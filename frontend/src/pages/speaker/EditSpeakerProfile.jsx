import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import useSpeakerResource from '../../hooks/useSpeakerResource.js'
import { getSpeakerProfileSource, profileFields, profileLimits, profileUnavailable, validateProfile } from '../../services/speakerProfileSource.js'
import { developmentDisclaimer } from '../../mocks/speakerData.js'
import './SpeakerDashboard.css'

export default function EditSpeakerProfile() {
  const { user, authSource, hasBackendSession } = useAuth()
  const source = useMemo(() => getSpeakerProfileSource(user, authSource, hasBackendSession), [user, authSource, hasBackendSession])
  return <ProfilePage key={`${authSource}-${user?.id}-${hasBackendSession}`} source={source} />
}
function ProfilePage({ source }) {
  const loader = useCallback(async () => {
    if (!source.available) return null
    const [profile, tracks] = await Promise.all([source.getProfile(), source.getTracks()])
    return { profile, tracks }
  }, [source])
  const resource = useSpeakerResource(loader, source)
  return <div className="speaker-portal">
    <div className="container portal-main portal-proposal-main" tabIndex={-1}>
      <Link className="portal-home" to="/speaker">← Back to Speaker Portal</Link>
      <h1>Edit Profile</h1>
      <p className="portal-demo">{developmentDisclaimer}</p>
      {!source.identityAvailable ? <p role="alert">Profile editing requires a verified backend speaker UUID, Speaker role and active session. Sign in again or use the speaker preview.</p>
        : !source.available ? <p>{profileUnavailable}</p>
        : <>
          <p className="portal-demo">Preview edits stay in memory for this login/application session and never call the API. The public speaker directory stays unchanged.</p>
          {resource.status === 'loading' && <p role="status">Loading profile…</p>}
          {resource.status === 'error' && <div role="alert"><p>Unable to load your profile.</p><button type="button" onClick={resource.retry}>Try again</button></div>}
          {resource.status === 'ready' && resource.data && <ProfileForm source={source} {...resource.data} />}
        </>}
    </div>
  </div>
}
function ProfileForm({ source, profile, tracks }) {
  const [values, setValues] = useState(() => ({ ...Object.fromEntries(profileFields.map(([field]) => [field, profile[field] || ''])), trackId: profile.trackIds?.[0] || '' }))
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const pending = useRef(false)
  const form = useRef(null)
  function change(event) {
    setValues(previous => ({ ...previous, [event.target.name]: event.target.value }))
    setSaved(false)
  }
  async function submit(event) {
    event.preventDefault()
    if (pending.current || saved) return
    const invalid = validateProfile(values)
    setErrors(invalid)
    setFailure('')
    if (Object.keys(invalid).length) {
      form.current.elements.namedItem(Object.keys(invalid)[0]).focus()
      return
    }
    pending.current = true
    setSaving(true)
    try {
      const updated = await source.updateProfile(values)
      setValues({ ...Object.fromEntries(profileFields.map(([field]) => [field, updated[field]])), trackId: updated.trackIds[0] })
      setSaved(true)
    } catch (error) { setFailure(`${error.message || 'Unable to save profile.'} Your entries are still here; please try again.`) }
    finally { pending.current = false; setSaving(false) }
  }
  return <form className="portal-editor portal-create-form portal-profile-form" ref={form} onSubmit={submit} noValidate>
    {Object.keys(errors).length > 0 && <p role="alert">Please correct the fields below.</p>}
    {profileFields.map(([field, label]) => {
      const props = { id: `profile-${field}`, name: field, value: values[field], onChange: change, required: true, disabled: saving, 'aria-invalid': !!errors[field], 'aria-describedby': `profile-${field}-hint${errors[field] ? ` profile-${field}-error` : ''}` }
      return <div key={field}><label htmlFor={props.id}>{label} (required)</label>
        {field === 'bio' ? <textarea {...props} rows={7} /> : <input {...props} type="text" />}
        <p id={`profile-${field}-hint`}>{profileLimits[field]} characters maximum.</p>
        {errors[field] && <p id={`profile-${field}-error`}>{errors[field]}</p>}
      </div>
    })}
    <div><label htmlFor="profile-trackId">Primary track (required)</label>
      <select id="profile-trackId" name="trackId" value={values.trackId} onChange={change} disabled={saving} required aria-invalid={!!errors.trackId} aria-describedby={errors.trackId ? 'profile-trackId-error' : undefined}>
        <option value="">Choose a track</option>{tracks.map(track => <option key={track.id} value={track.id}>{track.name}</option>)}
      </select>
      {errors.trackId && <p id="profile-trackId-error">{errors.trackId}</p>}
    </div>
    {failure && <p role="alert">{failure}</p>}
    <p aria-live="polite">{saving ? 'Saving profile…' : saved ? 'Preview profile saved for this session.' : ''}</p>
    <div className="button-group"><button className="button button-dark" type="submit" disabled={saving || saved}>Save Profile</button>
      {!saving && <Link className="button button-paper" to="/speaker">{saved ? 'Return to Speaker Portal' : 'Cancel'}</Link>}
    </div>
  </form>
}
