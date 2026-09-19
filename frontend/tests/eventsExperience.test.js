import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { eventExperiences, eventsForExperience, previewExperienceEvents, selectedExperience, experienceDestination } from '../src/config/eventExperiences.js'
import { createPublicProgramSource, adaptProgram } from '../src/services/publicProgramSource.js'

const anonymous = { user: null, isAuthenticated: false, isLoading: false, authSource: null, hasBackendSession: false }
const escapeText = value => value.replaceAll('&', '&amp;')

test('public Events route renders anonymously and preserves existing route destinations and guards', async () => {
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  try {
    const { default: App } = await server.ssrLoadModule('/src/App.jsx')
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const render = (url, auth = anonymous) => renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [url] }, createElement(AuthContext.Provider, { value: auth }, createElement(App))))
    const html = render('/events')
    assert.match(html, /Make room/)
    assert.match(html, /data-experience="schedule"/)
    assert.doesNotMatch(html, /Signing in…|That page isn’t here/)
    const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
    assert.ok(source.indexOf('path="/events"') < source.indexOf('<Route element={<ProtectedRoute />}'))
    for (const [route, page] of [['/', 'HomePage'], ['/tracks', 'TracksPage'], ['/calendar', 'CalendarPage'], ['/register', 'RegistrationPage'], ['/attendee', 'AttendeeDashboard'], ['/speaker', 'SpeakerDashboard']]) {
      assert.ok(source.includes(`path="${route}" element={<${page} />}`))
    }
    assert.match(source, /<Route element={<RoleRoute role="ATTENDEE" \/>}>([\s\S]*?)path="\/attendee"/)
    assert.match(source, /<Route element={<RoleRoute role="SPEAKER" \/>}>([\s\S]*?)path="\/speaker"/)
    assert.match(render('/'), /STEAM/)
    assert.match(render('/tracks'), /One shared future/)
    assert.match(render('/register'), /<form/)
    assert.doesNotMatch(render('/attendee'), /Attendee Dashboard/)
    assert.doesNotMatch(render('/speaker'), /Bill Nye/)
  } finally { await server.close() }
})

test('header exposes a direct Events link and unchanged account and login navigation', async () => {
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  try {
    const { default: Header } = await server.ssrLoadModule('/src/components/Header.jsx')
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    for (const role of [null, 'SPEAKER', 'ATTENDEE']) {
      const auth = role ? { ...anonymous, isAuthenticated: true, user: { role, displayName: 'Account' } } : anonymous
      const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(AuthContext.Provider, { value: auth }, createElement(Header))))
      assert.equal((html.match(/href="\/events"/g) || []).length, 1)
      assert.match(html, /<a href="\/events"[^>]*>Events<\/a>/)
      assert.doesNotMatch(html, /events-disclosure|<summary[^>]*>Events|All events|experience=/)
      for (const [route, label] of [['calendar', 'Calendar'], ['tracks', 'Tracks'], ['speakers', 'Speakers'], ['travel', 'Travel']]) assert.match(html, new RegExp(`href="/${route}"[^>]*>${label}`))
      if (role) {
        assert.match(html, /<summary aria-expanded="false" aria-controls="account-disclosure">Account<\/summary>/)
        assert.match(html, new RegExp(`href="/${role === 'SPEAKER' ? 'speaker' : 'attendee'}"[^>]*>${role === 'SPEAKER' ? 'Speaker' : 'Attendee'} Portal`))
        assert.match(html, /<button>Log out<\/button>/)
        assert.doesNotMatch(html, /href="\/login"/)
      } else {
        assert.match(html, /href="\/login"[^>]*>Log in/)
        assert.doesNotMatch(html, /<details|<summary|<button/)
      }
    }
  } finally { await server.close() }
})

for (const key of ['workshops', 'talks', 'special', 'showcase', 'schedule']) {
  test(`/events?experience=${key} selects and renders the intended experience without API requests`, async t => {
    const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Events must not submit requests') })
    const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
    try {
      const { default: App } = await server.ssrLoadModule('/src/App.jsx')
      const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
      const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [experienceDestination(key)] }, createElement(AuthContext.Provider, { value: anonymous }, createElement(App))))
      assert.match(html, new RegExp(`data-experience="${key}"`))
      assert.ok(html.includes(`<h2 id="experience-heading" tabindex="-1">${escapeText(selectedExperience(key).label)}</h2>`))
      assert.match(html, new RegExp(`aria-current="page" href="/events\\?experience=${key}"`))
      assert.match(html, /Program(?:ming)? preview/)
      if (key !== 'schedule') {
        assert.match(html, /Programming preview · Proposed experience/)
        assert.match(html, /Dates, rooms, and speakers are to be announced/)
      }
      assert.equal(fetch.mock.callCount(), 0)
    } finally { await server.close() }
  })
}

test('missing and invalid experience queries use the documented schedule fallback', async () => {
  for (const query of [null, '', 'invalid', 'WORKSHOPS', 'toString']) assert.equal(selectedExperience(query).key, 'schedule')
  const documentation = await readFile(new URL('../src/pages/EVENTS.md', import.meta.url), 'utf8')
  assert.match(documentation, /invalid values default to `schedule`/)
})

test('preview experience metadata cannot supply confirmed schedules, rooms, speakers or backend classifications', () => {
  for (const experience of eventExperiences) assert.deepEqual(Object.keys(experience).sort(), ['description', 'key', 'label'])
  for (const event of previewExperienceEvents) {
    assert.deepEqual(Object.keys(event).filter(key => !['id', 'experience', 'title', 'description', 'featured'].includes(key)), [])
    assert.match(event.description, /proposed/)
  }
  const records = [{ id: 'session-1', title: 'A backend title', trackId: 'track-1', description: 'Published description', mandatory: false }]
  const before = structuredClone(records)
  const program = adaptProgram([{ id: 'track-1', name: 'Science' }], records, [])
  assert.deepEqual(records, before)
  assert.equal(program.sessions[0].speaker, null)
  assert.equal(program.sessions[0].format, null)
  assert.deepEqual(program.sessions[0].occurrences, [])
  assert.equal(program.sessions[0].experience, undefined)
  assert.equal(program.sessions[0].title, 'A backend title')
})

test('experience collections contain only their own proposed events and Schedule uses the program instead', () => {
  const ids = new Set()
  for (const experience of eventExperiences.filter(item => item.key !== 'schedule')) {
    const events = eventsForExperience(experience.key)
    assert.equal(events.length, 2)
    assert.equal(events.filter(event => event.featured).length, 1)
    for (const event of events) {
      assert.equal(event.experience, experience.key)
      assert.equal(ids.has(event.id), false)
      ids.add(event.id)
    }
  }
  assert.deepEqual(eventsForExperience('schedule'), [])
})

test('anonymous program loading never enrolls, books, saves schedules or calls backend APIs', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Preview must not call APIs') })
  const repository = new Proxy({}, { get: () => { throw new Error('Preview must not access repository') } })
  const result = await createPublicProgramSource(repository, anonymous).load()
  assert.ok(Array.isArray(result.sessions))
  assert.equal(fetch.mock.callCount(), 0)
  const page = await readFile(new URL('../src/pages/EventsPage.jsx', import.meta.url), 'utf8')
  assert.doesNotMatch(page, /enroll|bookingRepository|saveSchedule|authenticatedFetch|fetch\(/i)
})

test('live Events program loads only existing read methods and never merges experience metadata', async () => {
  const calls = []
  const records = [{ id: 'session-1', title: 'Published talk', trackId: 'track-1' }]
  const repository = new Proxy({
    getTracks: async () => { calls.push('getTracks'); return [{ id: 'track-1', name: 'Science' }] },
    getSessions: async () => { calls.push('getSessions'); return records },
    getSessionOccurrences: async () => { calls.push('getSessionOccurrences'); return [] },
  }, { get: (target, key) => {
    assert.ok(Object.hasOwn(target, key), `Unexpected repository operation: ${String(key)}`)
    return target[key]
  } })
  const source = createPublicProgramSource(repository, { authSource: 'backend', isAuthenticated: true, hasBackendSession: true, user: { id: '11111111-1111-1111-1111-111111111111' } }, true)
  assert.equal(source.mode, 'live')
  const data = await source.load()
  assert.deepEqual(calls, ['getTracks', 'getSessions', 'getSessionOccurrences'])
  assert.equal(data.sessions[0].experience, undefined)
  assert.equal(data.sessions[0].speaker, null)
  assert.deepEqual(data.schedule, [])
})

test('invalid experience URL renders schedule fallback with no selected proposed experience', async () => {
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  try {
    const { default: App } = await server.ssrLoadModule('/src/App.jsx')
    const { AuthContext } = await server.ssrLoadModule('/src/auth/useAuth.js')
    const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/events?experience=invalid'] }, createElement(AuthContext.Provider, { value: anonymous }, createElement(App))))
    assert.match(html, /data-experience="schedule"/)
    assert.match(html, /<h2 id="experience-heading" tabindex="-1">Schedule<\/h2>/)
    assert.doesNotMatch(html, /Programming preview · Proposed experience/)
  } finally { await server.close() }
})
