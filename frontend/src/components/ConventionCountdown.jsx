import { useEffect, useState } from 'react'
import { conventionConfig } from '../mocks/conventionConfig.js'
import { conventionDayLabel, countdownRemaining, occurrenceDate } from '../utils/conventionCalendar.js'
import './ConventionCountdown.css'

export default function ConventionCountdown() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    timer.unref?.()
    return () => clearInterval(timer)
  }, [])
  const remaining = countdownRemaining(now)
  const started = now >= Date.parse(conventionConfig.countdownTarget)
  const ended = occurrenceEnd(now)
  return <section className="container convention-countdown" aria-labelledby="convention-countdown-heading">
    <h2 id="convention-countdown-heading">{conventionConfig.name} countdown</h2>
    <p><time dateTime={conventionConfig.startsOn}>{conventionDayLabel(conventionConfig.startsOn)}</time> – <time dateTime={conventionConfig.endsOn}>{conventionDayLabel(conventionConfig.endsOn)}</time>, {conventionConfig.startsOn.slice(0, 4)} · Eastern Time (America/New_York)</p>
    {started ? <p>{ended ? 'The convention dates have passed.' : 'The convention dates are here.'}</p> : <div role="timer" aria-label="Countdown to the first convention date" aria-live="off">
      {Object.entries(remaining).map(([unit, value]) => <span key={unit}><strong>{value}</strong> {unit}</span>)}
    </div>}
    <p>Counting to midnight on the first convention date. Opening and closing times, venue, and rooms are to be announced.</p>
  </section>
}

function occurrenceEnd(now) {
  return occurrenceDate(new Date(now).toISOString()) > conventionConfig.endsOn
}
