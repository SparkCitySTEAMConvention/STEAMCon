import { authenticatedFetch } from './authService.js'
import { eventRepository } from './eventRepository.js'
import { bookingRepository } from './bookingRepository.js'

async function get(path) {
  const response = await authenticatedFetch(path)
  if (!response.ok) throw new Error(`Attendee request failed (${response.status}).`)
  return response.json()
}
const easternDate = value => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' }) : 'Date pending'
const easternTime = value => value ? new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) : 'Time pending'

function sessionModel(session, tracks, occurrences, enrollments) {
  const occurrence = occurrences.find(item => item.sessionId === session.id)
  const enrolled = occurrence && enrollments.some(item => item.sessionOccurrenceId === occurrence.id && item.status === 'ENROLLED')
  return {
    ...session, occurrenceId: occurrence?.id ?? null, enrolled: Boolean(enrolled),
    track: tracks.find(track => track.id === session.trackId)?.name || 'Track',
    format: 'Session', speaker: 'Speaker details available in the directory',
    day: easternDate(occurrence?.startsAt), time: easternTime(occurrence?.startsAt),
    location: 'Jacob K. Javits Convention Center', order: occurrence?.startsAt ? Date.parse(occurrence.startsAt) : Number.MAX_SAFE_INTEGER,
  }
}

function bookingCards(travel, hotels, reservations, cars) {
  const firstTravel = travel[0]
  const reservation = reservations[0]
  const hotel = reservation ? hotels.find(item => item.id === reservation.hotelId) : null
  const car = cars[0]
  return [
    { id: 'travel', label: 'Air or train', href: '/attendee/travel', title: firstTravel ? `${firstTravel.origin} → ${firstTravel.destination}` : 'Book your travel', status: firstTravel ? 'Booked' : 'Not booked', tone: firstTravel ? 'confirmed' : 'pending', detail: firstTravel ? `${easternDate(firstTravel.departureAt)} at ${easternTime(firstTravel.departureAt)}` : 'Add your flight or train details.', action: firstTravel ? 'View trip' : 'Book travel' },
    { id: 'hotel', label: 'Hotel', href: '/attendee/hotel', title: hotel?.name || 'Choose a hotel', status: reservation ? 'Booked' : 'Not booked', tone: reservation ? 'confirmed' : 'pending', detail: reservation ? `${easternDate(reservation.checkin)} – ${easternDate(reservation.checkOut)}` : 'Reserve your stay near Javits Center.', action: reservation ? 'View stay' : 'Find hotel' },
    { id: 'car', label: 'Rental car', href: '/attendee/car', title: car ? `Pickup: ${car.pickupLocation}` : 'Reserve a car', status: car ? 'Booked' : 'Not booked', tone: car ? 'confirmed' : 'pending', detail: car ? `${easternDate(car.pickupAt)} at ${easternTime(car.pickupAt)}` : 'Add ground transportation if you need it.', action: car ? 'View rental' : 'Reserve car' },
  ]
}

function itineraryModels(travel, hotels, reservations, cars, sessions) {
  const rows = []
  travel.forEach(item => rows.push({ id: item.id, type: 'Travel', title: `${item.origin} → ${item.destination}`, day: easternDate(item.departureAt), time: easternTime(item.departureAt), location: item.destination, order: Date.parse(item.departureAt) }))
  reservations.forEach(item => { const hotel = hotels.find(h => h.id === item.hotelId); rows.push({ id: item.id, type: 'Hotel', title: `${hotel?.name || 'Hotel'} check-in`, day: easternDate(item.checkin), time: easternTime(item.checkin), location: hotel?.address || 'New York, NY', order: Date.parse(item.checkin) }) })
  cars.forEach(item => rows.push({ id: item.id, type: 'Rental car', title: 'Rental car pickup', day: easternDate(item.pickupAt), time: easternTime(item.pickupAt), location: item.pickupLocation, order: Date.parse(item.pickupAt) }))
  sessions.filter(item => item.enrolled).forEach(item => rows.push({ ...item, type: item.track }))
  return rows.sort((a,b) => a.order - b.order)
}

export const attendeeRepository = {
  getPreview() { return { attendee: { firstName: '', name: '', email: '' }, admission: { type: 'Loading…', status: 'Loading…', confirmationCode: '—' }, tracks: [], sessions: [], bookings: [], itinerary: [] } },
  async getDashboard() {
    const [auth, admission, tracks, sessions, occurrences, enrollments, hotels, travel, reservations, cars] = await Promise.all([
      get('/api/auth/me'), get('/api/admission/me'), eventRepository.getTracks(), eventRepository.getSessions(), eventRepository.getSessionOccurrences(), get('/api/enrollments/me'), bookingRepository.getHotels(), bookingRepository.getTravelLegs(), bookingRepository.getHotelReservations(), bookingRepository.getCarRentals(),
    ])
    const models = sessions.map(session => sessionModel(session, tracks, occurrences, enrollments))
    const name = auth.user.displayName || auth.user.email
    return {
      attendee: { id: auth.user.id, name, firstName: name.split(/\s+/)[0], email: auth.user.email },
      admission: { type: admission.type, status: admission.status === 'ACTIVE' ? 'Active' : admission.status, confirmationCode: admission.admissionId ? admission.admissionId.slice(0, 8).toUpperCase() : '—' },
      tracks: tracks.map(track => track.name), sessions: models,
      bookings: bookingCards(travel, hotels, reservations, cars),
      itinerary: itineraryModels(travel, hotels, reservations, cars, models),
    }
  },
  async getSchedule() { const data = await this.getDashboard(); return { tracks: data.tracks, sessions: data.sessions } },
  async enroll(sessionOccurrenceId) {
    const response = await authenticatedFetch('/api/enrollments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionOccurrenceId }) })
    if (!response.ok) throw new Error(`Enrollment failed (${response.status}).`)
    return response.json()
  },
  async cancel(sessionOccurrenceId) {
    const response = await authenticatedFetch(`/api/enrollments?${new URLSearchParams({ sessionOccurrenceId })}`, { method: 'DELETE' })
    if (!response.ok) throw new Error(`Enrollment cancellation failed (${response.status}).`)
  },
}
