import { authenticatedFetch } from './authService.js'

function requireValue(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} is required.`)
}

async function request(url, options) {
  const response = await authenticatedFetch(url, options)
  if (!response.ok) throw new Error(`Forum request failed (${response.status}).`)
  return response.status === 204 ? null : response.json()
}

export function getForums(scope) {
  const query = scope == null ? '' : `?${new URLSearchParams({ scope })}`
  return request(`/api/forums${query}`, { method: 'GET' })
}

export async function getMessages(forumId) {
  requireValue(forumId, 'Forum ID')
  return request(`/api/forums/${encodeURIComponent(forumId)}/messages`, { method: 'GET' })
}

export async function createMessage(forumId, { body } = {}) {
  requireValue(forumId, 'Forum ID')
  requireValue(body, 'Message body')
  return request(`/api/forums/${encodeURIComponent(forumId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body: body.trim() }),
  })
}

export const forumRepository = { getForums, getMessages, createMessage }
