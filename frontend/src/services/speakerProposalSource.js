import { tracks } from '../mocks/tracks.js'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// SessionProposal uses default JPA string columns (255 characters).
export const proposalTextLimit = 255
export function validateProposal({ title, description, trackId } = {}) {
  const errors = {}
  for (const [field, label, value] of [['title', 'Title', title], ['description', 'Description', description]]) {
    if (typeof value !== 'string' || !value.trim()) errors[field] = `${label} is required.`
    else if (value.trim().length > proposalTextLimit) errors[field] = `${label} must be ${proposalTextLimit} characters or fewer.`
  }
  if (typeof trackId !== 'string' || !trackId.trim()) errors.trackId = 'Choose a primary track.'
  return errors
}

export function createSpeakerProposalSource(repository, trackRepository, user, authSource, hasBackendSession = false) {
  const demo = authSource === 'demo' && user?.role === 'SPEAKER'
  const available = demo || (authSource === 'backend' && user?.role === 'SPEAKER' && hasBackendSession === true && uuid.test(user?.id || ''))
  const local = []
  let loadedTracks = []
  let nextId = 0
  function requireIdentity() {
    if (!available) throw new Error('Proposal submission requires a verified backend speaker account and active session. Sign in again or use the speaker preview.')
  }
  return {
    demo, available,
    getPreviewProposals: () => local.map(item => ({ ...item })),
    async getTracks() {
      requireIdentity()
      const result = demo ? tracks.map(item => ({ ...item })) : await trackRepository.getTracks()
      if (!Array.isArray(result) || result.some(item => !item || typeof item.name !== 'string' || !(demo ? tracks.some(track => track.id === item.id) : uuid.test(item.id || '')))) throw new Error('Invalid track response. Please retry loading tracks.')
      loadedTracks = result.map(item => ({ ...item }))
      return result
    },
    async createProposal(values) {
      requireIdentity()
      const errors = validateProposal(values)
      if (Object.keys(errors).length) throw new Error(Object.values(errors)[0])
      const { title, description, trackId } = values
      if ((!demo && !uuid.test(trackId)) || !loadedTracks.some(track => track.id === trackId)) throw new Error('Choose an available track from the loaded list.')
      const payload = { speakerId: user.id, title: title.trim(), description: description.trim(), trackId }
      if (!demo) return repository.createProposal(payload)
      const proposal = { id: `preview-proposal-${++nextId}`, ...payload, status: 'SUBMITTED' }
      local.push(proposal)
      return { ...proposal }
    },
  }
}
const previewSources = new WeakMap()
export function getSpeakerProposalSource(repository, trackRepository, user, authSource, hasBackendSession) {
  if (authSource !== 'demo' || !user) return createSpeakerProposalSource(repository, trackRepository, user, authSource, hasBackendSession)
  if (!previewSources.has(user)) previewSources.set(user, createSpeakerProposalSource(repository, trackRepository, user, authSource, hasBackendSession))
  return previewSources.get(user)
}
