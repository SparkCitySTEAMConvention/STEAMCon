package com.sparkcity.steamcon.events;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "attendee_session_enrollments")
public class AttendeeSessionEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(nullable = false)
    private UUID attendeeId;

    @NotNull
    @Column(nullable = false)
    private UUID sessionId;

    @NotNull
    @Column(nullable = false)
    private UUID sessionOccurrenceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status = EnrollmentStatus.ENROLLED;

    @Column(nullable = false)
    private Instant enrolledAt = Instant.now();

    public AttendeeSessionEnrollment() {
    }

    public AttendeeSessionEnrollment(
            UUID attendeeId,
            UUID sessionId,
            UUID sessionOccurrenceId) {

        this.attendeeId = attendeeId;
        this.sessionId = sessionId;
        this.sessionOccurrenceId = sessionOccurrenceId;
    }

    public UUID getId() {
        return id;
    }

    public UUID getAttendeeId() {
        return attendeeId;
    }

    public void setAttendeeId(UUID attendeeId) {
        this.attendeeId = attendeeId;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public UUID getSessionOccurrenceId() {
        return sessionOccurrenceId;
    }

    public void setSessionOccurrenceId(UUID sessionOccurrenceId) {
        this.sessionOccurrenceId = sessionOccurrenceId;
    }

    public EnrollmentStatus getStatus() {
        return status;
    }

    public void setStatus(EnrollmentStatus status) {
        this.status = status;
    }

    public Instant getEnrolledAt() {
        return enrolledAt;
    }
}