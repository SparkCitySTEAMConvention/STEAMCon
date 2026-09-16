import { demoForums } from '../mocks/forumData.js'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function createSpeakerForumSource(repository, user, authSource) {
  const demo = authSource === 'demo' && user?.role === 'SPEAKER'
  const available = demo || (authSource === 'backend' && user?.role === 'SPEAKER' && uuid.test(user?.id || ''))
  const messages = []
  let nextId = 0
  function requireIdentity() {
    if (!available) throw new Error('A verified speaker account is required.')
  }
  return {
    demo, available,
    async getForums(scope) {
      requireIdentity()
      if (!demo) return repository.getForums(scope)
      return demoForums.filter(forum => !scope || forum.scope === scope).map(forum => ({ ...forum }))
    },
    async getMessages(forumId) {
      requireIdentity()
      if (!demo) return repository.getMessages(forumId, 'SPEAKER', 'READ')
      return messages.filter(message => message.forumId === forumId).map(message => ({ ...message }))
    },
    async createMessage(forumId, { body }) {
      requireIdentity()
      if (typeof body !== 'string' || !body.trim()) throw new Error('Message body is required.')
      const payload = { authorId: user.id, body: body.trim(), role: 'SPEAKER', permission: 'POST' }
      if (!demo) return repository.createMessage(forumId, payload)
      if (!demoForums.some(forum => forum.id === forumId)) throw new Error('Forum not found.')
      const message = { id: `demo-message-${++nextId}`, forumId, ...payload, postedAt: new Date().toISOString(), status: 'ACTIVE', speakerFlairId: null }
      messages.push(message)
      return { ...message }
    },
  }
}
