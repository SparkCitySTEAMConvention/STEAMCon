import test from 'node:test'
import assert from 'node:assert/strict'
import { validateRegistration } from '../src/utils/registrationValidation.js'

const valid = {
  firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '555-0100',
  track: 'Technology', password: 'analytical-engine', sessionTitle: 'Creative computing',
  sessionFormat: 'Talk', sessionSummary: 'Practical ideas for combining art and computation.',
}

test('valid attendee registration has no errors', () => {
  assert.deepEqual(validateRegistration(valid, 'attendee'), {})
})

test('reports required, email, and password errors by field', () => {
  const errors = validateRegistration({ email: 'not-an-email', password: 'short' }, 'attendee')
  assert.equal(errors.firstName, 'This field is required.')
  assert.equal(errors.email, 'Enter a valid email address.')
  assert.equal(errors.password, 'Password must be at least 8 characters.')
})

test('speaker registration requires session details', () => {
  const errors = validateRegistration({ ...valid, sessionTitle: '', sessionSummary: '' }, 'speaker')
  assert.equal(errors.sessionTitle, 'This field is required.')
  assert.equal(errors.sessionSummary, 'This field is required.')
})

