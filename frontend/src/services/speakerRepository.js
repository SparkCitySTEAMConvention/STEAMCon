import { getSpeakerData } from '../mocks/speakerData.js'
import { proposals } from '../mocks/proposals.js'
import { speakers } from '../mocks/speakers.js'
// Replace this adapter when Backend C supplies its contract. These methods are
// frontend operations, not proposed URLs, payloads, authentication or API schemas.
const edits = new Map()
export const speakerRepository = {
  async getDashboard(speakerId) {
    const data = getSpeakerData(speakerId)
    return { ...data, proposals: data.proposals.map(proposal => edits.get(proposal.id) || proposal) }
  },
  async getProposal(id) {
    const proposal = edits.get(id) || proposals.find(item => item.id === id)
    return proposal ? { ...proposal, speakers: proposal.speakerIds.map(speakerId => speakers.find(person => person.id === speakerId)) } : null
  },
  async saveDraft(id, changes) {
    const proposal = edits.get(id) || proposals.find(item => item.id === id)
    if (proposal?.status !== 'Draft') throw new Error('Only drafts can be edited.')
    if (!changes.title.trim() || !changes.abstract.trim()) throw new Error('Enter a title and abstract.')
    edits.set(id, { ...proposal, title: changes.title.trim(), abstract: changes.abstract.trim(), trackId: changes.trackId, format: changes.format, durationMinutes: changes.durationMinutes })
    return this.getProposal(id)
  },
}
