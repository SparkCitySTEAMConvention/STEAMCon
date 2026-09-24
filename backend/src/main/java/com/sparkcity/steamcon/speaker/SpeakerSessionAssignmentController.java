package com.sparkcity.steamcon.speaker;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
        "/api/speaker/session-assignments")
public class SpeakerSessionAssignmentController {

    private final SpeakerSessionAssignmentService
            assignmentService;

    private final ScheduleChangeRequestService
            scheduleChangeRequestService;

    public SpeakerSessionAssignmentController(
            SpeakerSessionAssignmentService assignmentService,
            ScheduleChangeRequestService scheduleChangeRequestService) {

        this.assignmentService =
                assignmentService;

        this.scheduleChangeRequestService =
                scheduleChangeRequestService;
    }

    @PostMapping
    public ResponseEntity<
            SpeakerSessionAssignmentResponse>
            createAssignment(
                    @RequestBody
                    CreateSpeakerSessionAssignmentRequest request) {

        SpeakerSessionAssignment assignment =
                assignmentService.createAssignment(
                        request.proposalId(),
                        request.sessionId(),
                        request.role());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        SpeakerSessionAssignmentResponse
                                .from(assignment));
    }

    @GetMapping("/me")
    public ResponseEntity<
            List<SpeakerSessionAssignmentResponse>>
            getMyAssignments(
                    Authentication authentication) {

        UUID speakerId =
                getAuthenticatedUserId(
                        authentication);

        List<SpeakerSessionAssignmentResponse>
                response =
                assignmentService
                        .getAssignmentsForSpeaker(
                                speakerId)
                        .stream()
                        .map(
                                SpeakerSessionAssignmentResponse
                                        ::from)
                        .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping(
            "/{assignmentId}/schedule-change-requests")
    public ResponseEntity<ScheduleChangeRequest>
            createScheduleChangeRequest(
                    @PathVariable UUID assignmentId,
                    @RequestBody
                    CreateScheduleChangeRequest request,
                    Authentication authentication) {

        UUID speakerId =
                getAuthenticatedUserId(
                        authentication);

        ScheduleChangeRequest result =
                scheduleChangeRequestService
                        .create(
                                assignmentId,
                                speakerId,
                                request.reason(),
                                request.requestedStartsAt(),
                                request.message());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(result);
    }

    private UUID getAuthenticatedUserId(
            Authentication authentication) {

        if (authentication == null
                || authentication.getPrincipal()
                        == null) {

            throw new IllegalStateException(
                    "Authenticated user is required");
        }

        return (UUID)
                authentication.getPrincipal();
    }
}