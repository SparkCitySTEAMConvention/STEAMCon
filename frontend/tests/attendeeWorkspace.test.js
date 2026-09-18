import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

test('attendee calendar, itinerary, tracks and forum work together', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/attendee' })
  const oldWindow = globalThis.window, oldDocument = globalThis.document
  globalThis.window = dom.window; globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  dom.window.scrollTo = () => {}
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  let root, router
  try {
    const { default: App } = await server.ssrLoadModule('/src/App.jsx')
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const auth = { user: { id: 'demo-ATTENDEE', role: 'ATTENDEE', displayName: 'Avery' }, authSource: 'demo', isAuthenticated: true, isLoading: false }
    router = createMemoryRouter([{ path: '*', element: createElement(AuthContext.Provider, { value: auth }, createElement(App)) }], { initialEntries: ['/attendee'] })
    root = createRoot(document.getElementById('root'))
    await act(async () => root.render(createElement(RouterProvider, { router })))
    assert.deepEqual([...document.querySelectorAll('.workspace-panel h2')].map(e => e.textContent), ['Calendar', 'Itinerary', 'Tracks & events'])
    const click = async e => { await act(async () => e.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))) }
    const track = document.getElementById('attendee-track')
    await act(async () => { track.value = 'Engineering'; track.dispatchEvent(new dom.window.Event('change', { bubbles: true })) })
    assert.equal(document.querySelectorAll('#discover .attendee-session').length, 1)
    await click(document.querySelector('#discover .attendee-session-action'))
    assert.match(document.querySelector('#schedule').textContent, /Designing cities/)
    assert.match(document.querySelector('#itinerary').textContent, /Designing cities/)
    await click(document.querySelector('#discover .attendee-session-action'))
    assert.doesNotMatch(document.querySelector('#schedule').textContent, /Designing cities/)
    assert.doesNotMatch(document.querySelector('#itinerary').textContent, /Designing cities/)
    await click([...document.querySelectorAll('.workspace-day-picker button')].find(e => e.textContent === 'Day 2'))
    assert.match(document.querySelector('.workspace-calendar').textContent, /Making data feel human/)
    for (const path of ['travel', 'hotel', 'car']) assert.ok(document.querySelector(`a[href="/attendee/${path}"]`))
    await click(document.querySelector('a[href="/attendee/forums"]'))
    assert.equal(router.state.location.pathname, '/attendee/forums')
    assert.match(document.querySelector('h1').textContent, /Attendee Forum/)
    await click(document.querySelector('.forum-directory button'))
    assert.ok(document.querySelector('textarea'))
    assert.match(document.querySelector('.forum-conversation').textContent, /Start the conversation/)
    await act(async () => router.navigate('/speaker/forums'))
    assert.doesNotMatch(document.body.textContent, /Speaker Forum & Messaging/)
  } finally {
    if (root) await act(async () => root.unmount())
    router?.dispose(); await server.close(); dom.window.close()
    globalThis.window = oldWindow; globalThis.document = oldDocument
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
  }
})
