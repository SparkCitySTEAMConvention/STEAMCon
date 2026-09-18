import test from 'node:test'
import assert from 'node:assert/strict'
import { createAttendeeForumSource } from '../src/services/attendeeForumSource.js'

const user = { id: '11111111-1111-4111-8111-111111111111', role: 'ATTENDEE' }

test('demo browsing and posting never touch the live adapter and remain isolated', async () => {
  const forbidden = new Proxy({}, { get() { throw new Error('Live adapter accessed by demo') } })
  const source = createAttendeeForumSource(forbidden, { id: 'demo-ATTENDEE', role: 'ATTENDEE' }, 'demo')
  assert.equal((await source.getForums()).length, 3)
  for (const scope of ['TRACK', 'ADMIN', 'CONCIERGE']) {
    const forums = await source.getForums(scope)
    assert.equal(forums.length, 1)
    assert.equal(forums[0].scope, scope)
  }
  const forum = (await source.getForums('TRACK'))[0]
  assert.deepEqual(await source.getMessages(forum.id), [])
  await assert.rejects(() => source.createMessage(forum.id, { body: '   ' }))
  const message = await source.createMessage(forum.id, { body: '  Local example  ' })
  assert.equal(message.body, 'Local example')
  assert.equal(message.status, 'ACTIVE')
  assert.deepEqual(await source.getMessages(forum.id), [message])
  assert.deepEqual(await source.getMessages('demo-forum-admin'), [])
  const next = createAttendeeForumSource(forbidden, { id: 'demo-ATTENDEE', role: 'ATTENDEE' }, 'demo')
  assert.deepEqual(await next.getMessages(forum.id), [])
})

test('incomplete identity, role, or session source blocks every live operation', async () => {
  const forbidden = new Proxy({}, { get() { throw new Error('Adapter should not be accessed') } })
  for (const [identity, authSource] of [[null, null], [user, null], [{ ...user, role: null }, 'backend'], [{ ...user, role: 'SPEAKER' }, 'backend'], [{ ...user, id: 'demo-ATTENDEE' }, 'backend'], [{ ...user, id: '' }, 'backend']]) {
    const source = createAttendeeForumSource(forbidden, identity, authSource)
    assert.equal(source.available, false)
    await assert.rejects(() => source.getForums(), /verified attendee/)
    await assert.rejects(() => source.getMessages('forum'), /verified attendee/)
    await assert.rejects(() => source.createMessage('forum', { body: 'Hello' }), /verified attendee/)
  }
})

test('backend dispatch uses exact scopes, authenticated author and READ/POST contracts', async () => {
  const calls = []
  const repository = {
    async getForums(...args) { calls.push(['forums', ...args]); return [] },
    async getMessages(...args) { calls.push(['messages', ...args]); return [] },
    async createMessage(...args) { calls.push(['post', ...args]); return { id: 'saved' } },
  }
  const source = createAttendeeForumSource(repository, user, 'backend')
  for (const scope of [undefined, 'TRACK', 'ADMIN', 'CONCIERGE']) await source.getForums(scope)
  await source.getMessages('forum-id')
  await source.createMessage('forum-id', { body: '  Hello  ', authorId: 'spoofed', role: 'ADMIN', permission: 'MODERATE' })
  assert.deepEqual(calls, [
    ['forums', undefined], ['forums', 'TRACK'], ['forums', 'ADMIN'], ['forums', 'CONCIERGE'],
    ['messages', 'forum-id', 'ATTENDEE', 'READ'],
    ['post', 'forum-id', { authorId: user.id, body: 'Hello', role: 'ATTENDEE', permission: 'POST' }],
  ])
})

test('backend failures propagate for page retry and draft preservation', async () => {
  const fail = async () => { throw new Error('Unavailable') }
  const source = createAttendeeForumSource({ getForums: fail, getMessages: fail, createMessage: fail }, user, 'backend')
  await assert.rejects(() => source.getForums(), /Unavailable/)
  await assert.rejects(() => source.getMessages('forum'), /Unavailable/)
  await assert.rejects(() => source.createMessage('forum', { body: 'Draft' }), /Unavailable/)
})
