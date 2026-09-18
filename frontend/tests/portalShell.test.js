import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { createServer } from 'vite'
import { JSDOM } from 'jsdom'
import { createElement as h, act } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { getPortalNavigation } from '../src/components/portal/portalNavigation.js'

const source = path => readFile(new URL(`../src/${path}`, import.meta.url), 'utf8')

test('navigation destinations match existing route declarations and section targets', async () => {
  const app = await source('App.jsx')
  const sections = (await Promise.all([
    'pages/attendee/AttendeeDashboard.jsx', 'pages/speaker/SpeakerDashboard.jsx',
    'components/speaker/SpeakerHeader.jsx', 'components/speaker/SpeakerItinerary.jsx',
  ].map(source))).join('\n')
  for (const role of ['ATTENDEE', 'SPEAKER']) {
    for (const item of getPortalNavigation({ role })) {
      if (!item.to) { assert.ok(item.unavailable); continue }
      const [path, hash] = item.to.split('#')
      assert.ok(app.includes(`path="${path}"`), item.to)
      if (hash) assert.ok(sections.includes(`id="${hash}"`), item.to)
    }
  }
  const speaker = getPortalNavigation({ roles: ['SPEAKER'] })
  assert.equal(speaker.find(item => item.id === 'travel').to, null)
  assert.equal(speaker.find(item => item.id === 'hotel').to, null)
  assert.equal(speaker.find(item => item.id === 'car').to, null)
  assert.ok(speaker.every(item => !item.to?.startsWith('/attendee')))
  const both = getPortalNavigation({ roles: ['ATTENDEE', 'SPEAKER'] })
  assert.equal(both.find(item => item.id === 'hotel').to, '/attendee/hotel')
  assert.equal(both.find(item => item.id === 'itinerary').to, '/speaker#speaker-itinerary')
  assert.deepEqual(getPortalNavigation({ displayName: 'Demo Speaker' }), [])
})

test('shell is isolated from pages, API adapters and fixtures', async () => {
  const app = await source('App.jsx')
  assert.match(app, /<Route element=\{<ApplicationLayout \/>\}>[\s\S]*role="ATTENDEE"[\s\S]*role="SPEAKER"/)
  const directory = new URL('../src/components/portal/', import.meta.url)
  for (const name of await readdir(directory)) {
    if (!/\.(jsx|js)$/.test(name)) continue
    const content = await readFile(new URL(name, directory), 'utf8')
    assert.doesNotMatch(content, /fetch\(|axios|services\/|mocks\/|fixtures\/|useSpeakerResource/)
  }
  const shell = await source('components/portal/PortalShell.jsx')
  const topbar = await source('components/portal/PortalTopbar.jsx')
  assert.match(shell, /useAuth/)
  assert.match(topbar, /<AccountNavigation/)
  const css = await source('components/portal/portal.css')
  assert.match(css, /prefers-reduced-motion/)
  assert.match(css, /:focus-visible/)
  assert.match(css, /steam-portal-sidebar[^}]*position: sticky[^}]*height: 100dvh[^}]*overflow: hidden/)
  assert.match(css, /steam-portal-navigation[^}]*min-height: 0[^}]*overflow-y: auto/)
  assert.match(css, /steam-portal-drawer-layer \{ position: fixed; inset: 0/)
  for (const role of ['ATTENDEE', 'SPEAKER']) {
    const block = app.split(`role="${role}"`)[1].split('</Route>\n        </Route>')[0]
    const paths = role === 'ATTENDEE' ? ['/attendee', '/attendee/travel', '/attendee/hotel', '/attendee/car'] : ['/speaker', '/speaker/profile/edit', '/speaker/forums', '/speaker/proposals/new', '/speaker/proposals/:proposalId']
    for (const path of paths) assert.ok(block.includes(`path="${path}"`), `${path} stays in PortalShell`)
  }
})

test('rendered shell navigation, content, authentication and mobile keyboard behavior', async t => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://steamcon.test', pretendToBeVisual: true })
  let mobile = false
  const scrollCalls = []
  dom.window.scrollTo = (x, y) => { scrollCalls.push([x, y]) }
  Object.defineProperty(dom.window, 'scrollY', { configurable: true, value: 420 })
  Object.defineProperty(dom.window, 'scrollX', { configurable: true, value: 12 })
  const listeners = new Set()
  const media = { get matches() { return mobile }, addEventListener: (_, listener) => listeners.add(listener), removeEventListener: (_, listener) => listeners.delete(listener) }
  dom.window.matchMedia = query => { assert.equal(query, '(max-width: 760px)'); return media }
  for (const [name, value] of Object.entries({ window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name])
  }
  // JSDOM does not implement inert focus blocking; emulate the browser rule.
  const nativeFocus = dom.window.HTMLElement.prototype.focus
  t.mock.method(dom.window.HTMLElement.prototype, 'focus', function (...args) {
    for (let node = this; node; node = node.parentElement) if (node.inert) return
    nativeFocus.apply(this, args)
  })
  const { createRoot } = await import('react-dom/client')
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  let root, router
  let requests = 0
  t.mock.method(globalThis, 'fetch', () => { requests++; throw new Error('Shell must not make API requests') })
  try {
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const { default: Shell } = await server.ssrLoadModule('/src/components/portal/PortalShell.jsx')
    const { default: ProtectedRoute } = await server.ssrLoadModule('/src/auth/ProtectedRoute.jsx')
    const { default: RoleRoute } = await server.ssrLoadModule('/src/auth/RoleRoute.jsx')
    let logoutCalls = 0
    async function mount(user, route = '/events', authenticated = true, guarded = false) {
      if (root) await act(async () => root.unmount())
      router?.dispose()
      const shell = h(Shell, null, h('article', { 'data-testid': 'content' }, h('h1', null, 'Original page'), h('button', { type: 'button' }, 'Child action')))
      const routes = guarded ? [
        { element: h(ProtectedRoute), children: [{ element: h(RoleRoute, { role: 'SPEAKER' }), children: [{ path: '/speaker', element: shell }] }] },
        { path: '/login', element: h('p', null, 'Login destination') },
        { path: '/access-denied', element: h('p', null, 'Access denied destination') },
        { path: '/', element: h('p', null, 'Public homepage') },
      ] : [{ path: '*', element: shell }]
      router = createMemoryRouter(routes, { initialEntries: [route] })
      root = createRoot(document.getElementById('root'))
      await act(async () => root.render(h(AuthContext.Provider, { value: { user, isAuthenticated: authenticated, isLoading: false, logout: () => { logoutCalls++ } } }, h(RouterProvider, { router }))))
    }
    const navLinks = () => [...document.querySelectorAll('nav[aria-label="Portal navigation"] a')]
    const findLink = label => navLinks().find(link => link.querySelector('span')?.textContent === label)
    const findButton = label => [...document.querySelectorAll('button')].find(button => button.textContent === label)
    const assertRestored = () => {
      assert.equal(document.body.style.overflow, 'scroll')
      assert.equal(document.body.style.position, '')
      assert.deepEqual(scrollCalls.at(-1), [12, 420])
    }
    async function click(node) { assert.ok(node); await act(async () => node.click()) }
    async function key(value, shiftKey = false) { await act(async () => document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: value, shiftKey, bubbles: true, cancelable: true }))) }

    for (const role of ['ATTENDEE', 'SPEAKER']) {
      await mount({ role, displayName: 'Authenticated identity' })
      assert.equal(document.querySelector('[data-testid="content"]').innerHTML, '<h1>Original page</h1><button type="button">Child action</button>')
      assert.ok(document.body.textContent.includes('Authenticated identity'))
      for (const item of getPortalNavigation({ role })) {
        if (item.to) assert.equal(findLink(item.label)?.getAttribute('href'), item.to)
        else assert.equal(findLink(item.label), undefined)
      }
      assert.equal(Boolean(findLink('My proposals')), role === 'SPEAKER')
      assert.equal(Boolean(findLink('Speaking schedule')), role === 'SPEAKER')
      assert.equal(findLink('Explore').getAttribute('aria-current'), 'page')
      assert.equal(document.querySelector('input[type="search"]'), null)
      const account = document.querySelector('nav[aria-label="Account navigation"]')
      assert.equal(account.querySelector('a').getAttribute('href'), role === 'SPEAKER' ? '/speaker' : '/attendee')
      await click(findButton('Log out'))
    }
    assert.equal(logoutCalls, 2)
    await click(document.querySelector('.steam-portal-toggle'))
    assert.equal(document.querySelector('.steam-portal-toggle').getAttribute('aria-expanded'), 'false')
    assert.ok(document.querySelector('.steam-portal-collapsed'))
    assert.equal(window.sessionStorage.getItem('steam-portal-sidebar-collapsed'), 'true')
    await act(async () => router.navigate('/attendee/hotel'))
    assert.ok(document.querySelector('.steam-portal-collapsed'))
    await mount({ roles: ['SPEAKER'], displayName: 'Roles array' }, '/speaker#speaker-proposals')
    assert.ok(document.querySelector('.steam-portal-collapsed'), 'session state survives shell remount')
    assert.equal(findLink('My proposals').title, 'My proposals')
    await click(document.querySelector('.steam-portal-toggle'))
    assert.equal(document.querySelector('.steam-portal-toggle').getAttribute('aria-expanded'), 'true')
    assert.equal(window.sessionStorage.getItem('steam-portal-sidebar-collapsed'), 'false')
    assert.equal(findLink('My proposals').getAttribute('aria-current'), 'page')
    assert.equal(document.querySelectorAll('a[aria-current="page"]').length, 1)
    await act(async () => router.navigate('/speaker#speaker-itinerary'))
    assert.equal(findLink('My itinerary').getAttribute('aria-current'), 'page')
    await mount({ role: 'ATTENDEE', displayName: 'Speaker Demo' }, '/speaker')
    assert.equal(findLink('My proposals'), undefined)

    await act(async () => { mobile = true; listeners.forEach(listener => listener()) })
    const menu = findButton('Menu')
    const layer = document.querySelector('.steam-portal-drawer-layer')
    assert.equal(layer.hidden, true)
    assert.equal(navLinks().length, 0, 'closed drawer links are unmounted')
    assert.equal(menu.getAttribute('aria-expanded'), 'false')
    document.body.style.overflow = 'scroll'
    await click(menu)
    assert.equal(document.body.style.position, 'fixed')
    assert.equal(document.body.style.top, '-420px')
    for (const type of ['wheel', 'touchmove']) {
      const event = new dom.window.Event(type, { bubbles: true, cancelable: true })
      document.body.dispatchEvent(event)
      assert.equal(event.defaultPrevented, true)
    }
    for (const value of ['PageDown', ' ', 'ArrowDown', 'Home', 'End']) {
      const event = new dom.window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true })
      document.dispatchEvent(event)
      assert.equal(event.defaultPrevented, true)
    }
    assert.equal(layer.hidden, false)
    assert.equal(menu.getAttribute('aria-expanded'), 'true')
    assert.equal(document.activeElement, findButton('Close menu'))
    assert.equal(document.querySelector('.steam-portal-workspace').inert, true)
    assert.equal(document.body.style.overflow, 'hidden')
    await key('Tab', true)
    assert.equal(document.activeElement, navLinks().at(-1))
    await key('Tab')
    assert.equal(document.activeElement, findButton('Close menu'))
    await key('Escape')
    assert.equal(document.activeElement, menu)
    assert.equal(layer.hidden, true)
    assert.equal(navLinks().length, 0)
    assert.equal(document.querySelector('.steam-portal-workspace').inert, false)
    assert.equal(document.body.style.overflow, 'scroll')
    assert.equal(document.body.style.position, '')
    assert.deepEqual(scrollCalls.at(-1), [12, 420])
    await click(menu)
    await click(document.querySelector('.steam-portal-backdrop'))
    assertRestored()
    assert.equal(layer.hidden, true)
    assert.equal(document.activeElement, menu)
    await click(menu)
    await click(findLink('Explore'))
    assertRestored()
    assert.equal(router.state.location.pathname, '/events')
    assert.equal(layer.hidden, true)
    assert.equal(document.activeElement, menu)
    await click(menu)
    await click(findButton('Close menu'))
    assertRestored()
    assert.equal(document.activeElement, menu)
    await click(menu)
    await act(async () => router.navigate('/attendee/hotel'))
    assert.equal(layer.hidden, true, 'route change dismisses drawer')
    assert.equal(document.body.style.overflow, 'scroll')
    assert.deepEqual(scrollCalls.at(-1), [12, 420])
    await act(async () => new Promise(resolve => window.requestAnimationFrame(resolve)))
    assert.equal(document.activeElement, menu)
    await click(menu)
    await act(async () => { mobile = false; listeners.forEach(listener => listener()) })
    assert.equal(document.querySelector('[role="dialog"]'), null)
    assert.equal(document.body.style.overflow, 'scroll')
    assert.equal(document.body.style.position, '')
    assert.deepEqual(scrollCalls.at(-1), [12, 420])
    assert.ok(findLink('Explore'))

    await act(async () => { mobile = true; listeners.forEach(listener => listener()) })
    await click(findButton('Menu'))
    await mount(null, '/events', false)
    assert.equal(document.body.style.overflow, 'scroll', 'unmount restores original overflow')
    assert.equal(document.body.style.position, '')
    assert.deepEqual(scrollCalls.at(-1), [12, 420])
    const wheelAfterUnmount = new dom.window.Event('wheel', { cancelable: true })
    document.dispatchEvent(wheelAfterUnmount)
    assert.equal(wheelAfterUnmount.defaultPrevented, false, 'unmount removes scroll listeners')
    assert.equal(document.querySelector('.steam-portal-shell'), null)
    await mount(null, '/speaker', false, true)
    assert.equal(router.state.location.pathname, '/login')
    await mount({ role: 'ATTENDEE' }, '/speaker', true, true)
    assert.equal(router.state.location.pathname, '/access-denied')
    await act(async () => { mobile = false; listeners.forEach(listener => listener()) })
    await mount({ roles: ['SPEAKER'] }, '/speaker', true, true)
    assert.ok(findLink('My proposals'))
    await act(async () => router.navigate('/'))
    assert.equal(document.body.textContent, 'Public homepage')
    assert.equal(requests, 0)
  } finally {
    if (root) await act(async () => root.unmount())
    router?.dispose()
    await server.close()
    dom.window.close()
  }
})
