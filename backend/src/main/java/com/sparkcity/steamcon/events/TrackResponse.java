package com.sparkcity.steamcon.events;

import java.util.UUID;

public record TrackResponse(
        UUID id,
        String name,
        String description
) {

    public static TrackResponse from(Track track) {
        return new TrackResponse(
                track.getId(),
                track.getName(),
                track.getDescription()
        );
    }
}