import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'
import { createElement as h, act } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createMemoryRouter, RouterProvider, MemoryRouter } from 'react-router-dom'
import { conventionConfig } from '../src/mocks/conventionConfig.js'
import { publicPreviewOccurrences, publicProgramPreview } from '../src/mocks/publicProgram.js'
import { conventionState, selectedConventionDate, programCalendar } from '../src/utils/conventionCalendar.js'

const anonymous = { user: null, authSource: null, isAuthenticated: false, hasBackendSession: false }

test('confirmed configuration, safe dates and centralized ISO preview records', () => {
  assert.deepEqual(conventionConfig.dates, ['2027-04-06', '2027-04-07', '2027-04-08'])
  assert.equal(conventionConfig.timezone, 'America/New_York')
  assert.equal(conventionConfig.venueName, 'Jacob K. Javits Convention Center')
  assert.equal(conventionConfig.city, 'New York')
  assert.equal(conventionConfig.state, 'NY')
  assert.equal(conventionConfig.streetAddress, undefined)
  assert.equal(conventionConfig.countdownTarget, '2027-04-06T00:00:00-04:00')
  for (const key of ['startsAt', 'endsAt']) assert.equal(conventionConfig[key], null)
  for (const value of [null, '', 'invalid', '2027-04-09']) assert.equal(selectedConventionDate(value), '2027-04-06')
  for (const record of publicPreviewOccurrences) {
    assert.match(record.startsAt, /^2027-04-0[678]T\d{2}:\d{2}:\d{2}-04:00$/)
    assert.ok(Date.parse(record.endsAt) > Date.parse(record.startsAt))
    assert.ok(publicProgramPreview.sessions.some(session => session.id === record.sessionId))
  }
  assert.deepEqual([...new Set(programCalendar(publicProgramPreview.schedule).map(row => row.calendarDate))], conventionConfig.dates)
  const reordered = programCalendar([...publicProgramPreview.schedule].reverse().map(row => ({ ...row, day: 'Invalid display label' })))
  assert.deepEqual(reordered.map(row => row.id), publicProgramPreview.schedule.map(row => row.id))
  assert.equal(conventionState(Date.parse('2027-04-06T03:59:59Z')), 'countdown')
  assert.equal(conventionState(Date.parse('2027-04-06T04:00:00Z')), 'underway')
  assert.equal(conventionState(Date.parse('2027-04-09T03:59:59Z')), 'underway')
  assert.equal(conventionState(Date.parse('2027-04-09T04:00:00Z')), 'ended')
})

test('compact countdown renders minutes without seconds, convention states and accessible context', async t => {
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  try {
    const { default: Countdown } = await server.ssrLoadModule('/src/components/ConventionCountdown.jsx')
    const clock = t.mock.method(Date, 'now', () => Date.parse('2027-04-05T04:00:00Z'))
    const render = () => renderToStaticMarkup(h(MemoryRouter, null, h(Countdown)))
    const html = render()
    for (const unit of ['days', 'hours', 'minutes']) assert.ok(html.includes(unit))
    assert.doesNotMatch(html, /seconds/)
    assert.doesNotMatch(html, /<h2|<a|Explore the three-day program|Counting to midnight on the first convention date/)
    assert.match(html, /STEAM Con begins in/)
    assert.match(html, /April 6.*8, 2027/)
    assert.match(html, /class="portal-sr-only" id="convention-countdown-context"/)
    assert.match(html, /America\/New_York/)
    assert.match(html, /Venue: Jacob K. Javits Convention Center, New York, NY/)
    assert.match(html, /Exact opening and closing times remain unconfirmed/)
    clock.mock.mockImplementation(() => Date.parse('2027-04-08T16:00:00Z'))
    assert.match(render(), /convention is underway/)
    clock.mock.mockImplementation(() => Date.parse('2027-04-09T04:00:00Z'))
    assert.match(render(), /convention has ended/)
    clock.mock.restore()
  } finally { await server.close() }
})

test('Tracks calendar URL filters, history, empty states and live Backend B boundary', async t => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://steamcon.test/tracks' })
  for (const [name, value] of Object.entries({ window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name])
  }
  const { createRoot } = await import('react-dom/client')
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  let root, router
  try {
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const { default: Page } = await server.ssrLoadModule('/src/pages/TracksPage.jsx')
    const { default: Home } = await server.ssrLoadModule('/src/pages/HomePage.jsx')
    const { default: Events } = await server.ssrLoadModule('/src/pages/EventsPage.jsx')
    const { eventRepository } = await server.ssrLoadModule('/src/services/eventRepository.js')
    const { authService } = await server.ssrLoadModule('/src/services/authService.js')
    const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected fetch') })
    async function mount(url, auth = anonymous, Component = Page) {
      if (root) await act(async () => root.unmount())
      router?.dispose()
      router = createMemoryRouter([{ path: '*', element: h(Component) }], { initialEntries: [url] })
      root = createRoot(document.getElementById('root'))
      await act(async () => root.render(h(AuthContext.Provider, { value: auth }, h(RouterProvider, { router }))))
    }
    const calendar = () => document.querySelector('#schedule-by-day')
    const titles = () => [...calendar().querySelectorAll('.schedule-row h3')].map(node => node.textContent)
    const selectedDate = () => calendar().querySelector('.schedule-days [aria-pressed="true"]').textContent
    async function navigate(url) { await act(async () => router.navigate(url)) }
    await mount('/', anonymous, Home)
    assert.equal(calendar(), null, 'homepage delegates the full calendar to tracks')
    for (const selector of ['.convention-countdown', '.hero', '#events', '#tracks', '#speaker-registration']) assert.ok(document.querySelector(selector), selector)
    assert.equal(document.querySelectorAll('h1').length, 1)
    assert.equal(document.querySelectorAll('#tracks .track-card').length, 5)
    assert.equal(document.querySelector('#tracks .track-card p'), null, 'full track descriptions stay on tracks')
    assert.ok(document.querySelector('#events').compareDocumentPosition(document.querySelector('#tracks')) & window.Node.DOCUMENT_POSITION_FOLLOWING)
    assert.ok(document.querySelector('#speaker-registration a[href="/register?role=attendee"]'))
    assert.ok(document.querySelector('#speaker-registration a[href="/register?role=speaker"]'))
    await mount('/tracks?track=science')
    assert.match(selectedDate(), /April 6/)
    assert.match(document.querySelector('.track-feature').className, /science/)
    assert.deepEqual(titles(), ['The questions that shape tomorrow'])
    assert.match(calendar().textContent, /9:00 AM EDT/)
    assert.match(calendar().textContent, /Room to be announced/)
    assert.match(calendar().textContent, /Convention venue: Jacob K. Javits Convention Center, New York, NY/)
    assert.doesNotMatch(calendar().textContent, /Kris Younger|Main Stage|Keynote|Add to my schedule/)
    const trackButton = [...document.querySelectorAll('.track-page-filters button')].find(node => node.textContent === 'Technology')
    trackButton.focus()
    await act(async () => trackButton.click())
    assert.equal(router.state.location.search, '?track=technology&date=2027-04-06')
    assert.ok(document.activeElement === trackButton, 'Filter changes do not move focus')
    assert.match(document.querySelector('.track-feature').className, /technology/)
    await act(async () => calendar().querySelectorAll('.schedule-days button')[1].click())
    assert.equal(router.state.location.search, '?track=technology&date=2027-04-07')
    assert.equal(titles().length, 0)
    assert.match(calendar().textContent, /Try another track/)
    await act(async () => document.querySelector('.track-page-filters button').click())
    assert.equal(router.state.location.search, '?track=all&date=2027-04-07')
    assert.equal(document.querySelector('.track-feature'), null)
    assert.match(document.querySelector('#all-tracks-heading').textContent, /All tracks/)
    assert.equal(titles().length, 2)
    await navigate(-1)
    assert.match(selectedDate(), /April 7/)
    assert.match(document.querySelector('.track-feature').className, /technology/)
    assert.equal(titles().length, 0)
    await navigate(1)
    assert.equal(titles().length, 2)
    await navigate('/tracks?track=all&date=2027-04-08')
    assert.deepEqual(titles(), ['STEAM Con evening concert'])
    await navigate('/tracks?track=science&date=2027-04-08')
    assert.equal(titles().length, 0)
    for (const url of ['/tracks', '/tracks?track=invalid&date=invalid']) {
      await navigate(url)
      assert.match(selectedDate(), /April 6/)
      assert.match(document.querySelector('.track-feature').className, /science/)
    }
    await mount('/tracks?track=all', { ...anonymous, authSource: 'demo', user: { role: 'SPEAKER', id: 'demo' }, isAuthenticated: true })
    assert.equal(titles().length, 3)
    assert.equal(fetch.mock.callCount(), 0)
    let failed = true
    const calls = []
    t.mock.method(authService, 'hasValidBackendSession', () => true)
    for (const [name, records] of [
      ['getTracks', [{ id: 't', name: 'Science' }]],
      ['getSessions', [{ id: 's', title: 'Published science', trackId: 't' }]],
      ['getSessionOccurrences', [
        { id: 'late', sessionId: 's', startsAt: '2027-04-07T02:00:00Z', endsAt: '2027-04-07T03:00:00Z' },
        { id: 'early', sessionId: 's', startsAt: '2027-04-06T14:00:00Z', endsAt: '2027-04-06T15:00:00Z' },
      ]],
    ]) t.mock.method(eventRepository, name, async () => { calls.push(name); if (failed) throw new Error('Offline'); return records })
    const live = { authSource: 'backend', isAuthenticated: true, hasBackendSession: true, user: { id: '11111111-1111-4111-8111-111111111111', role: 'SPEAKER' } }
    await mount('/tracks?track=science&date=2027-04-06', live)
    assert.match(document.querySelector('[role="alert"]').textContent, /Unable to load tracks/)
    assert.equal(calendar(), null)
    assert.doesNotMatch(document.body.textContent, /The questions that shape tomorrow/)
    failed = false
    await act(async () => [...document.querySelectorAll('button')].find(node => node.textContent === 'Retry tracks').click())
    assert.deepEqual(titles(), ['Published science', 'Published science'])
    const times = [...calendar().querySelectorAll('.schedule-time strong')].map(node => node.textContent)
    assert.match(times[0], /10:00 AM EDT/)
    assert.match(times[1], /10:00 PM EDT/)
    assert.equal(calls.length, 6)
    assert.doesNotMatch(calendar().textContent, /Kris|Main Stage|Workshop/)
    await navigate('/tracks?track=all&date=2027-04-08')
    assert.match(calendar().textContent, /No session occurrences are listed for this day/)
    const delays = []
    const originalInterval = globalThis.setInterval
    const interval = t.mock.method(globalThis, 'setInterval', (callback, delay, ...args) => {
      delays.push(delay)
      return originalInterval(callback, delay, ...args)
    })
    await mount('/', anonymous, Home)
    assert.deepEqual(delays, [60000], 'Homepage countdown updates once per minute')
    interval.mock.restore()
    assert.equal(document.querySelectorAll('.convention-countdown').length, 1)
    const homepageMain = document.querySelector('#main')
    assert.ok(homepageMain.firstElementChild.matches('.convention-countdown'))
    assert.ok(homepageMain.previousElementSibling.matches('.site-header'))
    assert.ok(homepageMain.firstElementChild.nextElementSibling.matches('.hero'))
    await mount('/events', anonymous, Events)
    assert.equal(document.querySelectorAll('.convention-countdown').length, 0)
    assert.match(document.body.textContent, /Jacob K. Javits Convention Center, New York, NY/)
    assert.doesNotMatch(document.body.textContent, /Venue to be announced|venue are to be announced|Exact venue and dates to be announced/)
    const { default: Travel } = await server.ssrLoadModule('/src/pages/TravelInfoPage.jsx')
    await mount('/travel', anonymous, Travel)
    assert.match(document.querySelector('.travel-guide-lede').textContent, /Jacob K. Javits Convention Center, New York, NY/)
    assert.match(document.querySelector('.map-location-list').textContent, /Street address to be announced/)
    assert.doesNotMatch(document.body.textContent, /when the venue is announced|venue and event dates will be published after confirmation/)
  } finally {
    if (root) await act(async () => root.unmount())
    router?.dispose()
    await server.close()
    dom.window.close()
  }
})
