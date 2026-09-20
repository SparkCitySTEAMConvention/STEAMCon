package com.sparkcity.steamcon.admission;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PassRepository extends JpaRepository<Pass, UUID> {

    @EntityGraph(attributePaths = "trackIds")
    Optional<Pass> findByUserIdAndStatus(
            UUID userId,
            AdmissionStatus status
    );
}