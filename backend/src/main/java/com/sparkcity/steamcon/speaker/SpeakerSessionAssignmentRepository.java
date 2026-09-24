package com.sparkcity.steamcon.speaker;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpeakerSessionAssignmentRepository
        extends JpaRepository<
                SpeakerSessionAssignment,
                UUID> {

    List<SpeakerSessionAssignment>
            findBySpeakerId(UUID speakerId);

    Optional<SpeakerSessionAssignment>
            findByProposalId(UUID proposalId);

    boolean existsBySpeakerIdAndSessionId(
            UUID speakerId,
            UUID sessionId);
}