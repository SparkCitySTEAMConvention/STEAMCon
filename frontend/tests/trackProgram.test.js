import test from 'node:test'
import assert from 'node:assert/strict'
import { sessionsForTrack, filterTrackSessions } from '../src/utils/trackProgram.js'

test('track IDs take precedence over names and preview tracks retain name matching', () => {
  const sessions = [{ id: 'a', trackId: 'science', track: 'Science', occurrences: [{ id: 'first' }, { id: 'repeat' }] }, { id: 'b', trackId: 'other', track: 'Science' }]
  const related = sessionsForTrack({ id: 'science', name: 'Science' }, sessions)
  assert.deepEqual(related.map(session => session.id), ['a'])
  assert.equal(related[0].occurrences.length, 2)
  assert.deepEqual(sessionsForTrack(null, sessions), [])
  assert.equal(sessionsForTrack({ name: 'Science' }, sessions).length, 2)
})

test('search combines with strict mandatory filtering and handles missing descriptions', () => {
  const sessions = [{ id: 'a', title: 'Patterns', description: null, mandatory: true }, { id: 'b', title: 'Sound', description: 'Explore PATTERNS', mandatory: false }, { id: 'c', title: 'Patterns', mandatory: 'true' }]
  assert.deepEqual(filterTrackSessions(sessions, ' patterns ').map(session => session.id), ['a', 'b', 'c'])
  assert.deepEqual(filterTrackSessions(sessions, 'patterns', true).map(session => session.id), ['a'])
  assert.deepEqual(filterTrackSessions(sessions, 'absent'), [])
  assert.deepEqual(filterTrackSessions(sessions), sessions)
})
