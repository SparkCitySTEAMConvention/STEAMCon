import { authenticatedFetch } from './authService.js'

async function get(path) {
  const response = await authenticatedFetch(path, { method: 'GET' })
  if (!response.ok) throw new Error(`Event request failed (${response.status}).`)
  return response.json()
}

async function getById(path, id, name) {
  if (typeof id !== 'string' || !id.trim()) throw new Error(`${name} ID is required.`)
  return get(`${path}/${encodeURIComponent(id)}`)
}

export const eventRepository = {
  getTracks: () => get('/api/tracks'),
  getTrack: trackId => getById('/api/tracks', trackId, 'Track'),
  getSessions: () => get('/api/sessions'),
  getSession: sessionId => getById('/api/sessions', sessionId, 'Session'),
  getSessionOccurrences: () => get('/api/session-occurrences'),
  getSessionOccurrence: occurrenceId => getById('/api/session-occurrences', occurrenceId, 'Occurrence'),
}
