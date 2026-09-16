import { attendeeData } from '../mocks/attendeeData.js'

// Temporary adapter for attendee data.
// Replace these mock operations when the backend contract is finalized.

function copyAttendeeData() {
  return {
    ...attendeeData,
    attendee: { ...attendeeData.attendee },
    admission: { ...attendeeData.admission },
    tracks: [...attendeeData.tracks],
    sessions: attendeeData.sessions.map(session => ({ ...session })),
    bookings: attendeeData.bookings.map(booking => ({ ...booking })),
    itinerary: attendeeData.itinerary.map(item => ({ ...item })),
  }
}

export const attendeeRepository = {
  getPreview() {
    return copyAttendeeData()
  },

  async getDashboard() {
    return copyAttendeeData()
  },

  async getSchedule() {
    const data = copyAttendeeData()

    return {
      tracks: data.tracks,
      sessions: data.sessions,
    }
  },

  async getSession(id) {
    const session = attendeeData.sessions.find(item => item.id === id)

    return session ? { ...session } : null
  },
}