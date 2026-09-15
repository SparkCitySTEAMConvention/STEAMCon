package com.sparkcity.steamcon.events;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AttendeeSessionEnrollmentRepository
        extends JpaRepository<AttendeeSessionEnrollment, UUID> {

    Optional<AttendeeSessionEnrollment> findByAttendeeIdAndSessionIdAndStatus(
            UUID attendeeId,
            UUID sessionId,
            EnrollmentStatus status);
}