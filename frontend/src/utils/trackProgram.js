export function sessionsForTrack(track, sessions = []) {
  if (!track) return []
  return sessions.filter(session => track.id != null
    ? session.trackId === track.id
    : session.track === track.name)
}

export function filterTrackSessions(sessions, query = '', mandatoryOnly = false) {
  const search = query.trim().toLowerCase()
  return sessions.filter(session => (!mandatoryOnly || session.mandatory === true) &&
    (!search || [session.title, session.description].some(value => typeof value === 'string' && value.toLowerCase().includes(search))))
}
