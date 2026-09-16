import { publicProgramPreview } from '../mocks/publicProgram.js'
import { scheduleLabel } from '../utils/proposalPresentation.js'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export function adaptOccurrence(record) {
  return { id: record.id, sessionId: record.sessionId, scheduledAt: record.startsAt ?? null,
    endsAt: record.endsAt ?? null, timezone: null, room: null }
}
export function adaptProgram(tracks, sessions, occurrences) {
  if (![tracks, sessions, occurrences].every(Array.isArray)) throw new Error('Invalid program response.')
  const trackModels = tracks.map(({ id, name, description }) => ({ id, name, description: description ?? null, slug: 'live', symbol: null }))
  const occurrenceModels = occurrences.map(adaptOccurrence)
  const sessionModels = sessions.map(({ id, title, description, trackId, mandatory }) => ({
    id, title, description: description ?? null, trackId, mandatory,
    track: trackModels.find(track => track.id === trackId)?.name ?? null,
    speaker: null, format: null,
    occurrences: occurrenceModels.filter(occurrence => occurrence.sessionId === id),
  }))
  return { tracks: trackModels, sessions: sessionModels, occurrences: occurrenceModels,
    trackNames: trackModels.map(track => track.name),
    schedule: sessionModels.flatMap(session => session.occurrences.map(occurrence => ({
      ...session, ...occurrence, id: occurrence.id, title: session.title,
      // Instant is an absolute UTC timestamp; UTC is a display zone, not an event timezone.
      day: occurrence.scheduledAt ? 'Scheduled events (UTC)' : 'Time to be announced',
      time: scheduleLabel({ ...occurrence, timezone: 'UTC' }, { timezone: null }), location: null,
    }))),
  }
}
export function createPublicProgramSource(repository, auth = {}, sessionValid = false) {
  const live = auth.authSource === 'backend' && auth.isAuthenticated === true &&
    auth.hasBackendSession === true && uuid.test(auth.user?.id || '') && sessionValid
  const blocked = auth.authSource === 'backend' && !live
  return {
    mode: blocked ? 'unavailable' : live ? 'live' : 'preview',
    async load() {
      if (blocked) throw new Error('A valid backend identity and session are required.')
      if (!live) return publicProgramPreview
      const records = await Promise.all([repository.getTracks(), repository.getSessions(), repository.getSessionOccurrences()])
      return adaptProgram(...records)
    },
  }
}
