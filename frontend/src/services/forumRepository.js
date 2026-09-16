import { authenticatedFetch } from './authService.js'

function requireValue(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} is required.`)
}

async function request(url, options) {
  const response = await authenticatedFetch(url, options)
  if (!response.ok) {
    throw new Error(`Forum request failed (${response.status}).`)
  }
  return response.json()
}

export function getForums(scope) {
  const query = scope == null ? '' : `?${new URLSearchParams({ scope })}`
  return request(`/api/forums${query}`, { method: 'GET' })
}

export async function getMessages(forumId, role, permission) {
  requireValue(forumId, 'Forum ID')
  requireValue(role, 'Role')
  requireValue(permission, 'Permission')
  const query = new URLSearchParams({ role, permission })
  return request(`/api/forums/${encodeURIComponent(forumId)}/messages?${query}`, {
    method: 'GET',
  })
}

export async function createMessage(forumId, message = {}) {
  const { authorId, body, role, permission } = message ?? {}
  requireValue(forumId, 'Forum ID')
  requireValue(authorId, 'Author ID')
  requireValue(body, 'Message body')
  requireValue(role, 'Role')
  requireValue(permission, 'Permission')
  return request(`/api/forums/${encodeURIComponent(forumId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorId, body: body.trim(), role, permission }),
  })
}

export const forumRepository = { getForums, getMessages, createMessage }
