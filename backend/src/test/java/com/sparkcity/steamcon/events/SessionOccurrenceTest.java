package com.sparkcity.steamcon.events;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class SessionOccurrenceTest {

    private final Validator validator;

    SessionOccurrenceTest() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void shouldAcceptValidOccurrence() {
        SessionOccurrence occurrence = new SessionOccurrence();

        occurrence.setSessionId(UUID.randomUUID());
        occurrence.setStartsAt(Instant.parse("2026-10-10T10:00:00Z"));
        occurrence.setEndsAt(Instant.parse("2026-10-10T11:00:00Z"));

        Set violations = validator.validate(occurrence);

        assertTrue(violations.isEmpty());
    }

    @Test
    void shouldRejectMissingSession() {
        SessionOccurrence occurrence = new SessionOccurrence();

        occurrence.setStartsAt(Instant.parse("2026-10-10T10:00:00Z"));
        occurrence.setEndsAt(Instant.parse("2026-10-10T11:00:00Z"));

        Set violations = validator.validate(occurrence);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldRejectMissingStartTime() {
        SessionOccurrence occurrence = new SessionOccurrence();

        occurrence.setSessionId(UUID.randomUUID());
        occurrence.setEndsAt(Instant.parse("2026-10-10T11:00:00Z"));

        Set violations = validator.validate(occurrence);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldRejectMissingEndTime() {
        SessionOccurrence occurrence = new SessionOccurrence();

        occurrence.setSessionId(UUID.randomUUID());
        occurrence.setStartsAt(Instant.parse("2026-10-10T10:00:00Z"));

        Set violations = validator.validate(occurrence);

        assertFalse(violations.isEmpty());
    }

    @Test
void shouldRejectEndTimeBeforeStartTime() {
    SessionOccurrence occurrence = new SessionOccurrence();

    occurrence.setSessionId(UUID.randomUUID());
    occurrence.setStartsAt(Instant.parse("2026-10-10T11:00:00Z"));
    occurrence.setEndsAt(Instant.parse("2026-10-10T10:00:00Z"));

    Set violations = validator.validate(occurrence);

    assertFalse(violations.isEmpty());
}

    @Test
    void shouldAllowSimultaneousOccurrences() {
        UUID sessionOne = UUID.randomUUID();
        UUID sessionTwo = UUID.randomUUID();

        SessionOccurrence first = new SessionOccurrence();
        first.setSessionId(sessionOne);
        first.setStartsAt(Instant.parse("2026-10-10T10:00:00Z"));
        first.setEndsAt(Instant.parse("2026-10-10T11:00:00Z"));

        SessionOccurrence second = new SessionOccurrence();
        second.setSessionId(sessionTwo);
        second.setStartsAt(Instant.parse("2026-10-10T10:00:00Z"));
        second.setEndsAt(Instant.parse("2026-10-10T11:00:00Z"));

        assertTrue(validator.validate(first).isEmpty());
        assertTrue(validator.validate(second).isEmpty());
    }
}