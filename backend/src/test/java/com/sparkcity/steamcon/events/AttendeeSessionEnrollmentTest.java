package com.sparkcity.steamcon.events;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class AttendeeSessionEnrollmentTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void shouldAcceptValidEnrollment() {
        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(UUID.randomUUID(), UUID.randomUUID());

        assertTrue(validator.validate(enrollment).isEmpty());
        assertEquals(EnrollmentStatus.ENROLLED, enrollment.getStatus());
    }

    @Test
    void shouldRejectMissingAttendee() {
        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(null, UUID.randomUUID());

        assertFalse(validator.validate(enrollment).isEmpty());
    }

    @Test
    void shouldRejectMissingSession() {
        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(UUID.randomUUID(), null);

        assertFalse(validator.validate(enrollment).isEmpty());
    }

    @Test
    void shouldAllowCancellation() {
        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(UUID.randomUUID(), UUID.randomUUID());

        enrollment.setStatus(EnrollmentStatus.CANCELLED);

        assertEquals(EnrollmentStatus.CANCELLED, enrollment.getStatus());
    }
}