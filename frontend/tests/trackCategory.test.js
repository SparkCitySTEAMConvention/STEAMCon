import test from 'node:test'
import assert from 'node:assert/strict'
import { allCategoryCodes, steamCategories, trackCategoryCode, trackCategorySlug } from '../src/utils/trackCategory.js'

test('every published STEAM track name resolves to its single-letter category code', () => {
  assert.equal(trackCategoryCode('Science'), 'S')
  assert.equal(trackCategoryCode('Technology'), 'T')
  assert.equal(trackCategoryCode('Engineering'), 'E')
  assert.equal(trackCategoryCode('Art'), 'A')
  assert.equal(trackCategoryCode('Mathematics'), 'M')
  assert.equal(trackCategoryCode('  science  '), 'S')
})

test('unmapped, missing, or null track names have no category code and a neutral slug', () => {
  assert.equal(trackCategoryCode('Unknown'), null)
  assert.equal(trackCategoryCode(null), null)
  assert.equal(trackCategoryCode(undefined), null)
  assert.equal(trackCategorySlug('Unknown'), 'neutral')
  assert.equal(trackCategorySlug(null), 'neutral')
  assert.equal(trackCategorySlug('Art'), 'art')
})

test('the category list carries exactly the five STEAM letters and allCategoryCodes returns a fresh set each call', () => {
  assert.deepEqual(steamCategories.map(category => category.code), ['S', 'T', 'E', 'A', 'M'])
  const first = allCategoryCodes()
  const second = allCategoryCodes()
  assert.notEqual(first, second)
  assert.deepEqual([...first].sort(), ['A', 'E', 'M', 'S', 'T'])
})
