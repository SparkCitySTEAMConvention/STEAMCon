import { speakers } from './speakers.js'
import { panels } from './panels.js'
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
    scheduledAt: null, date: null, time: null, room: null,
  })),
  ...panels.map(panel => ({
    id: `proposal-${panel.id}`, title: panel.title,
    abstract: 'Proposed crossover discussion for development preview only. The title and participant grouping do not represent an agreed session or statements by these people.',
    trackId: panel.trackIds[0], format: 'Panel', durationMinutes: 60,
    primarySpeakerId: panel.speakerIds[0], speakerIds: panel.speakerIds, panelId: panel.id,
    status: 'Approved', adminFeedback: 'Sample feedback: approved in this UI scenario; scheduling is still pending.',
    scheduledAt: null, date: null, time: null, room: null,
  })),
]
