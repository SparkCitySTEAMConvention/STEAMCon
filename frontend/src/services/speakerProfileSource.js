import { speakerRepository } from './speakerRepository.js'
import { speakers } from '../mocks/speakers.js'
import { tracks } from '../mocks/tracks.js'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const profileLimits = { name: 255, role: 255, organization: 255, bio: 4000 }
export const profileFields = [
  ['name', 'Display name'], ['role', 'Current title'],
  ['organization', 'Organization'], ['bio', 'Professional biography'],
]
export const profileUnavailable = 'Profile editing requires an active Speaker session.'
export function validateProfile(input = {}, demo = true) {
  const errors = {}
  for (const [field, label] of profileFields) {
    const value = input[field]
    if (typeof value !== 'string' || !value.trim()) errors[field] = `${label} is required.`
    else if (value.trim().length > profileLimits[field]) errors[field] = `${label} must be ${profileLimits[field]} characters or fewer.`
  }
  if (demo && !tracks.some(track => track.id === input.trackId)) errors.trackId = 'Choose an available primary track.'
  return errors
}

export function createSpeakerProfileSource(user, authSource, hasBackendSession = false, repository = speakerRepository) {
  const demo = authSource === 'demo' && user?.role === 'SPEAKER'
  const identityAvailable = demo || (authSource === 'backend' && user?.role === 'SPEAKER' && uuid.test(user?.id || '') && hasBackendSession === true)
  let profile = demo ? structuredClone(speakers.find(speaker => speaker.id === 'speaker-bill-nye')) : undefined
  let pending = false
  let revision = 0
  const listeners = new Set()
  function requireEditing() {
    if (!identityAvailable) throw new Error('Profile editing requires a verified backend speaker UUID, Speaker role and active session. Sign in again or use the speaker preview.')
  }
  return {
    demo, identityAvailable, available: identityAvailable,
    getRevision: () => revision,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    async getProfile() { requireEditing(); return !demo && profile === undefined ? repository.getMyProfile() : structuredClone(profile) },
    async getTracks() { requireEditing(); return demo ? tracks.map(track => ({ ...track })) : [] },
    async updateProfile(input) {
      requireEditing()
      const errors = validateProfile(input, demo)
      if (Object.keys(errors).length) throw new Error(Object.values(errors)[0])
      if (pending) throw new Error('Profile save is already pending.')
      if (!demo) {
        pending = true
        try {
          const updated = await repository.updateMyProfile({ displayName: input.name.trim(), title: input.role.trim(), organization: input.organization.trim(), biography: input.bio.trim() })
          profile = structuredClone(updated)
          revision += 1
          listeners.forEach(listener => listener())
          return structuredClone(updated)
        } finally { pending = false }
      }
      const changes = Object.fromEntries(profileFields.map(([field]) => [field, input[field].trim()]))
      profile = { ...profile, ...changes, firstName: changes.name.split(/\s+/)[0], trackIds: [input.trackId, ...profile.trackIds.filter(id => id !== profile.trackIds[0] && id !== input.trackId)] }
      revision += 1
      listeners.forEach(listener => listener())
      return structuredClone(profile)
    },
  }
}
// AuthContext keeps this user object across routes; a new login or app reset
// receives a new object and therefore a fresh in-memory preview source.
const sessionSources = new WeakMap()
export function getSpeakerProfileSource(user, authSource, hasBackendSession) {
  if (!user) return createSpeakerProfileSource(user, authSource, hasBackendSession)
  let sources = sessionSources.get(user)
  if (!sources) { sources = new Map(); sessionSources.set(user, sources) }
  const key = `${authSource}-${hasBackendSession}`
  if (!sources.has(key)) sources.set(key, createSpeakerProfileSource(user, authSource, hasBackendSession))
  return sources.get(key)
}

export function profileFormValues(profile, demo) { return demo ? profile : { name: profile?.displayName, role: profile?.title, organization: profile?.organization, bio: profile?.biography } }
