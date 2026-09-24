const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function createSpeakerNotificationSource(repository, user, authSource, hasBackendSession = false) {
  const available = authSource === 'backend' && hasBackendSession === true && uuid.test(user?.id || '')
  function requireIdentity() { if (!available) throw new Error('Notifications require a verified backend user and active session.') }
  return {
    demo: false, available,
    async getNotifications() { requireIdentity(); return repository.getNotifications() },
    async markAsRead(notificationId) {
      requireIdentity()
      if (typeof notificationId !== 'string' || !notificationId.trim()) throw new Error('A notification ID is required.')
      return repository.markAsRead(notificationId)
    },
  }
}
export function getSpeakerNotificationSource(repository, user, authSource, hasBackendSession) {
  return createSpeakerNotificationSource(repository, user, authSource, hasBackendSession)
}
