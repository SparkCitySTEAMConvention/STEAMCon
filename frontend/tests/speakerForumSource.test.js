import test from 'node:test'
import assert from 'node:assert/strict'
import { createSpeakerForumSource } from '../src/services/speakerForumSource.js'

const user = { id: '11111111-1111-4111-8111-111111111111', role: 'SPEAKER' }

test('demo browsing and posting never touch the live adapter and remain isolated', async () => {
  const forbidden = new Proxy({}, { get() { throw new Error('Live adapter accessed by demo') } })
  const source = createSpeakerForumSource(forbidden, { id: 'demo-SPEAKER', role: 'SPEAKER' }, 'demo')
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
  const next = createSpeakerForumSource(forbidden, { id: 'demo-SPEAKER', role: 'SPEAKER' }, 'demo')
  assert.deepEqual(await next.getMessages(forum.id), [])
})

test('incomplete identity, role, or session source blocks every live operation', async () => {
  const forbidden = new Proxy({}, { get() { throw new Error('Adapter should not be accessed') } })
  for (const [identity, authSource] of [[null, null], [user, null], [{ ...user, role: null }, 'backend'], [{ ...user, role: 'ATTENDEE' }, 'backend'], [{ ...user, id: 'demo-SPEAKER' }, 'backend'], [{ ...user, id: '' }, 'backend']]) {
    const source = createSpeakerForumSource(forbidden, identity, authSource)
    assert.equal(source.available, false)
    await assert.rejects(() => source.getForums(), /verified speaker/)
    await assert.rejects(() => source.getMessages('forum'), /verified speaker/)
    await assert.rejects(() => source.createMessage('forum', { body: 'Hello' }), /verified speaker/)
  }
})

test('backend dispatch uses exact scopes, session-derived identity and body-only contracts', async () => {
  const calls = []
  const repository = {
    async getForums(...args) { calls.push(['forums', ...args]); return [] },
    async getMessages(...args) { calls.push(['messages', ...args]); return [] },
    async createMessage(...args) { calls.push(['post', ...args]); return { id: 'saved' } },
  }
  const source = createSpeakerForumSource(repository, user, 'backend', true)
  for (const scope of [undefined, 'TRACK', 'ADMIN', 'CONCIERGE']) await source.getForums(scope)
  await source.getMessages('forum-id')
  await source.createMessage('forum-id', { body: '  Hello  ', authorId: 'spoofed', role: 'ADMIN', permission: 'MODERATE' })
  assert.deepEqual(calls, [
    ['forums', undefined], ['forums', 'TRACK'], ['forums', 'ADMIN'], ['forums', 'CONCIERGE'],
    ['messages', 'forum-id'],
    ['post', 'forum-id', { body: 'Hello' }],
  ])
})

test('backend failures propagate for page retry and draft preservation', async () => {
  const fail = async () => { throw new Error('Unavailable') }
  const source = createSpeakerForumSource({ getForums: fail, getMessages: fail, createMessage: fail }, user, 'backend', true)
  await assert.rejects(() => source.getForums(), /Unavailable/)
  await assert.rejects(() => source.getMessages('forum'), /Unavailable/)
  await assert.rejects(() => source.createMessage('forum', { body: 'Draft' }), /Unavailable/)
})

test('missing backend session blocks all live forum requests even with a speaker identity', async () => {
  const forbidden = new Proxy({}, { get() { throw new Error('Repository accessed') } })
  for (const session of [false, undefined, null]) {
    const source = createSpeakerForumSource(forbidden, user, 'backend', session)
    assert.equal(source.available, false)
    await assert.rejects(() => source.getForums())
    await assert.rejects(() => source.getMessages('id'))
    await assert.rejects(() => source.createMessage('id', { body: 'Hello' }))
  }
})
