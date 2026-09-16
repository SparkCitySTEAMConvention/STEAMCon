import test from 'node:test'
import assert from 'node:assert/strict'
import { featuredTrackSession, featuredSessionSchedule, trackTreatment } from '../src/utils/trackFeature.js'
import { adaptProgram } from '../src/services/publicProgramSource.js'
import { publicProgramPreview } from '../src/mocks/publicProgram.js'

test('mandatory preference is restricted to the selected track and preserves source order', () => {
  const track = { id: 't', name: 'Science' }
  const sessions = [{ id: 'other', trackId: 'x', mandatory: true }, { id: 'first', trackId: 't' }, { id: 'mandatory', trackId: 't', mandatory: true }, { id: 'later', trackId: 't', mandatory: true }]
  assert.equal(featuredTrackSession(track, sessions).id, 'mandatory')
  assert.equal(featuredTrackSession(track, sessions.slice(0, 2)).id, 'first')
  assert.equal(featuredTrackSession({ id: 'empty' }, sessions), null)
  assert.equal(featuredTrackSession(null, sessions), null)
  assert.equal(featuredTrackSession(track, [{ track: 'Science', trackId: 'wrong' }]), null)
})
test('all five preview tracks select related sessions and use their color treatment', () => {
  for (const track of publicProgramPreview.tracks) {
    assert.equal(trackTreatment(track), track.slug)
    assert.equal(featuredTrackSession(track, publicProgramPreview.sessions).track, track.name)
  }
  assert.equal(featuredTrackSession(publicProgramPreview.tracks[3], publicProgramPreview.sessions).id, 'evening-concert')
  assert.equal(trackTreatment({ name: 'Unknown', slug: 'science' }), 'neutral')
})
test('backend descriptions and scheduled occurrences remain source data; missing dates are explicit', () => {
  const program = adaptProgram([{ id: 't', name: 'Science', description: 'Backend description' }], [{ id: 's', trackId: 't', title: 'Title', description: 'Session description' }], [{ id: 'o', sessionId: 's', startsAt: '2026-09-16T12:00:00Z' }])
  const session = featuredTrackSession(program.tracks[0], program.sessions)
  assert.equal(program.tracks[0].description, 'Backend description')
  assert.equal(session.description, 'Session description')
  assert.match(featuredSessionSchedule(session), /September 16, 2026.*12:00 PM UTC/)
  assert.equal(featuredSessionSchedule({ occurrences: [] }), 'Date and time to be announced')
  assert.equal(featuredSessionSchedule({ occurrences: [{ scheduledAt: 'bad' }] }), 'Date and time to be announced')
})
