import { proposals } from './proposals.js'
export { conventionConfig as convention } from './conventionConfig.js'

// A session derives its schedule and metadata from its proposal. Edit only the
// proposal record when scheduling becomes available.
export const sessions = proposals.filter(proposal => proposal.status === 'Approved').map(proposal => ({
  ...proposal,
  id: `session-${proposal.id}`,
  proposalId: proposal.id,
}))
