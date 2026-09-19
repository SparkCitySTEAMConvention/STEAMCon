package com.sparkcity.steamcon.speaker;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class SpeakerProfileServiceTest {

    @Mock
    private SpeakerProfileRepository repository;

    private SpeakerProfileService service;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        service =
                new SpeakerProfileService(
                        repository);
    }

    @Test
    void profileShouldPersistUpdates() {

        UUID speakerId =
                UUID.randomUUID();

        SpeakerProfile profile =
                new SpeakerProfile();

        profile.setSpeakerId(
                speakerId);

        when(repository
                .findBySpeakerId(
                        speakerId))
                .thenReturn(
                        Optional.of(profile));

        when(repository
                .save(any(
                        SpeakerProfile.class)))
                .thenAnswer(
                        invocation ->
                                invocation.getArgument(
                                        0));

        UpdateSpeakerProfileRequest request =
                new UpdateSpeakerProfileRequest(
                        "Bill Nye",
                        "Chief Ambassador",
                        "The Planetary Society",
                        "Science educator.");

        SpeakerProfile result =
                service.updateProfile(
                        speakerId,
                        request);

        assertEquals(
                "Bill Nye",
                result.getDisplayName());

        assertEquals(
                "Chief Ambassador",
                result.getTitle());

        assertEquals(
                "The Planetary Society",
                result.getOrganization());

        assertEquals(
                "Science educator.",
                result.getBiography());
    }
}