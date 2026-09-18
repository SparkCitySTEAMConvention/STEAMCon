import { useEffect, useRef, useState } from 'react'

export default function SpeakerNotifications({ source }) {
  const [notifications, setNotifications] = useState([])
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  const [pending, setPending] = useState({})
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const submissions = useRef(new Set())
  const active = useRef(false)
  useEffect(() => {
    active.current = true
    return () => { active.current = false }
  }, [])
  useEffect(() => {
    let current = true
    source.getNotifications().then(data => {
      if (!current) return
      if (!Array.isArray(data) || data.some(item => !item || typeof item.id !== 'string' || typeof item.message !== 'string' || typeof item.read !== 'boolean')) throw new Error('Invalid notification response.')
      setNotifications(data)
      setStatus('ready')
    }).catch(() => { if (current) setStatus('error') })
    return () => { current = false }
  }, [source, attempt])
  async function markAsRead(id) {
    if (submissions.current.has(id)) return
    submissions.current.add(id)
    setPending(previous => ({ ...previous, [id]: true }))
    setErrors(previous => ({ ...previous, [id]: '' }))
    setNotice('')
    try {
      const updated = await source.markAsRead(id)
      if (!active.current) return
      if (updated?.id === id && typeof updated.read === 'boolean' && typeof updated.message === 'string') {
        setNotifications(previous => previous.map(item => item.id === id ? updated : item))
      } else {
        // A successful acknowledgment need not contain a notification record.
        const data = await source.getNotifications()
        if (!Array.isArray(data) || data.some(item => !item || typeof item.id !== 'string' || typeof item.message !== 'string' || typeof item.read !== 'boolean')) throw new Error('Invalid notification response.')
        if (!active.current) return
        setNotifications(data)
      }
      setNotice('Notification marked as read.')
    } catch {
      if (active.current) setErrors(previous => ({ ...previous, [id]: 'Unable to mark this notification as read. It remains unread. Try Mark as read again.' }))
    } finally {
      submissions.current.delete(id)
      if (active.current) setPending(previous => ({ ...previous, [id]: false }))
    }
  }
  return <section className="portal-notifications" aria-labelledby="notifications-heading">
    <h2 id="notifications-heading">Notifications &amp; next steps</h2>
    {source.demo && <p className="portal-muted">Bill Nye preview notifications. Read changes stay in this application session; no API requests are sent.</p>}
    <p role="status" aria-live="polite">{source.available && status === 'loading' ? 'Loading notifications…' : notice}</p>
    {!source.available ? <p role="alert">Notifications are unavailable without a verified backend user and active session. Sign in again or use the speaker preview.</p> : status === 'error' ? <div role="alert"><p>Unable to load notifications. Check your connection or sign in again, then retry.</p><button type="button" className="button button-paper" onClick={() => { setStatus('loading'); setAttempt(value => value + 1) }}>Retry notifications</button></div> : status === 'ready' && <>
      {notifications.length ? <ul className="portal-list portal-notification-list">{notifications.map((item, index) => {
        const title = typeof item.type === 'string' ? item.type.replaceAll('_', ' ') : 'Notification'
        const timestamp = typeof item.createdAt === 'string' && Number.isFinite(Date.parse(item.createdAt)) ? item.createdAt : null
        const headingId = `notification-heading-${index}`
        return <li key={item.id} className="portal-notification">
          <h3 id={headingId}>{title}</h3><p>{item.message}</p>
          <div className="portal-notification-meta"><span>{item.read ? 'Read' : 'Unread'}</span>{timestamp && <time dateTime={timestamp}>{new Date(timestamp).toLocaleString()}</time>}
            {!item.read && <button type="button" className="button button-paper" aria-describedby={headingId} disabled={!!pending[item.id]} onClick={() => markAsRead(item.id)}>{pending[item.id] ? 'Marking as read…' : 'Mark as read'}</button>}
          </div>{errors[item.id] && <p role="alert">{errors[item.id]}</p>}
        </li>
      })}</ul> : <p>No notifications yet. Updates from organizers will appear here.</p>}
    </>}
  </section>
}
