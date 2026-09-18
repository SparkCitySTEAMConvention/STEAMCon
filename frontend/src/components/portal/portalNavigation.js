const hasRole = (user, role) => user?.roles?.includes(role) || user?.role === role

// Null destinations are deliberate gaps in the existing route graph.
export function getPortalNavigation(user) {
  const attendee = hasRole(user, 'ATTENDEE')
  const speaker = hasRole(user, 'SPEAKER')
  if (!attendee && !speaker) return []
  return [
    { id: 'explore', label: 'Explore', to: '/events', group: 'Convention' },
    { id: 'tracks', label: 'Tracks', to: '/tracks', group: 'Convention' },
    { id: 'directory', label: 'Speakers', to: '/speakers', group: 'Convention' },
    { id: 'planning', label: 'Travel planning', to: '/travel', group: 'Your trip' },
    { id: 'calendar', label: 'Calendar', to: attendee ? '/attendee#schedule' : null, unavailable: 'Use My itinerary for personal calendar entries', group: 'Convention' },
    { id: 'itinerary', label: 'My itinerary', to: speaker ? '/speaker#speaker-itinerary' : '/attendee#itinerary', group: 'Convention' },
    { id: 'travel', label: 'Travel', to: attendee ? '/attendee/travel' : null, unavailable: 'No Speaker travel booking destination is available', group: 'Your trip' },
    { id: 'hotel', label: 'Hotel', to: attendee ? '/attendee/hotel' : null, unavailable: 'Booking currently requires an Attendee account', group: 'Your trip' },
    { id: 'car', label: 'Car rental', to: attendee ? '/attendee/car' : null, unavailable: 'Booking currently requires an Attendee account', group: 'Your trip' },
    { id: 'forums', label: 'Forums', to: speaker ? '/speaker/forums' : null, unavailable: 'No Attendee forum destination is available', group: 'Community' },
    { id: 'notifications', label: 'Notifications', to: speaker ? '/speaker#speaker-updates' : null, unavailable: 'No Attendee notifications destination is available', group: 'Community' },
    { id: 'account', label: 'Account', to: speaker ? '/speaker#speaker-profile' : '/attendee', activePaths: speaker ? ['/speaker/profile/edit'] : [], group: 'Community' },
    ...(speaker ? [
      { id: 'overview', label: 'Overview', to: '/speaker', group: 'Speaking' },
      { id: 'proposals', label: 'My proposals', to: '/speaker#speaker-proposals', activePaths: ['/speaker/proposals/'], group: 'Speaking' },
      { id: 'speaking', label: 'Speaking schedule', to: '/speaker#speaker-engagements', group: 'Speaking' },
    ] : []),
  ]
}

export function isPortalDestinationActive(to, location, activePaths = []) {
  if (!to) return false
  if (activePaths.some(path => location.pathname === path || (path.endsWith('/') && location.pathname.startsWith(path)))) return true
  const [pathname, hash = ''] = to.split('#')
  return pathname === location.pathname && (['/events', '/tracks', '/speakers', '/travel'].includes(pathname) || location.hash === (hash ? `#${hash}` : ''))
}
