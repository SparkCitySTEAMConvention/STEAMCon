import test from 'node:test'
import assert from 'node:assert/strict'
import { createSpeakerProposalSource, getSpeakerProposalSource, isPreviewProposalDeletable, deleteConfirmedProposal } from '../src/services/speakerProposalSource.js'
import { proposals } from '../src/mocks/proposals.js'
import { eventRepository } from '../src/services/eventRepository.js'
const user = { id: '11111111-1111-4111-8111-111111111111', role: 'SPEAKER' }
const demo = { id: 'demo-SPEAKER', role: 'SPEAKER' }
const track = { id: '22222222-2222-4222-8222-222222222222', name: 'Science' }
const forbidden = new Proxy({}, { get() { throw new Error('Adapter accessed') } })
const preview = () => createSpeakerProposalSource(forbidden, forbidden, demo, 'demo')
const values = { title: '  Title  ', description: '  Description  ', trackId: 'science' }
const live = (repository = forbidden, identity = user, session = true) => createSpeakerProposalSource(repository, { getTracks: async () => [track] }, identity, 'backend', session)
test('preview track loading never fetches or accesses adapters', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Fetch called') })
  assert.deepEqual((await preview().getTracks()).map(item => item.name), ['Science', 'Technology', 'Engineering', 'Art', 'Mathematics'])
  assert.equal(fetch.mock.callCount(), 0)
})
test('preview submission never fetches or accesses adapters', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Fetch called') })
  const source = preview(); await source.getTracks(); await source.createProposal(values)
  assert.equal(fetch.mock.callCount(), 0)
})
test('preview trims title and description', async () => {
  const source = preview(); await source.getTracks()
  const result = await source.createProposal(values)
  assert.equal(result.title, 'Title'); assert.equal(result.description, 'Description')
})
for (const [field, value] of [['title', '   '], ['description', '   '], ['trackId', '']]) test(`blank ${field} rejected before dispatch`, async () => {
  await assert.rejects(() => preview().createProposal({ ...values, [field]: value }))
  await assert.rejects(() => live().createProposal({ ...values, [field]: value }))
})
test('preview initial status is SUBMITTED and record stays stable', async () => {
  const source = preview(); await source.getTracks()
  const saved = await source.createProposal(values)
  assert.equal(saved.status, 'SUBMITTED')
  assert.deepEqual(source.getPreviewProposals(), [saved])
})
test('preview does not mutate Bill Nye proposals', async () => {
  const before = structuredClone(proposals), source = preview(); await source.getTracks(); await source.createProposal(values)
  assert.deepEqual(proposals, before)
})
test('separate preview instances and returned records are isolated', async () => {
  const first = preview(), second = preview(); await first.getTracks()
  const result = await first.createProposal(values); result.title = 'Mutated'
  assert.deepEqual(second.getPreviewProposals(), [])
  assert.equal(first.getPreviewProposals()[0].title, 'Title')
})
test('preview navigation persists and new login resets', async () => {
  const identity = { ...demo }, source = getSpeakerProposalSource(forbidden, forbidden, identity, 'demo')
  await source.getTracks(); await source.createProposal(values)
  assert.equal(getSpeakerProposalSource(forbidden, forbidden, identity, 'demo'), source)
  assert.deepEqual(getSpeakerProposalSource(forbidden, forbidden, { ...identity }, 'demo').getPreviewProposals(), [])
})
test('live tracks use existing event repository unchanged', async t => {
  const get = t.mock.method(eventRepository, 'getTracks', async () => [track])
  const source = createSpeakerProposalSource(forbidden, eventRepository, user, 'backend', true)
  assert.deepEqual(await source.getTracks(), [track]); assert.equal(get.mock.callCount(), 1)
})
test('live submission excludes caller ownership and status, returns unchanged JSON', async () => {
  let payload; const response = { id: 'backend-response', status: 'SUBMITTED' }
  const source = live({ createProposal: async input => { payload = input; return response } }); await source.getTracks()
  assert.equal(await source.createProposal({ ...values, trackId: track.id, speakerId: 'fake', status: 'APPROVED' }), response)
  assert.deepEqual(payload, { title: 'Title', description: 'Description', trackId: track.id })
})
test('missing backend speaker UUID prevents all requests', async () => {
  for (const identity of [null, {}, { ...user, id: 'demo-SPEAKER' }]) {
    const source = live(forbidden, identity); assert.equal(source.available, false)
    await assert.rejects(() => source.getTracks()); await assert.rejects(() => source.createProposal(values))
  }
})
test('missing backend session prevents requests', async () => {
  const source = live(forbidden, user, false)
  await assert.rejects(() => source.getTracks()); await assert.rejects(() => source.createProposal(values))
})
test('wrong role or source prevents requests', async () => {
  for (const source of [live(forbidden, { ...user, role: 'ATTENDEE' }), createSpeakerProposalSource(forbidden, forbidden, user, null, true)]) {
    await assert.rejects(() => source.getTracks()); await assert.rejects(() => source.createProposal(values))
  }
})
test('preview track IDs and unloaded UUIDs rejected for live submission', async () => {
  const source = live(); await source.getTracks()
  await assert.rejects(() => source.createProposal(values), /available track/)
  await assert.rejects(() => source.createProposal({ ...values, trackId: user.id }), /available track/)
})
test('repository failure propagates and permits retry without changing input', async () => {
  let failing = true; const input = { ...values, trackId: track.id }, before = { ...input }
  const source = live({ createProposal: async () => { if (failing) throw new Error('Unavailable'); return { id: 'saved' } } }); await source.getTracks()
  await assert.rejects(() => source.createProposal(input), /Unavailable/); assert.deepEqual(input, before)
  failing = false; assert.deepEqual(await source.createProposal(input), { id: 'saved' })
})
test('live track failure propagates and can retry', async () => {
  let failing = true
  const source = createSpeakerProposalSource(forbidden, { getTracks: async () => { if (failing) throw new Error('Unavailable'); return [] } }, user, 'backend', true)
  await assert.rejects(() => source.getTracks(), /Unavailable/)
  failing = false; assert.deepEqual(await source.getTracks(), [])
})
test('proposal limits accept 200/2000 and reject 201/2001 without truncation', async () => {
  for (const source of [preview(), live({createProposal: async payload => payload})]) {
    await source.getTracks()
    const input = {title: 'a'.repeat(200), description: 'b'.repeat(2000), trackId: source.demo ? 'science' : track.id}
    const saved = await source.createProposal(input)
    assert.equal(saved.title.length, 200)
    assert.equal(saved.description.length, 2000)
    for (const [field, limit] of [['title', 200], ['description', 2000]]) {
      await assert.rejects(() => source.createProposal({...input, [field]: 'a'.repeat(limit + 1)}), new RegExp(`${limit}`))
    }
    if (source.demo) {
      assert.equal(source.getPreviewProposals().length, 1)
      assert.equal(saved.speakerId, demo.id)
    }
  }
})

async function savedPreview() {
  const source = preview()
  await source.getTracks()
  const proposal = await source.createProposal(values)
  return { source, proposal }
}
test('local preview proposal can be deleted and returns selected ID', async () => {
  const { source, proposal } = await savedPreview()
  assert.equal(source.canDeleteProposal(proposal.id), true)
  assert.deepEqual(await source.deleteProposal(proposal.id), { deletedId: proposal.id })
  assert.deepEqual(source.getPreviewProposals(), [])
  assert.equal(source.canDeleteProposal(proposal.id), false)
})
test('preview deletion never fetches or accesses live repository', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Fetch called') })
  const { source, proposal } = await savedPreview()
  await source.deleteProposal(proposal.id)
  assert.equal(fetch.mock.callCount(), 0)
})
test('deletion removes only selected proposal and preserves fixtures', async () => {
  const before = structuredClone(proposals), { source, proposal } = await savedPreview()
  const other = await source.createProposal({ ...values, title: 'Other' })
  await source.deleteProposal(proposal.id)
  assert.deepEqual(source.getPreviewProposals(), [other])
  assert.deepEqual(proposals, before)
})
test('Bill Nye fixture proposals including approved proposals cannot be deleted', async () => {
  const { source, proposal } = await savedPreview()
  const before = structuredClone(proposals)
  assert.ok(proposals.some(item => item.status === 'Approved'))
  for (const fixture of proposals) {
    assert.equal(source.canDeleteProposal(fixture.id), false)
    await assert.rejects(() => source.deleteProposal(fixture.id), /locally created/)
  }
  assert.deepEqual(source.getPreviewProposals(), [proposal])
  assert.deepEqual(proposals, before)
})
test('deletability rejects approved and other nonsubmitted statuses', () => {
  const proposal = { speakerId: demo.id, status: 'SUBMITTED' }
  assert.equal(isPreviewProposalDeletable(proposal, demo.id), true)
  for (const status of ['APPROVED', 'Approved', 'REJECTED', 'Draft']) assert.equal(isPreviewProposalDeletable({ ...proposal, status }, demo.id), false)
})
test('deletability rejects scheduling and ownership changes', () => {
  const proposal = { speakerId: demo.id, status: 'SUBMITTED' }
  for (const field of ['scheduledAt', 'startsAt', 'endsAt', 'scheduled', 'date', 'startTime', 'room', 'roomId', 'sessionId', 'occurrenceId']) assert.equal(isPreviewProposalDeletable({ ...proposal, [field]: 'assigned' }, demo.id), false)
  assert.equal(isPreviewProposalDeletable(proposal, 'another-speaker'), false)
})
for (const id of [undefined, null, '', '   ']) test(`deletion rejects missing or blank ID ${String(id)} and preserves state`, async () => {
  const { source, proposal } = await savedPreview()
  await assert.rejects(() => source.deleteProposal(id), /proposal ID/)
  assert.deepEqual(source.getPreviewProposals(), [proposal])
})
test('unknown ID and repeated deletion are rejected without further mutation', async () => {
  const { source, proposal } = await savedPreview()
  await assert.rejects(() => source.deleteProposal('unknown'), /locally created/)
  assert.deepEqual(source.getPreviewProposals(), [proposal])
  await source.deleteProposal(proposal.id)
  await assert.rejects(() => source.deleteProposal(proposal.id), /locally created/)
  assert.deepEqual(source.getPreviewProposals(), [])
})
test('canceling confirmation never invokes deletion and preserves source state', async t => {
  const { source, proposal } = await savedPreview()
  const operation = t.mock.method(source, 'deleteProposal')
  assert.equal(await deleteConfirmedProposal(source, proposal.id, false), null)
  assert.equal(operation.mock.callCount(), 0)
  assert.deepEqual(source.getPreviewProposals(), [proposal])
})
test('confirmed deletion dispatches once and failure preserves proposal for retry', async t => {
  const { source, proposal } = await savedPreview()
  const failure = t.mock.method(source, 'deleteProposal', async () => { throw new Error('Unavailable') })
  await assert.rejects(() => deleteConfirmedProposal(source, proposal.id, true), /Unavailable/)
  assert.equal(failure.mock.callCount(), 1)
  assert.deepEqual(source.getPreviewProposals(), [proposal])
  failure.mock.restore()
  await deleteConfirmedProposal(source, proposal.id, true)
  assert.deepEqual(source.getPreviewProposals(), [])
})
test('separate preview sessions do not leak deletions', async () => {
  const first = await savedPreview(), second = await savedPreview()
  await first.source.deleteProposal(first.proposal.id)
  assert.deepEqual(second.source.getPreviewProposals(), [second.proposal])
  assert.deepEqual(first.source.getPreviewProposals(), [])
})
test('live deletion is unavailable without a backend contract and never fetches', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Fetch called') })
  const source = live()
  assert.equal(source.canDeleteProposal('any-id'), false)
  await assert.rejects(() => source.deleteProposal('any-id'), /backend provides/)
  assert.equal(fetch.mock.callCount(), 0)
})
