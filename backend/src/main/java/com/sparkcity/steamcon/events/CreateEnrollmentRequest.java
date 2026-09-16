package com.sparkcity.steamcon.events;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateEnrollmentRequest(

        @NotNull(message = "Attendee ID is required")
        UUID attendeeId,

        @NotNull(message = "Session ID is required")
        UUID sessionId
) {
}