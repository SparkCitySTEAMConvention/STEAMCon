package com.sparkcity.steamcon.booking;

import java.time.Instant;
import java.util.UUID;

public record CreateTravelLegRequest(
        UUID userId,
        String origin,
        String destination,
        Instant departureAt,
        Instant arrivalAt) {
}
