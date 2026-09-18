package com.sparkcity.steamcon.speaker;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class SpeakerSessionAssignmentServiceTest {

    @Mock
    private SpeakerSessionAssignmentRepository
            assignmentRepository;

    @Mock
    private SessionProposalRepository
            proposalRepository;

    private SpeakerSessionAssignmentService
            service;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        service =
                new SpeakerSessionAssignmentService(
                        assignmentRepository,
                        proposalRepository);
    }

    @Test
    void approvedProposalShouldCreateAssignment() {

        UUID proposalId =
                UUID.randomUUID();

        UUID sessionId =
                UUID.randomUUID();

        UUID speakerId =
                UUID.randomUUID();

        SessionProposal proposal =
                new SessionProposal();

        proposal.setSpeakerId(speakerId);
        proposal.setStatus(
                ProposalStatus.APPROVED);

        when(proposalRepository
                .findById(proposalId))
                .thenReturn(
                        Optional.of(proposal));

        when(assignmentRepository
                .existsBySpeakerIdAndSessionId(
                        speakerId,
                        sessionId))
                .thenReturn(false);

        when(assignmentRepository
                .findByProposalId(proposalId))
                .thenReturn(
                        Optional.empty());

        when(assignmentRepository
                .save(any(
                        SpeakerSessionAssignment.class)))
                .thenAnswer(
                        invocation ->
                                invocation.getArgument(
                                        0));

        SpeakerSessionAssignment result =
                service.createAssignment(
                        proposalId,
                        sessionId,
                        SpeakerRole.PRIMARY_SPEAKER);

        assertEquals(
                speakerId,
                result.getSpeakerId());

        assertEquals(
                sessionId,
                result.getSessionId());

        assertEquals(
                proposalId,
                result.getProposalId());

        assertEquals(
                SpeakerRole.PRIMARY_SPEAKER,
                result.getRole());
    }

    @Test
    void unapprovedProposalShouldFail() {

        UUID proposalId =
                UUID.randomUUID();

        SessionProposal proposal =
                new SessionProposal();

        proposal.setStatus(
                ProposalStatus.SUBMITTED);

        when(proposalRepository
                .findById(proposalId))
                .thenReturn(
                        Optional.of(proposal));

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.createAssignment(
                                proposalId,
                                UUID.randomUUID(),
                                SpeakerRole
                                        .PRIMARY_SPEAKER));
    }

    @Test
    void duplicateAssignmentShouldFail() {

        UUID proposalId =
                UUID.randomUUID();

        UUID sessionId =
                UUID.randomUUID();

        UUID speakerId =
                UUID.randomUUID();

        SessionProposal proposal =
                new SessionProposal();

        proposal.setSpeakerId(speakerId);

        proposal.setStatus(
                ProposalStatus.APPROVED);

        when(proposalRepository
                .findById(proposalId))
                .thenReturn(
                        Optional.of(proposal));

        when(assignmentRepository
                .existsBySpeakerIdAndSessionId(
                        speakerId,
                        sessionId))
                .thenReturn(true);

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.createAssignment(
                                proposalId,
                                sessionId,
                                SpeakerRole
                                        .PRIMARY_SPEAKER));
    }
}