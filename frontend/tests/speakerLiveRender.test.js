import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { JSDOM } from 'jsdom'
import { createElement as h, act } from 'react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
const id = '11111111-1111-4111-8111-111111111111'
const proposalId = '22222222-2222-4222-8222-222222222222'
const trackId = '33333333-3333-4333-8333-333333333333'
const user = { id, displayName: 'Real Speaker', role: 'SPEAKER' }
const record = { id: proposalId, title: 'My live idea', description: 'Original description', status: 'SUBMITTED', trackId }
test('speaker screens isolate preview and preserve live drafts and withdrawal on failure', async t => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://steamcon.test', pretendToBeVisual: true })
  const globals = { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, FormData: dom.window.FormData, IS_REACT_ACT_ENVIRONMENT: true, requestAnimationFrame: callback => setTimeout(callback, 0) }
  for (const [name, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name])
  }
  const { createRoot } = await import('react-dom/client')
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  let root
  try {
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
    const { default: Shell } = await server.ssrLoadModule('/src/components/portal/PortalShell.jsx')
    const { default: Dashboard } = await server.ssrLoadModule('/src/pages/speaker/SpeakerDashboard.jsx')
    const { default: Details } = await server.ssrLoadModule('/src/pages/speaker/ProposalDetails.jsx')
    const { eventRepository } = await server.ssrLoadModule('/src/services/eventRepository.js')
    const { calendarRepository } = await server.ssrLoadModule('/src/services/calendarRepository.js')
    let failCalendar = true
    let calendarCalls = 0
    t.mock.method(calendarRepository, 'getMyCalendar', async () => {
      calendarCalls++
      if (failCalendar) throw new Error('Calendar unavailable')
      return [
        { sourceId: 'hotel', entryType: 'HOTEL', startsAt: '2027-04-06T20:00:00Z', endsAt: '2027-04-08T14:00:00Z' },
        { sourceId: 'occurrence', entryType: 'SESSION', startsAt: '2027-04-06T14:00:00Z', endsAt: '2027-04-06T15:00:00Z' },
      ]
    })
    const { notificationRepository } = await server.ssrLoadModule('/src/services/notificationRepository.js')
    const otherTrack = { id: '44444444-4444-4444-8444-444444444444', name: 'Another track' }
    let loadedTracks = [otherTrack, { id: trackId, name: 'Live science' }]
    let holdTracks = false, releaseTracks, failTracks = false
    t.mock.method(eventRepository, 'getTracks', async () => {
      if (failTracks) throw new Error('Track loading failed')
      if (holdTracks) await new Promise(resolve => { releaseTracks = resolve })
      return loadedTracks
    })
    let notificationLoads = 0
    t.mock.method(notificationRepository, 'getNotifications', async () => {
      notificationLoads++
      return [{ id: 'notice', type: 'PROPOSAL_UPDATE', message: 'Check your proposal feedback', read: false }]
    })
    t.mock.method(notificationRepository, 'markAsRead', async id => ({ id, type: 'PROPOSAL_UPDATE', message: 'Check your proposal feedback', read: true }))
    const calls = []
    let failDashboard = true, failSave = true, failWithdraw = true, failDetails = false, missingDetails = false, emptyDashboard = false
    let holdDashboard = false, releaseDashboard, failList = false
    let holdWithdrawal = false, releaseWithdrawal
    let holdSave = false, releaseSave
    const repository = {
      async getMyProposals(identity) { calls.push(['list', identity]); if (failList) throw new Error('List loading failed'); return emptyDashboard ? [] : [record] },
      async getSpeakerDashboard(identity) { calls.push(['dashboard', identity]); if (failDashboard) throw new Error('Offline'); if (holdDashboard) await new Promise(resolve => { releaseDashboard = resolve }); if (emptyDashboard) return { proposals: [], applications: [], feedback: [] }; return { proposals: [record], applications: [{ id: 'application', status: 'SUBMITTED' }], feedback: [{ id: 'feedback', decision: 'APPROVED', comment: 'Thanks for your application' }] } },
      async getProposal(proposal, identity) { calls.push(['detail', proposal, identity]); if (failDetails) throw new Error('Detail loading failed'); return missingDetails ? null : record },
      async updateProposal(proposal, identity, body) { calls.push(['patch', proposal, identity, body]); if (failSave) throw new Error('Save failed'); if (holdSave) await new Promise(resolve => { releaseSave = resolve }); Object.assign(record, body); return { ...record } },
      async withdrawProposal(proposal, identity) { calls.push(['delete', proposal, identity]); if (failWithdraw) throw new Error('Withdrawal failed'); if (holdWithdrawal) await new Promise(resolve => { releaseWithdrawal = resolve }) },
    }
    async function mount(Page, route, auth = { user, authSource: 'backend', hasBackendSession: true }) {
      if (root) await act(async () => root.unmount())
      root = createRoot(document.getElementById('root'))
      await act(async () => root.render(h(MemoryRouter, { initialEntries: [route] }, h(AuthContext.Provider, { value: { ...auth, isAuthenticated: true } }, h(Shell, null, h(Routes, null, h(Route, { path: '/speaker', element: h(Page, { repository }) }), h(Route, { path: '/speaker/proposals/:proposalId', element: h(Page, { repository }) })))))))
    }
    const text = () => document.body.textContent
    const button = name => [...document.querySelectorAll('button')].find(node => node.textContent === name)
    async function click(name) { const node = button(name); assert.ok(node, name); await act(async () => node.click()) }
    await mount(Dashboard, '/speaker?speakerId=attacker&preview=scheduled')
    assert.match(text(), /Speaker dashboard/)
    assert.doesNotMatch(text(), /Bill Nye|Science Changes Everything/)
    assert.match(text(), /Unable to load proposals/)
    failDashboard = false
    await click('Try again')
    for (const expected of [/My live idea/, /Applications/, /Thanks for your application/]) assert.match(text(), expected)
    for (const kind of ['dashboard', 'list']) {
      assert.ok(calls.some(call => call[0] === kind))
      assert.ok(calls.filter(call => call[0] === kind).every(call => call[1] === id))
    }
    await t.test('calendar retry preserves proposals and keeps enrolled sessions separate from speaking assignments', async () => {
      assert.match(text(), /Unable to load your itinerary/)
      const proposalCalls = calls.length
      failCalendar = false
      await click('Retry itinerary')
      assert.equal(calendarCalls, 2)
      assert.equal(calls.length, proposalCalls)
      assert.match(text(), /My live idea/)
      const navigation = document.querySelector('nav[aria-label="Portal navigation"]')
      assert.ok(navigation.querySelector('a[href="/speaker#speaker-itinerary"]'))
      assert.ok(navigation.querySelector('a[href="/speaker#speaker-proposals"]'))
      assert.equal(document.querySelector('.portal-dashboard-navigation'), null)
      assert.equal(document.querySelectorAll('nav[aria-label="Account navigation"]').length, 1)
      const itinerary = document.querySelector('#speaker-itinerary')
      const rows = [...itinerary.querySelectorAll('li')]
      assert.deepEqual(rows.map(row => row.querySelector('h3').textContent), ['Enrolled session', 'Hotel stay'])
      assert.match(rows[0].textContent, /10:00 AM EDT/)
      assert.equal(document.querySelector('#speaker-engagements .portal-session'), null)
      const summary = document.querySelector('#proposal-summary-heading').parentElement
      assert.ok(summary.compareDocumentPosition(itinerary) & window.Node.DOCUMENT_POSITION_FOLLOWING)
      const proposals = document.querySelector('#speaker-proposals')
      assert.ok(proposals.compareDocumentPosition(itinerary) & window.Node.DOCUMENT_POSITION_FOLLOWING)
      for (const link of document.querySelectorAll('.steam-portal-navigation a[href^="/speaker#"]')) {
        assert.ok(document.querySelector('#' + link.getAttribute('href').split('#')[1]))
      }
    })
    await t.test('Organizer Updates is the first dashboard disclosure and retains read state across collapse', async () => {
      const main = document.querySelector('#speaker-main')
      const disclosure = main.firstElementChild
      assert.equal(disclosure.tagName, 'DETAILS')
      assert.equal(disclosure.id, 'speaker-updates')
      assert.equal(main.previousElementSibling.tagName, 'SECTION')
      assert.equal(disclosure.open, false)
      const summary = disclosure.querySelector('summary')
      assert.match(summary.textContent, /Organizer Updates/)
      summary.focus()
      assert.ok(document.activeElement === summary, 'updates summary receives focus')
      await act(async () => summary.click())
      assert.equal(disclosure.open, true)
      await click('Mark as read')
      assert.match(disclosure.textContent, /Notification marked as read/)
      const loads = notificationLoads
      await act(async () => summary.click())
      assert.equal(disclosure.open, false)
      await act(async () => summary.click())
      assert.equal(disclosure.open, true)
      assert.equal(notificationLoads, loads)
      assert.equal(disclosure.querySelector('.portal-notification-meta span').textContent, 'Read')
      assert.equal(button('Mark as read'), undefined)
      assert.equal(document.querySelectorAll('#speaker-updates').length, 1)
      assert.equal(document.querySelector('nav[aria-label="Speaker navigation"]'), null)
    })
    assert.equal(document.querySelector('a[href="/speaker/profile/edit"]'), null)
    await mount(Details, `/speaker/proposals/${proposalId}?speakerId=attacker&preview=scheduled`)
    assert.match(text(), /My live idea/); assert.doesNotMatch(text(), /Bill Nye|Fictional schedule/)
    holdTracks = true
    await click('Edit proposal')
    assert.match(text(), /Loading tracks before saving/); assert.ok(button('Save proposal').disabled)
    assert.equal(document.querySelector('[name="format"]'), null)
    assert.equal(document.querySelector('[name="durationMinutes"]'), null)
    const title = document.querySelector('[name="title"]'); title.value = 'Preserved draft'
    document.querySelector('[name="abstract"]').value = 'Preserved description'
    await act(async () => releaseTracks())
    holdTracks = false
    assert.equal(document.querySelector('[name="trackId"]').value, trackId)
    async function submit(form) { await act(async () => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))) }
    await submit(title.form)
    assert.match(text(), /Your entries are still here/)
    assert.equal(title.value, 'Preserved draft')
    const patch = calls.find(call => call[0] === 'patch')
    assert.deepEqual(patch.slice(1), [proposalId, id, { title: 'Preserved draft', description: 'Preserved description', trackId }])
    failSave = false
    await submit(title.form)
    assert.match(text(), /Proposal saved/)
    await click('Withdraw proposal')
    assert.ok(button('Edit proposal').disabled)
    assert.equal(calls.filter(call => call[0] === 'delete').length, 0)
    const confirmation = document.querySelector('[name="confirmation"]')
    confirmation.value = 'Preserved draft'
    await submit(confirmation.form)
    assert.match(text(), /Withdrawal failed/)
    assert.equal(document.querySelector('h1').textContent, 'Preserved draft')
    assert.equal(confirmation.value, 'Preserved draft')
    failWithdraw = false; holdWithdrawal = true
    await act(async () => {
      confirmation.form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
      confirmation.form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
    })
    assert.equal(calls.filter(call => call[0] === 'delete').length, 2)
    assert.ok(button('Withdrawing…').disabled)
    await act(async () => releaseWithdrawal())
    assert.equal(calls.filter(call => call[0] === 'delete').length, 2)
    assert.match(text(), /Proposal withdrawn successfully/)
    await new Promise(resolve => setTimeout(resolve, 10))
    assert.ok(document.activeElement === document.querySelector('h1'), 'Success heading receives focus')
    for (const status of ['APPROVED', 'REJECTED', 'WITHDRAWN']) {
      record.status = status
      await mount(Details, `/speaker/proposals/${proposalId}`)
      assert.equal(button('Edit proposal'), undefined); assert.equal(button('Withdraw proposal'), undefined)
      assert.match(text(), /only for draft or submitted/)
    }
    await t.test('pending live saves freeze inputs and dispatch only one PATCH', async () => {
      record.status = 'DRAFT'; holdSave = true
      await mount(Details, `/speaker/proposals/${proposalId}`)
      await click('Edit proposal')
      const title = document.querySelector('[name="title"]')
      const count = calls.filter(call => call[0] === 'patch').length
      await act(async () => {
        title.form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
        title.form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
      })
      assert.equal(calls.filter(call => call[0] === 'patch').length, count + 1)
      assert.ok(title.disabled)
      assert.ok(document.querySelector('[name="abstract"]').disabled)
      assert.ok(document.querySelector('[name="trackId"]').disabled)
      assert.ok(button('Saving…').disabled)
      await act(async () => releaseSave())
      holdSave = false
      assert.match(text(), /Proposal saved/)
      assert.ok(document.activeElement === button('Edit proposal'), 'Focus returns after saving')
    })
    await t.test('live detail failures have Retry and missing details have an empty state', async () => {
      failDetails = true
      await mount(Details, `/speaker/proposals/${proposalId}`)
      assert.match(text(), /Unable to load this proposal/)
      assert.doesNotMatch(text(), /Bill Nye/)
      failDetails = false
      await click('Try again')
      assert.match(text(), /Preserved draft/)
      missingDetails = true
      await mount(Details, `/speaker/proposals/${proposalId}`)
      assert.match(text(), /Proposal not found/)
      assert.equal(button('Withdraw proposal'), undefined)
      missingDetails = false
    })
    await t.test('empty and failed track loads block saves and preserve draft input on Retry', async () => {
      record.status = 'DRAFT'; loadedTracks = []
      await mount(Details, `/speaker/proposals/${proposalId}`)
      await click('Edit proposal')
      assert.match(text(), /No tracks are available/); assert.ok(button('Save proposal').disabled)
      const title = document.querySelector('[name="title"]'); title.value = 'Draft during track retry'
      failTracks = true
      await click('Retry')
      assert.match(text(), /Unable to load tracks/); assert.ok(button('Save proposal').disabled)
      assert.equal(title.value, 'Draft during track retry')
      failTracks = false; loadedTracks = [otherTrack, { id: trackId, name: 'Live science' }]
      await click('Retry')
      assert.equal(title.value, 'Draft during track retry')
      assert.equal(document.querySelector('[name="trackId"]').value, trackId)
      assert.equal(button('Save proposal').disabled, false)
      await click('Cancel')
      assert.ok(document.activeElement === button('Edit proposal'), 'Focus returns to Edit proposal')
      await click('Withdraw proposal')
      await click('Cancel')
      assert.ok(document.activeElement === button('Withdraw proposal'), 'Focus returns to Withdraw proposal')
    })
    await t.test('an unavailable current track is retained until the speaker selects a replacement', async () => {
      record.status = 'SUBMITTED'; loadedTracks = [otherTrack]
      await mount(Details, `/speaker/proposals/${proposalId}`)
      await click('Edit proposal')
      const select = document.querySelector('[name="trackId"]')
      assert.equal(select.value, trackId)
      assert.match(text(), /Current track unavailable/)
      assert.ok(button('Save proposal').disabled)
      await act(async () => { select.value = otherTrack.id; select.dispatchEvent(new window.Event('change', { bubbles: true })) })
      assert.equal(select.value, otherTrack.id)
      assert.equal(button('Save proposal').disabled, false)
      await click('Cancel')
      loadedTracks = [otherTrack, { id: trackId, name: 'Live science' }]
    })
    await t.test('live dashboard has loading and empty proposal, application and feedback states', async () => {
      holdDashboard = true; emptyDashboard = true
      await mount(Dashboard, '/speaker')
      assert.match(text(), /Loading proposals/)
      assert.doesNotMatch(text(), /Bill Nye|Science Changes Everything/)
      await act(async () => releaseDashboard())
      holdDashboard = false
      assert.match(text(), /Make room for your first idea/)
      assert.match(text(), /No applications yet/)
      assert.match(text(), /organizer notes and proposal feedback/i)
      emptyDashboard = false
    })
    await t.test('proposal-list failure has no fixture fallback and Retry reloads live data', async () => {
      failList = true
      await mount(Dashboard, '/speaker?speakerId=attacker')
      assert.match(text(), /Unable to load proposals/)
      assert.doesNotMatch(text(), /Bill Nye|Science Changes Everything/)
      assert.equal(document.querySelector('.portal-proposals'), null)
      failList = false
      await click('Try again')
      assert.match(text(), /Preserved draft/)
    })
    const { speakerRepository: preview } = await server.ssrLoadModule('/src/services/speakerRepository.js')
    repository.getDashboard = () => preview.getDashboard()
    await mount(Dashboard, '/speaker', { user: { id: 'demo-SPEAKER', role: 'SPEAKER' }, authSource: 'demo', hasBackendSession: false })
    assert.match(text(), /Speaker dashboard/)
    assert.match(text(), /Science Changes Everything/)
    assert.ok(document.querySelector('a[href="/speaker/profile/edit"]'))
  } finally {
    if (root) await act(async () => root.unmount())
    await server.close(); dom.window.close()
  }
})
