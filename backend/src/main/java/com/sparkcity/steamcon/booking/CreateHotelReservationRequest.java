package com.sparkcity.steamcon.booking;

import java.time.Instant;
import java.util.UUID;

public record CreateHotelReservationRequest(
        UUID userId,
        UUID hotelId,
        Instant checkIn,
        Instant checkOut) {
}
