package com.sparkcity.steamcon.admission;

import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdmissionServiceTest {

    private final TicketRepository ticketRepository =
            mock(TicketRepository.class);

    private final PassRepository passRepository =
            mock(PassRepository.class);

    private final AdmissionService admissionService =
            new AdmissionService(ticketRepository, passRepository);

    @Test
    void userHasAccessWhenTheyHaveActiveTicket() {

        UUID userId = UUID.randomUUID();
        UUID trackId = UUID.randomUUID();

        Ticket ticket = new Ticket(userId, trackId);

        when(ticketRepository.findByUserIdAndTrackIdAndStatus(
                userId,
                trackId,
                AdmissionStatus.ACTIVE))
                .thenReturn(Optional.of(ticket));

        assertTrue(
                admissionService.hasAccessToTrack(userId, trackId)
        );
    }

    @Test
    void userHasAccessWhenActivePassIncludesTrack() {

        UUID userId = UUID.randomUUID();
        UUID trackId = UUID.randomUUID();

        Pass pass = new Pass(userId, "Full Conference Pass");
        pass.addTrack(trackId);

        when(ticketRepository.findByUserIdAndTrackIdAndStatus(
                userId,
                trackId,
                AdmissionStatus.ACTIVE))
                .thenReturn(Optional.empty());

        when(passRepository.findByUserIdAndStatus(
                userId,
                AdmissionStatus.ACTIVE))
                .thenReturn(Optional.of(pass));

        assertTrue(
                admissionService.hasAccessToTrack(userId, trackId)
        );
    }

    @Test
    void userDoesNotHaveAccessWithoutTicketOrPass() {

        UUID userId = UUID.randomUUID();
        UUID trackId = UUID.randomUUID();

        when(ticketRepository.findByUserIdAndTrackIdAndStatus(
                userId,
                trackId,
                AdmissionStatus.ACTIVE))
                .thenReturn(Optional.empty());

        when(passRepository.findByUserIdAndStatus(
                userId,
                AdmissionStatus.ACTIVE))
                .thenReturn(Optional.empty());

        assertFalse(
                admissionService.hasAccessToTrack(userId, trackId)
        );
    }
}