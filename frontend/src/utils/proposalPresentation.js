export function hasSchedule(record) {
  return Boolean(record.scheduledAt || (record.date && record.time))
}
export function scheduleLabel(record) {
  return record.scheduledAt || [record.date, record.time].filter(Boolean).join(' · ') || 'Schedule to be announced'
}
export function canRequestScheduleChange(proposal) {
  return proposal.status === 'Approved' && hasSchedule(proposal)
}
