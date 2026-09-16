package com.sparkcity.steamcon.speaker;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionProposalRepository
        extends JpaRepository<SessionProposal, UUID> {

    List<SessionProposal> findBySpeakerId(UUID speakerId);

    List<SessionProposal> findByStatus(ProposalStatus status);
}