import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { JSDOM } from 'jsdom'
import { createElement as h, act } from 'react'
import { BrowserRouter, createMemoryRouter, RouterProvider } from 'react-router-dom'
import { attendeeData } from '../src/mocks/attendeeData.js'

const paths = ['/attendee', '/attendee/travel', '/attendee/hotel', '/attendee/car']
const headings = ['Attendee dashboard', 'Book your way there and back.', 'Find your STEAM Con stay.', 'Reserve your ride.']

test('existing attendee routes use the shell while preserving identity, content, bookings and guards', { timeout: 20000 }, async t => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' })
  t.after(() => dom.window.close())
  const frames = new Map()
  let nextFrame = 0
  dom.window.requestAnimationFrame = callback => { const id = ++nextFrame; frames.set(id, callback); return id }
  dom.window.cancelAnimationFrame = id => frames.delete(id)
  let mobile = false
  const listeners = new Set()
  const media = { get matches() { return mobile }, addEventListener: (_, cb) => listeners.add(cb), removeEventListener: (_, cb) => listeners.delete(cb) }
  dom.window.matchMedia = () => media
  dom.window.scrollTo = () => {}
  const scrolls = []
  dom.window.HTMLElement.prototype.scrollIntoView = function (options) { scrolls.push([this.id, options]) }
  // Exercise focus return using the browser's inert focus-blocking rule.
  const nativeFocus = dom.window.HTMLElement.prototype.focus
  dom.window.HTMLElement.prototype.focus = function (...args) {
    for (let node = this; node; node = node.parentElement) if (node.inert) return
    nativeFocus.apply(this, args)
  }
  for (const [name, value] of Object.entries({ window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage, IS_REACT_ACT_ENVIRONMENT: true })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name])
  }
  const requests = t.mock.method(globalThis, 'fetch', () => { throw new Error('Attendee presentation must not introduce API requests') })
  const expiryTimers = new Set()
  const nativeSetTimeout = globalThis.setTimeout
  const nativeClearTimeout = globalThis.clearTimeout
  t.mock.method(globalThis, 'setTimeout', (callback, delay, ...args) => {
    const timer = nativeSetTimeout(callback, delay, ...args)
    if (delay > 50000 && delay <= 60000) expiryTimers.add(timer)
    return timer
  })
  t.mock.method(globalThis, 'clearTimeout', timer => { expiryTimers.delete(timer); nativeClearTimeout(timer) })
  const keyListeners = new Set()
  const nativeAddEventListener = dom.window.document.addEventListener.bind(dom.window.document)
  const nativeRemoveEventListener = dom.window.document.removeEventListener.bind(dom.window.document)
  t.mock.method(dom.window.document, 'addEventListener', (type, listener, options) => {
    if (type === 'keydown') keyListeners.add(listener)
    nativeAddEventListener(type, listener, options)
  })
  t.mock.method(dom.window.document, 'removeEventListener', (type, listener, options) => {
    if (type === 'keydown') keyListeners.delete(listener)
    nativeRemoveEventListener(type, listener, options)
  })
  const { createRoot } = await import('react-dom/client')
  let server, root, router
  async function cleanup() {
    if (root) { await act(async () => root.unmount()); root = null }
    router?.dispose()
    router = null
  }
  async function run(name, body) {
    await t.test(name, async subtest => {
      subtest.after(async () => {
        await cleanup()
        mobile = false
        dom.window.localStorage.clear()
        dom.window.sessionStorage.clear()
        assert.equal(frames.size, 0, 'animation frames are canceled or flushed')
        assert.equal(expiryTimers.size, 0, 'authentication expiry timers are cleared')
        assert.equal(listeners.size, 0, 'media listeners are removed')
        assert.equal(keyListeners.size, 0, 'keyboard listeners are removed')
        assert.equal(document.body.style.overflow, '', 'drawer scroll lock is released')
      })
      await body()
    })
  }
  try {
    server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
    const { default: App } = await server.ssrLoadModule('/src/App.jsx')
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const { default: AuthProvider } = await server.ssrLoadModule('/src/auth/AuthContext.jsx')
    const { default: Shell } = await server.ssrLoadModule('/src/components/portal/PortalShell.jsx')
    const { default: Dashboard } = await server.ssrLoadModule('/src/pages/attendee/AttendeeDashboard.jsx')
    const { demoAccounts } = await server.ssrLoadModule('/src/auth/demoConfig.js')
    const demo = { user: { role: 'ATTENDEE', displayName: demoAccounts.ATTENDEE.displayName }, authSource: 'demo', isAuthenticated: true, isLoading: false }
    let logoutCalls = 0
    async function mount(route, auth = demo, Page = App, props, realProvider = false) {
      await cleanup()
      if (realProvider) {
        dom.window.history.replaceState({}, '', route)
        root = createRoot(document.getElementById('root'))
        await act(async () => root.render(h(BrowserRouter, null, h(AuthProvider, null, h(App)))))
        await frame()
        return
      }
      router = createMemoryRouter([{ path: '*', element: h(AuthContext.Provider, { value: { ...auth, logout: () => { logoutCalls++; return router.navigate('/') } } }, Page === App ? h(Page, props) : h(Shell, null, h(Page, props))) }], { initialEntries: [route] })
      root = createRoot(document.getElementById('root'))
      await act(async () => root.render(h(RouterProvider, { router })))
      await frame()
    }
    async function frame() {
      await act(async () => {
        const pending = [...frames]
        for (const [id, callback] of pending) {
          if (!frames.delete(id)) continue
          callback(0)
        }
      })
    }
    async function navigate(path) { await act(async () => router.navigate(path)); await frame() }
    async function click(node) { assert.ok(node); await act(async () => node.click()); await frame() }
    const button = label => [...document.querySelectorAll('button')].find(node => node.textContent.trim() === label)
    const nav = () => document.querySelector('nav[aria-label="Portal navigation"]')
    const link = to => nav()?.querySelector(`a[href="${to}"]`)
    const text = () => document.body.textContent
    async function key(value) { await act(async () => document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }))) }
    async function field(selector, value) {
      const node = document.querySelector(selector)
      assert.ok(node, selector)
      const prototype = node.tagName === 'SELECT' ? dom.window.HTMLSelectElement.prototype : dom.window.HTMLInputElement.prototype
      await act(async () => {
        Object.getOwnPropertyDescriptor(prototype, 'value').set.call(node, value)
        node.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
        node.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
      })
    }
    async function submit() { await act(async () => document.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))) }
    function assertShell() {
      assert.equal(document.querySelectorAll('.steam-portal-shell').length, 1)
      assert.equal(document.querySelectorAll('main').length, 1)
      assert.equal(document.querySelectorAll('header').length, 1)
      assert.equal(document.querySelectorAll('nav[aria-label="Portal navigation"]').length, 1)
      assert.equal([...document.querySelectorAll('button')].filter(node => node.textContent === 'Log out').length, 1)
      assert.equal(document.querySelector('.attendee-header, .booking-page-header'), null)
      assert.doesNotMatch(nav().textContent, /My proposals|Speaking schedule|Speaker/)
      const unavailable = [...nav().querySelectorAll('.steam-portal-unavailable')]
      assert.equal(unavailable.length, 2)
      assert.ok(unavailable.every(node => node.tabIndex === -1 && !node.querySelector('a, button, input')))
    }

    await run('dashboard identity, existing sections, summaries and attendee navigation', async () => {
      await mount('/attendee')
      assertShell()
      assert.ok(document.querySelector('main .attendee-portal'))
      assert.match(text(), /Avery/)
      assert.match(text(), /Avery Johnson/)
      for (const id of ['admission', 'bookings', 'schedule', 'itinerary', 'discover']) assert.ok(document.getElementById(id))
      assert.equal(document.querySelectorAll('.attendee-summary-card').length, 3)
      assert.equal(document.querySelectorAll('.attendee-booking-card').length, 3)
      assert.match(text(), /All-Access Pass|SC-2048/)
      assert.equal(document.querySelectorAll('#schedule .attendee-session').length, attendeeData.sessions.filter(item => item.enrolled).length)
      for (const destination of ['/events', '/attendee#schedule', '/attendee#itinerary', '/attendee/travel', '/attendee/hotel', '/attendee/car', '/attendee']) assert.ok(link(destination), destination)
      assert.equal(link('/attendee').getAttribute('aria-current'), 'page')
      assert.equal(document.querySelector('input[type="search"]'), null)
      const identity = { user: { roles: ['ATTENDEE'], role: 'ATTENDEE', displayName: 'Real attendee', email: 'real@example.test' }, authSource: 'backend', isAuthenticated: true, isLoading: false }
      await mount('/attendee', identity)
      assert.match(document.querySelector('nav[aria-label="Account navigation"]').textContent, /Real attendee/)
      assert.match(document.querySelector('#admission').textContent, /Real attendee/)
      assert.doesNotMatch(text(), /Avery/)
      assert.match(text(), /Attendee workspace preview/, 'existing preview content is still identified honestly')
    })

    await run('schedule enrollment, mandatory sessions, track filters and itinerary still work', async () => {
      await mount('/attendee')
      const mandatory = document.querySelector('#schedule button:disabled')
      assert.ok(mandatory)
      const optional = document.querySelector('#discover .attendee-session button:not(:disabled):not(.is-selected)')
      const title = optional.closest('article').querySelector('h3').textContent
      const count = document.querySelectorAll('#schedule .attendee-session').length
      await click(optional)
      assert.equal(document.querySelectorAll('#schedule .attendee-session').length, count + 1)
      assert.match(document.querySelector('#attendee-notice').textContent, /added to your schedule/)
      assert.ok(document.querySelector('#itinerary').textContent.includes(title))
      const remove = [...document.querySelectorAll('#schedule article')].find(node => node.querySelector('h3').textContent === title).querySelector('button')
      await click(remove)
      assert.equal(document.querySelectorAll('#schedule .attendee-session').length, count)
      await click([...document.querySelectorAll('.attendee-filters button')].find(node => node.textContent.trim() === 'Art'))
      assert.equal(document.querySelectorAll('#discover .attendee-session').length, attendeeData.sessions.filter(item => item.track === 'Art').length)
      const empty = { ...attendeeData, sessions: [], itinerary: [], bookings: [] }
      await mount('/attendee', demo, Dashboard, { data: empty })
      assert.match(document.querySelector('#itinerary summary').textContent, /0 entries/)
      assert.equal(document.querySelectorAll('#schedule .attendee-session').length, 0)
    })

    await run('all four actual routes retain authentication and role guards, headings and form controls', async () => {
      for (const [index, path] of paths.entries()) {
        await mount(path)
        assertShell()
        assert.equal(document.querySelector('h1').textContent, headings[index])
        assert.equal(link(path).getAttribute('aria-current'), 'page')
        if (index) assert.ok(document.querySelector('main form'))
        await mount(path, { user: null, isAuthenticated: false, isLoading: false })
        assert.equal(router.state.location.pathname, '/login')
        assert.equal(document.querySelector('.steam-portal-shell'), null)
        await mount(path, { user: { role: 'SPEAKER' }, isAuthenticated: true, isLoading: false })
        assert.equal(router.state.location.pathname, '/access-denied')
        await mount(path, { user: null, isAuthenticated: false, isLoading: true })
        assert.match(text(), /Signing in/)
      }
    })

    await run('travel/car/hotel errors, saved confirmations and dashboard itinerary remain local', async () => {
      await mount('/attendee/travel')
      for (const [name, value] of Object.entries({ origin: 'Boston', destination: 'New York', departureDate: '2027-06-10', departureTime: '08:00', returnDate: '2027-06-09', returnTime: '18:00' })) await field(`[name="${name}"]`, value)
      await submit()
      assert.match(document.querySelector('.travel-form-error').textContent, /Return must be after/)
      await field('[name="returnDate"]', '2027-06-13')
      await submit()
      assert.match(text(), /Your travel is booked/)
      await navigate('/attendee/car')
      for (const [name, value] of Object.entries({ pickupLocation: 'JFK', dropoffLocation: 'JFK', pickupDate: '2027-06-10', pickupTime: '10:00', dropoffDate: '2027-06-09', dropoffTime: '16:00' })) await field(`[name="${name}"]`, value)
      await submit()
      assert.match(document.querySelector('.travel-form-error').textContent, /Drop-off must be after/)
      await field('[name="dropoffDate"]', '2027-06-13')
      await submit()
      assert.match(text(), /Your rental car is booked/)
      await navigate('/attendee/hotel')
      await submit()
      assert.match(document.querySelector('.travel-form-error').textContent, /Choose a hotel/)
      await click(document.querySelector('.hotel-card button'))
      await field('.hotel-search-bar label:nth-child(1) input', '2027-06-10')
      await field('.hotel-search-bar label:nth-child(2) input', '2027-06-09')
      await submit()
      assert.match(document.querySelector('.travel-form-error').textContent, /Check-out must be after/)
      await field('.hotel-search-bar label:nth-child(2) input', '2027-06-13')
      await submit()
      assert.match(text(), /Your hotel is booked/)
      for (const path of paths.slice(1)) { await navigate(path); assert.match(text(), /is booked/); assertShell() }
      await navigate('/attendee')
      assert.match(document.querySelector('#itinerary').textContent, /Boston|JFK|Staybridge Suites/)
      assert.ok([...document.querySelectorAll('.attendee-booking-status')].every(node => node.textContent === 'Booked'))
      dom.window.localStorage.clear()
    })

    await run('cross-page, direct and Back/Forward schedule/itinerary hashes focus existing targets', async () => {
      await mount('/attendee/travel')
      for (const id of ['schedule', 'itinerary']) {
        await click(link(`/attendee#${id}`))
        assert.ok(document.activeElement === document.getElementById(id), `${id} receives focus`)
        assert.deepEqual(scrolls.at(-1), [id, { behavior: 'instant', block: 'start' }])
        assert.equal(link(`/attendee#${id}`).getAttribute('aria-current'), 'page')
      }
      await navigate(-1)
      assert.ok(document.activeElement === document.getElementById('schedule'), 'schedule receives focus')
      await navigate(1)
      assert.ok(document.activeElement === document.getElementById('itinerary'), 'itinerary receives focus')
      await mount('/attendee#schedule')
      assert.ok(document.activeElement === document.getElementById('schedule'), 'schedule receives focus')
      await navigate('/attendee#missing-target')
      assert.ok(document.getElementById('schedule'))
    })

    await run('integrated mobile menu dismissal, navigation, focus return and hidden links', async () => {
      mobile = true
      await mount('/attendee')
      const menu = button('Menu')
      assert.ok(menu)
      assert.equal(nav(), null)
      for (const action of ['Escape', 'outside', 'Close menu', 'selection']) {
        await click(menu)
        assert.ok(document.activeElement === button('Close menu'), 'Close menu receives focus')
        assert.ok(nav())
        assert.equal(menu.getAttribute('aria-expanded'), 'true')
        if (action === 'Escape') await key('Escape')
        else if (action === 'outside') await click(document.querySelector('.steam-portal-backdrop'))
        else if (action === 'Close menu') await click(button('Close menu'))
        else await click(link('/attendee/travel'))
        assert.equal(nav(), null)
        assert.equal(menu.getAttribute('aria-expanded'), 'false')
        // The shared route layout keeps the same Menu button across pages.
        assert.ok(document.activeElement === button('Menu'), `Menu receives focus; active element is ${document.activeElement.tagName}`)
        assert.equal(document.body.style.overflow, '')
      }
      mobile = false
    })

    await run('public registration links and speaker destinations retain their existing presentation', async () => {
      await mount('/register')
      assert.ok(document.querySelector('h1'))
      assert.equal(document.querySelector('.steam-portal-shell'), null)
      await mount('/events')
      assert.ok(document.querySelector('nav[aria-label="Main navigation"]'))
      assert.equal(document.querySelector('.steam-portal-shell'), null)
      await mount('/speaker', { user: { role: 'SPEAKER', displayName: 'Bill Nye' }, authSource: 'demo', isAuthenticated: true, isLoading: false })
      assert.ok(document.querySelector('.portal-header'))
      assert.match(text(), /Bill Nye/)
      assert.equal(document.querySelector('.steam-portal-shell'), null)
      await mount('/attendee')
      await click(button('Log out'))
      assert.equal(logoutCalls, 1)
      assert.equal(router.state.location.pathname, '/')
      assert.equal(document.querySelector('.steam-portal-shell'), null)
    })

    await run('real demo authentication restores Avery and logout clears the existing session', async () => {
      dom.window.sessionStorage.setItem('steamcon.auth', JSON.stringify({ source: 'demo', expiresAt: new Date(Date.now() + 60000).toISOString(), user: { role: 'ATTENDEE', email: demoAccounts.ATTENDEE.email } }))
      await mount('/attendee', demo, App, undefined, true)
      assertShell()
      assert.match(text(), /Avery/)
      assert.equal(expiryTimers.size, 1, 'restored session has one expiry timer')
      await click(button('Log out'))
      assert.equal(expiryTimers.size, 0, 'logout clears the expiry timer')
      assert.equal(dom.window.sessionStorage.getItem('steamcon.auth'), null)
      assert.equal(document.querySelector('.steam-portal-shell'), null)
      assert.ok(document.querySelector('a[href="/login"]'), 'logged-out account navigation is restored')
      await act(async () => {
        dom.window.history.pushState({}, '', '/attendee')
        dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'))
      })
      assert.equal(dom.window.location.pathname, '/login')
    })
    assert.equal(requests.mock.callCount(), 0)
  } finally {
    try { await cleanup() }
    finally {
      try { await server?.close() }
      finally {
        for (const timer of expiryTimers) nativeClearTimeout(timer)
        frames.clear()
      }
    }
  }
})
