import { attendeeData } from './attendeeData.js'

export const publicTracks = [
  { name: 'Science', slug: 'science', symbol: '◎', description: 'Ask bigger questions. Discover new perspectives.' },
  { name: 'Technology', slug: 'technology', symbol: '</>', description: 'Explore the tools changing how we connect and create.' },
  { name: 'Engineering', slug: 'engineering', symbol: '⌘', description: 'Turn bold ideas into things that work.' },
  { name: 'Art', slug: 'art', symbol: '✳', description: 'Challenge the familiar. Make room for imagination.' },
  { name: 'Mathematics', slug: 'mathematics', symbol: '∞', description: 'Find the patterns that open up new possibilities.' },
]
// Demonstration occurrences only; these are not confirmed program times.
export const publicPreviewOccurrences = [
  { id: 'preview-opening', sessionId: 'opening-keynote', startsAt: '2027-04-06T09:00:00-04:00', endsAt: '2027-04-06T10:00:00-04:00' },
  { id: 'preview-code', sessionId: 'creative-code', startsAt: '2027-04-06T11:15:00-04:00', endsAt: '2027-04-06T12:30:00-04:00' },
  { id: 'preview-cities', sessionId: 'cities-together', startsAt: '2027-04-06T14:00:00-04:00', endsAt: '2027-04-06T15:00:00-04:00' },
  { id: 'preview-music', sessionId: 'patterns-music', startsAt: '2027-04-07T10:00:00-04:00', endsAt: '2027-04-07T11:00:00-04:00' },
  { id: 'preview-data', sessionId: 'art-data', startsAt: '2027-04-07T13:30:00-04:00', endsAt: '2027-04-07T14:45:00-04:00' },
  { id: 'preview-concert', sessionId: 'evening-concert', startsAt: '2027-04-08T19:00:00-04:00', endsAt: '2027-04-08T21:00:00-04:00' },
]
const occurrences = publicPreviewOccurrences.map(record => ({ id: record.id, sessionId: record.sessionId,
  scheduledAt: record.startsAt, endsAt: record.endsAt, timezone: null, room: null }))
const sessions = attendeeData.sessions.map(session => ({ ...session, occurrences: occurrences.filter(record => record.sessionId === session.id) }))
const schedule = sessions.flatMap(session => session.occurrences.map(occurrence => ({
  ...session, ...occurrence, id: occurrence.id, speaker: null, format: null, location: null,
})))
export const publicProgramPreview = { tracks: publicTracks, sessions, occurrences, schedule, trackNames: attendeeData.tracks }
