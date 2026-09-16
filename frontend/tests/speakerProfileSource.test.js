import test from 'node:test'
import assert from 'node:assert/strict'
import { createSpeakerProfileSource, getSpeakerProfileSource, validateProfile, profileLimits } from '../src/services/speakerProfileSource.js'
import { speakers } from '../src/mocks/speakers.js'
import { proposals } from '../src/mocks/proposals.js'
import { createSpeakerProposalSource } from '../src/services/speakerProposalSource.js'
import { createSpeakerNotificationSource } from '../src/services/speakerNotificationSource.js'
import { createSpeakerForumSource } from '../src/services/speakerForumSource.js'
const demo = { id: 'demo-SPEAKER', role: 'SPEAKER' }
const backend = { id: '11111111-1111-4111-8111-111111111111', role: 'SPEAKER' }
const preview = () => createSpeakerProfileSource({ ...demo }, 'demo')
const input = { name: '  Preview Speaker  ', role: '  Science educator  ', organization: '  Example organization  ', bio: '  Professional experience summary.  ', trackId: 'engineering' }
const forbidden = new Proxy({}, { get() { throw new Error('Live repository accessed') } })
test('preview profile and track reads never fetch', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Fetch called') })
  const source = preview()
  assert.deepEqual(await source.getProfile(), speakers[0])
  assert.equal((await source.getTracks()).length, 5)
  assert.equal(fetch.mock.callCount(), 0)
})
test('preview updates never fetch', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Fetch called') })
  await preview().updateProfile(input)
  assert.equal(fetch.mock.callCount(), 0)
})
test('preview updates trim only supported text and derive presentation fields', async () => {
  const updated = await preview().updateProfile({ ...input, email: 'ignored', status: 'APPROVED' })
  for (const field of ['name', 'role', 'organization', 'bio']) assert.equal(updated[field], input[field].trim())
  assert.equal(updated.firstName, 'Preview')
  assert.deepEqual(updated.trackIds, ['engineering'])
  assert.equal(updated.email, undefined)
  assert.equal(updated.status, undefined)
  assert.equal(input.name, '  Preview Speaker  ')
})
test('cancel discards an edited copy without changing the source', async () => {
  const source = preview(), before = await source.getProfile()
  const draft = await source.getProfile()
  draft.name = 'Canceled edit'
  draft.trackIds.push('art')
  assert.deepEqual(await source.getProfile(), before)
})
for (const field of ['name', 'role', 'organization', 'bio']) test(`blank required ${field} rejected with state intact`, async () => {
  const source = preview(), before = await source.getProfile()
  assert.ok(validateProfile({ ...input, [field]: '   ' })[field])
  await assert.rejects(() => source.updateProfile({ ...input, [field]: '   ' }), /required/)
  assert.deepEqual(await source.getProfile(), before)
})
test('missing and unknown tracks are rejected', async () => {
  for (const trackId of [undefined, '', 'missing', backend.id]) {
    assert.ok(validateProfile({ ...input, trackId }).trackId)
    await assert.rejects(() => preview().updateProfile({ ...input, trackId }), /track/)
  }
})
test('length limits reject without truncation or mutation', async () => {
  for (const [field, limit] of Object.entries(profileLimits)) {
    const source = preview(), before = await source.getProfile()
    const values = { ...input, [field]: 'x'.repeat(limit + 1) }
    await assert.rejects(() => source.updateProfile(values), /characters/)
    assert.equal(values[field].length, limit + 1)
    assert.deepEqual(await source.getProfile(), before)
    assert.equal(validateProfile({ ...input, [field]: 'x'.repeat(limit) })[field], undefined)
  }
})
test('successful update changes the dashboard-facing profile', async () => {
  const source = preview(), saved = await source.updateProfile(input)
  assert.deepEqual(await source.getProfile(), saved)
  saved.trackIds.push('art')
  assert.deepEqual((await source.getProfile()).trackIds, ['engineering'])
})
test('profile updates do not mutate Bill Nye or public directory fixtures', async () => {
  const before = structuredClone(speakers)
  await preview().updateProfile(input)
  assert.deepEqual(speakers, before)
})
test('profile update preserves proposal fixtures and locally submitted proposals', async () => {
  const before = structuredClone(proposals)
  const source = createSpeakerProposalSource(forbidden, forbidden, demo, 'demo')
  await source.getTracks()
  await source.createProposal({ title: 'Local idea', description: 'Sample', trackId: 'science' })
  const local = source.getPreviewProposals()
  await preview().updateProfile(input)
  assert.deepEqual(proposals, before)
  assert.deepEqual(source.getPreviewProposals(), local)
})
test('profile updates preserve notification read state and forum messages', async () => {
  const notifications = createSpeakerNotificationSource(forbidden, demo, 'demo')
  await notifications.markAsRead((await notifications.getNotifications())[0].id)
  const before = await notifications.getNotifications()
  const forums = createSpeakerForumSource(forbidden, demo, 'demo')
  const forum = (await forums.getForums())[0]
  await forums.createMessage(forum.id, { body: 'Local message' })
  const messages = await forums.getMessages(forum.id)
  await preview().updateProfile(input)
  assert.deepEqual(await notifications.getNotifications(), before)
  assert.deepEqual(await forums.getMessages(forum.id), messages)
})
test('separate preview source instances do not leak edits', async () => {
  const first = preview(), second = preview()
  await first.updateProfile(input)
  assert.deepEqual(await second.getProfile(), speakers[0])
})
test('current login source retains edits across portal navigation and resets on new login', async () => {
  const user = { ...demo }, source = getSpeakerProfileSource(user, 'demo')
  await source.updateProfile(input)
  assert.equal(getSpeakerProfileSource(user, 'demo'), source)
  assert.equal((await getSpeakerProfileSource(user, 'demo').getProfile()).name, input.name.trim())
  assert.deepEqual(await getSpeakerProfileSource({ ...user }, 'demo').getProfile(), speakers[0])
})
test('missing backend identity prevents live reads and updates', async () => {
  for (const user of [null, {}, { ...backend, id: 'demo-SPEAKER' }]) {
    const source = createSpeakerProfileSource(user, 'backend', true)
    assert.equal(source.identityAvailable, false)
    await assert.rejects(() => source.getProfile(), /UUID/)
    await assert.rejects(() => source.updateProfile(input), /UUID/)
  }
})
test('missing backend session or authentication source prevents live updates', async () => {
  for (const [authSource, session] of [['backend', false], ['backend', undefined], [null, true]]) {
    const source = createSpeakerProfileSource(backend, authSource, session)
    assert.equal(source.identityAvailable, false)
    await assert.rejects(() => source.updateProfile(input), /active session/)
  }
})
test('Speaker role is required even with backend UUID and session', async () => {
  for (const role of [null, 'ATTENDEE', 'ADMIN']) {
    await assert.rejects(() => createSpeakerProfileSource({ ...backend, role }, 'backend', true).updateProfile(input), /Speaker role/)
  }
})
test('live editing remains unavailable without a verified contract and never fetches', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Fetch called') })
  const source = createSpeakerProfileSource(backend, 'backend', true)
  assert.equal(source.identityAvailable, true)
  assert.equal(source.available, false)
  await assert.rejects(() => source.getProfile(), /awaits backend support/)
  await assert.rejects(() => source.getTracks(), /awaits backend support/)
  await assert.rejects(() => source.updateProfile(input), /awaits backend support/)
  assert.equal(input.name, '  Preview Speaker  ')
  assert.equal(fetch.mock.callCount(), 0)
})

const nameInput = (profile, name) => ({ ...profile, name, trackId: profile.trackIds[0] })
test('consecutive name saves restore Bill Nye and retain all other profile fields', async () => {
  const user = { ...demo }, source = getSpeakerProfileSource(user, 'demo')
  const initial = await source.getProfile()
  assert.equal(initial.name, 'Bill Nye')
  const first = await source.updateProfile(nameInput(initial, 'Bill'))
  assert.equal(first.name, 'Bill')
  assert.equal((await source.getProfile()).name, 'Bill')
  const reopened = getSpeakerProfileSource(user, 'demo')
  assert.equal(reopened, source)
  const editorProfile = await reopened.getProfile()
  assert.equal(editorProfile.name, 'Bill')
  const second = await reopened.updateProfile(nameInput(editorProfile, 'Bill Nye'))
  assert.equal(second.name, 'Bill Nye')
  assert.deepEqual(await source.getProfile(), second)
  assert.deepEqual(await getSpeakerProfileSource(user, 'demo').getProfile(), initial)
  for (const saved of [first, second]) {
    for (const field of ['id', 'firstName', 'role', 'organization', 'bio', 'trackIds']) assert.deepEqual(saved[field], initial[field])
  }
  assert.deepEqual(await getSpeakerProfileSource({ ...user }, 'demo').getProfile(), initial)
  assert.deepEqual(speakers[0], initial)
})
test('cancel after saved Bill discards Bill Nye draft and leaves revision unchanged', async () => {
  const source = preview()
  await source.updateProfile(nameInput(await source.getProfile(), 'Bill'))
  const revision = source.getRevision()
  const draft = await source.getProfile()
  draft.name = 'Bill Nye'
  assert.equal((await source.getProfile()).name, 'Bill')
  assert.equal(source.getRevision(), revision)
  assert.equal(speakers[0].name, 'Bill Nye')
})
test('copies from consecutive saves and reads cannot mutate the latest internal profile', async () => {
  const source = preview(), initial = await source.getProfile()
  const first = await source.updateProfile(nameInput(initial, 'Bill'))
  const second = await source.updateProfile(nameInput(first, 'Bill Nye'))
  for (const copy of [initial, first, second, await source.getProfile()]) {
    copy.name = 'Mutated copy'
    copy.trackIds.push('art')
    copy.bio = 'Mutated biography'
  }
  assert.deepEqual(await source.getProfile(), speakers[0])
})
test('dashboard subscribers observe a new revision and the newest profile on every save', async () => {
  const source = preview(), revisions = [], reads = []
  const unsubscribe = source.subscribe(() => {
    revisions.push(source.getRevision())
    reads.push(source.getProfile())
  })
  assert.equal(source.getRevision(), 0)
  const initial = await source.getProfile()
  await source.updateProfile(nameInput(initial, 'Bill'))
  await source.updateProfile(nameInput(initial, 'Bill Nye'))
  assert.deepEqual(revisions, [1, 2])
  assert.deepEqual((await Promise.all(reads)).map(profile => profile.name), ['Bill', 'Bill Nye'])
  unsubscribe()
  await source.updateProfile(nameInput(initial, 'Newest name'))
  assert.deepEqual(revisions, [1, 2])
  assert.equal(source.getRevision(), 3)
})
test('failed validation and canceled drafts do not notify dashboard subscribers', async () => {
  const source = preview(), notifications = []
  const unsubscribe = source.subscribe(() => notifications.push(source.getRevision()))
  const initial = await source.getProfile()
  await assert.rejects(() => source.updateProfile(nameInput(initial, '   ')), /required/)
  const draft = await source.getProfile()
  draft.name = 'Canceled'
  assert.deepEqual(notifications, [])
  assert.equal(source.getRevision(), 0)
  unsubscribe()
})
test('source subscriptions and revisions remain isolated between preview logins', async () => {
  const first = preview(), second = preview(), observed = []
  const unsubscribe = second.subscribe(() => observed.push(second.getRevision()))
  await first.updateProfile(nameInput(await first.getProfile(), 'Bill'))
  assert.equal(first.getRevision(), 1)
  assert.equal(second.getRevision(), 0)
  assert.deepEqual(observed, [])
  assert.equal((await second.getProfile()).name, 'Bill Nye')
  unsubscribe()
})
