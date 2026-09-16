package com.sparkcity.steamcon.speaker;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class SpeakerController {

    private final SpeakerService speakerService;

    public SpeakerController(SpeakerService speakerService) {
        this.speakerService = speakerService;
    }

    @PostMapping("/proposals")
    public ResponseEntity<SessionProposal> createProposal(
            @Valid @RequestBody CreateProposalRequest request,
            Authentication authentication) {

        UUID authenticatedUserId =
                getAuthenticatedUserId(authentication);

        SessionProposal proposal =
                speakerService.createProposal(
                        authenticatedUserId,
                        request.title(),
                        request.description(),
                        request.trackId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(proposal);
    }

    @PostMapping("/speaker-applications")
    public ResponseEntity<SpeakerApplication> createSpeakerApplication(
            @Valid @RequestBody CreateSpeakerApplicationRequest request,
            Authentication authentication) {

        UUID authenticatedUserId =
                getAuthenticatedUserId(authentication);

        SpeakerApplication application =
                speakerService.createSpeakerApplication(
                        authenticatedUserId,
                        request.sessionId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(application);
    }

    @PostMapping("/proposals/{id}/decision")
    public ResponseEntity<ApprovalDecision> decideProposal(
            @PathVariable UUID id,
            @RequestBody ProposalDecisionRequest request,
            Authentication authentication) {

        UUID authenticatedUserId =
                getAuthenticatedUserId(authentication);

        ApprovalDecision decision =
                speakerService.makeProposalDecision(
                        id,
                        authenticatedUserId,
                        request.decision(),
                        request.comment());

        return ResponseEntity.ok(decision);
    }

    @PostMapping("/speaker-applications/{id}/status")
    public ResponseEntity<SpeakerApplication>
    updateSpeakerApplicationStatus(
            @PathVariable UUID id,
            @RequestBody SpeakerApplicationStatusRequest request) {

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
}
