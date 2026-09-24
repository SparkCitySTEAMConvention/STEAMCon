package com.sparkcity.steamcon.events;

import java.util.UUID;

public record SessionResponse(
        UUID id,
        String title,
        String description,
        UUID trackId,
        boolean mandatory
) {

    public static SessionResponse from(Session session) {
        return new SessionResponse(
                session.getId(),
                session.getTitle(),
                session.getDescription(),
                session.getTrackId(),
                session.isMandatory()
        );
    }
}