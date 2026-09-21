package com.sparkcity.steamcon.admission;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sparkcity.steamcon.events.TrackRepository;

@RestController
@RequestMapping("/api/admission")
public class AdmissionController {

    private final PassRepository passRepository;
    private final TicketRepository ticketRepository;
    private final TrackRepository trackRepository;

    public AdmissionController(
            PassRepository passRepository,
            TicketRepository ticketRepository,
            TrackRepository trackRepository) {

        this.passRepository = passRepository;
        this.ticketRepository = ticketRepository;
        this.trackRepository = trackRepository;
    }

    @PostMapping("/me")
    public ResponseEntity<AdmissionResponse> createMyAdmission(
            @RequestBody CreateAdmissionRequest request,
            Authentication authentication) {

        UUID userId = (UUID) authentication.getPrincipal();

        Pass pass = passRepository
                .findByUserIdAndStatus(userId, AdmissionStatus.ACTIVE)
                .orElseGet(() -> new Pass(userId, request.passType()));

        pass.setPassType(request.passType());
        trackRepository.findAll().forEach(track -> pass.addTrack(track.getId()));
        Pass saved = passRepository.save(pass);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new AdmissionResponse(
                        saved.getId(),
                        saved.getPassType(),
                        saved.getStatus().name(),
                        saved.getIssuedAt(),
                        saved.getTrackIds(),
                        List.of()));
    }

    @GetMapping("/me")
    public ResponseEntity<AdmissionResponse> getMyAdmission(
            Authentication authentication) {

        UUID userId = (UUID) authentication.getPrincipal();

        Pass pass = passRepository
                .findByUserIdAndStatus(userId, AdmissionStatus.ACTIVE)
                .orElse(null);

        List<Ticket> tickets = ticketRepository.findAll()
                .stream()
                .filter(ticket ->
                        userId.equals(ticket.getUserId())
                        && ticket.getStatus() == AdmissionStatus.ACTIVE)
                .toList();

        return ResponseEntity.ok(new AdmissionResponse(
                pass == null ? null : pass.getId(),
                pass == null
                        ? (tickets.isEmpty() ? "No active admission" : "Track Ticket")
                        : pass.getPassType(),
                pass == null && tickets.isEmpty() ? "INACTIVE" : "ACTIVE",
                pass == null ? null : pass.getIssuedAt(),
                pass == null ? Set.of() : pass.getTrackIds(),
                tickets.stream().map(Ticket::getTrackId).toList()));
    }
}
