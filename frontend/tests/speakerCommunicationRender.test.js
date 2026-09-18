import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'
import { act, createElement as h } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

const user = { id: '11111111-1111-4111-8111-111111111111', role: 'SPEAKER', displayName: 'Authenticated Speaker' }
const forum = { id: '22222222-2222-4222-8222-222222222222', name: 'Backend forum', scope: 'TRACK' }
const notification = { id: 'notice', type: 'PROPOSAL_UPDATE', message: 'Backend-only update', read: false }
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }

test('forum and notification errors, retries, duplicate actions and session isolation preserve existing portal presentation', async t => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://steamcon.test', pretendToBeVisual: true })
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
  dom.window.scrollTo = () => {}
  dom.window.HTMLElement.prototype.scrollIntoView = () => {}
  for (const [name, value] of Object.entries({ window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, sessionStorage: dom.window.sessionStorage, localStorage: dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT: true })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name])
  }
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected backend request') })
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  const { createRoot } = await import('react-dom/client')
  let root, router, auth
  try {
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const { default: App } = await server.ssrLoadModule('/src/App.jsx')
    const { default: Shell } = await server.ssrLoadModule('/src/components/portal/PortalShell.jsx')
    const { default: Notifications } = await server.ssrLoadModule('/src/components/speaker/SpeakerNotifications.jsx')
    const { createSpeakerNotificationSource } = await server.ssrLoadModule('/src/services/speakerNotificationSource.js')
    const { forumRepository } = await server.ssrLoadModule('/src/services/forumRepository.js')
    const liveAuth = () => ({ user: { ...user }, authSource: 'backend', hasBackendSession: true, isAuthenticated: true, isLoading: false, logout() {} })
    const demoAuth = () => ({ ...liveAuth(), user: { id: 'demo-SPEAKER', role: 'SPEAKER', displayName: 'Bill Nye' }, authSource: 'demo', hasBackendSession: false })
    let renderedPage
    const render = () => root.render(h(AuthContext.Provider, { value: auth }, h(RouterProvider, { router })))
    const mount = async (page, value = liveAuth(), route = '/speaker/forums') => {
      if (root) await act(async () => root.unmount())
      router?.dispose()
      auth = value
      renderedPage = page
      router = createMemoryRouter([{ path: '*', element: renderedPage }], { initialEntries: [route] })
      root = createRoot(document.getElementById('root'))
      await act(async () => render())
    }
    const button = label => [...document.querySelectorAll('button')].find(node => node.textContent.trim() === label)
    const click = async node => { assert.ok(node); await act(async () => node.click()) }
    const submit = async (times = 1) => { await act(async () => { for (let i = 0; i < times; i++) document.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })) }) }
    const field = async value => { await act(async () => {
      const textarea = document.querySelector('#forum-message')
      Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, 'value').set.call(textarea, value)
      textarea.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    }) }
    const expectPortal = () => {
      assert.equal(document.querySelectorAll('.steam-portal-shell').length, 1)
      assert.equal(document.querySelectorAll('header').length, 1)
      assert.equal(document.querySelectorAll('.steam-portal-sidebar').length, 1)
      assert.equal([...document.querySelectorAll('button')].filter(node => node.textContent === 'Log out').length, 1)
      assert.ok(document.querySelector('nav[aria-label="Portal navigation"] a[href="/speaker/forums"]'))
    }

    await t.test('live forum load errors and malformed responses expose Retry; empty lists stay empty', async () => {
      let result = new Error('offline')
      t.mock.method(forumRepository, 'getForums', async () => { if (result instanceof Error) throw result; return result })
      await mount(h(App))
      expectPortal()
      assert.match(document.querySelector('[role="alert"]').textContent, /Unable to load forums/)
      assert.equal(document.querySelector('.forum-directory'), null)
      result = { invalid: true }
      await click(button('Try again'))
      assert.match(document.querySelector('[role="alert"]').textContent, /Unable to load forums/)
      result = []
      await click(button('Try again'))
      assert.match(document.querySelector('.forum-directory').textContent, /No forums are available/)
      assert.doesNotMatch(document.body.textContent, /Demo forum examples/)
    })
    await t.test('live message errors retry without fixtures; failed duplicate posts retain the exact draft', async () => {
      t.mock.method(forumRepository, 'getForums', async () => [forum])
      let result = new Error('HTTP 403')
      t.mock.method(forumRepository, 'getMessages', async (...args) => {
        assert.deepEqual(args, [forum.id])
        if (result instanceof Error) throw result
        return result
      })
      let post = deferred()
      const posts = t.mock.method(forumRepository, 'createMessage', (...args) => { assert.deepEqual(args, [forum.id, { body: 'Keep my draft' }]); return post.promise })
      await mount(h(App))
      await click(document.querySelector('.forum-directory button'))
      assert.match(document.querySelector('.forum-conversation [role="alert"]').textContent, /Unable to load messages/)
      result = null
      await click(button('Try again'))
      assert.match(document.querySelector('.forum-conversation [role="alert"]').textContent, /Unable to load messages/)
      result = []
      await click(button('Try again'))
      assert.match(document.querySelector('.forum-conversation').textContent, /There are no active messages/)
      await field('   ')
      await submit(2)
      assert.equal(posts.mock.callCount(), 0)
      await field('  Keep my draft  ')
      await submit(2)
      assert.equal(posts.mock.callCount(), 1)
      assert.equal(button('Posting…').disabled, true)
      await act(async () => post.reject(new Error('offline')))
      assert.equal(document.querySelector('#forum-message').value, '  Keep my draft  ')
      assert.match(document.querySelector('.forum-conversation [role="alert"]').textContent, /draft has been kept/)
      post = deferred()
      await submit(2)
      assert.equal(posts.mock.callCount(), 2)
      await act(async () => post.resolve({ id: 'saved', forumId: forum.id, body: 'Keep my draft', status: 'ACTIVE', authorId: user.id }))
      assert.equal(document.querySelector('#forum-message').value, '')
      assert.match(document.querySelector('.forum-messages').textContent, /Keep my draft/)
      expectPortal()
    })
    await t.test('missing session and missing user prevent repository calls; authoritative role guards stay in place', async () => {
      const lists = t.mock.method(forumRepository, 'getForums', async () => { throw new Error('Should not call repository') })
      await mount(h(App), { ...liveAuth(), hasBackendSession: false })
      assert.equal(lists.mock.callCount(), 0)
      assert.match(document.body.textContent, /active session/)
      await mount(h(App), { ...liveAuth(), user: null, isAuthenticated: false })
      assert.equal(router.state.location.pathname, '/login')
      assert.equal(lists.mock.callCount(), 0)
      await mount(h(App), { ...liveAuth(), user: { ...user, role: 'ATTENDEE' } })
      assert.equal(router.state.location.pathname, '/access-denied')
      assert.equal(lists.mock.callCount(), 0)
    })
    await t.test('demo messages survive navigation only for the current login and never enter live results', async () => {
      const demo = demoAuth()
      await mount(h(App), demo)
      await click(document.querySelector('.forum-directory button'))
      await field('Only this demo login')
      await submit()
      await act(async () => router.navigate('/events'))
      await act(async () => router.navigate('/speaker/forums'))
      await click(document.querySelector('.forum-directory button'))
      assert.match(document.querySelector('.forum-messages').textContent, /Only this demo login/)
      auth = demoAuth()
      await act(async () => render())
      assert.equal(document.querySelector('#forum-message'), null, 'another login clears selected conversation and draft')
      await click(document.querySelector('.forum-directory button'))
      assert.equal(document.querySelector('.forum-messages'), null)
      t.mock.method(forumRepository, 'getForums', async () => [forum])
      t.mock.method(forumRepository, 'getMessages', async () => [])
      auth = liveAuth()
      await act(async () => render())
      await click(document.querySelector('.forum-directory button'))
      assert.equal(document.querySelector('.forum-messages'), null)
      assert.doesNotMatch(document.body.textContent, /Only this demo login|Demo forum examples/)
    })

    await t.test('notification failures retain state and drafts of read requests are not duplicated; acknowledgment reloads real JSON', async () => {
      let result = new Error('offline')
      let update = deferred()
      const repository = {
        async getNotifications(...args) { assert.deepEqual(args, []); if (result instanceof Error) throw result; return result },
        markAsRead: t.mock.fn(() => update.promise),
      }
      const source = createSpeakerNotificationSource(repository, user, 'backend', true)
      await mount(h(Shell, null, h(Notifications, { source })))
      expectPortal()
      assert.match(document.querySelector('[role="alert"]').textContent, /Unable to load notifications/)
      result = [null]
      await click(button('Retry notifications'))
      assert.match(document.querySelector('[role="alert"]').textContent, /Unable to load notifications/)
      result = []
      await click(button('Retry notifications'))
      assert.match(document.body.textContent, /No notifications yet/)
      result = [{ ...notification }]
      await mount(h(Shell, null, h(Notifications, { source })))
      const mark = button('Mark as read')
      await act(async () => { mark.click(); mark.click() })
      assert.equal(repository.markAsRead.mock.callCount(), 1)
      assert.equal(button('Marking as read…').disabled, true)
      await act(async () => update.reject(new Error('HTTP 403')))
      assert.equal(document.querySelector('.portal-notification-meta span').textContent, 'Unread')
      assert.match(document.querySelector('.portal-notification [role="alert"]').textContent, /It remains unread/)
      assert.equal(document.querySelector('.portal-notification > p').textContent, notification.message)
      update = deferred()
      await click(button('Mark as read'))
      assert.equal(repository.markAsRead.mock.callCount(), 2)
      result = [{ ...notification, read: true, opaqueBackendField: 'preserved' }]
      await act(async () => update.resolve(undefined))
      assert.equal(document.querySelector('.portal-notification-meta span').textContent, 'Read')
      assert.equal(button('Mark as read'), undefined)
      assert.match(document.body.textContent, /Notification marked as read/)
      assert.doesNotMatch(document.body.textContent, /Bill Nye preview notifications/)
    })
    assert.equal(fetch.mock.callCount(), 0, 'demo operations and invalid contexts make zero backend requests')
  } finally {
    if (root) await act(async () => root.unmount())
    router?.dispose()
    await server.close()
    dom.window.close()
  }
})
