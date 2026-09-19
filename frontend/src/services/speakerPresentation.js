// Preserve backend records; aliases and status labels belong only to presentation.
export function adaptProposal(record) {
  if (!record) return null
  return { ...record, backendRecord: record, abstract: record.description,
    status: typeof record.status === 'string' ? record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase() : 'Unavailable',
    speakers: [] }
}
export function liveSpeaker(user) { return { name: user?.displayName || 'Speaker', profileEditable: false } }
export function adaptDashboard(record, user, proposals = record.proposals || []) {
  return { ...record, backendRecord: record, speaker: liveSpeaker(user), convention: {},
    proposals: proposals.map(adaptProposal), applications: record.applications || [],
    sessions: [], feedback: (record.feedback || []).map(item => ({ ...item, title: item.decision || item.status || 'Proposal feedback', message: item.comment || item.reason || item.message || 'No feedback message available.', date: item.createdAt })) }
}
