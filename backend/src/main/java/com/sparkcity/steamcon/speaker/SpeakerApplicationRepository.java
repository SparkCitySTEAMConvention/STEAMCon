package com.sparkcity.steamcon.speaker;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpeakerApplicationRepository
        extends JpaRepository<SpeakerApplication, UUID> {

    List<SpeakerApplication> findBySpeakerId(UUID speakerId);
}