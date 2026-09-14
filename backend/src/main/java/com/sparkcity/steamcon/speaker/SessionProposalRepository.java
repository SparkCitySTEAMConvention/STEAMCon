package com.sparkcity.steamcon.speaker;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SessionProposalRepository extends JpaRepository<SessionProposal, UUID> {}
