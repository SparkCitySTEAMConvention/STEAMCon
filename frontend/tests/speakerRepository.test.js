import test from 'node:test'
import assert from 'node:assert/strict'
import { speakers } from '../src/mocks/speakers.js'
import { proposals } from '../src/mocks/proposals.js'
import { panels } from '../src/mocks/panels.js'
import { sessions, convention } from '../src/mocks/sessions.js'
import { tracks } from '../src/mocks/tracks.js'
import { scheduledProposal } from '../src/mocks/previewScenarios.js'
import { speakerRepository } from '../src/services/speakerRepository.js'
import { canRequestScheduleChange, canAddToCalendar, calendarHref, scheduleLabel, roomLabel, locationLabel } from '../src/utils/proposalPresentation.js'

test('program IDs and relationships remain valid across all five tracks', () => {
  for (const collection of [speakers, proposals, panels, sessions, tracks]) {
    assert.equal(new Set(collection.map(item => item.id)).size, collection.length)
  }
  assert.equal(speakers.length, 15)
  assert.equal(panels.length, 5)
  for (const track of tracks) assert.equal(speakers.filter(speaker => speaker.trackIds[0] === track.id).length, 3)
  for (const record of [...proposals, ...panels, ...sessions]) {
    for (const id of record.speakerIds) assert.ok(speakers.some(speaker => speaker.id === id))
    assert.equal(record.scheduledAt, null)
    assert.equal(record.room, null)
  }
  for (const proposal of proposals) {
    assert.ok(proposal.speakerIds.includes(proposal.primarySpeakerId))
    assert.ok(tracks.some(track => track.id === proposal.trackId))
  }
  for (const field of ['startsAt', 'endsAt', 'timezone', 'venueName', 'city', 'state']) assert.equal(convention[field], null)
})

test('schedule actions require approval and a complete actual schedule', () => {
  assert.equal(scheduleLabel({}), 'Date and time to be announced')
  assert.equal(canRequestScheduleChange({ status: 'Approved', date: '2000-01-01' }), false)
  assert.equal(canRequestScheduleChange({ status: 'Approved', time: '10:00' }), false)
  for (const status of ['Draft', 'Pending', 'Rejected']) assert.equal(canRequestScheduleChange({ ...scheduledProposal, status }), false)
  assert.equal(canRequestScheduleChange(scheduledProposal), true)
  for (const proposal of proposals) assert.equal(canRequestScheduleChange(proposal), false)
})

test('draft saves persist in the preview and cannot change status or membership', async () => {
  const before = await speakerRepository.getProposal('proposal-timnit-gebru')
  const saved = await speakerRepository.saveDraft(before.id, { ...before, title: 'Updated title', status: 'Approved', speakerIds: [] })
  assert.equal(saved.title, 'Updated title')
  assert.equal(saved.status, 'Draft')
  assert.deepEqual(saved.speakerIds, before.speakerIds)
  assert.equal((await speakerRepository.getProposal(before.id)).title, 'Updated title')
  await assert.rejects(speakerRepository.saveDraft('proposal-neil-degrasse-tyson', before))
  await assert.rejects(speakerRepository.saveDraft(before.id, { ...before, title: '  ' }))
  assert.equal(await speakerRepository.getProposal('missing'), null)
})

test('Bill Nye has the complete proposed program and panel membership', async () => {
  const dashboard = await speakerRepository.getDashboard()
  assert.equal(dashboard.speaker.name, 'Bill Nye')
  assert.equal(dashboard.proposals.length, 2)
  assert.deepEqual(dashboard.proposals.map(item => item.title), ['Science Changes Everything', 'Space, Science, and Public Imagination'])
  for (const proposal of dashboard.proposals) {
    assert.equal(proposal.status, 'Approved')
    assert.equal(proposal.durationMinutes, 60)
    const session = dashboard.sessions.find(item => item.proposalId === proposal.id)
    for (const field of ['scheduledAt', 'endsAt', 'timezone', 'room']) assert.equal(session[field], proposal[field])
  }
  assert.deepEqual(dashboard.sessions[1].speakers.map(person => person.name), ['Bill Nye', 'Neil deGrasse Tyson', 'Mae Jemison'])
  assert.deepEqual(dashboard.proposals[1].additionalTrackIds, ['engineering'])
})

test('dashboard identity stays Bill Nye for every public speaker ID', async () => {
  for (const speaker of speakers) {
    const dashboard = await speakerRepository.getDashboard(speaker.id)
    assert.equal(dashboard.speaker.id, 'speaker-bill-nye')
    assert.ok(dashboard.proposals.every(proposal => proposal.speakerIds.includes('speaker-bill-nye')))
  }
})

test('shared schedule formatting respects the event timezone and nullable fields', () => {
  assert.equal(scheduleLabel({ scheduledAt: null }), 'Date and time to be announced')
  assert.equal(roomLabel({ room: null }), 'Room to be announced')
  assert.equal(locationLabel(), 'Location to be announced')
  assert.equal(locationLabel({ venueName: 'Test Hall', city: 'Test City', state: 'NY' }), 'Test Hall, Test City, NY')
  const record = { scheduledAt: '2000-01-01T02:00:00Z' }
  assert.equal(scheduleLabel(record, { timezone: 'America/New_York' }), 'December 31, 1999 at 9:00 PM EST')
  assert.equal(scheduleLabel({ ...record, timezone: 'UTC' }), 'January 1, 2000 at 2:00 AM UTC')
  assert.equal(scheduleLabel(record), 'Date and time awaiting event timezone')
  assert.match(scheduleLabel(scheduledProposal), /January 1, 2000 at 5:00 AM EST.*5:30 AM EST/)
})

test('calendar downloads require complete schedules and preserve UTC instants', () => {
  for (const proposal of proposals) {
    assert.equal(canAddToCalendar(proposal), false)
    assert.equal(calendarHref(proposal), null)
  }
  for (const field of ['scheduledAt', 'endsAt', 'timezone']) assert.equal(canAddToCalendar({ ...scheduledProposal, [field]: null }), false)
  assert.equal(canAddToCalendar({ ...scheduledProposal, endsAt: '1999-01-01T00:00:00Z' }), false)
  assert.equal(canAddToCalendar(scheduledProposal), true)
  const calendar = decodeURIComponent(calendarHref(scheduledProposal))
  assert.match(calendar, /DTSTART:20000101T100000Z/)
  assert.match(calendar, /DTEND:20000101T103000Z/)
})
