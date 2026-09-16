package com.sparkcity.steamcon.speaker;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SpeakerController {

    private final SpeakerService speakerService;

    public SpeakerController(
            SpeakerService speakerService) {

        this.speakerService = speakerService;
    }

    @PostMapping("/proposals")
    public ResponseEntity<SessionProposal> createProposal(
            @RequestBody CreateProposalRequest request) {

        SessionProposal proposal =
                speakerService.createProposal(
                        request.speakerId(),
                        request.title(),
                        request.description(),
                        request.trackId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(proposal);
    }

    @PostMapping("/speaker-applications")
    public ResponseEntity<SpeakerApplication>
            createSpeakerApplication(
                    @RequestBody
                    CreateSpeakerApplicationRequest request) {

        SpeakerApplication application =
                speakerService.createSpeakerApplication(
                        request.speakerId(),
                        request.sessionId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(application);
    }

    @PostMapping("/proposals/{id}/decision")
    public ResponseEntity<ApprovalDecision>
            decideProposal(
                    @PathVariable UUID id,
                    @RequestBody
                    ProposalDecisionRequest request) {

        ApprovalDecision decision =
                speakerService.makeProposalDecision(
                        id,
                        request.adminReviewerId(),
                        request.decision(),
                        request.comment());

        return ResponseEntity.ok(decision);
    }

    @PostMapping("/speaker-applications/{id}/status")
    public ResponseEntity<SpeakerApplication>
            updateSpeakerApplicationStatus(
                    @PathVariable UUID id,
                    @RequestBody
                    SpeakerApplicationStatusRequest request) {

        return ResponseEntity.ok(
                speakerService
                        .updateSpeakerApplicationStatus(
                                id,
                                request.status()));
    }
}