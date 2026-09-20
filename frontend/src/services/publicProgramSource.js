import { scheduleLabel } from '../utils/proposalPresentation.js'

export function adaptOccurrence(record) {
  return { id: record.id, sessionId: record.sessionId, scheduledAt: record.startsAt ?? null,
    endsAt: record.endsAt ?? null, timezone: 'America/New_York', room: null }
}

export function adaptProgram(tracks, sessions, occurrences) {
  if (![tracks, sessions, occurrences].every(Array.isArray)) throw new Error('Invalid program response.')
  const trackModels = tracks.map(({ id, name, description }) => ({ id, name, description: description ?? null, slug: name?.toLowerCase().replaceAll(' ', '-') || 'track', symbol: null }))
  const occurrenceModels = occurrences.map(adaptOccurrence)
  const sessionModels = sessions.map(({ id, title, description, trackId, mandatory }) => ({
    id, title, description: description ?? null, trackId, mandatory,
    track: trackModels.find(track => track.id === trackId)?.name ?? null,
    speaker: null, format: 'Session',
    occurrences: occurrenceModels.filter(occurrence => occurrence.sessionId === id),
  }))
  return { tracks: trackModels, sessions: sessionModels, occurrences: occurrenceModels,
    trackNames: trackModels.map(track => track.name),
    schedule: sessionModels.flatMap(session => session.occurrences.map(occurrence => ({
      ...session, ...occurrence, id: occurrence.id, title: session.title,
      day: occurrence.scheduledAt ? new Date(occurrence.scheduledAt).toLocaleDateString('en-US', { timeZone: 'America/New_York' }) : 'Time to be announced',
      time: scheduleLabel({ ...occurrence, timezone: 'America/New_York' }, { timezone: 'America/New_York' }),
      location: 'Jacob K. Javits Convention Center',
    }))),
  }
}

export function createPublicProgramSource(repository) {
  return {
    mode: 'live',
    async load() {
      const records = await Promise.all([
        repository.getTracks(),
        repository.getSessions(),
        repository.getSessionOccurrences(),
      ])
      return adaptProgram(...records)
    },
  }
}
