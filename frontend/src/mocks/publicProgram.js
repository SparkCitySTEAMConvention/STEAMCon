import { attendeeData } from './attendeeData.js'

export const publicTracks = [
  { name: 'Science', slug: 'science', symbol: '◎', description: 'Ask bigger questions. Discover new perspectives.' },
  { name: 'Technology', slug: 'technology', symbol: '</>', description: 'Explore the tools changing how we connect and create.' },
  { name: 'Engineering', slug: 'engineering', symbol: '⌘', description: 'Turn bold ideas into things that work.' },
  { name: 'Art', slug: 'art', symbol: '✳', description: 'Challenge the familiar. Make room for imagination.' },
  { name: 'Mathematics', slug: 'mathematics', symbol: '∞', description: 'Find the patterns that open up new possibilities.' },
]
export const publicProgramPreview = { tracks: publicTracks, sessions: attendeeData.sessions, trackNames: attendeeData.tracks }
