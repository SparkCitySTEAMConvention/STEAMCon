package com.sparkcity.steamcon.events;

import java.time.Instant;
import java.util.UUID;

public record EnrollmentResponse(
        UUID id,
        UUID attendeeId,
        UUID sessionId,
        UUID sessionOccurrenceId,
        EnrollmentStatus status,
        Instant enrolledAt
) {
    public static EnrollmentResponse from(
            AttendeeSessionEnrollment enrollment) {

        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getAttendeeId(),
                enrollment.getSessionId(),
                enrollment.getSessionOccurrenceId(),
                enrollment.getStatus(),
                enrollment.getEnrolledAt()
        );
    }
}