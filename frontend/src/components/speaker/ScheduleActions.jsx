import { useState } from 'react'
import { calendarHref, canRequestScheduleChange } from '../../utils/proposalPresentation.js'
import { authenticatedFetch } from '../../services/authService.js'

export default function ScheduleActions({ session }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  async function requestScheduleChange() {
    const reason = window.prompt('Why do you need a schedule change?')
    if (!reason?.trim()) return
    setSending(true)
    setMessage('')
    try {
      const response = await authenticatedFetch(`/api/speaker/session-assignments/${session.assignmentId || session.id}/schedule-change-requests`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim(), requestedStartsAt: null, message: 'Submitted from the speaker portal.' }),
      })
      if (!response.ok) throw new Error()
      setMessage('Schedule-change request sent to the backend.')
    } catch {
      setMessage('Unable to send the schedule-change request. Please try again.')
    } finally { setSending(false) }
  }
  const calendar = calendarHref(session)
  const canReschedule = canRequestScheduleChange(session)
  return <div className="portal-schedule-actions">
    <div className="portal-actions">
      {canReschedule && <button className="button button-paper" type="button" disabled={sending} onClick={requestScheduleChange}>{sending ? 'Sending…' : 'Request Schedule Change'}</button>}
      {calendar && <a className="button button-paper" href={calendar} download={`${session.id}.ics`}>Add to Calendar</a>}
    </div>
    {!canReschedule && <p className="portal-muted">Schedule changes become available for approved sessions once a start time is assigned.</p>}
    {!calendar && <p className="portal-muted">Calendar downloads require a confirmed start time, end time, and event timezone.</p>}
    {message && <p role="status">{message}</p>}
  </div>
}
