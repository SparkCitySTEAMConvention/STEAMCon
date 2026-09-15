package com.sparkcity.steamcon.admission;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AdmissionService {

    private final TicketRepository ticketRepository;
    private final PassRepository passRepository;

    public AdmissionService(
            TicketRepository ticketRepository,
            PassRepository passRepository) {

        this.ticketRepository = ticketRepository;
        this.passRepository = passRepository;
    }

    public boolean hasAccessToTrack(UUID userId, UUID trackId) {

        // Check for an active ticket for this track
        boolean hasTicket = ticketRepository
                .findByUserIdAndTrackIdAndStatus(
                        userId,
                        trackId,
                        AdmissionStatus.ACTIVE)
                .isPresent();

        if (hasTicket) {
            return true;
        }

        // Check for an active pass that includes this track
        boolean hasPass = passRepository
                .findByUserIdAndStatus(
                        userId,
                        AdmissionStatus.ACTIVE)
                .map(pass -> pass.getTrackIds().contains(trackId))
                .orElse(false);

        return hasPass;
    }
}