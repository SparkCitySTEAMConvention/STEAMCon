import test from 'node:test'
import assert from 'node:assert/strict'
import { conventionConfig } from '../src/mocks/conventionConfig.js'
import { countdownRemaining, occurrenceDate, programCalendar } from '../src/utils/conventionCalendar.js'
test('countdown clamps at zero and uses confirmed midnight', () => {
 const target = Date.parse(conventionConfig.countdownTarget)
 assert.deepEqual(countdownRemaining(target - 90061000), { days: 1, hours: 1, minutes: 1 })
 assert.deepEqual(countdownRemaining(target + 1000), { days: 0, hours: 0, minutes: 0 })
})
test('UTC midnight does not split the Eastern convention day; occurrences sort by instant', () => {
 assert.equal(occurrenceDate('2027-04-07T02:00:00Z'), '2027-04-06')
 assert.equal(occurrenceDate('2027-04-07T04:00:00Z'), '2027-04-07')
 assert.equal(occurrenceDate(null), null)
 const rows = programCalendar([{ id: 'b', scheduledAt: '2027-04-07T04:00:00Z' }, { id: 'a', scheduledAt: '2027-04-07T02:00:00Z' }], true)
 assert.deepEqual(rows.map(row => row.id), ['a', 'b'])
 assert.match(rows[0].time, /10:00 PM EDT/)
})
