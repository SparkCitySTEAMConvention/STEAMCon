import { Link } from 'react-router-dom'

import AccountNavigation from '../../auth/AccountNavigation.jsx'
import { notificationRepository } from '../../services/notificationRepository.js'
import SpeakerNotifications from '../../components/speaker/SpeakerNotifications.jsx'

import './AttendeeDashboard.css'

const attendeeNotificationSource = {
  available: true,
  demo: false,

  getNotifications() {
    return notificationRepository.getNotifications()
  },

  markAsRead(id) {
    return notificationRepository.markAsRead(id)
  },
}

export default function AttendeeNotifications() {
  return (
    <div className="attendee-portal">
      <header className="attendee-header">
        <div className="container attendee-header-top">
          <div className="attendee-brand">
            <Link to="/">
              STEAM Con
            </Link>

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

            <Link
              to="/attendee/notifications"
              aria-current="page"
            >
              Notifications
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

          <h1>Notifications</h1>

          <p>
            Convention updates, reminders, and next steps.
          </p>
        </div>

        <SpeakerNotifications
          source={attendeeNotificationSource}
        />
      </main>

      <footer className="container portal-footer">
        <p>
          STEAM Con · A place for curious minds.
        </p>

        <p>
          Attendee Portal / Notifications
        </p>
      </footer>
    </div>
  )
}