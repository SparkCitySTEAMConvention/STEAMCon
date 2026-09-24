import test from 'node:test'
import assert from 'node:assert/strict'
import { calendarRepository } from '../src/services/calendarRepository.js'
import { createSpeakerCalendarSource } from '../src/services/speakerCalendarSource.js'

const user = { id: '11111111-1111-4111-8111-111111111111', role: 'SPEAKER' }
const entries = [
  { sourceId: 'hotel-id', entryType: 'HOTEL', startsAt: '2027-04-06T20:00:00Z', endsAt: '2027-04-08T14:00:00Z' },
  { sourceId: 'occurrence-id', entryType: 'SESSION', startsAt: '2027-04-06T14:00:00Z', endsAt: '2027-04-06T15:00:00Z' },
]

test('calendar uses current authenticated session without a caller identity or mutations', async t => {
  for (const [name, value] of Object.entries({
    window: { location: { origin: 'https://steamcon.test' } },
    sessionStorage: { getItem: () => JSON.stringify({ source: 'backend', sessionId: 'session-id', user, expiresAt: new Date(Date.now() + 60000).toISOString() }) },
  })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, value })
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name])
  }
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/calendar/me')
    assert.equal(options.method, 'GET')
    assert.equal(options.body, undefined)
    assert.equal(options.headers.get('X-Session-Id'), 'session-id')
    return new Response(JSON.stringify(entries))
  })
  assert.deepEqual(await calendarRepository.getMyCalendar('attacker'), entries)
  for (const status of [401, 403, 500]) {
    fetch.mock.mockImplementation(async () => new Response('', { status }))
    await assert.rejects(() => calendarRepository.getMyCalendar(), new RegExp(`${status}`))
  }
  fetch.mock.mockImplementation(async () => { throw new Error('Offline') })
  await assert.rejects(() => calendarRepository.getMyCalendar(), /Offline/)
  fetch.mock.mockImplementation(async () => new Response('invalid JSON'))
  await assert.rejects(() => calendarRepository.getMyCalendar(), SyntaxError)
  for (const malformed of [{}, [null], [{ sourceId: 'id' }]]) {
    fetch.mock.mockImplementation(async () => new Response(JSON.stringify(malformed)))
    await assert.rejects(() => calendarRepository.getMyCalendar(), /Invalid calendar response/)
  }
})

test('demo and invalid identities never contact calendar; live sorts without inventing speaking assignments', async () => {
  let calls = 0
  const repository = { async getMyCalendar() { calls++; return entries } }
  const demo = createSpeakerCalendarSource(repository, { role: 'SPEAKER', id: 'demo' }, 'demo')
  assert.deepEqual(await demo.load(), [])
  for (const [identity, auth, session] of [[user, 'backend', false], [null, 'backend', true], [{ ...user, id: 'demo' }, 'backend', true], [{ ...user, role: 'ATTENDEE' }, 'backend', true], [user, null, true]]) {
    await assert.rejects(() => createSpeakerCalendarSource(repository, identity, auth, session).load())
  }
  assert.equal(calls, 0)
  const result = await createSpeakerCalendarSource(repository, user, 'backend', true).load()
  assert.deepEqual(result, [entries[1], entries[0]])
  assert.equal(result[0].title, undefined)
  assert.equal(result[0].proposalId, undefined)
  assert.equal(entries[0].entryType, 'HOTEL')
  assert.deepEqual(await createSpeakerCalendarSource({ getMyCalendar: async () => [] }, user, 'backend', true).load(), [])
  await assert.rejects(() => createSpeakerCalendarSource({ getMyCalendar: async () => { throw new Error('Offline') } }, user, 'backend', true).load(), /Offline/)
})
