import { useState } from 'react'
import { calendarHref, canRequestScheduleChange } from '../../utils/proposalPresentation.js'

export default function ScheduleActions({ session }) {
  const [message, setMessage] = useState('')
  const calendar = calendarHref(session)
  const canReschedule = canRequestScheduleChange(session)
  return <div className="portal-schedule-actions">
    <div className="portal-actions">
      {canReschedule && <button className="button button-paper" type="button" onClick={() => setMessage('Schedule-change requests are not connected yet. No request was sent.')}>Request Schedule Change</button>}
      {calendar && <a className="button button-paper" href={calendar} download={`${session.id}.ics`}>Add to Calendar</a>}
    </div>
    {!canReschedule && <p className="portal-muted">Schedule changes become available for approved sessions once a start time is assigned.</p>}
    {!calendar && <p className="portal-muted">Calendar downloads require a confirmed start time, end time, and event timezone.</p>}
    {message && <p role="status">{message}</p>}
  </div>
}
