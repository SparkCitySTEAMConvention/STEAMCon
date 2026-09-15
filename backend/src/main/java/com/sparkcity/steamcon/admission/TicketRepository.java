package com.sparkcity.steamcon.admission;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    Optional<Ticket> findByUserIdAndTrackIdAndStatus(
            UUID userId,
            UUID trackId,
            AdmissionStatus status
    );
}