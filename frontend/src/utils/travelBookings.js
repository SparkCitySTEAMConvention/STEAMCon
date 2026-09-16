const STORAGE_KEY = 'steamcon-attendee-travel-bookings'

export function loadTravelBookings() {
  if (typeof window === 'undefined') return {}

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export function saveTravelBooking(kind, booking) {
  const nextBookings = { ...loadTravelBookings(), [kind]: booking }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBookings))
  return nextBookings
}

export function makeConfirmationCode(prefix) {
  return `${prefix}-${Date.now().toString().slice(-6)}`
}

export function formatBookingDate(value) {
  if (!value) return 'Date pending'

  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatBookingTime(value) {
  if (!value) return 'Time pending'

  const [hours, minutes] = value.split(':').map(Number)
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getBookingCards(baseBookings, savedBookings) {
  return baseBookings.map(booking => {
    const saved = savedBookings[booking.id]
    if (!saved) return booking

    if (booking.id === 'travel') {
      return {
        ...booking,
        title: `${saved.mode} to STEAM Con`,
        status: 'Booked',
        tone: 'confirmed',
        detail: `Departs ${saved.origin} · ${formatBookingDate(saved.departureDate)} at ${formatBookingTime(saved.departureTime)}`,
        action: 'View trip',
      }
    }

    if (booking.id === 'hotel') {
      return {
        ...booking,
        title: saved.hotelName,
        status: 'Booked',
        tone: 'confirmed',
        detail: `${saved.nights} ${saved.nights === 1 ? 'night' : 'nights'} · Confirmation ${saved.confirmationCode}`,
        action: 'View stay',
      }
    }

    return {
      ...booking,
      title: saved.vehicle,
      status: 'Booked',
      tone: 'confirmed',
      detail: `Pickup ${saved.pickupLocation} · ${formatBookingDate(saved.pickupDate)} at ${formatBookingTime(saved.pickupTime)}`,
      action: 'View rental',
    }
  })
}

export function buildTravelItinerary(bookings) {
  const itinerary = []

  if (bookings.travel) {
    const travel = bookings.travel
    itinerary.push(
      {
        id: 'outbound-travel',
        type: travel.mode,
        title: `${travel.mode} to STEAM Con`,
        day: formatBookingDate(travel.departureDate),
        time: formatBookingTime(travel.departureTime),
        location: `${travel.origin} → ${travel.destination}`,
        order: 1,
      },
      {
        id: 'return-travel',
        type: travel.mode,
        title: `${travel.mode} home`,
        day: formatBookingDate(travel.returnDate),
        time: formatBookingTime(travel.returnTime),
        location: `${travel.destination} → ${travel.origin}`,
        order: 90,
      },
    )
  }

  if (bookings.car) {
    const car = bookings.car
    itinerary.push(
      {
        id: 'car-pickup',
        type: 'Rental car',
        title: `${car.vehicle} pickup`,
        day: formatBookingDate(car.pickupDate),
        time: formatBookingTime(car.pickupTime),
        location: car.pickupLocation,
        order: 3,
      },
      {
        id: 'car-dropoff',
        type: 'Rental car',
        title: `${car.vehicle} return`,
        day: formatBookingDate(car.dropoffDate),
        time: formatBookingTime(car.dropoffTime),
        location: car.dropoffLocation,
        order: 80,
      },
    )
  }

  if (bookings.hotel) {
    const hotel = bookings.hotel
    itinerary.push({
      id: 'hotel-check-in',
      type: 'Hotel',
      title: `${hotel.hotelName} check-in`,
      day: formatBookingDate(hotel.checkIn),
      time: 'After 3:00 PM',
      location: hotel.hotelName,
      order: 5,
    })
  }

  return itinerary
}
