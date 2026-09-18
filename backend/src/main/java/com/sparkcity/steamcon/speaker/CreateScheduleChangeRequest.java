package com.sparkcity.steamcon.speaker;

import java.time.Instant;

public record CreateScheduleChangeRequest(
        String reason,
        Instant requestedStartsAt,
        String message) {
}