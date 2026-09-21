import { timestampLabel } from '../../utils/proposalPresentation.js'
import { conventionConfig } from '../../config/conventionConfig.js'
import EmptyState from './EmptyState.jsx'

export default function SpeakerFeedback({ feedback }) {
  return (
    <section className="portal-feedback" aria-labelledby="feedback-heading">
      <h2 id="feedback-heading">Organizer feedback</h2>
      {feedback.length ? <ul className="portal-list">
        {feedback.map(item => (
          <li key={item.id} className={`portal-feedback-item ${typeof item.read === 'boolean' ? item.read ? 'is-read' : 'is-unread' : ''}`}>
            <div className="portal-feedback-meta">{typeof item.read === 'boolean' && <span>{item.read ? 'Read' : '● Unread'}</span>}<span>{timestampLabel(item.date, conventionConfig.timezone)}</span></div>
            <h3>{item.title}</h3>
            <p>{item.message}</p>
          </li>
        ))}
      </ul> : <EmptyState title="You’re all caught up.">Organizer notes and proposal feedback will appear here.</EmptyState>}
    </section>
  )
}
