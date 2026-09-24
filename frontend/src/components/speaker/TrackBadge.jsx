import { useEffect, useState } from 'react'
import { eventRepository } from '../../services/eventRepository.js'

export default function TrackBadge({ trackId }) {
  const [name, setName] = useState('Track to be announced')

  useEffect(() => {
    let active = true
    if (!trackId) return undefined
    eventRepository.getTrack(trackId)
      .then(track => { if (active) setName(track?.name || 'Track to be announced') })
      .catch(() => { if (active) setName('Track to be announced') })
    return () => { active = false }
  }, [trackId])

  return <span className="portal-track-label portal-badge">{name}</span>
}
