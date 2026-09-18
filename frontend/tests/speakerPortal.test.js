import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { JSDOM } from 'jsdom'
import { createElement as h, act } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

const id = '11111111-1111-4111-8111-111111111111'
const proposalId = '22222222-2222-4222-8222-222222222222'
const trackId = '33333333-3333-4333-8333-333333333333'
const routes = ['/speaker', '/speaker/proposals/new', `/speaker/proposals/${proposalId}`, '/speaker/forums', '/speaker/profile/edit']

test('complete Speaker flow shares one shell, preserving demo/live boundaries and drawer behavior', { timeout: 20000 }, async t => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' })
  t.after(() => dom.window.close())
  const frames = new Map()
  let frameId = 0
  dom.window.requestAnimationFrame = callback => { const id = ++frameId; frames.set(id, callback); return id }
  dom.window.cancelAnimationFrame = id => frames.delete(id)
  let mobile = false
  const mediaListeners = new Set()
  dom.window.matchMedia = () => ({ get matches() { return mobile }, addEventListener: (_, cb) => mediaListeners.add(cb), removeEventListener: (_, cb) => mediaListeners.delete(cb) })
  dom.window.scrollTo = () => {}
  const scrolls = []
  dom.window.HTMLElement.prototype.scrollIntoView = function (options) { scrolls.push([this.id, options]) }
  const nativeFocus = dom.window.HTMLElement.prototype.focus
  dom.window.HTMLElement.prototype.focus = function (...args) {
    for (let node = this; node; node = node.parentElement) if (node.inert) return
    nativeFocus.apply(this, args)
  }
  for (const [name, value] of Object.entries({ window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, FormData: dom.window.FormData, localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage, requestAnimationFrame: dom.window.requestAnimationFrame, IS_REACT_ACT_ENVIRONMENT: true })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name])
  }
  const keyboardListeners = new Set()
  const nativeAdd = dom.window.document.addEventListener.bind(dom.window.document)
  const nativeRemove = dom.window.document.removeEventListener.bind(dom.window.document)
  t.mock.method(dom.window.document, 'addEventListener', (type, cb, options) => { if (type === 'keydown') keyboardListeners.add(cb); nativeAdd(type, cb, options) })
  t.mock.method(dom.window.document, 'removeEventListener', (type, cb, options) => { if (type === 'keydown') keyboardListeners.delete(cb); nativeRemove(type, cb, options) })
  const requests = t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected endpoint connection') })
  const { createRoot } = await import('react-dom/client')
  let server, root, router, auth
  async function cleanup() {
    if (root) { await act(async () => root.unmount()); root = null }
    router?.dispose()
    router = null
  }
  async function frame() {
    await act(async () => { for (const [id, callback] of [...frames]) if (frames.delete(id)) callback(0) })
  }
  async function run(name, body) {
    await t.test(name, async subtest => {
      subtest.after(async () => {
        await cleanup()
        mobile = false
        dom.window.localStorage.clear()
        dom.window.sessionStorage.clear()
        assert.equal(frames.size, 0, 'animation frames are flushed or canceled')
        assert.equal(mediaListeners.size, 0, 'media listeners are removed')
        assert.equal(keyboardListeners.size, 0, 'keyboard listeners are removed')
        assert.equal(document.body.style.overflow, '', 'scroll lock is released')
      })
      await body()
    })
  }
  try {
    server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
    const { speakerRepository: profileRepository } = await server.ssrLoadModule('/src/services/speakerRepository.js')
    t.mock.method(profileRepository, 'getMyProfile', async () => { throw new Error('Profile offline') })
    const { default: App } = await server.ssrLoadModule('/src/App.jsx')
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const { speakerRepository } = await server.ssrLoadModule('/src/services/speakerRepository.js')
    const { eventRepository } = await server.ssrLoadModule('/src/services/eventRepository.js')
    const { calendarRepository } = await server.ssrLoadModule('/src/services/calendarRepository.js')
    const { notificationRepository } = await server.ssrLoadModule('/src/services/notificationRepository.js')
    const { forumRepository } = await server.ssrLoadModule('/src/services/forumRepository.js')
    const demo = () => ({ user: { id: 'demo-SPEAKER', displayName: 'Bill Nye', role: 'SPEAKER' }, authSource: 'demo', isAuthenticated: true, isLoading: false, hasBackendSession: false, logout() {} })
    const live = () => ({ user: { id, displayName: 'Authenticated Speaker', role: 'SPEAKER', roles: ['SPEAKER'] }, authSource: 'backend', isAuthenticated: true, isLoading: false, hasBackendSession: true, logout() {} })
    function render() { return root.render(h(AuthContext.Provider, { value: auth }, h(RouterProvider, { router }))) }
    async function mount(route = '/speaker', value = demo()) {
      await cleanup()
      auth = value
      router = createMemoryRouter([{ path: '*', element: h(App) }], { initialEntries: [route] })
      root = createRoot(document.getElementById('root'))
      await act(async () => render())
      await frame()
    }
    async function navigate(path) { await act(async () => router.navigate(path)); await frame() }
    async function click(node) { assert.ok(node, 'control exists'); await act(async () => node.click()); await frame() }
    async function key(key, shiftKey = false) { await act(async () => document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key, shiftKey, cancelable: true, bubbles: true }))); await frame() }
    const text = () => document.body.textContent
    const button = label => [...document.querySelectorAll('button')].find(node => node.textContent.trim() === label)
    const nav = () => document.querySelector('nav[aria-label="Portal navigation"]')
    const link = href => nav()?.querySelector(`a[href="${href}"]`)
    async function field(selector, value) {
      const node = document.querySelector(selector)
      assert.ok(node, selector)
      const prototype = node.tagName === 'SELECT' ? dom.window.HTMLSelectElement.prototype : node.tagName === 'TEXTAREA' ? dom.window.HTMLTextAreaElement.prototype : dom.window.HTMLInputElement.prototype
      await act(async () => {
        Object.getOwnPropertyDescriptor(prototype, 'value').set.call(node, value)
        node.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
        node.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
      })
    }
    async function submit() { await act(async () => document.querySelector('form').dispatchEvent(new dom.window.Event('submit', { cancelable: true, bubbles: true }))); await frame() }
    function assertShell() {
      assert.equal(document.querySelectorAll('.steam-portal-shell').length, 1)
      assert.equal(document.querySelectorAll('main').length, 1)
      assert.equal(document.querySelectorAll('header').length, 1)
      assert.equal(document.querySelectorAll('nav[aria-label="Portal navigation"]').length, 1)
      assert.equal([...document.querySelectorAll('button')].filter(node => node.textContent === 'Log out').length, 1)
      assert.ok(document.querySelector('.portal-header, .portal-nav') === null)
      assert.ok(document.querySelector('main .speaker-portal'))
      assert.ok(document.querySelector('.attendee-admission, .attendee-session-action, .attendee-summary') === null)
      for (const to of ['/events', '/speaker#speaker-itinerary', '/speaker/forums', '/speaker#speaker-updates', '/speaker#speaker-proposals', '/speaker#speaker-engagements', '/speaker#speaker-profile']) assert.ok(link(to), to)
      assert.ok(nav().querySelector('a[href^="/attendee"]') === null)
      const unavailable = [...nav().querySelectorAll('.steam-portal-unavailable')]
      assert.equal(unavailable.length, 4, 'Calendar and all three booking destinations are unavailable')
      assert.ok(unavailable.every(node => node.tabIndex === -1 && !node.querySelector('a, button')))
    }

    await run('all five actual routes preserve the same shell/main/topbar and guard enforcement', async () => {
      await mount()
      assert.equal(link('/speaker').getAttribute('aria-current'), 'page')
      const shell = document.querySelector('.steam-portal-shell')
      const main = document.querySelector('main')
      const topbar = document.querySelector('header')
      for (const route of routes) {
        await navigate(route)
        assertShell()
        assert.ok(document.querySelector('.steam-portal-shell') === shell, `${route}: persistent shell`)
        assert.ok(document.querySelector('main') === main, `${route}: persistent main`)
        assert.ok(document.querySelector('header') === topbar, `${route}: persistent topbar`)
        assert.match(text(), /Bill Nye/)
        if (route.includes('/proposals/')) assert.equal(link('/speaker#speaker-proposals').getAttribute('aria-current'), 'page')
        if (route === '/speaker/profile/edit') assert.equal(link('/speaker#speaker-profile').getAttribute('aria-current'), 'page')
      }
      await navigate(-1)
      assert.equal(router.state.location.pathname, '/speaker/forums')
      await navigate(1)
      assert.equal(router.state.location.pathname, '/speaker/profile/edit')
      assert.ok(document.querySelector('.steam-portal-shell') === shell)
      for (const route of routes) {
        await mount(route, { ...demo(), user: null, isAuthenticated: false })
        assert.equal(router.state.location.pathname, '/login')
        await mount(route, { ...demo(), user: { role: 'ATTENDEE' } })
        assert.equal(router.state.location.pathname, '/access-denied')
      }
    })

    await run('proposal creation retains entered values when shell/context rerenders and saves locally', async () => {
      await mount('/speaker/proposals/new')
      await field('[name="title"]', 'Shell migration preview proposal')
      await field('[name="description"]', 'A local proposal, preserved through shell rerenders.')
      await field('[name="trackId"]', 'science')
      const input = document.querySelector('[name="title"]')
      auth = { ...auth }
      await act(async () => render())
      assert.ok(document.querySelector('[name="title"]') === input, 'form stays mounted')
      assert.equal(input.value, 'Shell migration preview proposal')
      await submit()
      assert.match(text(), /saved locally for this application session/)
      const shell = document.querySelector('.steam-portal-shell')
      await navigate('/speaker')
      assert.ok(document.querySelector('.steam-portal-shell') === shell)
      assert.match(document.querySelector('[aria-labelledby="local-proposals-heading"]').textContent, /Shell migration preview proposal/)
    })

    await run('demo notifications retain read state across disclosure collapse, routes and hashes', async () => {
      await mount()
      let updates = document.getElementById('speaker-updates')
      assert.equal(updates.open, false)
      await click(updates.querySelector('summary'))
      await click(button('Mark as read'))
      const marked = document.querySelector('.portal-notification')
      assert.ok(marked.querySelector('button') === null)
      await click(updates.querySelector('summary'))
      await click(updates.querySelector('summary'))
      assert.ok(document.querySelector('.portal-notification') === marked, 'collapse keeps read state mounted')
      await navigate('/speaker/forums')
      await click(link('/speaker#speaker-updates'))
      updates = document.getElementById('speaker-updates')
      assert.ok(!document.querySelector('.portal-notification').querySelector('button'), 'route return reloads the same demo read source')
      assert.ok(document.activeElement === updates, 'updates hash receives focus')
      assert.equal(link('/speaker#speaker-updates').getAttribute('aria-current'), 'page')
      assert.match(document.getElementById('speaker-itinerary').textContent, /No personal itinerary entries in this preview/)
    })

    await run('existing forum conversations and demo profile editing stay local', async () => {
      await mount('/speaker/forums')
      await click(document.querySelector('.forum-directory button'))
      await field('#forum-message', 'A local forum draft')
      await submit()
      assert.match(document.querySelector('.forum-conversation').textContent, /Demo message posted locally|A local forum draft/)
      await navigate('/speaker/profile/edit')
      await field('[name="organization"]', 'Preview organization')
      await submit()
      assert.match(text(), /Preview profile saved for this session/)
      await navigate('/speaker#speaker-profile')
      assert.match(document.getElementById('speaker-profile').textContent, /Preview organization/)
      assert.ok(document.activeElement === document.getElementById('speaker-profile'))
      assert.match(text(), /Bill Nye/)
    })

    await run('live proposal create/edit/withdraw, identity and calendar keep existing repository contracts', async () => {
      const calls = []
      let record = { id: proposalId, title: 'Live proposal', description: 'Live abstract', status: 'SUBMITTED', trackId }
      t.mock.method(speakerRepository, 'getSpeakerDashboard', async identity => { calls.push(['dashboard', identity]); return { proposals: [], applications: [], feedback: [] } })
      t.mock.method(speakerRepository, 'getMyProposals', async identity => { calls.push(['list', identity]); return record ? [record] : [] })
      t.mock.method(eventRepository, 'getTracks', async () => [{ id: trackId, name: 'Live track' }])
      t.mock.method(speakerRepository, 'createProposal', async payload => { calls.push(['create', payload]); return record })
      t.mock.method(speakerRepository, 'getProposal', async (proposal, identity) => { calls.push(['detail', proposal, identity]); return record })
      t.mock.method(speakerRepository, 'updateProposal', async (proposal, identity, payload) => { calls.push(['patch', proposal, identity, payload]); record = { ...record, ...payload }; return record })
      t.mock.method(speakerRepository, 'withdrawProposal', async (proposal, identity) => { calls.push(['delete', proposal, identity]); record = null })
      t.mock.method(calendarRepository, 'getMyCalendar', async () => [{ sourceId: 'stay', entryType: 'HOTEL', startsAt: '2026-10-10T16:00:00Z', endsAt: '2026-10-12T16:00:00Z' }])
      t.mock.method(notificationRepository, 'getNotifications', async () => [])
      t.mock.method(forumRepository, 'getForums', async () => [])
      await mount('/speaker', live())
      assertShell()
      assert.match(text(), /Authenticated Speaker/)
      assert.doesNotMatch(text(), /Bill Nye|Science Changes Everything/)
      assert.match(document.getElementById('speaker-itinerary').textContent, /Hotel stay/)
      const shell = document.querySelector('.steam-portal-shell')
      await navigate('/speaker/proposals/new')
      await field('[name="title"]', 'Live submission')
      await field('[name="description"]', 'Live submission abstract')
      await field('[name="trackId"]', trackId)
      await submit()
      assert.deepEqual(calls.find(call => call[0] === 'create'), ['create', { title: 'Live submission', description: 'Live submission abstract', trackId }])
      await navigate(`/speaker/proposals/${proposalId}`)
      await click(button('Edit proposal'))
      await field('[name="title"]', 'Preserved live edit')
      await field('[name="abstract"]', 'Edited abstract')
      const editor = document.querySelector('form')
      auth = { ...auth }
      await act(async () => render())
      assert.ok(document.querySelector('form') === editor)
      await submit()
      assert.deepEqual(calls.find(call => call[0] === 'patch'), ['patch', proposalId, id, { title: 'Preserved live edit', description: 'Edited abstract', trackId }])
      await click(button('Withdraw proposal'))
      await field('[name="confirmation"]', 'Preserved live edit')
      await submit()
      assert.deepEqual(calls.find(call => call[0] === 'delete'), ['delete', proposalId, id])
      assert.match(text(), /Proposal withdrawn successfully/)
      assert.ok(document.querySelector('.steam-portal-shell') === shell)
      await navigate('/speaker/profile/edit')
      assert.match(text(), /Unable to load your profile/)
      assert.ok(document.querySelector('.portal-profile-form') === null)
    })

    await run('mobile focus trap, Escape, outside/selection dismissal and hash focus use the existing shell', async () => {
      mobile = true
      await mount()
      const menu = button('Menu')
      assert.ok(nav() === null)
      await click(menu)
      assert.ok(document.activeElement === button('Close menu'))
      await key('Tab', true)
      assert.ok(document.activeElement === [...nav().querySelectorAll('a')].at(-1))
      await key('Tab')
      assert.ok(document.activeElement === button('Close menu'))
      await key('Escape')
      assert.ok(document.activeElement === menu)
      for (const dismissal of ['outside', '/speaker/forums', '/speaker#speaker-itinerary']) {
        await click(menu)
        if (dismissal === 'outside') await click(document.querySelector('.steam-portal-backdrop'))
        else await click(link(dismissal))
        assert.equal(nav(), null, 'closed drawer links are unmounted')
        assert.ok(document.activeElement === menu, 'Menu regains focus after dismissal')
        assert.equal(menu.getAttribute('aria-expanded'), 'false')
      }
      assert.equal(router.state.location.hash, '#speaker-itinerary')
      assert.deepEqual(scrolls.at(-1), ['speaker-itinerary', { behavior: 'instant', block: 'start' }])
      await click(menu)
      assert.equal(link('/speaker#speaker-itinerary').getAttribute('aria-current'), 'page')
      await click(button('Close menu'))
      assert.ok(document.activeElement === menu)
      const inputRoute = '/speaker/proposals/new'
      await navigate(inputRoute)
      assert.ok(document.querySelector('form input:not(:disabled)'), 'proposal controls remain available')
    })

    await run('public speaker directory remains outside shell and attendee navigation has no speaker actions', async () => {
      await mount('/speakers', demo())
      assert.ok(document.querySelector('.steam-portal-shell') === null)
      assert.ok(document.querySelector('nav[aria-label="Main navigation"]'))
      await mount('/attendee', { ...demo(), user: { role: 'ATTENDEE', displayName: 'Avery' } })
      assert.match(text(), /Avery/)
      assert.equal(link('/attendee/travel').getAttribute('href'), '/attendee/travel')
      assert.ok(link('/speaker#speaker-proposals') === null)
      assert.ok(document.querySelector('.attendee-admission'))
    })
    assert.equal(requests.mock.callCount(), 0, 'no new endpoints are contacted')
  } finally {
    try { await cleanup() }
    finally { try { await server?.close() } finally { frames.clear() } }
  }
})
