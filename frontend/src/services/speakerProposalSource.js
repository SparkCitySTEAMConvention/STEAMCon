import { adaptProposal, adaptDashboard } from './speakerPresentation.js'
import { tracks } from '../mocks/tracks.js'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// Validation limits match CreateProposalRequest.
export const proposalTextLimit = 2000
export const proposalTitleLimit = 200
export function validateProposal({ title, description, trackId } = {}) {
  const errors = {}
  for (const [field, label, value] of [['title', 'Title', title], ['description', 'Description', description]]) {
    if (typeof value !== 'string' || !value.trim()) errors[field] = `${label} is required.`
    else if (value.trim().length > (field === 'title' ? proposalTitleLimit : proposalTextLimit)) errors[field] = `${label} must be ${field === 'title' ? proposalTitleLimit : proposalTextLimit} characters or fewer.`
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
  const currentUserId = user?.id
  const identity = { id: currentUserId, displayName: user?.displayName }
  const demo = authSource === 'demo' && user?.role === 'SPEAKER'
  const available = demo || (authSource === 'backend' && user?.role === 'SPEAKER' && hasBackendSession === true && typeof currentUserId === 'string' && uuid.test(currentUserId))
  const local = []
  let loadedTracks = []
  let nextId = 0
  function requireIdentity() {
    if (!available) throw new Error('Speaker operations require a verified backend speaker account and active session. Sign in again or use the speaker preview.')
  }
  function requireProposalId(id) {
    if (typeof id !== 'string' || !uuid.test(id)) throw new Error('Proposal ID must be a valid UUID.')
  }
  return {
    demo, available,
    async getDashboard() {
      requireIdentity()
      if (demo) return repository.getDashboard()
      const [dashboard, proposals] = await Promise.all([
        repository.getSpeakerDashboard(currentUserId),
        repository.getMyProposals(currentUserId),
      ])
      return adaptDashboard(dashboard, identity, proposals)
    },
    async getMyProposals() {
      requireIdentity()
      return demo ? (await repository.getDashboard()).proposals : (await repository.getMyProposals(currentUserId)).map(adaptProposal)
    },
    async getProposal(id) {
      requireIdentity()
      if (demo) return repository.getProposal(id)
      requireProposalId(id)
      return adaptProposal(await repository.getProposal(id, currentUserId))
    },
    async saveDraft(id, changes) {
      requireIdentity()
      if (demo) return repository.saveDraft(id, changes)
      requireProposalId(id)
      const record = await repository.getProposal(id, currentUserId)
      if (!canManageLiveProposal(record)) throw new Error('Only draft or submitted proposals can be edited.')
      const payload = { title: changes.title, description: changes.abstract, trackId: changes.trackId }
      const errors = validateProposal(payload)
      if (Object.keys(errors).length) throw new Error(Object.values(errors)[0])
      if (!uuid.test(payload.trackId)) throw new Error('Track ID must be a valid UUID.')
      return adaptProposal(await repository.updateProposal(id, currentUserId, { ...payload, title: payload.title.trim(), description: payload.description.trim() }))
    },
    async withdrawProposal(id, name) {
      requireIdentity()
      if (demo) throw new Error('Withdrawal is available for live proposals only.')
      requireProposalId(id)
      const record = await repository.getProposal(id, currentUserId)
      if (!canManageLiveProposal(record)) throw new Error('Only draft or submitted proposals can be withdrawn.')
      if (name !== record.title) throw new Error('Enter the proposal title to confirm withdrawal.')
      return repository.withdrawProposal(id, currentUserId)
    },
    getPreviewProposals: () => local.map(item => ({ ...item })),
    canDeleteProposal(proposalId) {
      return demo && isPreviewProposalDeletable(local.find(item => item.id === proposalId), user.id)
    },
    async deleteProposal(proposalId) {
      requireIdentity()
      if (!demo) throw new Error('Local deletion is available only in the preview. Use confirmed withdrawal for live proposals.')
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
      const payload = { title: title.trim(), description: description.trim(), trackId }
      if (!demo) return repository.createProposal(payload)
      const proposal = { id: `preview-proposal-${++nextId}`, ...payload, speakerId: user.id, status: 'SUBMITTED' }
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

export function canManageLiveProposal(proposal) { return typeof proposal?.status === 'string' && ['DRAFT', 'SUBMITTED'].includes(proposal.status.toUpperCase()) }
