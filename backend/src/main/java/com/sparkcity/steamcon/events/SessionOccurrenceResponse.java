package com.sparkcity.steamcon.events;

import java.time.Instant;
import java.util.UUID;

public record SessionOccurrenceResponse(
        UUID id,
        UUID sessionId,
        Instant startsAt,
        Instant endsAt
) {

    public static SessionOccurrenceResponse from(
            SessionOccurrence occurrence) {

        return new SessionOccurrenceResponse(
                occurrence.getId(),
                occurrence.getSessionId(),
                occurrence.getStartsAt(),
                occurrence.getEndsAt()
        );
    }
}