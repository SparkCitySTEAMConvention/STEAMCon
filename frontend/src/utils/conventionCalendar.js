import { conventionConfig } from '../mocks/conventionConfig.js'

export function conventionDayLabel(date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date(`${date}T12:00:00Z`))
}

export function occurrenceDate(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return null
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: conventionConfig.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(value))
  const get = type => parts.find(part => part.type === type).value
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function programCalendar(sessions, live) {
  return sessions.map(session => {
    if (!live) {
      const index = /^Day (\d+)$/.exec(session.day)?.[1]
      return { ...session, calendarDate: conventionConfig.dates[Number(index) - 1] ?? null }
    }
    const date = occurrenceDate(session.scheduledAt)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: conventionConfig.timezone, hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    })
    const time = date ? formatter.format(new Date(session.scheduledAt)) : 'Time to be announced'
    const end = occurrenceDate(session.endsAt) ? formatter.format(new Date(session.endsAt)) : null
    return { ...session, calendarDate: date, time: end ? `${time} – ${end}` : time }
  }).sort((a, b) => (Date.parse(a.scheduledAt) || 0) - (Date.parse(b.scheduledAt) || 0))
}

export function countdownRemaining(now) {
  const seconds = Math.max(0, Math.floor((Date.parse(conventionConfig.countdownTarget) - now) / 1000))
  return { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 }
}
