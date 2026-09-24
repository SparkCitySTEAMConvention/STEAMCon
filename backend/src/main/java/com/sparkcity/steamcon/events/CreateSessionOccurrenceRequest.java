package com.sparkcity.steamcon.events;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record CreateSessionOccurrenceRequest(

        @NotNull(message = "Session ID is required")
        UUID sessionId,

        @NotNull(message = "Start time is required")
        Instant startsAt,

        @NotNull(message = "End time is required")
        Instant endsAt
) {

    @AssertTrue(message = "End time must be after start time")
    public boolean isEndAfterStart() {
        if (startsAt == null || endsAt == null) {
            return true;
        }

        return endsAt.isAfter(startsAt);
    }
}