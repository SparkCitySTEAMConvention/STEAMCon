import { locationLabel } from '../utils/proposalPresentation.js'
import { useEffect, useState } from 'react'
import { conventionConfig } from '../config/conventionConfig.js'
import { conventionDayLabel, countdownRemaining, occurrenceDate } from '../utils/conventionCalendar.js'
import './ConventionCountdown.css'

export default function ConventionCountdown() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    timer.unref?.()
    return () => clearInterval(timer)
  }, [])
  const remaining = countdownRemaining(now)
  const state = conventionState(now)
  const dates = conventionDateRange()
  return <section className="container convention-countdown" aria-label={`${conventionConfig.name} convention status`} aria-describedby="convention-countdown-context">
    <p className="convention-countdown-label">{state === 'countdown' ? `${conventionConfig.name} begins in` : state === 'ended' ? 'The convention has ended.' : 'The convention is underway.'}</p>
    {state === 'countdown' && <div role="timer" aria-label="Countdown to the first convention date" aria-live="off">
      {Object.entries(remaining).map(([unit, value]) => <span key={unit}><strong>{value}</strong> {unit}</span>)}
    </div>}
    <p className="convention-countdown-dates">{dates}</p>
    <p className="portal-sr-only" id="convention-countdown-context">Venue: {locationLabel()}. Event timezone: {conventionConfig.timezone}. Countdown targets midnight on the first convention date. Exact opening and closing times remain unconfirmed.</p>
  </section>
}
