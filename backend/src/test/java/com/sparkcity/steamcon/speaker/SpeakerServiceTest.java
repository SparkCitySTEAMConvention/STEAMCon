package com.sparkcity.steamcon.speaker;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

class SpeakerServiceTest {

    @Mock
    private SessionProposalRepository sessionProposalRepository;

    @Mock
    private SpeakerApplicationRepository speakerApplicationRepository;

    @Mock
    private ApprovalDecisionRepository approvalDecisionRepository;

    private SpeakerService speakerService;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        speakerService = new SpeakerService(
                sessionProposalRepository,
                speakerApplicationRepository,
                approvalDecisionRepository);
    }

    @Test
    void createProposalShouldSaveProposal() {

        UUID speakerId = UUID.randomUUID();
        UUID trackId = UUID.randomUUID();

        when(sessionProposalRepository.save(any(SessionProposal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SessionProposal result = speakerService.createProposal(
                speakerId,
                "Building Better APIs",
                "A session about API design.",
                trackId);

        assertNotNull(result);
        assertEquals(speakerId, result.getSpeakerId());
        assertEquals(trackId, result.getTrackId());
        assertEquals("Building Better APIs", result.getTitle());
        assertEquals(
                "A session about API design.",
                result.getDescription());

        verify(sessionProposalRepository)
                .save(any(SessionProposal.class));
    }

    @Test
    void createSpeakerApplicationShouldSaveApplication() {

        UUID speakerId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();

        when(speakerApplicationRepository
                .save(any(SpeakerApplication.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SpeakerApplication result =
                speakerService.createSpeakerApplication(
                        speakerId,
                        sessionId);

        assertNotNull(result);
        assertEquals(speakerId, result.getSpeakerId());
        assertEquals(sessionId, result.getSessionId());

        verify(speakerApplicationRepository)
                .save(any(SpeakerApplication.class));
    }

    @Test
    void approveProposalShouldUpdateProposalStatus() {

        UUID proposalId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();

        SessionProposal proposal = new SessionProposal();

        when(sessionProposalRepository.findById(proposalId))
                .thenReturn(Optional.of(proposal));

        when(sessionProposalRepository.save(any(SessionProposal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(approvalDecisionRepository.save(any(ApprovalDecision.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ApprovalDecision result =
                speakerService.makeProposalDecision(
                        proposalId,
                        adminId,
                        ApprovalDecisionType.APPROVE,
                        "Looks good.");

        assertEquals(ProposalStatus.APPROVED, proposal.getStatus());
        assertEquals(
                ApprovalDecisionType.APPROVE,
                result.getDecision());

        verify(sessionProposalRepository).save(proposal);
        verify(approvalDecisionRepository)
                .save(any(ApprovalDecision.class));
    }

    @Test
    void rejectProposalShouldUpdateProposalStatus() {

        UUID proposalId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();

        SessionProposal proposal = new SessionProposal();

        when(sessionProposalRepository.findById(proposalId))
                .thenReturn(Optional.of(proposal));

        when(sessionProposalRepository.save(any(SessionProposal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(approvalDecisionRepository.save(any(ApprovalDecision.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ApprovalDecision result =
                speakerService.makeProposalDecision(
                        proposalId,
                        adminId,
                        ApprovalDecisionType.REJECT,
                        "Needs more detail.");

        assertEquals(ProposalStatus.REJECTED, proposal.getStatus());
        assertEquals(
                ApprovalDecisionType.REJECT,
                result.getDecision());
    }

    @Test
    void decisionShouldThrowWhenProposalDoesNotExist() {

        UUID proposalId = UUID.randomUUID();

        when(sessionProposalRepository.findById(proposalId))
                .thenReturn(Optional.empty());

        assertThrows(
                IllegalArgumentException.class,
                () -> speakerService.makeProposalDecision(
                        proposalId,
                        UUID.randomUUID(),
                        ApprovalDecisionType.APPROVE,
                        "Approved"));
    }
}