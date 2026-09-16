// Sample UI copy for the Bill Nye frontend preview; no attendance is implied.
// Scheduling remains nullable in the shared proposal/session fixtures.
export const demoNotifications = [
  { id: 'demo-notification-feedback', userId: 'demo-SPEAKER', type: 'SPEAKER_APPLICATION_UPDATED', message: 'Sample organizer feedback: please review the proposal abstract and clarify the audience takeaways.', read: false, createdAt: '2026-09-15T14:00:00Z' },
  { id: 'demo-notification-scheduling', userId: 'demo-SPEAKER', type: 'GENERAL', message: 'Preview scheduling reminder: proposed sessions have no assigned date, time, or room. Scheduling details remain pending.', read: false, createdAt: '2026-09-14T12:00:00Z' },
  { id: 'demo-notification-proposal', userId: 'demo-SPEAKER', type: 'GENERAL', message: 'Sample proposal information is available in your workspace for review. This preview does not confirm participation.', read: true, createdAt: '2026-09-13T10:00:00Z' },
]
