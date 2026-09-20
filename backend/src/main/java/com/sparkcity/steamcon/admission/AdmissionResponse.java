package com.sparkcity.steamcon.admission;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public record AdmissionResponse(
        UUID admissionId,
        String type,
        String status,
        Instant issuedAt,
        Set<UUID> trackIds,
        List<UUID> ticketTrackIds) {
}
