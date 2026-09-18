import { demoForums } from '../mocks/forumData.js'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

let nextSourceId = 0

export function createSpeakerForumSource(repository, user, authSource, hasBackendSession = false) {
  const demo = authSource === 'demo' && user?.role === 'SPEAKER'
  const available = demo || (authSource === 'backend' && hasBackendSession === true && user?.role === 'SPEAKER' && uuid.test(user?.id || ''))
  const messages = []
  let nextId = 0
  function requireIdentity() {
    if (!available) throw new Error('A verified speaker account and active backend session are required.')
  }
  return {
    demo, available, sessionKey: ++nextSourceId,
    async getForums(scope) {
      requireIdentity()
      if (!demo) return repository.getForums(scope)
      return demoForums.filter(forum => !scope || forum.scope === scope).map(forum => ({ ...forum }))
    },
    async getMessages(forumId) {
      requireIdentity()
      if (!demo) return repository.getMessages(forumId)
      return messages.filter(message => message.forumId === forumId).map(message => ({ ...message }))
    },
    async createMessage(forumId, { body } = {}) {
      requireIdentity()
      if (typeof body !== 'string' || !body.trim()) throw new Error('Message body is required.')
      const payload = { body: body.trim() }
      if (!demo) return repository.createMessage(forumId, payload)
      if (!demoForums.some(forum => forum.id === forumId)) throw new Error('Forum not found.')
      const message = { id: `demo-message-${++nextId}`, forumId, authorId: user.id, ...payload, postedAt: new Date().toISOString(), status: 'ACTIVE', speakerFlairId: null }
      messages.push(message)
      return { ...message }
    },
  }
}

// Keep demo conversations with the current login identity only.
const previewSources = new WeakMap()
export function getSpeakerForumSource(repository, user, authSource, hasBackendSession) {
  if (authSource !== 'demo' || !user) return createSpeakerForumSource(repository, user, authSource, hasBackendSession)
  if (!previewSources.has(user)) previewSources.set(user, createSpeakerForumSource(repository, user, authSource, hasBackendSession))
  return previewSources.get(user)
}
