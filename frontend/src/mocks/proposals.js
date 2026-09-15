import { speakers } from './speakers.js'
import { panels } from './panels.js'
// Data: edit one entry per session here. Use ISO 8601 timestamps with offsets;
// null timezone inherits conventionConfig.timezone. Never enter display strings.
export const proposalSchedules = {
  'proposal-bill-nye': { scheduledAt: null, endsAt: null, timezone: null, room: null },
  'proposal-panel-space-imagination': { scheduledAt: null, endsAt: null, timezone: null, room: null },
}

// Presentation fixtures only. Titles, abstracts, statuses and feedback are authored
// for UI testing; none is a submission or a claim made by the named person.
export const proposals = [
  ...speakers.map((speaker, index) => ({
    id: `proposal-${speaker.id.slice(8)}`, title: `${speaker.trackIds[0][0].toUpperCase()}${speaker.trackIds[0].slice(1)}: proposed conversation`,
    abstract: 'Development-only proposal concept for exploring questions and exchanging ideas. This abstract was not submitted or approved by the named placeholder.',
    trackId: speaker.trackIds[0], format: 'Talk', durationMinutes: 30,
    primarySpeakerId: speaker.id, speakerIds: [speaker.id], panelId: null,
    status: ['Draft', 'Pending', 'Approved', 'Rejected'][index % 4],
    adminFeedback: index % 4 === 3 ? 'Sample feedback: please clarify the intended audience and scope before resubmitting.' : null,
    scheduledAt: null, endsAt: null, timezone: null, room: null,
    ...(speaker.id === 'speaker-bill-nye' ? {
      title: 'Science Changes Everything',
      abstract: 'Proposed featured talk exploring science and its role in everyday life. This development concept was not submitted or approved by the named speaker.',
      format: 'Featured talk',
      durationMinutes: 60,
      status: 'Approved',
    } : {}),
    ...proposalSchedules[`proposal-${speaker.id.slice(8)}`],
  })),
  ...panels.map(panel => ({
    id: `proposal-${panel.id}`, title: panel.title,
    abstract: 'Proposed crossover discussion for development preview only. The title and participant grouping do not represent an agreed session or statements by these people.',
    trackId: panel.trackIds[0], additionalTrackIds: panel.trackIds.slice(1), format: 'Panel', durationMinutes: 60,
    primarySpeakerId: panel.speakerIds[0], speakerIds: panel.speakerIds, panelId: panel.id,
    status: 'Approved', adminFeedback: 'Sample feedback: approved in this UI scenario; scheduling is still pending.',
    scheduledAt: null, endsAt: null, timezone: null, room: null,
    ...proposalSchedules[`proposal-${panel.id}`],
  })),
]
