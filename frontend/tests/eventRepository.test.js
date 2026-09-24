import test from 'node:test'
import assert from 'node:assert/strict'
import { eventRepository } from '../src/services/eventRepository.js'

const resources = [
  ['getTracks', 'getTrack', '/api/tracks', { id: 'track', name: 'Science', description: null }],
  ['getSessions', 'getSession', '/api/sessions', { id: 'session', title: 'Title', description: null, trackId: 'track', mandatory: false }],
  ['getSessionOccurrences', 'getSessionOccurrence', '/api/session-occurrences', { id: 'occurrence', sessionId: 'session', startsAt: '2026-09-16T12:00:00Z', endsAt: '2026-09-16T13:00:00Z' }],
]

for (const [list, detail, path, record] of resources) {
  test(`${path}: authenticated list/detail GETs preserve response records`, async t => {
    const descriptors = ['window', 'sessionStorage'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)])
    globalThis.window = { location: { origin: 'https://steamcon.test' } }
    globalThis.sessionStorage = { getItem: () => JSON.stringify({ source: 'backend', sessionId: 'session-id', user: { id: 'user-id' }, expiresAt: new Date(Date.now() + 60000).toISOString() }) }
    t.after(() => {
      for (const [name, descriptor] of descriptors) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor)
        else delete globalThis[name]
      }
    })
    const calls = []
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      calls.push(url)
      assert.equal(options.method, 'GET')
      assert.equal(options.body, undefined)
      assert.equal(options.headers.get('X-Session-Id'), 'session-id')
      return new Response(JSON.stringify(url === path ? [record] : record))
    })
    assert.deepEqual(await eventRepository[list](), [record])
    assert.deepEqual(await eventRepository[detail]('id /?'), record)
    assert.deepEqual(calls, [path, `${path}/id%20%2F%3F`])
    for (const id of [undefined, null, '', '   ']) await assert.rejects(() => eventRepository[detail](id), /ID is required/)
    assert.equal(calls.length, 2)
    globalThis.fetch.mock.mockImplementation(async () => new Response('', { status: 404 }))
    await assert.rejects(() => eventRepository[detail]('missing'), /Event request failed \(404\)/)
    await assert.rejects(() => eventRepository[list](), /404/)
    globalThis.fetch.mock.mockImplementation(async () => { throw new Error('offline') })
    await assert.rejects(() => eventRepository[list](), /offline/)
    globalThis.fetch.mock.mockImplementation(async () => new Response('invalid JSON'))
    await assert.rejects(() => eventRepository[detail]('id'), SyntaxError)
  })
}
