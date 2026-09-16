import { hasSchedule, scheduleLabel } from './proposalPresentation.js'

const treatments = new Set(['science', 'technology', 'engineering', 'art', 'mathematics'])
export function trackTreatment(track) {
  const name = track?.name?.trim().toLowerCase()
  return treatments.has(name) ? name : 'neutral'
}

export function featuredTrackSession(track, sessions = []) {
  if (!track) return null
  const related = sessions.filter(session => track.id != null
    ? session.trackId === track.id
    : session.track === track.name)
  return related.find(session => session.mandatory === true) ?? related[0] ?? null
}

export function featuredSessionSchedule(session) {
  const occurrence = session?.occurrences?.find(hasSchedule)
  return occurrence
    ? scheduleLabel({ ...occurrence, timezone: occurrence.timezone || 'UTC' }, { timezone: null })
    : 'Date and time to be announced'
}
