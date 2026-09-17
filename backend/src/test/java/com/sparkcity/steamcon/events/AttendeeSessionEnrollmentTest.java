package com.sparkcity.steamcon.events;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class AttendeeSessionEnrollmentTest {

    @Test
    void shouldCreateEnrollment() {
        UUID attendeeId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID sessionOccurrenceId = UUID.randomUUID();

        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(
                        attendeeId,
                        sessionId,
                        sessionOccurrenceId);

        assertEquals(attendeeId, enrollment.getAttendeeId());
        assertEquals(sessionId, enrollment.getSessionId());
        assertEquals(
                sessionOccurrenceId,
                enrollment.getSessionOccurrenceId());
        assertEquals(
                EnrollmentStatus.ENROLLED,
                enrollment.getStatus());
        assertNotNull(enrollment.getEnrolledAt());
    }

    @Test
    void shouldSetAttendeeId() {
        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment();

        UUID attendeeId = UUID.randomUUID();

        enrollment.setAttendeeId(attendeeId);

        assertEquals(
                attendeeId,
                enrollment.getAttendeeId());
    }

    @Test
    void shouldSetSessionId() {
        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment();

        UUID sessionId = UUID.randomUUID();

        enrollment.setSessionId(sessionId);

        assertEquals(
                sessionId,
                enrollment.getSessionId());
    }

    @Test
    void shouldSetSessionOccurrenceId() {
        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment();

        UUID sessionOccurrenceId = UUID.randomUUID();

        enrollment.setSessionOccurrenceId(sessionOccurrenceId);

        assertEquals(
                sessionOccurrenceId,
                enrollment.getSessionOccurrenceId());
    }

    @Test
    void shouldSetStatus() {
        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment();

        enrollment.setStatus(
                EnrollmentStatus.CANCELLED);

        assertEquals(
                EnrollmentStatus.CANCELLED,
                enrollment.getStatus());
    }
}