import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { JSDOM } from 'jsdom'
import { createElement as h, act } from 'react'
import { MemoryRouter } from 'react-router-dom'

test('live profile loading, Retry, empty, draft preservation, pending save and dashboard update stay isolated from demo', async t => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://steamcon.test' })
  for (const [name, value] of Object.entries({ window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name])
  }
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected fetch') })
  const { createRoot } = await import('react-dom/client')
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  let root
  try {
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const { default: Editor } = await server.ssrLoadModule('/src/pages/speaker/EditSpeakerProfile.jsx')
    const { default: Dashboard } = await server.ssrLoadModule('/src/pages/speaker/SpeakerDashboard.jsx')
    const { speakerRepository } = await server.ssrLoadModule('/src/services/speakerRepository.js')
    const { calendarRepository } = await server.ssrLoadModule('/src/services/calendarRepository.js')
    const { notificationRepository } = await server.ssrLoadModule('/src/services/notificationRepository.js')
    t.mock.method(calendarRepository, 'getMyCalendar', async () => [])
    t.mock.method(notificationRepository, 'getNotifications', async () => [])
    const user = { id: '11111111-1111-4111-8111-111111111111', role: 'SPEAKER' }
    const auth = { user, authSource: 'backend', hasBackendSession: true }
    const initial = { displayName: 'Backend Speaker', title: 'Scientist', organization: 'Lab', biography: 'Experience' }
    let releaseRead, releaseSave, readMode = 'hold', saveMode = 'fail', saves = 0, reads = 0
    t.mock.method(speakerRepository, 'getMyProfile', async () => {
      reads++
      if (readMode === 'hold') await new Promise(resolve => { releaseRead = resolve })
      if (readMode === 'fail') throw new Error('offline')
      return readMode === 'empty' ? null : initial
    })
    t.mock.method(speakerRepository, 'updateMyProfile', async body => {
      saves++
      assert.deepEqual(Object.keys(body), ['displayName', 'title', 'organization', 'biography'])
      if (saveMode === 'fail') throw new Error('Save failed')
      if (saveMode === 'hold') await new Promise(resolve => { releaseSave = resolve })
      return { ...initial, displayName: 'Canonical saved name', biography: 'Canonical biography' }
    })
    const repository = { getSpeakerDashboard: async () => ({ proposals: [], applications: [], feedback: [] }), getMyProposals: async () => [] }
    const text = () => document.body.textContent
    async function mount(Page, context = auth) {
      if (root) await act(async () => root.unmount())
      root = createRoot(document.getElementById('root'))
      await act(async () => root.render(h(MemoryRouter, null, h(AuthContext.Provider, { value: context }, h(Page, { repository })))))
    }
    async function click(label) { await act(async () => [...document.querySelectorAll('button')].find(button => button.textContent === label).click()) }
    await mount(Editor)
    assert.match(text(), /Loading profile/)
    readMode = 'fail'
    await act(async () => releaseRead())
    assert.match(text(), /Unable to load your profile/)
    assert.doesNotMatch(text(), /Bill Nye/)
    readMode = 'empty'
    await click('Try again')
    assert.match(text(), /No speaker profile is available/)
    readMode = 'ready'
    await click('Retry profile')
    const name = document.querySelector('[name="name"]')
    assert.equal(name.value, initial.displayName)
    assert.equal(document.querySelector('[name="trackId"]'), null)
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    await act(async () => { setter.call(name, 'Preserved draft'); name.dispatchEvent(new window.Event('input', { bubbles: true })) })
    const form = name.form
    async function submit() { await act(async () => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))) }
    await submit()
    assert.match(text(), /Your entries are still here/)
    assert.equal(name.value, 'Preserved draft')
    saveMode = 'hold'
    await act(async () => {
      form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
      form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
    })
    assert.equal(saves, 2)
    assert.equal(name.disabled, true)
    assert.equal(form.querySelector('[type="submit"]').disabled, true)
    await act(async () => releaseSave())
    assert.match(text(), /Profile saved/)
    assert.equal(name.value, 'Canonical saved name')
    await mount(Dashboard)
    assert.match(document.querySelector('#speaker-profile').textContent, /Canonical saved name.*Canonical biography/)
    assert.equal(reads, 3)
    readMode = 'hold'
    await mount(Dashboard, { ...auth, user: { ...user } })
    assert.match(text(), /Loading profile/)
    readMode = 'fail'
    await act(async () => releaseRead())
    assert.match(text(), /Unable to load your profile/)
    assert.doesNotMatch(text(), /Bill Nye|Canonical saved name/)
    readMode = 'empty'
    await click('Retry profile')
    assert.match(text(), /No speaker profile is available/)
    readMode = 'ready'
    await click('Retry profile')
    assert.match(document.querySelector('#speaker-profile').textContent, /Backend Speaker/)
    const demo = { user: { id: 'demo-SPEAKER', role: 'SPEAKER' }, authSource: 'demo', hasBackendSession: false }
    await mount(Editor, demo)
    assert.equal(document.querySelector('[name="name"]').value, 'Bill Nye')
    await mount(Editor, auth)
    assert.equal(document.querySelector('[name="name"]').value, 'Canonical saved name')
    for (const context of [{ ...auth, hasBackendSession: false }, { ...auth, user: { ...user, role: 'ATTENDEE' } }]) {
      await mount(Editor, context)
      assert.equal(document.querySelector('form'), null)
    }
    assert.equal(reads, 6)
    assert.equal(fetch.mock.callCount(), 0)
  } finally {
    if (root) await act(async () => root.unmount())
    await server.close()
    dom.window.close()
  }
})
