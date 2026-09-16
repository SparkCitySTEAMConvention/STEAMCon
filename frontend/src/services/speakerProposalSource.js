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

export function isPreviewProposalDeletable(proposal, speakerId) {
  return !!proposal && proposal.speakerId === speakerId && proposal.status === 'SUBMITTED'
    && !proposal.scheduledAt && !proposal.startsAt && !proposal.endsAt
    && !proposal.scheduled && !proposal.date && !proposal.startTime && !proposal.room
    && !proposal.roomId && !proposal.sessionId && !proposal.occurrenceId
}

// Confirmation is explicit; cancellation never invokes the source operation.
export async function deleteConfirmedProposal(source, proposalId, confirmed) {
  if (confirmed !== true) return null
  return source.deleteProposal(proposalId)
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
    canDeleteProposal(proposalId) {
      return demo && isPreviewProposalDeletable(local.find(item => item.id === proposalId), user.id)
    },
    async deleteProposal(proposalId) {
      requireIdentity()
      if (!demo) throw new Error('Proposal removal is unavailable until the backend provides a supported deletion or withdrawal contract.')
      if (typeof proposalId !== 'string' || !proposalId.trim()) throw new Error('A proposal ID is required.')
      const index = local.findIndex(item => item.id === proposalId)
      if (index < 0 || !isPreviewProposalDeletable(local[index], user.id)) throw new Error('Only your locally created, submitted and unscheduled preview proposals can be deleted.')
      local.splice(index, 1)
      return { deletedId: proposalId }
    },
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
