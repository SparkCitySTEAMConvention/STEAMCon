import { passBySlug } from '../config/passes.js'
import { trackQuery } from './trackNavigation.js'

export const registrationTracks = ['Science', 'Technology', 'Engineering', 'Art', 'Mathematics']

export function registrationPrefill(searchParams) {
  const role = searchParams.get('role') === 'speaker' ? 'speaker' : 'attendee'
  return {
    role,
    track: registrationTracks.find(name => trackQuery({ name }) === searchParams.get('track')) || '',
    passType: (role === 'attendee' && passBySlug(searchParams.get('pass'))?.name) || 'All-Access Pass',
  }
}

export function passRegistrationDestination(track, pass) {
  return `/register?${new URLSearchParams({ role: 'attendee', track: trackQuery(track), pass: pass.slug })}`
}
