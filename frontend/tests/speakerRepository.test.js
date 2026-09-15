import test from 'node:test'
import assert from 'node:assert/strict'
import { speakers } from '../src/mocks/speakers.js'
import { proposals } from '../src/mocks/proposals.js'
import { panels } from '../src/mocks/panels.js'
import { sessions, convention } from '../src/mocks/sessions.js'
import { tracks } from '../src/mocks/tracks.js'
import { scheduledProposal } from '../src/mocks/previewScenarios.js'
import { speakerRepository } from '../src/services/speakerRepository.js'
import { canRequestScheduleChange, scheduleLabel } from '../src/utils/proposalPresentation.js'

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
  assert.equal(convention.location, null)
  assert.equal(convention.date, null)
})

test('schedule actions require approval and a complete actual schedule', () => {
  assert.equal(scheduleLabel({}), 'Schedule to be announced')
  assert.equal(canRequestScheduleChange({ status: 'Approved', date: '2000-01-01' }), false)
  assert.equal(canRequestScheduleChange({ status: 'Approved', time: '10:00' }), false)
  for (const status of ['Draft', 'Pending', 'Rejected']) assert.equal(canRequestScheduleChange({ ...scheduledProposal, status }), false)
  assert.equal(canRequestScheduleChange(scheduledProposal), true)
  for (const proposal of proposals) assert.equal(canRequestScheduleChange(proposal), false)
})

test('draft saves persist in the preview and cannot change status or membership', async () => {
  const before = await speakerRepository.getProposal('proposal-bill-nye')
  const saved = await speakerRepository.saveDraft(before.id, { ...before, title: 'Updated title', status: 'Approved', speakerIds: [] })
  assert.equal(saved.title, 'Updated title')
  assert.equal(saved.status, 'Draft')
  assert.deepEqual(saved.speakerIds, before.speakerIds)
  const dashboard = await speakerRepository.getDashboard('speaker-bill-nye')
  assert.ok(dashboard.proposals.length > 1)
  assert.equal(dashboard.proposals.find(proposal => proposal.id === before.id).title, 'Updated title')
  await assert.rejects(speakerRepository.saveDraft('proposal-neil-degrasse-tyson', before))
  await assert.rejects(speakerRepository.saveDraft(before.id, { ...before, title: '  ' }))
  assert.equal(await speakerRepository.getProposal('missing'), null)
})
