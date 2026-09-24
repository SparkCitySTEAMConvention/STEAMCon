import { authenticatedFetch } from './authService.js'
import { eventRepository } from './eventRepository.js'

export const profileLimits = { name: 255, role: 255, organization: 255, bio: 2000 }
export const profileFields = [['name', 'Display name'], ['role', 'Current title'], ['organization', 'Organization'], ['bio', 'Professional biography']]
export const profileUnavailable = 'Profile service is unavailable.'

export function validateProfile(input = {}, tracks = []) {
  const errors = {}
  for (const [field, label] of profileFields) {
    const value = input[field]
    if (typeof value !== 'string' || !value.trim()) errors[field] = `${label} is required.`
    else if (value.trim().length > profileLimits[field]) errors[field] = `${label} must be ${profileLimits[field]} characters or fewer.`
  }
  if (input.trackId && tracks.length && !tracks.some(track => track.id === input.trackId)) errors.trackId = 'Choose an available primary track.'
  return errors
}

function adaptProfile(record) {
  return {
    id: record.id, speakerId: record.speakerId,
    name: record.displayName || '', role: record.title || '', organization: record.organization || '', bio: record.biography || '',
    trackIds: [],
  }
}

export function createSpeakerProfileSource(user, authSource, hasBackendSession = false) {
  const available = authSource === 'backend' && user?.role === 'SPEAKER' && hasBackendSession === true
  let revision = 0
  const listeners = new Set()
  function requireEditing() { if (!available) throw new Error('Profile editing requires a verified backend speaker session.') }
  return {
    demo: false, identityAvailable: available, available,
    getRevision: () => revision,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
    async getProfile() {
      requireEditing()
      const response = await authenticatedFetch('/api/speaker/profile/me')
      if (!response.ok) throw new Error(`Profile request failed (${response.status}).`)
      return adaptProfile(await response.json())
    },
    async getTracks() { requireEditing(); return eventRepository.getTracks() },
    async updateProfile(input) {
      requireEditing()
      const tracks = await eventRepository.getTracks()
      const errors = validateProfile(input, tracks)
      if (Object.keys(errors).length) throw new Error(Object.values(errors)[0])
      const response = await authenticatedFetch('/api/speaker/profile/me', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: input.name.trim(), title: input.role.trim(), organization: input.organization.trim(), biography: input.bio.trim() }),
      })
      if (!response.ok) throw new Error(`Profile update failed (${response.status}).`)
      revision += 1; listeners.forEach(listener => listener())
      return adaptProfile(await response.json())
    },
  }
}
export function getSpeakerProfileSource(user, authSource, hasBackendSession) { return createSpeakerProfileSource(user, authSource, hasBackendSession) }
