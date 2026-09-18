package com.sparkcity.steamcon.speaker;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class ScheduleChangeRequestService {

    private final ScheduleChangeRequestRepository
            repository;

    private final SpeakerSessionAssignmentService
            assignmentService;

    public ScheduleChangeRequestService(
            ScheduleChangeRequestRepository repository,
            SpeakerSessionAssignmentService assignmentService) {

        this.repository = repository;
        this.assignmentService =
                assignmentService;
    }

    public ScheduleChangeRequest create(
            UUID assignmentId,
            UUID speakerId,
            String reason,
            Instant requestedStartsAt,
            String message) {

        assignmentService.getOwnedAssignment(
                assignmentId,
                speakerId);

        if (reason == null
                || reason.isBlank()) {

            throw new IllegalArgumentException(
                    "Reason is required");
        }

        ScheduleChangeRequest request =
                new ScheduleChangeRequest();

        request.setAssignmentId(
                assignmentId);

        request.setReason(reason);

        request.setRequestedStartsAt(
                requestedStartsAt);

        request.setMessage(message);

        return repository.save(request);
    }
}