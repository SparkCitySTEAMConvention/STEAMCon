const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function createSpeakerForumSource(repository, user, authSource) {
  const roles = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role] : []
  const available = authSource === 'backend' && roles.includes('SPEAKER') && uuid.test(user?.id || '')

  function requireIdentity() {
    if (!available) throw new Error('A verified speaker account is required.')
  }

  return {
    demo: false,
    available,

    async getForums(scope) {
      requireIdentity()
      return repository.getForums(scope)
    },

    async getMessages(forumId) {
      requireIdentity()
      return repository.getMessages(forumId)
    },

    async createMessage(forumId, { body }) {
      requireIdentity()
      if (typeof body !== 'string' || !body.trim()) {
        throw new Error('Message body is required.')
      }
      return repository.createMessage(forumId, { body: body.trim() })
    },
  }
}
