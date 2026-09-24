package com.sparkcity.steamcon.speaker;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpeakerProfileRepository
        extends JpaRepository<SpeakerProfile, UUID> {

    Optional<SpeakerProfile>
            findBySpeakerId(UUID speakerId);
}