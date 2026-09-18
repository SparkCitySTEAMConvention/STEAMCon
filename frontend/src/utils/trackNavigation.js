import { hasSchedule } from './proposalPresentation.js'

export function trackQuery(track) {
  return (track.name || '').trim().toLowerCase().replaceAll(/\s+/g, '-')
}

export function trackDestination(track) {
  return `/tracks?track=${encodeURIComponent(trackQuery(track))}`
}

export function selectedTrack(tracks, query) {
  if (query === 'all') return undefined
  return tracks.find(track => trackQuery(track) === query) || tracks[0]
}

export function programSummary(data, preview = false) {
  const tracks = data?.tracks || []
  const sessions = data?.sessions || []
  const scheduled = sessions.filter(session => session.occurrences?.some(hasSchedule)).length
  return {
    trackCount: tracks.length,
    sessionCount: sessions.length,
    status: preview || !sessions.length || scheduled < sessions.length ? 'Program taking shape' : 'Published session times',
  }
}
