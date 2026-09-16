import test from 'node:test'
import assert from 'node:assert/strict'
import { createSpeakerNotificationSource, getSpeakerNotificationSource } from '../src/services/speakerNotificationSource.js'
const user = { id: '11111111-1111-4111-8111-111111111111', role: 'SPEAKER' }
const demo = { id: 'demo-SPEAKER', role: 'SPEAKER' }
const forbidden = new Proxy({}, { get() { throw new Error('Adapter accessed') } })
const preview = () => createSpeakerNotificationSource(forbidden, demo, 'demo')
test('preview reads never fetch and include read/unread', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Fetch called') })
  const items = await preview().getNotifications()
  assert.ok(items.some(item => item.read))
  assert.ok(items.some(item => !item.read))
  assert.equal(fetch.mock.callCount(), 0)
})
test('preview mark never fetches and updates only selected notification', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Fetch called') })
  const source = preview(), before = await source.getNotifications()
  const updated = await source.markAsRead(before[0].id)
  assert.deepEqual(updated, { ...before[0], read: true })
  assert.deepEqual(await source.getNotifications(), before.map((item, index) => index ? item : updated))
  assert.equal(fetch.mock.callCount(), 0)
})
for (const id of [undefined, null, '', '   ']) test(`invalid ID ${String(id)} rejected before dispatch`, async () => {
  await assert.rejects(() => preview().markAsRead(id), /notification ID/)
  await assert.rejects(() => createSpeakerNotificationSource(forbidden, user, 'backend', true).markAsRead(id), /notification ID/)
})
test('failed preview update preserves all state', async () => {
  const source = preview(), before = await source.getNotifications()
  await assert.rejects(() => source.markAsRead('missing'), /not found/)
  assert.deepEqual(await source.getNotifications(), before)
})
test('separate instances and returned copies do not leak state', async () => {
  const first = preview(), second = preview(), before = await second.getNotifications()
  const copy = await first.getNotifications()
  copy[1].read = true
  await first.markAsRead(copy[0].id)
  assert.deepEqual(await second.getNotifications(), before)
  assert.equal((await first.getNotifications())[1].read, false)
})
test('navigation retains preview state for current login only', async () => {
  const identity = { ...demo }, source = getSpeakerNotificationSource(forbidden, identity, 'demo')
  await source.markAsRead((await source.getNotifications())[0].id)
  assert.equal(getSpeakerNotificationSource(forbidden, identity, 'demo'), source)
  assert.equal((await getSpeakerNotificationSource(forbidden, { ...identity }, 'demo').getNotifications())[0].read, false)
})
test('live dispatch preserves exact user/notification IDs and backend JSON', async () => {
  const calls = [], list = [], updated = { id: 'exact-id', read: true }
  const source = createSpeakerNotificationSource({
    async getNotifications(id) { calls.push(['get', id]); return list },
    async markAsRead(id) { calls.push(['read', id]); return updated },
  }, user, 'backend', true)
  assert.equal(await source.getNotifications(), list)
  assert.equal(await source.markAsRead('exact-id'), updated)
  assert.deepEqual(calls, [['get', user.id], ['read', 'exact-id']])
})
test('missing backend identity prevents every request', async () => {
  for (const identity of [null, {}, { ...user, id: '' }, { ...user, id: 'demo-SPEAKER' }]) {
    const source = createSpeakerNotificationSource(forbidden, identity, 'backend', true)
    assert.equal(source.available, false)
    await assert.rejects(() => source.getNotifications())
    await assert.rejects(() => source.markAsRead('id'))
  }
})
test('missing backend source/session prevents every request', async () => {
  for (const [authSource, session] of [[null, true], ['other', true], ['backend', false], ['backend', undefined]]) {
    const source = createSpeakerNotificationSource(forbidden, user, authSource, session)
    assert.equal(source.available, false)
    await assert.rejects(() => source.getNotifications())
    await assert.rejects(() => source.markAsRead('id'))
  }
})
test('repository failures propagate and allow retry', async () => {
  let failing = true
  const saved = { id: 'id', read: true }
  const source = createSpeakerNotificationSource({
    async getNotifications() { if (failing) throw new Error('Unavailable'); return [] },
    async markAsRead() { if (failing) throw new Error('Unavailable'); return saved },
  }, user, 'backend', true)
  await assert.rejects(() => source.getNotifications(), /Unavailable/)
  await assert.rejects(() => source.markAsRead('id'), /Unavailable/)
  failing = false
  assert.deepEqual(await source.getNotifications(), [])
  assert.equal(await source.markAsRead('id'), saved)
})
