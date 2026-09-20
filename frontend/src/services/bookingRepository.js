import { authenticatedFetch } from './authService.js'

async function request(url, options = {}) {
  const response = await authenticatedFetch(url, options)
  if (!response.ok) throw new Error(`Booking request failed (${response.status}).`)
  return response.status === 204 ? null : response.json()
}

const json = body => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const toInstant = (date, time) => new Date(`${date}T${time}:00`).toISOString()

export const bookingRepository = {
  getHotels: () => request('/api/hotels'),
  getTravelLegs: () => request('/api/travel-legs/me'),
  getCarRentals: () => request('/api/car-rentals/me'),
  getHotelReservations: () => request('/api/hotel-reservations/me'),
  async bookRoundTrip(form) {
    const outbound = await request('/api/travel-legs', { method: 'POST', ...json({
      origin: form.origin, destination: form.destination,
      departureAt: toInstant(form.departureDate, form.departureTime),
      arrivalAt: toInstant(form.departureDate, form.departureTime),
    }) })
    const inbound = await request('/api/travel-legs', { method: 'POST', ...json({
      origin: form.destination, destination: form.origin,
      departureAt: toInstant(form.returnDate, form.returnTime),
      arrivalAt: toInstant(form.returnDate, form.returnTime),
    }) })
    return { outbound, inbound }
  },
  bookCar(form) {
    return request('/api/car-rentals', { method: 'POST', ...json({
      pickupLocation: form.pickupLocation, dropoffLocation: form.dropoffLocation,
      pickupAt: toInstant(form.pickupDate, form.pickupTime),
      dropoffAt: toInstant(form.dropoffDate, form.dropoffTime),
    }) })
  },
  bookHotel(hotelId, checkIn, checkOut) {
    return request('/api/hotel-reservations', { method: 'POST', ...json({
      hotelId, checkIn: new Date(`${checkIn}T15:00:00`).toISOString(),
      checkOut: new Date(`${checkOut}T11:00:00`).toISOString(),
    }) })
  },
}
