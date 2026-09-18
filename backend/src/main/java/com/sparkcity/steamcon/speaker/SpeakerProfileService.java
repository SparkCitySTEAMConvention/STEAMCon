package com.sparkcity.steamcon.speaker;

import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class SpeakerProfileService {

    private final SpeakerProfileRepository
            repository;

    public SpeakerProfileService(
            SpeakerProfileRepository repository) {

        this.repository = repository;
    }

    public SpeakerProfile getProfile(
            UUID speakerId) {

        return repository
                .findBySpeakerId(speakerId)
                .orElseGet(() -> {

                    SpeakerProfile profile =
                            new SpeakerProfile();

                    profile.setSpeakerId(
                            speakerId);

                    return repository.save(
                            profile);
                });
    }

    public SpeakerProfile updateProfile(
            UUID speakerId,
            UpdateSpeakerProfileRequest request) {

        SpeakerProfile profile =
                getProfile(speakerId);

        if (request.displayName() != null) {
            profile.setDisplayName(
                    request.displayName());
        }

        if (request.title() != null) {
            profile.setTitle(
                    request.title());
        }

        if (request.organization() != null) {
            profile.setOrganization(
                    request.organization());
        }

        if (request.biography() != null) {
            profile.setBiography(
                    request.biography());
        }

        return repository.save(profile);
    }
}