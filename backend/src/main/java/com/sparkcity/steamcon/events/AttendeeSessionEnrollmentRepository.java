package com.sparkcity.steamcon.events;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendeeSessionEnrollmentRepository
        extends JpaRepository<AttendeeSessionEnrollment, UUID> {

    Optional<AttendeeSessionEnrollment>
    findByAttendeeIdAndSessionOccurrenceIdAndStatus(
            UUID attendeeId,
            UUID sessionOccurrenceId,
            EnrollmentStatus status);

    List<AttendeeSessionEnrollment> findByAttendeeIdAndStatus(
            UUID attendeeId,
            EnrollmentStatus status);
}