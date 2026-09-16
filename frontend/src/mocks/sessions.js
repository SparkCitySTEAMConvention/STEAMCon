import { proposals } from './proposals.js'
export const convention = { id: 'convention-preview', location: null, date: null }
export const sessions = proposals.filter(proposal => proposal.status === 'Approved').map(proposal => ({
  id: `session-${proposal.id}`, proposalId: proposal.id, panelId: proposal.panelId,
  title: proposal.title, speakerIds: proposal.speakerIds,
  scheduledAt: null, date: null, time: null, room: null,
}))
