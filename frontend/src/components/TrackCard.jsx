import { Link } from 'react-router-dom'
import { trackDestination, trackQuery } from '../utils/trackNavigation.js'
import './TrackCard.css'

export default function TrackCard({ name, slug, number, symbol, description, compact = false }) {
  return (
    <li>
      <Link className={`track-card track-${slug === 'live' ? trackQuery({ name }) : slug}`} to={trackDestination({ name })} aria-label={`Explore ${name} programming`}>
        <div className="track-meta"><span>{number} / TRACK</span><span className="track-symbol" aria-hidden="true">{symbol}</span></div>
        <h3>{name}</h3>
        {!compact && <p>{description}</p>}
      </Link>
    </li>
  )
}
