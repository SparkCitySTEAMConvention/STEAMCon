import test from 'node:test'
import assert from 'node:assert/strict'
import { notificationRepository as notifications } from '../src/services/notificationRepository.js'
import { forumRepository as forums } from '../src/services/forumRepository.js'
import { speakerRepository as speakers } from '../src/services/speakerRepository.js'

const userId = '11111111-1111-4111-8111-111111111111'
const forumId = '22222222-2222-4222-8222-222222222222'
const trackId = '33333333-3333-4333-8333-333333333333'
const message = { authorId: userId, body: '  Hello forum  ', role: 'SPEAKER', permission: 'POST' }
const proposal = { speakerId: userId, title: '  Title  ', description: '  Description  ', trackId }

function setup(t, fetch) {
  t.mock.method(globalThis, 'fetch', fetch)
  for (const [name, value] of Object.entries({
    window: { location: { origin: 'https://steamcon.test' } },
    sessionStorage: { getItem: () => JSON.stringify({
      source: 'backend', sessionId: forumId, user: { id: userId },
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    }) },
  })) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
    t.after(() => {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
      else delete globalThis[name]
    })
  }
}

const cases = [
  ['notification GET', () => notifications.getNotifications('user &/?'), '/api/notifications/me?userId=user+%26%2F%3F', 'GET', undefined, [{ id: userId, read: false }]],
  ['notification POST', () => notifications.markAsRead('id /?'), '/api/notifications/id%20%2F%3F/read', 'POST', undefined, { id: userId, read: true }],
  ['all forums', () => forums.getForums(), '/api/forums', 'GET', undefined, [{ id: forumId, scope: 'TRACK' }]],
  ['scoped forums', () => forums.getForums('TRACK &/?'), '/api/forums?scope=TRACK+%26%2F%3F', 'GET', undefined, []],
  ['forum messages', () => forums.getMessages('id /?', 'role &/?', 'permission &/?'), '/api/forums/id%20%2F%3F/messages?role=role+%26%2F%3F&permission=permission+%26%2F%3F', 'GET', undefined, [{ body: 'Hello' }]],
  ['create message', () => forums.createMessage(forumId, { ...message, status: 'ACTIVE', extra: true }), `/api/forums/${forumId}/messages`, 'POST', { ...message, body: 'Hello forum' }, { id: userId, body: 'Hello forum' }],
  ['create proposal', () => speakers.createProposal({ ...proposal, abstract: 'exclude', format: 'Panel', durationMinutes: 60, status: 'Approved' }), '/api/proposals', 'POST', { title: 'Title', description: 'Description', trackId }, { id: forumId, status: 'SUBMITTED' }],
]

for (const [name, call, url, method, body, payload] of cases) {
  test(`${name}: exact request and parsed backend JSON`, async t => {
    setup(t, async (actualUrl, options) => {
      assert.equal(actualUrl, url)
      assert.equal(options.method, method)
      assert.equal(options.headers.get('X-Session-Id'), forumId)
      if (body) {
        assert.equal(options.headers.get('Content-Type'), 'application/json')
        assert.deepEqual(JSON.parse(options.body), body)
      } else assert.equal(options.body, undefined)
      return new Response(JSON.stringify(payload), { status: method === 'POST' && body ? 201 : 200 })
    })
    assert.deepEqual(await call(), payload)
    assert.equal(globalThis.fetch.mock.callCount(), 1)
  })
  test(`${name}: useful HTTP error and propagated transport/JSON errors`, async t => {
    setup(t, async () => new Response('Unavailable', { status: 503 }))
    await assert.rejects(call, /(?:Notification request|Forum request|Proposal submission) failed \(503\)/)
    globalThis.fetch.mock.mockImplementation(async () => { throw new Error('offline') })
    await assert.rejects(call, /offline/)
    globalThis.fetch.mock.mockImplementation(async () => new Response('invalid JSON'))
    await assert.rejects(call, SyntaxError)
  })
}

test('notification missing or blank IDs prevent fetch', async t => {
  setup(t, async () => { throw new Error('fetch must not run') })
  for (const value of [undefined, null, '', '   ']) {
    await assert.rejects(() => notifications.getNotifications(value), /user ID is required/)
    await assert.rejects(() => notifications.markAsRead(value), /notification ID is required/)
  }
  assert.equal(globalThis.fetch.mock.callCount(), 0)
})

test('forum required IDs, role, permission and nonblank body prevent fetch', async t => {
  setup(t, async () => { throw new Error('fetch must not run') })
  for (const value of [undefined, null, '', '   ']) {
    for (let index = 0; index < 3; index++) {
      const args = [forumId, 'SPEAKER', 'READ']
      args[index] = value
      await assert.rejects(() => forums.getMessages(...args), /is required/)
    }
    await assert.rejects(() => forums.createMessage(value, message), /Forum ID is required/)
    for (const field of ['authorId', 'body', 'role', 'permission']) {
      await assert.rejects(() => forums.createMessage(forumId, { ...message, [field]: value }), /is required/)
    }
  }
  await assert.rejects(() => forums.createMessage(forumId), /is required/)
  assert.equal(globalThis.fetch.mock.callCount(), 0)
})

test('proposal missing IDs and blank title/description prevent fetch', async t => {
  setup(t, async () => { throw new Error('fetch must not run') })
  for (const value of [undefined, null, '', '   ']) {
    for (const field of ['trackId', 'title', 'description']) {
      await assert.rejects(() => speakers.createProposal({ ...proposal, [field]: value }), new RegExp(`${field} is required`))
    }
  }
  await assert.rejects(() => speakers.createProposal(), /title is required/)
  assert.equal(globalThis.fetch.mock.callCount(), 0)
})

test('API submission preserves Bill Nye dashboard, proposal lookup and in-memory edits', async t => {
  setup(t, async () => new Response(JSON.stringify({ id: forumId, status: 'SUBMITTED' }), { status: 201 }))
  const dashboard = await speakers.getDashboard()
  assert.equal(dashboard.speaker.name, 'Bill Nye')
  assert.equal((await speakers.getProposal('proposal-bill-nye')).id, 'proposal-bill-nye')
  const draft = await speakers.getProposal('proposal-timnit-gebru')
  const saved = await speakers.saveDraft(draft.id, { ...draft, title: ' Edited draft ', abstract: ' Edited abstract ' })
  assert.equal(saved.title, 'Edited draft')
  assert.equal(saved.abstract, 'Edited abstract')
  assert.equal(saved.status, 'Draft')
  assert.deepEqual(saved.speakerIds, draft.speakerIds)
  await speakers.createProposal(proposal)
  assert.deepEqual(await speakers.getDashboard(), dashboard)
  assert.equal((await speakers.getProposal(draft.id)).title, 'Edited draft')
  assert.equal(globalThis.fetch.mock.callCount(), 1)
})
