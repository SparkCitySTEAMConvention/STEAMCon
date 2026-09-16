import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { trackTreatment, featuredTrackSession } from '../src/utils/trackFeature.js'
import { publicProgramPreview } from '../src/mocks/publicProgram.js'
const read = path => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8')
const ui = read('components/TrackVisual.jsx')
const css = read('components/TrackVisual.css')

test('dispatcher maps each track to its own illustration with a neutral fallback', () => {
  for (const [name, visual] of Object.entries({ science: 'ScienceVisual', technology: 'TechnologyVisual', engineering: 'EngineeringVisual', art: 'ArtVisual', mathematics: 'MathematicsVisual', neutral: 'NeutralVisual' })) {
    assert.match(ui, new RegExp(`${name}: ${visual}`))
  }
  assert.equal(trackTreatment({ name: 'Unknown' }), 'neutral')
  assert.match(ui, /visuals\[treatment\]/)
})
test('visual selection leaves session selection independent and deterministic', () => {
  for (const track of publicProgramPreview.tracks) {
    const before = featuredTrackSession(track, publicProgramPreview.sessions)
    trackTreatment(track)
    assert.equal(featuredTrackSession(track, publicProgramPreview.sessions), before)
  }
  assert.doesNotMatch(ui, /featuredTrackSession|fetch\(|Repository|useState|tabIndex|onClick/)
  assert.match(read('components/TrackFeature.jsx'), /<TrackVisual track=\{track\} \/>/)
})
test('illustrations are hidden and non-focusable; Science has three separate orbital planes', () => {
  assert.match(ui, /aria-hidden="true"/)
  assert.match(ui, /focusable="false"/)
  assert.match(ui, /\[1, 2, 3\]/)
  for (const index of [1,2,3]) {
    assert.match(css, new RegExp(`science-plane-${index}.*rotateX.*rotateY.*rotateZ`))
  }
  assert.match(css, /perspective: 800px/)
  assert.match(css, /transform-style: preserve-3d/)
  assert.match(css, /science-ring-2.*animation-direction: reverse/)
})
test('reduced motion stops every animation family and restores complete drawing', () => {
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
  for (const selector of ['track-visual-stage','science-ring','circuit-pulse','circuit-node','mechanical-gear','art-swatch','art-brush','math-graph','math-shape']) assert.ok(reduced.includes(`.${selector}`))
  assert.match(reduced, /animation: none; transition: none/)
  assert.match(reduced, /stroke-dashoffset: 0/)
  assert.match(css, /data-illustration='neutral'.*animation: none/)
})
test('homepage panel and animation and backend adapters remain unchanged', () => {
  const hashes = {
    'components/FeaturedSessions.jsx': '6293387d84b26136c3c06fbdc98317ce8b5d9637dfd9596a5e23072e1a2d4223',
    'App.css': 'da0864eeb5f2c969cc28a296a89bc584cb662ef04078098c080ca532f3bf8da7',
    'services/publicProgramSource.js': 'f23e22b99e2b2d5f984a5e08c907e287a47722653c820ccd5a0695b5bddec852',
    'services/eventRepository.js': '79410cc55a42912b5af73d7683b034961047c43255a3852ab31e8e7d71a63ff0',
  }
  for (const [path, expected] of Object.entries(hashes)) assert.equal(createHash('sha256').update(read(path)).digest('hex'), expected, path)
})
