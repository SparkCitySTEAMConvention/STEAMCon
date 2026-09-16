export default function TrackCard({ name, slug, number, symbol, description }) {
  return (
    <li className={`track-card track-${slug}`} tabIndex={0}>
      <div className="track-meta"><span>{number} / TRACK</span><span className="track-symbol" aria-hidden="true">{symbol}</span></div>
      <h3>{name}</h3>
      <p>{description}</p>
    </li>
  )
}
