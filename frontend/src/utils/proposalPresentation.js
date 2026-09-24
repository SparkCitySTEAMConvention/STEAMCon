import { conventionConfig } from '../config/conventionConfig.js'

function validTimestamp(value) {
  return typeof value === 'string' && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value))
}

function eventTimezone(record, convention) {
  return record.timezone || convention.timezone
}

export function hasSchedule(record) {
  return validTimestamp(record.scheduledAt)
}

export function timestampLabel(value, timezone) {
  if (!validTimestamp(value)) return 'Date and time to be announced'
  // Never silently use the viewer's machine timezone.
  if (!timezone) return 'Date and time awaiting event timezone'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(value))
}

export function scheduleLabel(record, convention = conventionConfig) {
  const timezone = eventTimezone(record, convention)
  const start = timestampLabel(record.scheduledAt, timezone)
  return hasSchedule(record) && validTimestamp(record.endsAt) && timezone
    ? `${start} – ${timestampLabel(record.endsAt, timezone)}`
    : start
}

export function conventionScheduleLabel(convention = conventionConfig) {
  return scheduleLabel({ scheduledAt: convention.startsAt, endsAt: convention.endsAt, timezone: convention.timezone }, convention)
}

export function roomLabel(record) {
  return record.room || 'Room to be announced'
}

export function locationLabel(convention = conventionConfig) {
  return [convention.venueName, convention.city, convention.state].filter(Boolean).join(', ') || 'Location to be announced'
}

export function canRequestScheduleChange(proposal) {
  return proposal.status === 'Approved' && hasSchedule(proposal)
}

export function canAddToCalendar(record, convention = conventionConfig) {
  return hasSchedule(record) && validTimestamp(record.endsAt) &&
    Date.parse(record.endsAt) > Date.parse(record.scheduledAt) &&
    Boolean(eventTimezone(record, convention))
}

// Calendar timestamps are UTC instants; display formatting uses the event zone.
export function calendarHref(record, convention = conventionConfig) {
  if (!canAddToCalendar(record, convention)) return null
  const stamp = value => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const escape = value => value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/[,;]/g, '\\$&')
  const content = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//STEAM Con//Speaker Portal//EN',
    'BEGIN:VEVENT', `UID:${record.id}@steamcon-preview`,
    `DTSTAMP:${stamp(record.scheduledAt)}`, `DTSTART:${stamp(record.scheduledAt)}`,
    `DTEND:${stamp(record.endsAt)}`, `SUMMARY:${escape(record.title)}`,
    `LOCATION:${escape([record.room, convention.venueName, convention.city, convention.state].filter(Boolean).join(', '))}`,
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n')
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(content)}`
}
