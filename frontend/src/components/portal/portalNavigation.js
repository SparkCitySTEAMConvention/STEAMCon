const hasRole = (user, role) => user?.roles?.includes(role) || user?.role === role

// Null destinations are deliberate gaps in the existing route graph.
export function getPortalNavigation(user) {
  const attendee = hasRole(user, 'ATTENDEE')
  const speaker = hasRole(user, 'SPEAKER')
  if (!attendee && !speaker) return []
  return [
    { id: 'explore', label: 'Explore', to: '/events', group: 'Convention' },
    { id: 'calendar', label: 'Calendar', to: attendee ? '/attendee#schedule' : null, unavailable: 'Use My itinerary for personal calendar entries', group: 'Convention' },
    { id: 'itinerary', label: 'My itinerary', to: speaker ? '/speaker#speaker-itinerary' : '/attendee#itinerary', group: 'Convention' },
    { id: 'travel', label: 'Travel', to: attendee ? '/attendee/travel' : '/travel', description: attendee ? null : 'Travel planning', group: 'Your trip' },
    { id: 'hotel', label: 'Hotel', to: attendee ? '/attendee/hotel' : null, unavailable: 'Booking currently requires an Attendee account', group: 'Your trip' },
    { id: 'car', label: 'Car rental', to: attendee ? '/attendee/car' : null, unavailable: 'Booking currently requires an Attendee account', group: 'Your trip' },
    { id: 'forums', label: 'Forums', to: speaker ? '/speaker/forums' : null, unavailable: 'No Attendee forum destination is available', group: 'Community' },
    { id: 'notifications', label: 'Notifications', to: speaker ? '/speaker#speaker-updates' : null, unavailable: 'No Attendee notifications destination is available', group: 'Community' },
    { id: 'account', label: 'Account', to: speaker ? '/speaker#speaker-profile' : '/attendee', group: 'Community' },
    ...(speaker ? [
      { id: 'proposals', label: 'My proposals', to: '/speaker#speaker-proposals', group: 'Speaking' },
      { id: 'speaking', label: 'Speaking schedule', to: '/speaker#speaker-engagements', group: 'Speaking' },
    ] : []),
  ]
}

export function isPortalDestinationActive(to, location) {
  if (!to) return false
  const [pathname, hash = ''] = to.split('#')
  return pathname === location.pathname && location.hash === (hash ? `#${hash}` : '')
}
