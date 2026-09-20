import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'
import { act, createElement as h } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

const discovery = ['/', '/events', '/tracks', '/speakers', '/travel']

test('real application selects public or persistent portal presentation without changing discovery content', async t => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost', pretendToBeVisual: true })
  let mobile = false
  const listeners = new Set()
  const frames = new Map()
  let frameId = 0
  dom.window.requestAnimationFrame = cb => { frames.set(++frameId, cb); return frameId }
  dom.window.cancelAnimationFrame = id => frames.delete(id)
  dom.window.matchMedia = () => ({ get matches() { return mobile }, addEventListener: (_, cb) => listeners.add(cb), removeEventListener: (_, cb) => listeners.delete(cb) })
  const scrolls = []
  dom.window.scrollTo = (x, y) => scrolls.push([x, y])
  Object.defineProperty(dom.window, 'scrollY', { value: 350 })
  dom.window.HTMLElement.prototype.scrollIntoView = () => {}
  const nativeFocus = dom.window.HTMLElement.prototype.focus
  dom.window.HTMLElement.prototype.focus = function (...args) {
    for (let node = this; node; node = node.parentElement) if (node.inert) return
    nativeFocus.apply(this, args)
  }
  for (const [name, value] of Object.entries({ window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage, requestAnimationFrame: dom.window.requestAnimationFrame, IS_REACT_ACT_ENVIRONMENT: true })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name])
  }
  const requests = t.mock.method(globalThis, 'fetch', () => { throw new Error('Demo layout must not call an API') })
  const { createRoot } = await import('react-dom/client')
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  let root, router, auth
  try {
    const { default: App } = await server.ssrLoadModule('/src/App.jsx')
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const anonymous = () => ({ user: null, isAuthenticated: false, isLoading: false, authSource: null, hasBackendSession: false })
    const render = () => root.render(h(AuthContext.Provider, { value: auth }, h(RouterProvider, { router })))
    const login = async role => {
      auth = { user: { role, id: `demo-${role}`, displayName: role === 'SPEAKER' ? 'Bill Nye' : 'Avery' }, isAuthenticated: true, isLoading: false, authSource: 'demo', hasBackendSession: false,
        logout: async () => { auth = anonymous(); render() } }
      await act(async () => render())
      await frame()
    }
    const frame = async () => { await act(async () => { for (const [id, cb] of [...frames]) if (frames.delete(id)) cb(0) }) }
    const navigate = async path => { await act(async () => router.navigate(path)); await frame() }
    const click = async node => { assert.ok(node); await act(async () => node.click()); await frame() }
    const button = label => [...document.querySelectorAll('button')].find(node => node.textContent.trim() === label)
    const nav = () => document.querySelector('nav[aria-label="Portal navigation"]')
    const link = path => nav()?.querySelector(`a[href="${path}"]`)
    const shell = () => document.querySelector('.steam-portal-shell')
    const expectPortal = () => {
      assert.equal(document.querySelectorAll('.steam-portal-shell').length, 1)
      assert.equal(document.querySelectorAll('header').length, 1)
      assert.equal(document.querySelectorAll('.steam-portal-sidebar').length, mobile ? 0 : 1)
      assert.equal(document.querySelector('.site-header'), null)
      assert.equal([...document.querySelectorAll('button')].filter(node => node.textContent.trim() === 'Log out').length, 1)
      assert.equal(document.querySelectorAll('main').length, 1, 'no nested main landmarks')
    }
    const contentSignature = () => ({
      mainClass: document.querySelector('main').className,
      headings: [...document.querySelectorAll('main h1, main h2')].map(node => node.textContent),
      graphics: [...document.querySelectorAll('main svg, main img')].map(node => node.outerHTML),
      filters: [...document.querySelectorAll('main select, main input, main [aria-label="Choose an event experience"]')].map(node => node.outerHTML.replace(/_r_[a-z0-9]+_/g, 'react-id')),
      footer: document.querySelector('footer').outerHTML,
    })
    auth = anonymous()
    router = createMemoryRouter([{ path: '*', element: h(App) }], { initialEntries: ['/'] })
    root = createRoot(document.getElementById('root'))
    await act(async () => render())
    const publicContent = new Map()
    for (const path of discovery) {
      await navigate(path)
      assert.equal(shell(), null)
      assert.equal(document.querySelectorAll('.site-header').length, 1)
      assert.equal(document.querySelectorAll('header').length, 1)
      assert.ok(document.querySelector('nav[aria-label="Main navigation"]'))
      publicContent.set(path, contentSignature())
    }
    for (const role of ['ATTENDEE', 'SPEAKER']) {
      await navigate('/')
      await login(role)
      const originalShell = shell()
      const topbar = document.querySelector('.steam-portal-topbar')
      const sidebar = document.querySelector('.steam-portal-sidebar')
      await click(document.querySelector('.steam-portal-toggle'))
      assert.ok(shell().classList.contains('steam-portal-collapsed'))
      const portalPaths = role === 'ATTENDEE' ? ['/attendee', '/attendee/travel', '/attendee/hotel', '/attendee/car'] : ['/speaker', '/speaker/profile/edit', '/speaker/forums', '/speaker/proposals/new', '/speaker/proposals/bill-nye-science-keynote']
      for (const path of [...discovery, ...portalPaths]) {
        await navigate(path)
        expectPortal()
        assert.equal(shell(), originalShell, `${path}: shell stays mounted`)
        assert.equal(document.querySelector('.steam-portal-topbar'), topbar)
        assert.equal(document.querySelector('.steam-portal-sidebar'), sidebar)
        assert.ok(shell().classList.contains('steam-portal-collapsed'))
        if (discovery.includes(path)) {
          assert.deepEqual(contentSignature(), publicContent.get(path), `${path}: public content, graphics, filters and footer preserved`)
          assert.equal(link(path).getAttribute('aria-current'), 'page')
        }
      }
      await navigate(role === 'ATTENDEE' ? '/attendee#itinerary' : '/speaker#speaker-proposals')
      assert.equal(link(role === 'ATTENDEE' ? '/attendee#itinerary' : '/speaker#speaker-proposals').getAttribute('aria-current'), 'page')
      assert.equal(Boolean(link('/speaker#speaker-proposals')), role === 'SPEAKER')
      assert.equal(Boolean(link('/attendee/travel')), role === 'ATTENDEE')
      assert.ok(link('/travel'), 'planning is separate from booking')
      if (role === 'SPEAKER') assert.match(nav().textContent, /No Speaker travel booking destination/)
      await navigate('/events?experience=workshops#experience-heading')
      assert.equal(link('/events').getAttribute('aria-current'), 'page')
      for (const path of ['/login', '/register', '/register?role=speaker', '/registration-qr', '/access-denied']) {
        await navigate(path)
        assert.equal(shell(), null, `${path} excludes portal presentation`)
      }
      await navigate('/events')
      assert.ok(shell().classList.contains('steam-portal-collapsed'), 'collapse survives excluded routes')
      await click(document.querySelector('.steam-portal-toggle'))
      assert.equal(shell().classList.contains('steam-portal-collapsed'), false)
      await click(button('Log out'))
      assert.equal(router.state.location.pathname, '/events')
      assert.equal(shell(), null)
      assert.equal(document.querySelectorAll('.site-header').length, 1)
      assert.deepEqual(contentSignature(), publicContent.get('/events'))
    }
    await login('ATTENDEE')
    await act(async () => { mobile = true; listeners.forEach(cb => cb()) })
    document.body.style.overflow = 'auto'
    const restored = () => {
      assert.equal(document.body.style.overflow, 'auto')
      assert.equal(document.body.style.position, '')
      assert.ok(scrolls.some(([x, y]) => x === 0 && y === 350))
      assert.equal(document.activeElement, button('Menu'))
      assert.equal(nav(), null, 'hidden links are unmounted')
    }
    const key = async (key, shiftKey = false) => { await act(async () => document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }))); await frame() }
    for (const dismiss of ['close', 'escape', 'outside', 'selection', 'route']) {
      await click(button('Menu'))
      assert.equal(document.body.style.overflow, 'hidden')
      assert.equal(document.body.style.position, 'fixed')
      assert.equal(document.body.style.top, '-350px')
      assert.equal(document.querySelector('.steam-portal-workspace').inert, true)
      const wheel = new dom.window.Event('wheel', { bubbles: true, cancelable: true })
      document.body.dispatchEvent(wheel)
      assert.equal(wheel.defaultPrevented, true)
      assert.equal(document.activeElement, button('Close menu'))
      await key('Tab', true)
      assert.equal(document.activeElement, nav().querySelectorAll('a').item(nav().querySelectorAll('a').length - 1))
      await key('Tab')
      assert.equal(document.activeElement, button('Close menu'))
      if (dismiss === 'close') await click(button('Close menu'))
      if (dismiss === 'escape') await key('Escape')
      if (dismiss === 'outside') await click(document.querySelector('.steam-portal-backdrop'))
      if (dismiss === 'selection') await click(link('/tracks'))
      if (dismiss === 'route') await navigate('/attendee')
      restored()
    }
    await navigate('/travel')
    await click(button('Menu'))
    await click(button('Log out'))
    assert.equal(shell(), null)
    assert.ok(document.querySelector('.site-header'))
    assert.equal(document.body.style.overflow, 'auto', 'logout releases mobile lock')
    assert.equal(document.body.style.position, '')
    // Exercise logout with the actual centralized provider and its existing redirect.
    await act(async () => root.unmount())
    router.dispose()
    mobile = false
    const { default: AuthProvider } = await server.ssrLoadModule('/src/auth/AuthContext.jsx')
    const { demoAccounts } = await server.ssrLoadModule('/src/auth/demoConfig.js')
    window.sessionStorage.setItem('steamcon.auth', JSON.stringify({ source: 'demo', expiresAt: new Date(Date.now() + 60000).toISOString(), user: { role: 'ATTENDEE', email: demoAccounts.ATTENDEE.email } }))
    router = createMemoryRouter([{ path: '*', element: h(AuthProvider, null, h(App)) }], { initialEntries: ['/events'] })
    root = createRoot(document.getElementById('root'))
    await act(async () => root.render(h(RouterProvider, { router })))
    expectPortal()
    await click(button('Log out'))
    assert.equal(router.state.location.pathname, '/', 'existing provider logout redirect is preserved')
    assert.equal(shell(), null)
    assert.equal(document.querySelectorAll('.site-header').length, 1)
    assert.equal(window.sessionStorage.getItem('steamcon.auth'), null)
    assert.equal(requests.mock.callCount(), 0, 'layout does not change source or API boundaries')
  } finally {
    if (root) await act(async () => root.unmount())
    router?.dispose()
    await server.close()
    dom.window.close()
  }
})

test('layout changes leave discovery features and reduced motion in their existing components', async () => {
  const source = async path => readFile(new URL(`../src/${path}`, import.meta.url), 'utf8')
  const layout = await source('components/layout/ApplicationLayout.jsx')
  assert.doesNotMatch(layout, /fetch\(|services\/|mocks\/|fixtures\//)
  assert.match(layout, /useAuth/)
  assert.match(layout, /<PortalShell/)
  const home = await source('pages/HomePage.jsx')
  for (const component of ['ConventionCountdown', 'Hero', 'PublicProgram', 'SpeakerCallout', 'Footer']) assert.ok(home.includes(`<${component} />`))
  assert.match(await source('components/portal/portal.css'), /prefers-reduced-motion/)
})
