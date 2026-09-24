import { authenticatedFetch } from './authService.js'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function requireUuid(value, label) { if (typeof value !== 'string' || !uuid.test(value)) throw new Error(`${label} must be a valid UUID.`) }
async function request(path, options = {}) {
  const response = await authenticatedFetch(path, { method: 'GET', ...options })
  if (!response.ok) throw new Error(`Speaker request failed (${response.status}). Please retry.`)
  return response.status === 204 ? null : response.json()
}
export const speakerRepository = {
  getSpeakerDashboard() { return request('/api/speaker/dashboard/me') },
  getMyProposals() { return request('/api/proposals/me') },
  getMyAssignments() { return request('/api/speaker/session-assignments/me') },
  async updateProposal(id, _currentUserId, changes) {
    requireUuid(id, 'Proposal ID')
    if (changes.trackId != null) requireUuid(changes.trackId, 'Track ID')
    const body = Object.fromEntries(['title', 'description', 'trackId'].filter(key => changes[key] !== undefined).map(key => [key, changes[key]]))
    return request(`/api/proposals/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  },
  async withdrawProposal(id) { requireUuid(id, 'Proposal ID'); return request(`/api/proposals/${id}`, { method: 'DELETE' }) },
  async getProposal(id) { requireUuid(id, 'Proposal ID'); return request(`/api/proposals/${id}`) },
  async createProposal({ title, description, trackId } = {}) {
    for (const [name, value] of Object.entries({ title, description, trackId })) if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} is required.`)
    requireUuid(trackId, 'Track ID')
    return request('/api/proposals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim(), description: description.trim(), trackId }) })
  },
}
