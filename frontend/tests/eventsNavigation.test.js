import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { eventExperiences, eventsForExperience } from '../src/config/eventExperiences.js'

test('mounted public Events page reacts to query navigation, collection changes, and Back/Forward', async t => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/events' })
  const previousWindow = globalThis.window
  const previousDocument = globalThis.document
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  // React act flushes router navigation and the public preview loader effects.
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  dom.window.scrollTo = () => {}
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Public preview navigation must not call APIs') })
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  let root
  let router
  try {
    const { default: App } = await server.ssrLoadModule('/src/App.jsx')
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const auth = { user: null, isAuthenticated: false, isLoading: false, authSource: null, hasBackendSession: false }
    router = createMemoryRouter([{ path: '*', element: createElement(AuthContext.Provider, { value: auth }, createElement(App)) }], { initialEntries: ['/events'] })
    root = createRoot(document.getElementById('root'))
    await act(async () => { root.render(createElement(RouterProvider, { router })) })
    const originalMain = document.querySelector('main')
    await t.test('compact introduction leads directly to reachable experience filters and the selected heading', () => {
      const introduction = document.querySelector('.events-hero')
      const experience = document.querySelector('.events-experience')
      assert.equal(introduction.nextElementSibling, experience)
      const controls = experience.firstElementChild
      assert.equal(controls.getAttribute('aria-label'), 'Choose an event experience')
      const links = [...controls.querySelectorAll('a')]
      assert.deepEqual(links.map(link => link.textContent), eventExperiences.map(item => item.label))
      for (const link of links) {
        assert.equal(link.tabIndex, 0)
        assert.match(link.getAttribute('href'), /^\/events\?experience=/)
      }
      assert.equal(controls.nextElementSibling.nextElementSibling.id, 'experience-heading')
    })
    const expectSelection = key => {
      assert.equal(document.querySelector('main'), originalMain, 'page must update without remounting')
      const experience = eventExperiences.find(item => item.key === key)
      const section = document.querySelector('[data-experience]')
      assert.equal(section.dataset.experience, key)
      assert.equal(section.querySelector('h2').textContent, experience.label)
      const heading = section.querySelector('#experience-heading')
      assert.equal(heading.tabIndex, -1)
      for (const results of section.querySelectorAll('.events-featured, .events-collection')) {
        assert.ok(heading.compareDocumentPosition(results) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING)
      }
      if (router.state.location.search) assert.equal(document.activeElement, heading)
      assert.ok(section.textContent.includes(experience.description))
      const active = section.querySelectorAll('[aria-current="page"]')
      assert.equal(active.length, 1)
      assert.equal(active[0].textContent, experience.label)
      const collection = [...section.querySelectorAll('.events-collection article')].map(card => card.dataset.eventId)
      assert.deepEqual(collection, eventsForExperience(key).map(event => event.id))
      if (key === 'schedule') {
        assert.equal(section.querySelector('.events-featured'), null)
        assert.ok(document.querySelector('#schedule-by-day'))
      } else {
        const featured = eventsForExperience(key).find(event => event.featured)
        assert.equal(section.querySelector('#featured-event-heading').textContent, featured.title)
        assert.equal(document.querySelector('#schedule-by-day'), null, 'unrelated schedule cards must be hidden')
        for (const other of eventExperiences.filter(item => item.key !== key)) {
          for (const event of eventsForExperience(other.key)) assert.ok(!section.textContent.includes(event.title))
        }
        for (const card of section.querySelectorAll('[data-event-id]')) assert.match(card.textContent, /Programming preview.*to be announced/s)
      }
      return { heading: experience.label, collection }
    }
    const clickExperience = async key => {
      const link = document.querySelector(`#events-disclosure a[href="/events?experience=${key}"]`)
      await act(async () => { link.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })) })
    }
    expectSelection('schedule')
    await clickExperience('workshops')
    const workshops = expectSelection('workshops')
    await clickExperience('talks')
    const talks = expectSelection('talks')
    assert.notEqual(workshops.heading, talks.heading)
    assert.notDeepEqual(workshops.collection, talks.collection)
    await act(async () => { await router.navigate(-1) })
    expectSelection('workshops')
    await act(async () => { await router.navigate(1) })
    expectSelection('talks')
    for (const key of ['special', 'showcase', 'schedule']) {
      await clickExperience(key)
      expectSelection(key)
    }
    await t.test('in-page controls focus the heading and only scroll instantly when it is outside the viewport', async () => {
      const heading = document.querySelector('#experience-heading')
      const focus = t.mock.method(heading, 'focus')
      t.mock.method(heading, 'getBoundingClientRect', () => ({ top: -50, bottom: -10 }))
      const scrollCalls = []
      heading.scrollIntoView = options => { scrollCalls.push(options) }
      const controls = document.querySelector('[aria-label="Choose an event experience"]')
      await act(async () => {
        controls.querySelector('a[href="/events?experience=workshops"]').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
      })
      expectSelection('workshops')
      assert.deepEqual(focus.mock.calls.at(-1).arguments, [{ preventScroll: true }])
      assert.deepEqual(scrollCalls, [{ behavior: 'instant', block: 'start' }])
      t.mock.method(heading, 'getBoundingClientRect', () => ({ top: 100, bottom: 150 }))
      await act(async () => {
        controls.querySelector('a[href="/events?experience=talks"]').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
      })
      expectSelection('talks')
      assert.equal(scrollCalls.length, 1, 'visible headings must not trigger scrolling')
      delete heading.scrollIntoView
    })
    await act(async () => { await router.navigate('/events?experience=invalid') })
    expectSelection('schedule')
    assert.equal(fetch.mock.callCount(), 0)
  } finally {
    if (root) await act(async () => { root.unmount() })
    router?.dispose()
    await server.close()
    dom.window.close()
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
    if (previousDocument === undefined) delete globalThis.document
    else globalThis.document = previousDocument
  }
})
