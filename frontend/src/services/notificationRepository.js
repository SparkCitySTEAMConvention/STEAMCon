import { authenticatedFetch } from './authService.js'

async function request(url, options) {
  const response = await authenticatedFetch(url, options)
  if (!response.ok) {
    throw new Error(`Notification request failed (${response.status}).`)
  }
  return response.json()
}

export async function getNotifications(userId) {
  if (typeof userId !== 'string' || !userId.trim()) throw new Error('A user ID is required.')
  const query = new URLSearchParams({ userId })
  return request(`/api/notifications/me?${query}`, { method: 'GET' })
}

export async function markAsRead(notificationId) {
  if (typeof notificationId !== 'string' || !notificationId.trim()) throw new Error('A notification ID is required.')
  return request(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'POST',
  })
}

export const notificationRepository = { getNotifications, markAsRead }
