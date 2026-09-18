import { authenticatedFetch } from './authService.js'

export const calendarRepository = {
  async getMyCalendar() {
    const response = await authenticatedFetch('/api/calendar/me', { method: 'GET' })
    if (!response.ok) throw new Error(`Calendar request failed (${response.status}).`)
    const entries = await response.json()
    if (!Array.isArray(entries) || entries.some(entry => !entry || typeof entry.sourceId !== 'string' || typeof entry.entryType !== 'string')) {
      throw new Error('Invalid calendar response.')
    }
    return entries
  },
}
