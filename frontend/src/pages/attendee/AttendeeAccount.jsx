import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import AccountNavigation from '../../auth/AccountNavigation.jsx'
import { useAuth } from '../../auth/useAuth.js'
import { accountRepository } from '../../services/accountRepository.js'

import './AttendeeDashboard.css'

export default function AttendeeAccount() {
  const { user, updateUser } = useAuth()

  const [profileImage, setProfileImage] = useState(
    user?.profileImageUrl || ''
  )

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setProfileImage(user?.profileImageUrl || '')
  }, [user?.profileImageUrl])

  async function handleProfilePicture(event) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      setMessage('')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Profile pictures must be smaller than 2 MB.')
      setMessage('')
      return
    }

    setError('')
    setMessage('')

    const reader = new FileReader()

    reader.onload = async () => {
      try {
        setSaving(true)

        const imageData = reader.result

        if (typeof imageData !== 'string') {
          throw new Error('Unable to read image.')
        }

        const updated =
          await accountRepository.updateProfileImage(imageData)

        setProfileImage(updated.profileImageUrl || '')

        updateUser(updated)

        setMessage('Profile picture updated.')
      } catch (error) {
        console.error(error)
        setError('Unable to update profile picture.')
      } finally {
        setSaving(false)

        event.target.value = ''
      }
    }

    reader.onerror = () => {
      setError('Unable to read the selected image.')
      setSaving(false)
    }

    reader.readAsDataURL(file)
  }

  return (
    <div className="attendee-portal">
      <header className="attendee-header">
        <div className="container attendee-header-top">
          <div className="attendee-brand">
            <Link to="/">STEAM Con</Link>
            <span>Attendee Portal</span>
          </div>

          <nav
            className="attendee-nav"
            aria-label="Attendee navigation"
          >
            <Link to="/attendee">
              Overview
            </Link>

            <Link to="/attendee/forums">
              Forums &amp; Messaging
            </Link>

            <Link to="/attendee/notifications">
              Notifications
            </Link>

            <Link
              to="/attendee/account"
              aria-current="page"
            >
              Account
            </Link>
          </nav>
        </div>

        <div className="container">
          <AccountNavigation />
        </div>
      </header>

      <main
        className="container portal-main"
        id="attendee-main"
        tabIndex={-1}
      >
        <div className="portal-welcome">
          <p className="eyebrow">
            Attendee workspace
          </p>

          <h1>Account</h1>

          <p>
            Review and manage the account information associated
            with your STEAM Con profile.
          </p>
        </div>

        <section
          className="portal-detail-section"
          aria-labelledby="profile-picture-heading"
        >
          <h2 id="profile-picture-heading">
            Profile picture
          </h2>

          <div className="attendee-account-picture">
            {profileImage ? (
              <img
                src={profileImage}
                alt={`${user?.displayName || 'Attendee'} profile`}
                className="attendee-account-avatar"
              />
            ) : (
              <div
                className="
                  attendee-account-avatar
                  attendee-account-avatar-fallback
                "
                aria-hidden="true"
              >
                {(user?.displayName || 'A')
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="attendee-account-picture-actions">
              <label
                className="button button-paper"
                htmlFor="profile-picture"
              >
                {saving
                  ? 'Saving…'
                  : 'Choose profile picture'}
              </label>

              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleProfilePicture}
                disabled={saving}
                hidden
              />

              <p className="attendee-muted">
                Choose an image smaller than 2 MB.
              </p>

              {message && (
                <p
                  role="status"
                  aria-live="polite"
                >
                  {message}
                </p>
              )}

              {error && (
                <p role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>
        </section>

        <section
          className="portal-detail-section"
          aria-labelledby="account-details-heading"
        >
          <h2 id="account-details-heading">
            Account details
          </h2>

          <dl>
            <div>
              <dt>Name</dt>

              <dd>
                {user?.displayName ||
                  user?.name ||
                  'Name unavailable'}
              </dd>
            </div>

            <div>
              <dt>Email</dt>

              <dd>
                {user?.email ||
                  'Email unavailable'}
              </dd>
            </div>

            <div>
              <dt>Organization</dt>

              <dd>
                {user?.organization ||
                  'No organization listed'}
              </dd>
            </div>

            <div>
              <dt>Role</dt>

              <dd>
                {user?.role ||
                  user?.roles?.join(', ') ||
                  'Attendee'}
              </dd>
            </div>
          </dl>
        </section>
      </main>

      <footer className="container portal-footer">
        <p>
          STEAM Con · A place for curious minds.
        </p>

        <p>
          Attendee Portal / Account
        </p>
      </footer>
    </div>
  )
}