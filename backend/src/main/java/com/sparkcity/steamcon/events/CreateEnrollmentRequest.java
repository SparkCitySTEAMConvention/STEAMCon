package com.sparkcity.steamcon.events;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateEnrollmentRequest(

        @NotNull(message = "Session occurrence ID is required")
        UUID sessionOccurrenceId

) {
}