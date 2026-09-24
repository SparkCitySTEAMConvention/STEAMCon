import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { trackDestination, selectedTrack, programSummary } from '../src/utils/trackNavigation.js'
import { publicProgramPreview } from '../src/mocks/publicProgram.js'
const read = path => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8')

test('all five destinations and direct query selections match preview and backend names', () => {
  for (const track of publicProgramPreview.tracks) {
    assert.equal(trackDestination(track), `/tracks?track=${track.slug}`)
    assert.equal(selectedTrack(publicProgramPreview.tracks, track.slug), track)
    assert.equal(trackDestination({ ...track, slug: 'live' }), `/tracks?track=${track.slug}`)
  }
  for (const query of [null, '', 'invalid', 'SCIENCE']) assert.equal(selectedTrack(publicProgramPreview.tracks, query), publicProgramPreview.tracks[0])
  assert.equal(selectedTrack([], 'science'), undefined)
  assert.equal(selectedTrack(publicProgramPreview.tracks, 'all'), undefined)
})
test('whole cards are semantic Router links without nested controls and query selection is wired', () => {
  const card = read('components/TrackCard.jsx')
  assert.match(card, /import \{ Link \} from 'react-router-dom'/)
  assert.match(card, /<Link className=.*to=\{trackDestination\(\{ name \}\)\}/)
  assert.match(card, /aria-label=\{`Explore \$\{name\} programming`\}/)
  assert.doesNotMatch(card, /onClick|tabIndex|<button|<a /)
  const page = read('pages/TracksPage.jsx')
  assert.match(page, /useSearchParams\(\)/)
  assert.match(page, /selectedTrack\(tracks, searchParams.get\('track'\)\)/)
  assert.match(page, /changeTrack\(trackQuery\(item\)\)/)
  assert.match(page, /<Link to=\{passRegistrationDestination\(track, pass\)\}/)
  assert.equal((page.match(/<h1>/g) || []).length, 1)
})
test('summary derives counts from varying data and never claims unconfirmed schedules', () => {
  assert.deepEqual(programSummary({ tracks: [{}, {}], sessions: [{}, {}, {}] }), { trackCount: 2, sessionCount: 3, status: 'Program taking shape' })
  assert.deepEqual(programSummary({ tracks: [], sessions: [] }), { trackCount: 0, sessionCount: 0, status: 'Program taking shape' })
  const scheduled = { tracks: [{}], sessions: [{ occurrences: [{ scheduledAt: '2026-09-16T12:00:00Z' }] }] }
  assert.equal(programSummary(scheduled).status, 'Published session times')
  assert.equal(programSummary(scheduled, true).status, 'Program taking shape')
  assert.match(read('pages/TracksPage.jsx'), /summary.sessionCount/)
})
test('Bill Nye dashboard and identity remain unchanged', () => {
  for (const [path, expected] of Object.entries({
    'mocks/speakerData.js': 'ed1e3ea3d9af6cc21d6e78bdc86925c247fc07a6a813fb7079d838526f7563bf',
  })) assert.equal(createHash('sha256').update(read(path)).digest('hex'), expected)
})
