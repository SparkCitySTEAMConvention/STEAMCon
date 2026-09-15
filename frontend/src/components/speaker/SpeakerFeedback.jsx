import EmptyState from './EmptyState.jsx'

export default function SpeakerFeedback({ feedback }) {
  return (
    <section className="portal-feedback" aria-labelledby="feedback-heading">
      <h2 id="feedback-heading">Organizer feedback</h2>
      {feedback.length ? <ul className="portal-list">
        {feedback.map(item => (
          <li key={item.id} className={`portal-feedback-item ${item.read ? 'is-read' : 'is-unread'}`}>
            <div className="portal-feedback-meta"><span>{item.read ? 'Read' : '● Unread'}</span><span>{item.date || 'Date to be announced'}</span></div>
            <h3>{item.title}</h3>
            <p>{item.message}</p>
          </li>
        ))}
      </ul> : <EmptyState title="You’re all caught up.">Organizer notes and proposal feedback will appear here.</EmptyState>}
    </section>
  )
}
