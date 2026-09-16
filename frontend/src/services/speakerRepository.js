import { getSpeakerData } from '../mocks/speakerData.js'
import { proposals } from '../mocks/proposals.js'
import { speakers } from '../mocks/speakers.js'
import { authenticatedFetch } from './authService.js'
// Dashboard reads and draft edits remain mock operations; submission uses the API.
const edits = new Map()
export const speakerRepository = {
  async getDashboard() {
    const data = getSpeakerData('speaker-bill-nye')
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
  async createProposal({ speakerId, title, description, trackId } = {}) {
    for (const [name, value] of Object.entries({ speakerId, title, description, trackId })) {
      if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} is required.`)
    }
    const response = await authenticatedFetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speakerId, title: title.trim(), description: description.trim(), trackId }),
    })
    if (!response.ok) {
      throw new Error(`Proposal submission failed (${response.status}).`)
    }
    return response.json()
  },
}
