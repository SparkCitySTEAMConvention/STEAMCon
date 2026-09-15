// Proposed UI-only panel concepts, not claims about talks or participants.
export const panels = [
  ['ai-people', 'AI With People at the Center', ['fei-fei-li', 'timnit-gebru', 'ayanna-howard'], ['technology', 'engineering']],
  ['space-imagination', 'Space, Science, and Public Imagination', ['bill-nye', 'neil-degrasse-tyson', 'mae-jemison'], ['science', 'engineering']],
  ['creative-systems', 'Creative Systems: Where Art Meets Engineering', ['refik-anadol', 'es-devlin', 'neri-oxman'], ['art', 'engineering']],
  ['patterns-proof', 'Patterns, Proof, and Big Ideas', ['eric-weinstein', 'hannah-fry', 'marcus-du-sautoy'], ['mathematics']],
  ['understand-technology', 'Building Technology People Can Understand', ['limor-fried', 'mark-rober', 'raven-baxter'], ['technology', 'engineering', 'science']],
].map(([id, title, people, trackIds]) => ({ id: `panel-${id}`, title, speakerIds: people.map(person => `speaker-${person}`), trackIds, scheduledAt: null, room: null }))
