import test from 'node:test'
import assert from 'node:assert/strict'
import { speakerRepository as repo } from '../src/services/speakerRepository.js'
import { createSpeakerProposalSource, canManageLiveProposal } from '../src/services/speakerProposalSource.js'
import { adaptProposal } from '../src/services/speakerPresentation.js'
const id = '11111111-1111-4111-8111-111111111111'
const proposalId = '22222222-2222-4222-8222-222222222222'
const trackId = '33333333-3333-4333-8333-333333333333'
const user = { id, role: 'SPEAKER', displayName: 'Real Speaker' }
const record = { id: proposalId, title: 'Real proposal', description: 'Description', trackId, status: 'SUBMITTED' }
const live = (repository = repo, identity = user, session = true) => createSpeakerProposalSource(repository, {}, identity, 'backend', session)
function setup(t, implementation) {
  t.mock.method(globalThis, 'fetch', implementation)
  for (const [name, value] of Object.entries({ window: { location: { origin: 'https://steamcon.test' } }, sessionStorage: { getItem: () => JSON.stringify({ source: 'backend', sessionId: proposalId, user, expiresAt: new Date(Date.now() + 60000).toISOString() }) } })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, value })
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name])
  }
}
for (const [label, call, path, method, body] of [
  ['dashboard', () => repo.getSpeakerDashboard(id), '/api/speaker/dashboard', 'GET'],
  ['list', () => repo.getMyProposals(id), '/api/proposals/me', 'GET'],
  ['detail', () => repo.getProposal(proposalId, id), `/api/proposals/${proposalId}`, 'GET'],
  ['edit', () => repo.updateProposal(proposalId, id, { title: 'Updated', description: null, trackId, status: 'APPROVED', speakerId: proposalId, format: 'Panel' }), `/api/proposals/${proposalId}`, 'PATCH', { title: 'Updated', description: null, trackId }],
  ['withdraw', () => repo.withdrawProposal(proposalId, id), `/api/proposals/${proposalId}`, 'DELETE'],
]) test(`live ${label}: exact authenticated contract and unchanged JSON`, async t => {
  setup(t, async (url, options) => {
    assert.equal(url, `${path}?speakerId=${id}`)
    assert.equal(options.method, method)
    assert.equal(options.headers.get('X-Session-Id'), proposalId)
    assert.deepEqual(options.body && JSON.parse(options.body), body)
    return { ok: true, status: method === 'DELETE' ? 204 : 200, json() { assert.notEqual(method, 'DELETE'); return record } }
  })
  assert.deepEqual(await call(), method === 'DELETE' ? null : record)
  assert.equal(fetch.mock.callCount(), 1)
})
test('invalid UUIDs reject before fetch', async t => {
  setup(t, () => { throw new Error('Unexpected fetch') })
  await assert.rejects(() => repo.getSpeakerDashboard('bad'))
  await assert.rejects(() => repo.getMyProposals(null))
  await assert.rejects(() => repo.getProposal('bad', id))
  await assert.rejects(() => repo.getProposal(proposalId, undefined))
  await assert.rejects(() => repo.getProposal(proposalId, null))
  await assert.rejects(() => repo.updateProposal(proposalId, id, { trackId: 'bad' }))
  await assert.rejects(() => repo.withdrawProposal('bad', id))
  assert.equal(fetch.mock.callCount(), 0)
})
test('incomplete identities, wrong roles and absent sessions never dispatch', async t => {
  setup(t, () => { throw new Error('Unexpected fetch') })
  for (const source of [live(repo, null), live(repo, { ...user, id: 'bad' }), live(repo, { ...user, role: 'ATTENDEE' }), live(repo, user, false), createSpeakerProposalSource(repo, {}, user, null, true)]) {
    await assert.rejects(() => source.getDashboard()); await assert.rejects(() => source.getMyProposals())
    await assert.rejects(() => source.getProposal(proposalId)); await assert.rejects(() => source.saveDraft(proposalId, {}))
    await assert.rejects(() => source.withdrawProposal(proposalId, record.title))
  }
  assert.equal(fetch.mock.callCount(), 0)
})
test('caller identity cannot override backend user on any read or mutation', async () => {
  const calls = []
  const source = live({
    getSpeakerDashboard: async (...args) => { calls.push(args); return { proposals: [record], applications: [], feedback: [] } },
    getMyProposals: async (...args) => { calls.push(args); return [record] },
    getProposal: async (...args) => { calls.push(args); return record },
    updateProposal: async (...args) => { calls.push(args); return record },
    withdrawProposal: async (...args) => { calls.push(args); return null },
  })
  const dashboard = await source.getDashboard(proposalId)
  assert.equal(dashboard.speaker.name, user.displayName)
  assert.equal(dashboard.speaker.bio, undefined)
  await source.getMyProposals(proposalId); await source.getProposal(proposalId, proposalId)
  await source.saveDraft(proposalId, { title: 'Changed', abstract: 'Changed description', trackId, speakerId: proposalId, status: 'APPROVED', format: 'Panel' })
  await source.withdrawProposal(proposalId, record.title, proposalId)
  assert.deepEqual(calls[0], [id]); assert.deepEqual(calls[1], [id])
  assert.deepEqual(calls[2], [id])
  for (const args of calls.slice(3)) assert.equal(args[1], id)
  assert.deepEqual(calls.find(args => args.length === 3)[2], { title: 'Changed', description: 'Changed description', trackId })
})
test('demo dashboard and details retain Bill Nye fixtures with zero fetches', async t => {
  setup(t, () => { throw new Error('Unexpected fetch') })
  const source = createSpeakerProposalSource(repo, {}, { id: 'demo-SPEAKER', role: 'SPEAKER' }, 'demo')
  const dashboard = await source.getDashboard()
  assert.equal(dashboard.speaker.name, 'Bill Nye'); assert.equal(dashboard.proposals.length, 2)
  assert.equal((await source.getProposal(dashboard.proposals[0].id)).title, 'Science Changes Everything')
  assert.equal(fetch.mock.callCount(), 0)
})
test('HTTP and network failures propagate without fixture fallback', async t => {
  setup(t, async () => new Response('Unavailable', { status: 503 }))
  for (const call of [() => live().getDashboard(), () => live().getMyProposals(), () => live().getProposal(proposalId), () => repo.updateProposal(proposalId, id, {}), () => repo.withdrawProposal(proposalId, id)]) await assert.rejects(call, /503/)
  fetch.mock.mockImplementation(async () => { throw new Error('Offline') })
  await assert.rejects(() => live().getDashboard(), /Offline/)
})
test('presentation retains original data and does not invent programming', () => {
  const adapted = adaptProposal(record)
  assert.equal(adapted.backendRecord, record); assert.equal(adapted.abstract, record.description)
  assert.equal(adapted.status, 'Submitted'); assert.equal(record.status, 'SUBMITTED')
  for (const field of ['format', 'durationMinutes', 'room', 'scheduledAt', 'speakerIds', 'panelists']) assert.equal(adapted[field], undefined)
})
for (const status of ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'WITHDRAWN']) test(`${status} governs live edits and withdrawal`, async () => {
  let writes = 0
  const source = live({ getProposal: async () => ({ ...record, status }), updateProposal: async () => { writes++; return record }, withdrawProposal: async () => { writes++ } })
  const allowed = ['DRAFT', 'SUBMITTED'].includes(status)
  assert.equal(canManageLiveProposal({ status }), allowed)
  if (allowed) { await source.saveDraft(proposalId, { title: record.title, abstract: record.description, trackId }); await source.withdrawProposal(proposalId, record.title); assert.equal(writes, 2) }
  else { await assert.rejects(() => source.saveDraft(proposalId, {})); await assert.rejects(() => source.withdrawProposal(proposalId, record.title)); assert.equal(writes, 0) }
})
test('named withdrawal confirmation and failure preserve proposal for retry', async () => {
  let deletes = 0
  const source = live({ getProposal: async () => record, withdrawProposal: async () => { deletes++; if (deletes === 1) throw new Error('Retry withdrawal') } })
  await assert.rejects(() => source.withdrawProposal(proposalId, 'wrong'), /confirm/)
  assert.equal(deletes, 0)
  await assert.rejects(() => source.withdrawProposal(proposalId, record.title), /Retry/)
  assert.equal((await source.getProposal(proposalId)).title, record.title)
  await source.withdrawProposal(proposalId, record.title); assert.equal(deletes, 2)
})

test('live sources capture authenticated identity and reject invalid proposal routes', async () => {
  const identity = { ...user }
  const identities = []
  const repository = {
    async getSpeakerDashboard(value) { identities.push(value); return { proposals: [], applications: [], feedback: [] } },
    async getMyProposals(value) { identities.push(value); return [record] },
    async getProposal(proposal, value) { identities.push(value); return record },
    async updateProposal(proposal, value) { identities.push(value); return record },
    async withdrawProposal(proposal, value) { identities.push(value) },
  }
  const source = live(repository, identity)
  identity.id = proposalId
  await source.getDashboard()
  await source.getProposal(proposalId)
  await source.saveDraft(proposalId, { title: record.title, abstract: record.description, trackId })
  await source.withdrawProposal(proposalId, record.title)
  assert.ok(identities.every(value => value === id))
  const count = identities.length
  for (const value of [undefined, null, '', 'fixture-id', `${proposalId}?speakerId=attacker`]) {
    await assert.rejects(() => source.getProposal(value), /UUID/)
    await assert.rejects(() => source.saveDraft(value, {}), /UUID/)
    await assert.rejects(() => source.withdrawProposal(value, record.title), /UUID/)
  }
  assert.equal(identities.length, count)
})
test('live editing validates text and track without dispatching an invalid PATCH', async () => {
  let writes = 0
  const source = live({ getProposal: async () => record, updateProposal: async () => { writes++; return record } })
  const changes = { title: record.title, abstract: record.description, trackId }
  for (const invalid of [{ title: '  ' }, { abstract: ' ' }, { title: 'x'.repeat(201) }, { abstract: 'x'.repeat(2001) }, { trackId: 'science' }]) {
    await assert.rejects(() => source.saveDraft(proposalId, { ...changes, ...invalid }))
  }
  assert.equal(writes, 0)
  await source.saveDraft(proposalId, { ...changes, title: '  Trimmed title  ', abstract: '  Trimmed description  ' })
  assert.equal(writes, 1)
})
test('nullable PATCH fields are preserved and unsupported fields are stripped', async t => {
  setup(t, async (url, options) => {
    assert.equal(url, `/api/proposals/${proposalId}?speakerId=${id}`)
    assert.deepEqual(JSON.parse(options.body), { title: null, description: null, trackId: null })
    return new Response(JSON.stringify(record))
  })
  assert.deepEqual(await repo.updateProposal(proposalId, id, { title: null, description: null, trackId: null, speakerId: proposalId, status: 'APPROVED', schedule: 'invented' }), record)
})
test('unreadable live JSON propagates instead of using demo data', async t => {
  setup(t, async () => new Response('not JSON'))
  await assert.rejects(() => live().getDashboard(), SyntaxError)
  await assert.rejects(() => live().getMyProposals(), SyntaxError)
  await assert.rejects(() => live().getProposal(proposalId), SyntaxError)
})
test('missing and malformed statuses never grant lifecycle actions', () => {
  for (const status of [undefined, null, 1, {}, 'PENDING', 'UNKNOWN']) assert.equal(canManageLiveProposal({ status }), false)
})

test('live dashboard uses both authenticated reads and retains the original dashboard JSON', async t => {
  const dashboard = { speakerId: id, proposals: [], applications: [{ id: proposalId, status: 'SUBMITTED' }], feedback: [] }
  const paths = []
  setup(t, async (url, options) => {
    paths.push(url)
    assert.equal(options.method, 'GET')
    assert.equal(options.headers.get('X-Session-Id'), proposalId)
    return new Response(JSON.stringify(url.startsWith('/api/speaker/dashboard') ? dashboard : [record]))
  })
  const result = await live().getDashboard(proposalId)
  assert.deepEqual(paths.sort(), [`/api/proposals/me?speakerId=${id}`, `/api/speaker/dashboard?speakerId=${id}`])
  assert.deepEqual(result.backendRecord, dashboard)
  assert.equal(result.proposals[0].id, proposalId)
  assert.deepEqual(result.proposals[0].backendRecord, record)
  assert.deepEqual(result.applications, dashboard.applications)
})
