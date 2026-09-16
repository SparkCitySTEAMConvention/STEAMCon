package com.sparkcity.steamcon.events;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateSessionRequest(

        @NotBlank(message = "Session title is required")
        @Size(max = 100, message = "Session title cannot exceed 100 characters")
        String title,

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        String description,

        @NotNull(message = "Track ID is required")
        UUID trackId,

        boolean mandatory
) {
}