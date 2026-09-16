package com.sparkcity.steamcon.booking;

import java.time.Instant;
import java.util.UUID;

public record CreateCarRentalRequest(
        UUID userId,
        Instant pickupAt,
        Instant dropoffAt,
        String pickupLocation,
        String dropoffLocation) {
}
