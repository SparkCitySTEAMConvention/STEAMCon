import test from 'node:test'
import assert from 'node:assert/strict'
import { passes, passBySlug } from '../src/config/passes.js'
import { registrationPrefill, passRegistrationDestination } from '../src/utils/registrationQuery.js'
import { selectedTrack } from '../src/utils/trackNavigation.js'
import { publicProgramPreview } from '../src/mocks/publicProgram.js'
import { validateRegistration } from '../src/utils/registrationValidation.js'

const expected = {
  'All-Access Pass': { price: 249, slug: 'all-access', description: 'All three days, every track, and evening events' },
  'Single-Day Pass': { price: 99, slug: 'single-day', description: 'One convention day and its scheduled sessions' },
  'Student Pass': { price: 79, slug: 'student', description: 'All three days with valid student identification' },
}

test('shared passes contain exactly the existing names, prices, slugs and descriptions', () => {
  assert.deepEqual(passes, expected)
  for (const [name, pass] of Object.entries(expected)) assert.deepEqual(passBySlug(pass.slug), { name, ...pass })
  for (const slug of [null, '', 'invalid', 'constructor', '__proto__']) assert.equal(passBySlug(slug), undefined)
})

test('every selected track generates attendee registration links for all three passes', () => {
  for (const track of publicProgramPreview.tracks) {
    const selected = selectedTrack(publicProgramPreview.tracks, track.slug)
    for (const pass of Object.values(passes)) {
      const url = new URL(passRegistrationDestination(selected, pass), 'https://steamcon.test')
      assert.equal(url.pathname, '/register')
      assert.deepEqual(Object.fromEntries(url.searchParams), { role: 'attendee', track: track.slug, pass: pass.slug })
    }
  }
})

test('changing selected track updates every pass destination', () => {
  const destinations = slug => Object.values(passes).map(pass => passRegistrationDestination(selectedTrack(publicProgramPreview.tracks, slug), pass))
  const science = destinations('science')
  for (const track of publicProgramPreview.tracks.filter(track => track.slug !== 'science')) {
    destinations(track.slug).forEach((url, index) => {
      assert.notEqual(url, science[index])
      assert.equal(new URL(url, 'https://steamcon.test').searchParams.get('track'), track.slug)
    })
  }
})

for (const [slug, pass, track, name] of [
  ['science', 'all-access', 'Science', 'All-Access Pass'],
  ['technology', 'single-day', 'Technology', 'Single-Day Pass'],
  ['art', 'student', 'Art', 'Student Pass'],
]) test(`${slug} + ${pass} initializes the registration track and pass`, () => {
  assert.deepEqual(registrationPrefill(new URLSearchParams({ role: 'attendee', track: slug, pass })), { role: 'attendee', track, passType: name })
})

test('invalid tracks remain unselected', () => {
  for (const track of ['invalid', 'SCIENCE', '', 'constructor']) assert.equal(registrationPrefill(new URLSearchParams({ track })).track, '')
})

test('invalid or absent pass falls back to All-Access Pass', () => {
  for (const pass of ['invalid', 'constructor', '', 'STUDENT']) assert.equal(registrationPrefill(new URLSearchParams({ pass })).passType, 'All-Access Pass')
  assert.deepEqual(registrationPrefill(new URLSearchParams()), { role: 'attendee', track: '', passType: 'All-Access Pass' })
})

test('speaker registration ignores every pass query', () => {
  for (const pass of ['single-day', 'student', 'all-access', 'invalid']) assert.deepEqual(registrationPrefill(new URLSearchParams({ role: 'speaker', track: 'art', pass })), { role: 'speaker', track: 'Art', passType: 'All-Access Pass' })
})

test('query prefill retains required-field and attendee/speaker validation', () => {
  const prefill = registrationPrefill(new URLSearchParams('track=technology&pass=single-day'))
  const errors = validateRegistration(prefill, prefill.role)
  assert.equal(errors.firstName, 'This field is required.')
  assert.equal(errors.password, 'This field is required.')
  assert.equal(errors.track, undefined)
  const complete = { ...prefill, firstName: 'Avery', lastName: 'Johnson', email: 'avery@example.test', phone: '555-0142', password: 'DemoPass123!' }
  assert.deepEqual(validateRegistration(complete, 'attendee'), {})
  assert.deepEqual(Object.keys(validateRegistration(complete, 'speaker')), ['sessionTitle', 'sessionFormat', 'sessionSummary'])
  const invalid = validateRegistration({ ...complete, email: 'invalid', password: 'short', track: '' }, 'attendee')
  assert.equal(invalid.email, 'Enter a valid email address.')
  assert.equal(invalid.password, 'Password must be at least 8 characters.')
  assert.equal(invalid.track, 'This field is required.')
})
