// Editorial preview metadata only; never merge this into backend session records.
export const eventExperiences = [
  { key: 'workshops', label: 'Workshops', description: 'Proposed hands-on opportunities to explore, experiment, and build together.' },
  { key: 'talks', label: 'Talks & Panels', description: 'Proposed conversations and presentations across STEAM disciplines.' },
  { key: 'special', label: 'Keynotes & Special Events', description: 'Proposed shared experiences to bring the STEAM Con community together.' },
  { key: 'showcase', label: 'Showcases', description: 'Proposed opportunities to discover creative projects and new ideas.' },
  { key: 'schedule', label: 'Schedule', description: 'Browse the program below. Preview entries are demonstration data; live entries show published records only.' },
]

// Proposed editorial concepts, not backend sessions or confirmed programming.
export const previewExperienceEvents = [
  { id: 'preview-workshop-build', experience: 'workshops', title: 'Build, test, imagine', description: 'A proposed hands-on workshop exploring how an idea becomes a working prototype.', featured: true },
  { id: 'preview-workshop-patterns', experience: 'workshops', title: 'Patterns in practice', description: 'A proposed creative workshop connecting mathematics, art, and everyday discovery.' },
  { id: 'preview-talk-crossroads', experience: 'talks', title: 'Ideas at the crossroads', description: 'A proposed panel on what different disciplines can learn from one another.', featured: true },
  { id: 'preview-talk-tools', experience: 'talks', title: 'Tools for a shared future', description: 'A proposed conversation about technology, creativity, and collaboration.' },
  { id: 'preview-special-curiosity', experience: 'special', title: 'A shared invitation to curiosity', description: 'A proposed keynote bringing the five STEAM disciplines into one conversation.', featured: true },
  { id: 'preview-special-community', experience: 'special', title: 'Community connections', description: 'A proposed gathering for exchanging ideas and meeting fellow STEAM explorers.' },
  { id: 'preview-showcase-making', experience: 'showcase', title: 'Making possibilities visible', description: 'A proposed showcase of projects combining creative and technical thinking.', featured: true },
  { id: 'preview-showcase-discovery', experience: 'showcase', title: 'Discovery in progress', description: 'A proposed showcase exploring experiments, prototypes, and emerging ideas.' },
]
export function eventsForExperience(key) {
  return previewExperienceEvents.filter(event => event.experience === key)
}

// Missing and invalid experience queries default to the schedule overview.
export const defaultExperience = 'schedule'
export function selectedExperience(query) {
  return eventExperiences.find(item => item.key === query) || eventExperiences.find(item => item.key === defaultExperience)
}
export const experienceDestination = key => `/events?experience=${encodeURIComponent(key)}`
