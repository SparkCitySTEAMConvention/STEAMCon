import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { adaptProgram, adaptOccurrence, createPublicProgramSource } from '../src/services/publicProgramSource.js'
import { canAddToCalendar, scheduleLabel } from '../src/utils/proposalPresentation.js'
import { speakerData } from '../src/mocks/speakerData.js'
const auth = { authSource: 'backend', isAuthenticated: true, hasBackendSession: true, user: { id: '12345678-1234-1234-1234-123456789abc' } }
const tracks = [{ id: 't', name: 'Science', description: null }]
const sessions = [{ id: 's', title: 'Science Changes Everything', description: 'Description', trackId: 't', mandatory: true }]
const occurrence = { id: 'o', sessionId: 's', startsAt: '2026-09-16T12:00:00Z', endsAt: '2026-09-16T13:00:00Z' }
test('exact adaptation and only confirmed relationships, ISO schedule formatting', () => {
 const result = adaptProgram(tracks, sessions, [occurrence, { ...occurrence, id: 'other', sessionId: 'unknown' }])
 assert.deepEqual(result.tracks, [{ ...tracks[0], slug: 'live', symbol: null }])
 assert.deepEqual(result.sessions[0], { ...sessions[0], track: 'Science', speaker: null, format: null, occurrences: [adaptOccurrence(occurrence)] })
 assert.equal(result.schedule.length, 1)
 assert.equal(result.schedule[0].location, null)
 assert.equal(adaptProgram([], sessions, []).sessions[0].track, null)
 assert.equal(result.schedule[0].time, scheduleLabel({ scheduledAt: occurrence.startsAt, endsAt: occurrence.endsAt, timezone: 'UTC' }))
 assert.match(result.schedule[0].time, /September 16, 2026/)
 assert.match(result.schedule[0].time, /UTC/)
})
test('null scheduling and missing event timezone do not enable calendar', () => {
 const model = adaptOccurrence({ id: 'o', sessionId: 's' })
 assert.deepEqual(model, { id: 'o', sessionId: 's', scheduledAt: null, endsAt: null, timezone: null, room: null })
 assert.equal(canAddToCalendar(model), false)
 assert.equal(canAddToCalendar(adaptOccurrence(occurrence), { timezone: null }), false)
})
test('anonymous and demo preview never contact backend', async () => {
 const repository = new Proxy({}, { get() { throw new Error('Backend contacted') } })
 for (const state of [{}, { authSource: 'demo', user: { id: 'demo-speaker' }, isAuthenticated: true }]) {
  const source = createPublicProgramSource(repository, state, true)
  assert.equal(source.mode, 'preview')
  assert.ok((await source.load()).sessions.length)
 }
})
test('live uses adapter; failure propagates and retry reloads; empty stays empty', async () => {
 let failed = true
 let empty = false
 const calls = []
 const repository = Object.fromEntries([['getTracks', tracks], ['getSessions', sessions], ['getSessionOccurrences', [occurrence]]].map(([name, records]) => [name, async () => {
  calls.push(name)
  if (failed) throw new Error('offline')
  return empty ? [] : records
 }]))
 const source = createPublicProgramSource(repository, auth, true)
 assert.equal(source.mode, 'live')
 await assert.rejects(source.load(), /offline/)
 failed = false
 assert.deepEqual(await source.load(), adaptProgram(tracks, sessions, [occurrence]))
 empty = true
 assert.deepEqual(await source.load(), { tracks: [], sessions: [], occurrences: [], trackNames: [], schedule: [] })
 assert.equal(calls.length, 9)
})
test('invalid backend context blocks without mock substitution', async () => {
 for (const [state, valid] of [[auth, false], [{ ...auth, user: { id: 'demo-speaker' } }, true], [{ ...auth, hasBackendSession: false }, true]]) {
  const source = createPublicProgramSource({}, state, valid)
  assert.equal(source.mode, 'unavailable')
  await assert.rejects(source.load(), /valid backend identity/)
 }
})
test('Bill Nye identity is unchanged and matching title invents no speaker relationship', () => {
 assert.equal(speakerData.speaker.name, 'Bill Nye')
 assert.equal(speakerData.speaker.id, 'speaker-bill-nye')
 assert.equal(adaptProgram(tracks, sessions, [occurrence]).sessions[0].speaker, null)
})
test('accessible loading/error/retry wiring and component source boundary', () => {
 const ui = readFileSync(new URL('../src/components/PublicProgram.jsx', import.meta.url), 'utf8')
 assert.match(ui, /role="status"/)
 assert.match(ui, /role="alert"/)
 assert.match(ui, /onClick=\{resource.retry\}/)
 for (const name of ['PublicProgram', 'TrackGrid', 'FeaturedSessions', 'ScheduleByDay']) {
  assert.doesNotMatch(readFileSync(new URL(`../src/components/${name}.jsx`, import.meta.url), 'utf8'), /fetch\(|eventRepository/)
 }
})
