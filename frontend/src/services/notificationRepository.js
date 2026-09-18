import { authenticatedFetch, authService } from './authService.js'

async function request(url, options) {
  if (!authService.hasValidBackendSession()) throw new Error('Notification requests require an authenticated backend user and active session.')
  const response = await authenticatedFetch(url, options)
  if (!response.ok) {
    throw new Error(`Notification request failed (${response.status}).`)
  }
  if (options.method === 'POST') {
    const text = await response.text()
    return text ? JSON.parse(text) : undefined
  }
  return response.json()
}

export async function getNotifications() {
  return request('/api/notifications/me', { method: 'GET' })
}

export async function markAsRead(notificationId) {
  if (typeof notificationId !== 'string' || !notificationId.trim()) throw new Error('A notification ID is required.')
  return request(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'POST',
  })
}

export const notificationRepository = { getNotifications, markAsRead }
