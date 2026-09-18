package com.sparkcity.steamcon.speaker;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class ScheduleChangeRequestServiceTest {

    @Mock
    private ScheduleChangeRequestRepository
            repository;

    @Mock
    private SpeakerSessionAssignmentService
            assignmentService;

    private ScheduleChangeRequestService
            service;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        service =
                new ScheduleChangeRequestService(
                        repository,
                        assignmentService);
    }

    @Test
    void speakerCanRequestScheduleChange() {

        UUID assignmentId =
                UUID.randomUUID();

        UUID speakerId =
                UUID.randomUUID();

        SpeakerSessionAssignment assignment =
                new SpeakerSessionAssignment();

        assignment.setSpeakerId(speakerId);

        when(assignmentService
                .getOwnedAssignment(
                        assignmentId,
                        speakerId))
                .thenReturn(assignment);

        when(repository
                .save(any(
                        ScheduleChangeRequest.class)))
                .thenAnswer(
                        invocation ->
                                invocation.getArgument(
                                        0));

        Instant requestedTime =
                Instant.parse(
                        "2027-04-06T14:00:00Z");

        ScheduleChangeRequest result =
                service.create(
                        assignmentId,
                        speakerId,
                        "Travel conflict",
                        requestedTime,
                        "I am unavailable before 2 PM.");

        assertEquals(
                assignmentId,
                result.getAssignmentId());

        assertEquals(
                "Travel conflict",
                result.getReason());

        assertEquals(
                ScheduleChangeRequestStatus.PENDING,
                result.getStatus());
    }
}