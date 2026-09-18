import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { JSDOM } from 'jsdom'
import { createElement as h, act } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

const user = { id: '11111111-1111-4111-8111-111111111111', displayName: 'Real Speaker', role: 'SPEAKER' }
const targets = ['speaker-profile', 'speaker-proposals', 'speaker-engagements', 'speaker-itinerary', 'speaker-updates']

test('rendered speaker hash targets work during loading, failure and history navigation', async t => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://steamcon.test' })
  for (const [name, value] of Object.entries({ window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name])
  }
  const scrolls = []
  dom.window.HTMLElement.prototype.scrollIntoView = function (options) { scrolls.push({ id: this.id, options }) }
  const { createRoot } = await import('react-dom/client')
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  let root, router
  try {
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const { default: Dashboard } = await server.ssrLoadModule('/src/pages/speaker/SpeakerDashboard.jsx')
    const { default: Header } = await server.ssrLoadModule('/src/components/speaker/SpeakerHeader.jsx')
    const { calendarRepository } = await server.ssrLoadModule('/src/services/calendarRepository.js')
    const { notificationRepository } = await server.ssrLoadModule('/src/services/notificationRepository.js')
    t.mock.method(calendarRepository, 'getMyCalendar', async () => [])
    t.mock.method(notificationRepository, 'getNotifications', async () => [])
    const auth = { user, authSource: 'backend', hasBackendSession: true, logout() {} }
    let rejectDashboard
    const repository = {
      getSpeakerDashboard: () => new Promise((resolve, reject) => { rejectDashboard = reject }),
      getMyProposals: async () => [],
    }
    async function mount() {
      if (root) await act(async () => root.unmount())
      router?.dispose()
      router = createMemoryRouter([
        { path: '/speaker', element: h(Dashboard, { repository }) },
        { path: '/speaker/proposals/example', element: h(Header, { speaker: { name: user.displayName, profileEditable: false } }) },
      ], { initialEntries: ['/speaker/proposals/example'] })
      root = createRoot(document.getElementById('root'))
      await act(async () => root.render(h(AuthContext.Provider, { value: auth }, h(RouterProvider, { router }))))
      scrolls.length = 0
    }
    async function navigate(destination) { await act(async () => router.navigate(destination)) }
    function assertTarget(id) {
      assert.ok(document.activeElement === document.getElementById(id), `${id} receives focus`)
      assert.deepEqual(scrolls.at(-1), { id, options: { behavior: 'instant', block: 'start' } })
    }
    const labels = { 'speaker-profile': 'Profile', 'speaker-proposals': 'Proposals', 'speaker-engagements': 'Speaking Schedule', 'speaker-itinerary': 'Itinerary' }
    for (const id of targets) {
      await t.test(`${id}: cross-page navigation focuses the loading target and still works after failure`, async () => {
        await mount()
        if (labels[id]) {
          const link = [...document.querySelectorAll('.portal-nav a')].find(node => node.textContent === labels[id])
          await act(async () => link.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })))
        } else {
          await navigate(`/speaker#${id}`)
        }
        assert.match(document.body.textContent, /Loading proposals/)
        assertTarget(id)
        assert.equal(scrolls.length, 1)
        await act(async () => rejectDashboard(new Error('Dashboard unavailable')))
        assert.match(document.body.textContent, /Unable to load proposals/)
        assertTarget(id)
        assert.equal(scrolls.length, 2)
        await act(async () => root.render(h(AuthContext.Provider, { value: { ...auth } }, h(RouterProvider, { router }))))
        assert.equal(scrolls.length, 2)
        await navigate('/speaker/proposals/example')
        await navigate(`/speaker#${id}`)
        await act(async () => rejectDashboard(new Error('Still unavailable')))
        assertTarget(id)
      })
    }
    await t.test('missing targets are harmless and Back/Forward restores available targets during failure', async () => {
      await mount()
      await navigate('/speaker#not-rendered')
      assert.equal(scrolls.length, 0)
      await act(async () => rejectDashboard(new Error('Dashboard unavailable')))
      assert.equal(scrolls.length, 0)
      await navigate('/speaker#speaker-itinerary')
      assertTarget('speaker-itinerary')
      await navigate('/speaker#speaker-proposals')
      assertTarget('speaker-proposals')
      await navigate(-1)
      assertTarget('speaker-itinerary')
      await navigate(1)
      assertTarget('speaker-proposals')
      assert.equal(scrolls.length, 4)
    })
  } finally {
    if (root) await act(async () => root.unmount())
    router?.dispose()
    await server.close()
    dom.window.close()
  }
})
