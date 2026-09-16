package com.sparkcity.steamcon.events;

import java.time.Instant;
import java.util.UUID;

public record EnrollmentResponse(
        UUID id,
        UUID attendeeId,
        UUID sessionId,
        EnrollmentStatus status,
        Instant enrolledAt
) {
    public static EnrollmentResponse from(
            AttendeeSessionEnrollment enrollment) {

        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getAttendeeId(),
                enrollment.getSessionId(),
                enrollment.getStatus(),
                enrollment.getEnrolledAt()
        );
    }
}