import { tracks } from '../../mocks/tracks.js'
export default function TrackBadge({ trackId }) {
  return <span className={`portal-track-label portal-badge portal-track-${trackId}`}>{tracks.find(track => track.id === trackId)?.name || 'Track to be announced'}</span>
}
