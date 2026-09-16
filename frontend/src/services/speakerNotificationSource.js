import { demoNotifications } from '../mocks/notificationData.js'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function createSpeakerNotificationSource(repository, user, authSource, hasBackendSession = false) {
  const demo = authSource === 'demo' && user?.role === 'SPEAKER'
  const available = demo || (authSource === 'backend' && hasBackendSession === true && uuid.test(user?.id || ''))
  const notifications = demoNotifications.map(item => ({ ...item }))
  function requireIdentity() {
    if (!available) throw new Error('Notifications require a verified backend user and active session. Sign in again or use the speaker preview.')
  }
  return {
    demo, available,
    async getNotifications() {
      requireIdentity()
      return demo ? notifications.map(item => ({ ...item })) : repository.getNotifications(user.id)
    },
    async markAsRead(notificationId) {
      requireIdentity()
      if (typeof notificationId !== 'string' || !notificationId.trim()) throw new Error('A notification ID is required.')
      if (!demo) return repository.markAsRead(notificationId)
      const notification = notifications.find(item => item.id === notificationId)
      if (!notification) throw new Error('Notification not found. Refresh notifications and try again.')
      notification.read = true
      return { ...notification }
    },
  }
}

// AuthContext retains the user object for the application session. Leaving the
// dashboard keeps local read state; a new login gets a separate source.
const previewSources = new WeakMap()
export function getSpeakerNotificationSource(repository, user, authSource, hasBackendSession) {
  if (authSource !== 'demo' || !user) return createSpeakerNotificationSource(repository, user, authSource, hasBackendSession)
  if (!previewSources.has(user)) previewSources.set(user, createSpeakerNotificationSource(repository, user, authSource, hasBackendSession))
  return previewSources.get(user)
}
