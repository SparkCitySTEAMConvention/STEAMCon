package com.sparkcity.steamcon.events;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ConstraintViolation;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class TrackTest {

    private final Validator validator =
            Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldAcceptValidTrack() {
        Track track = new Track("Engineering");
        track.setDescription("Engineering and technology sessions.");

        Set<ConstraintViolation<Track>> violations =
                validator.validate(track);

        assertTrue(violations.isEmpty());
    }

    @Test
    void shouldRejectBlankName() {
        Track track = new Track("");

        Set<ConstraintViolation<Track>> violations =
                validator.validate(track);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldRejectNameLongerThan100Characters() {
        Track track = new Track("A".repeat(101));

        Set<ConstraintViolation<Track>> violations =
                validator.validate(track);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldRejectDescriptionLongerThan500Characters() {
        Track track = new Track("Engineering");
        track.setDescription("A".repeat(501));

        Set<ConstraintViolation<Track>> violations =
                validator.validate(track);

        assertFalse(violations.isEmpty());
    }
}