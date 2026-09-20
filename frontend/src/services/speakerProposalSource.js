import { adaptProposal, adaptDashboard } from './speakerPresentation.js'

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
  const demo = false
  const available = authSource === 'backend' && user?.role === 'SPEAKER' && hasBackendSession === true && typeof currentUserId === 'string' && uuid.test(currentUserId)
  let loadedTracks = []
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
      const [dashboard, proposals, assignments, tracksLive, sessionsLive, occurrencesLive] = await Promise.all([
        repository.getSpeakerDashboard(currentUserId),
        repository.getMyProposals(currentUserId),
        repository.getMyAssignments(),
        trackRepository.getTracks(),
        trackRepository.getSessions(),
        trackRepository.getSessionOccurrences(),
      ])
      const adapted = adaptDashboard(dashboard, identity, proposals)
      const speakingSessions = assignments.map(assignment => {
        const session = sessionsLive.find(item => item.id === assignment.sessionId)
        const occurrence = occurrencesLive.find(item => item.sessionId === assignment.sessionId)
        const proposal = proposals.find(item => item.id === assignment.proposalId)
        return {
          id: assignment.assignmentId, assignmentId: assignment.assignmentId,
          proposalId: assignment.proposalId, sessionId: assignment.sessionId,
          title: session?.title || proposal?.title || 'Assigned session',
          description: session?.description || proposal?.description || '',
          trackId: session?.trackId || proposal?.trackId || null,
          track: tracksLive.find(item => item.id === (session?.trackId || proposal?.trackId))?.name || 'Track',
          role: assignment.role, format: 'Session', durationMinutes: null,
          status: 'Approved', scheduledAt: occurrence?.startsAt || null,
          endsAt: occurrence?.endsAt || null, room: null,
          location: 'Jacob K. Javits Convention Center',
          speakers: [{ id: currentUserId, name: user?.displayName || 'Speaker' }],
        }
      })
      return { ...adapted, sessions: speakingSessions, tracks: tracksLive }
    },
    async getMyProposals() {
      requireIdentity()
      return (await repository.getMyProposals(currentUserId)).map(adaptProposal)
    },
    async getProposal(id) {
      requireIdentity()
      requireProposalId(id)
      return adaptProposal(await repository.getProposal(id, currentUserId))
    },
    async saveDraft(id, changes) {
      requireIdentity()
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
      requireProposalId(id)
      const record = await repository.getProposal(id, currentUserId)
      if (!canManageLiveProposal(record)) throw new Error('Only draft or submitted proposals can be withdrawn.')
      if (name !== record.title) throw new Error('Enter the proposal title to confirm withdrawal.')
      return repository.withdrawProposal(id, currentUserId)
    },
    getPreviewProposals: () => [],
    canDeleteProposal() { return false },
    async deleteProposal() { throw new Error('Use confirmed withdrawal for live proposals.') },
    async getTracks() {
      requireIdentity()
      const result = await trackRepository.getTracks()
      if (!Array.isArray(result) || result.some(item => !item || typeof item.name !== 'string' || !uuid.test(item.id || ''))) throw new Error('Invalid track response. Please retry loading tracks.')
      loadedTracks = result.map(item => ({ ...item }))
      return result
    },
    async createProposal(values) {
      requireIdentity()
      const errors = validateProposal(values)
      if (Object.keys(errors).length) throw new Error(Object.values(errors)[0])
      const { title, description, trackId } = values
      if (!uuid.test(trackId) || !loadedTracks.some(track => track.id === trackId)) throw new Error('Choose an available track from the loaded list.')
      const payload = { title: title.trim(), description: description.trim(), trackId }
      return repository.createProposal(payload)
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
