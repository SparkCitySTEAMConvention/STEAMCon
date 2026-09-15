package com.sparkcity.steamcon.events;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ConstraintViolation;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class SessionTest {

    private final Validator validator =
            Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldAcceptValidSession() {
        Session session = new Session();
        session.setTitle("Introduction to Robotics");
        session.setDescription("Learn the basics of robotics.");
        session.setTrackId(UUID.randomUUID());
        session.setMandatory(false);

        Set<ConstraintViolation<Session>> violations =
                validator.validate(session);

        assertTrue(violations.isEmpty());
    }

    @Test
    void shouldRejectBlankTitle() {
        Session session = new Session();
        session.setTitle("");
        session.setTrackId(UUID.randomUUID());

        Set<ConstraintViolation<Session>> violations =
                validator.validate(session);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldRejectTitleLongerThan100Characters() {
        Session session = new Session();
        session.setTitle("A".repeat(101));
        session.setTrackId(UUID.randomUUID());

        Set<ConstraintViolation<Session>> violations =
                validator.validate(session);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldRejectDescriptionLongerThan500Characters() {
        Session session = new Session();
        session.setTitle("Robotics");
        session.setDescription("A".repeat(501));
        session.setTrackId(UUID.randomUUID());

        Set<ConstraintViolation<Session>> violations =
                validator.validate(session);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldRejectMissingTrack() {
        Session session = new Session();
        session.setTitle("Robotics");

        Set<ConstraintViolation<Session>> violations =
                validator.validate(session);

        assertFalse(violations.isEmpty());
    }
}