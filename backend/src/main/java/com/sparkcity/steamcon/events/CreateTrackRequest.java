package com.sparkcity.steamcon.events;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTrackRequest(

        @NotBlank(message = "Track name is required")
        @Size(max = 100, message = "Track name cannot exceed 100 characters")
        String name,

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        String description
) {
}