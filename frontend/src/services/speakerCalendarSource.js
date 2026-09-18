const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function createSpeakerCalendarSource(repository, user, authSource, hasBackendSession = false) {
  const demo = authSource === 'demo' && user?.role === 'SPEAKER'
  const available = authSource === 'backend' && user?.role === 'SPEAKER' && hasBackendSession === true && uuid.test(user?.id || '')
  return {
    demo,
    async load() {
      if (demo) return []
      if (!available) throw new Error('An active backend speaker session is required.')
      const entries = await repository.getMyCalendar()
      return [...entries].sort((a, b) => {
        const first = Date.parse(a.startsAt)
        const second = Date.parse(b.startsAt)
        return (Number.isFinite(first) ? first : Infinity) - (Number.isFinite(second) ? second : Infinity)
      })
    },
  }
}
