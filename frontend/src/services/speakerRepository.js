import { getSpeakerData } from '../mocks/speakerData.js'
import { proposals } from '../mocks/proposals.js'
import { speakers } from '../mocks/speakers.js'
import { authenticatedFetch } from './authService.js'
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function requireUuid(value, label) {
  if (typeof value !== 'string' || !uuid.test(value)) throw new Error(`${label} must be a valid UUID.`)
}
async function request(path, currentUserId, options = {}) {
  requireUuid(currentUserId, 'Speaker identity')
  const query = new URLSearchParams({ speakerId: currentUserId })
  const response = await authenticatedFetch(`${path}?${query}`, { method: 'GET', ...options })
  if (!response.ok) throw new Error(`Speaker request failed (${response.status}). Please retry.`)
  return response.status === 204 ? null : response.json()
}
const edits = new Map()
export const speakerRepository = {
  getSpeakerDashboard(currentUserId) { return request('/api/speaker/dashboard', currentUserId) },
  getMyProposals(currentUserId) { return request('/api/proposals/me', currentUserId) },
  async updateProposal(id, currentUserId, changes) {
    requireUuid(id, 'Proposal ID')
    if (changes.trackId != null) requireUuid(changes.trackId, 'Track ID')
    const body = Object.fromEntries(['title', 'description', 'trackId'].filter(key => changes[key] !== undefined).map(key => [key, changes[key]]))
    return request(`/api/proposals/${id}`, currentUserId, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  },
  async withdrawProposal(id, currentUserId) {
    requireUuid(id, 'Proposal ID')
    return request(`/api/proposals/${id}`, currentUserId, { method: 'DELETE' })
  },
  async getDashboard() {
    const data = getSpeakerData('speaker-bill-nye')
    return { ...data, proposals: data.proposals.map(proposal => edits.get(proposal.id) || proposal) }
  },
  async getProposal(id, currentUserId) {
    if (arguments.length > 1) { requireUuid(id, 'Proposal ID'); return request(`/api/proposals/${id}`, currentUserId) }
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
  async createProposal({ title, description, trackId } = {}) {
    for (const [name, value] of Object.entries({ title, description, trackId })) {
      if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} is required.`)
    }
    requireUuid(trackId, 'Track ID')
    const response = await authenticatedFetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), description: description.trim(), trackId }),
    })
    if (!response.ok) {
      throw new Error(`Proposal submission failed (${response.status}).`)
    }
    return response.json()
  },
}
