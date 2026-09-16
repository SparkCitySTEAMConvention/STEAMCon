package com.sparkcity.steamcon.speaker;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SpeakerController {

    private final SpeakerService speakerService;

    public SpeakerController(
            SpeakerService speakerService) {

        this.speakerService =
                speakerService;
    }

    // ---------------------------------------------------------
    // CREATE
    // ---------------------------------------------------------

    @PostMapping("/proposals")
    public ResponseEntity<SessionProposal>
            createProposal(
                    @RequestBody
                    CreateProposalRequest request) {

        SessionProposal proposal =
                speakerService.createProposal(
                        authenticatedUserId,
                        request.title(),
                        request.description(),
                        request.trackId(),
                        request.status());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(proposal);
    }

    // ---------------------------------------------------------
    // SPEAKER DASHBOARD
    // Temporary speakerId until Backend A auth is integrated.
    // ---------------------------------------------------------

    @GetMapping("/speaker/dashboard")
    public ResponseEntity<SpeakerDashboardResponse>
            getDashboard(
                    @RequestParam UUID speakerId) {

        return ResponseEntity.ok(
                speakerService.getDashboard(
                        speakerId));
    }

    // ---------------------------------------------------------
    // MY PROPOSALS
    // ---------------------------------------------------------

    @GetMapping("/proposals/me")
    public ResponseEntity<List<SessionProposal>>
            getMyProposals(
                    @RequestParam UUID speakerId) {

        return ResponseEntity.ok(
                speakerService
                        .getProposalsForSpeaker(
                                speakerId));
    }

    // ---------------------------------------------------------
    // PROPOSAL DETAIL
    // ---------------------------------------------------------

    @GetMapping("/proposals/{id}")
    public ResponseEntity<SessionProposal>
            getProposal(
                    @PathVariable UUID id,
                    @RequestParam UUID speakerId) {

        return ResponseEntity.ok(
                speakerService
                        .getProposalForSpeaker(
                                id,
                                speakerId));
    }

    // ---------------------------------------------------------
    // EDIT
    // ---------------------------------------------------------

    @PatchMapping("/proposals/{id}")
    public ResponseEntity<SessionProposal>
            updateProposal(
                    @PathVariable UUID id,
                    @RequestParam UUID speakerId,
                    @RequestBody
                    UpdateProposalRequest request) {

        return ResponseEntity.ok(
                speakerService.updateProposal(
                        id,
                        speakerId,
                        request.title(),
                        request.description(),
                        request.trackId()));
    }

    // ---------------------------------------------------------
    // WITHDRAW
    // ---------------------------------------------------------

    @DeleteMapping("/proposals/{id}")
    public ResponseEntity<Void>
            withdrawProposal(
                    @PathVariable UUID id,
                    @RequestParam UUID speakerId) {

        speakerService.withdrawProposal(
                id,
                speakerId);

        return ResponseEntity.noContent()
                .build();
    }

    // ---------------------------------------------------------
    // ORGANIZER DECISION
    // ---------------------------------------------------------

    @PostMapping("/proposals/{id}/decision")
    public ResponseEntity<ApprovalDecision> decideProposal(
            @PathVariable UUID id,
            @RequestBody ProposalDecisionRequest request,
            Authentication authentication) {

        UUID authenticatedUserId =
                getAuthenticatedUserId(authentication);

        return ResponseEntity.ok(
                speakerService
                        .makeProposalDecision(
                                id,
                                request.adminReviewerId(),
                                request.decision(),
                                request.comment()));
    }

    // ---------------------------------------------------------
    // SPEAKER APPLICATION
    // ---------------------------------------------------------

    @PostMapping("/speaker-applications")
    public ResponseEntity<SpeakerApplication>
            createSpeakerApplication(
                    @RequestBody
                    CreateSpeakerApplicationRequest request) {

        SpeakerApplication application =
                speakerService
                        .createSpeakerApplication(
                                request.speakerId(),
                                request.sessionId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(application);
    }

    @PostMapping(
            "/speaker-applications/{id}/status")
    public ResponseEntity<SpeakerApplication>
            updateApplicationStatus(
                    @PathVariable UUID id,
                    @RequestBody
                    SpeakerApplicationStatusRequest request) {

        return ResponseEntity.ok(
                speakerService.updateSpeakerApplicationStatus(
                        id,
                        request.status()));
    }

    private UUID getAuthenticatedUserId(
            Authentication authentication) {

        if (authentication == null
                || authentication.getPrincipal() == null) {

            throw new IllegalStateException(
                    "Authenticated user is required");
        }

        Object principal =
                authentication.getPrincipal();

        if (principal instanceof UUID userId) {
            return userId;
        }

        try {
            return UUID.fromString(principal.toString());
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "Invalid authenticated user ID");
        }
    }

    // ---------------------------------------------------------
    // PUBLIC DIRECTORY
    // ---------------------------------------------------------

    @GetMapping("/speakers")
    public ResponseEntity<List<SpeakerDirectoryEntry>>
            getPublicSpeakerDirectory() {

        return ResponseEntity.ok(
                speakerService
                        .getPublicSpeakerDirectory());
    }

    @GetMapping("/speakers/{speakerId}")
    public ResponseEntity<SpeakerPublicProfileResponse>
            getPublicSpeakerProfile(
                    @PathVariable UUID speakerId) {

        return ResponseEntity.ok(
                speakerService
                        .getPublicSpeakerProfile(
                                speakerId));
    }
}
