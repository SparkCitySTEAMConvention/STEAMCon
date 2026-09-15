// Public figures are UI-development placeholders only; no participation,
// endorsement, booking, partnership, or affiliation with STEAM Con is implied.
// No current affiliations are displayed except Bill Nye's, verified 2026-09-15:
// https://www.planetary.org/profiles/bill-nye
export const speakers = [
  ['bill-nye', 'Bill Nye', ['science'], 'Science educator and communicator.'],
  ['neil-degrasse-tyson', 'Neil deGrasse Tyson', ['science'], 'Astrophysicist and science communicator.'],
  ['raven-baxter', 'Raven Baxter', ['science'], 'Science communicator and educator.'],
  ['fei-fei-li', 'Fei-Fei Li', ['technology'], 'Researcher in artificial intelligence.'],
  ['timnit-gebru', 'Timnit Gebru', ['technology'], 'Researcher studying artificial intelligence and its social implications.'],
  ['limor-fried', 'Limor Fried', ['technology'], 'Engineer working with electronics.'],
  ['mark-rober', 'Mark Rober', ['engineering'], 'Engineer and science communicator.'],
  ['ayanna-howard', 'Ayanna Howard', ['engineering', 'technology'], 'Researcher in robotics.'],
  ['mae-jemison', 'Mae Jemison', ['engineering', 'science'], 'Engineer and former astronaut.'],
  ['refik-anadol', 'Refik Anadol', ['art'], 'Artist working with data and digital media.'],
  ['es-devlin', 'Es Devlin', ['art'], 'Artist and designer.'],
  ['neri-oxman', 'Neri Oxman', ['art', 'engineering'], 'Designer exploring relationships between nature and technology.'],
  ['eric-weinstein', 'Eric Weinstein', ['mathematics'], 'Mathematician and public commentator.'],
  ['hannah-fry', 'Hannah Fry', ['mathematics'], 'Mathematician and communicator.'],
  ['marcus-du-sautoy', 'Marcus du Sautoy', ['mathematics'], 'Mathematician and author.'],
].map(([id, name, trackIds, bio]) => ({ id: `speaker-${id}`, name, firstName: name.split(' ')[0], trackIds, bio,
  organization: id === 'bill-nye' ? 'The Planetary Society' : null,
  role: id === 'bill-nye' ? 'Chief Ambassador and Vice Chairman' : null,
}))
