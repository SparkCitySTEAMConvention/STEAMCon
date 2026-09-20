import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'
import { createElement as h, act } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createMemoryRouter, RouterProvider, MemoryRouter } from 'react-router-dom'

const anonymous = { user: null, authSource: null, isAuthenticated: false, hasBackendSession: false }

test('/calendar is public, reachable ahead of the protected routes, and links exist in navigation', async () => {
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  try {
    const { default: App } = await server.ssrLoadModule('/src/App.jsx')
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const html = renderToStaticMarkup(h(MemoryRouter, { initialEntries: ['/calendar'] }, h(AuthContext.Provider, { value: anonymous }, h(App))))
    assert.match(html, /The full program, day by day/)
    assert.doesNotMatch(html, /Signing in…|That page isn’t here/)
    const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
    assert.ok(source.indexOf('path="/calendar"') < source.indexOf('<Route element={<ProtectedRoute />}'))
  } finally { await server.close() }
})

test('CalendarView never fetches; it renders from props alone like the other program components', () => {
  const ui = readFileSync(new URL('../src/components/CalendarView.jsx', import.meta.url), 'utf8')
  assert.doesNotMatch(ui, /fetch\(|eventRepository/)
})

test('preview calendar groups approved sessions by day and filters toggle by STEAM category', async t => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/calendar' })
  const previousWindow = globalThis.window
  const previousDocument = globalThis.document
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  dom.window.scrollTo = () => {}
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Preview must not call APIs') })
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  let root, router
  try {
    const { createRoot } = await import('react-dom/client')
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const { default: Page } = await server.ssrLoadModule('/src/pages/CalendarPage.jsx')
    router = createMemoryRouter([{ path: '*', element: h(Page) }], { initialEntries: ['/calendar'] })
    root = createRoot(document.getElementById('root'))
    await act(async () => root.render(h(AuthContext.Provider, { value: anonymous }, h(RouterProvider, { router }))))

    const eventTitles = () => [...document.querySelectorAll('.calendar-event h4')].map(node => node.textContent)
    const resultCount = () => document.querySelector('.calendar-result-count').textContent
    const chip = letter => [...document.querySelectorAll('.calendar-category')].find(node => node.textContent === letter)

    assert.equal(fetch.mock.callCount(), 0)
    assert.equal(eventTitles().length, 6)
    assert.match(resultCount(), /Showing 6 events across 2 days/)
    assert.deepEqual([...document.querySelectorAll('.calendar-day h3')].map(node => node.textContent), ['Day 1', 'Day 2'])

    await act(async () => chip('S').click())
    assert.equal(chip('S').getAttribute('aria-pressed'), 'false')
    assert.equal(eventTitles().length, 5)
    assert.doesNotMatch(document.querySelector('.calendar-grid').textContent, /The questions that shape tomorrow/)

    await act(async () => chip('T').click())
    await act(async () => chip('E').click())
    assert.equal(eventTitles().length, 3)

    await act(async () => chip('A').click())
    await act(async () => chip('M').click())
    assert.equal(document.querySelector('.calendar-grid'), null)
    assert.match(document.querySelector('.calendar-empty').textContent, /Try another category/)

    await act(async () => [...document.querySelectorAll('.calendar-empty button')].find(node => node.textContent === 'Show every category').click())
    assert.equal(eventTitles().length, 6)
    assert.equal(document.querySelector('button[aria-pressed="true"]').textContent, 'All')

    await act(async () => chip('A').click())
    assert.equal(eventTitles().length, 4)
    await act(async () => [...document.querySelectorAll('.calendar-filters > button')].find(node => node.textContent === 'All').click())
    assert.equal(eventTitles().length, 6)
  } finally {
    if (root) await act(async () => root.unmount())
    router?.dispose()
    await server.close()
    dom.window.close()
    globalThis.window = previousWindow
    globalThis.document = previousDocument
  }
})
