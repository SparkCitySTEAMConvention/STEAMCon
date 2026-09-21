package com.sparkcity.steamcon.speaker;

import java.util.List;
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

import com.sparkcity.steamcon.communication.NotificationService;
import com.sparkcity.steamcon.communication.NotificationType;
import com.sparkcity.steamcon.communication.SpeakerFlairRepository;

class SpeakerServiceTest {

        @Mock
        private SessionProposalRepository sessionProposalRepository;

        @Mock
        private SpeakerApplicationRepository speakerApplicationRepository;

        @Mock
        private ApprovalDecisionRepository approvalDecisionRepository;

        @Mock
        private NotificationService notificationService;

        @Mock
        private SpeakerFlairRepository speakerFlairRepository;

        private SpeakerService speakerService;

        @Mock
        private SpeakerProfileRepository speakerProfileRepository;

        @BeforeEach
        void setUp() {

                MockitoAnnotations.openMocks(this);

                speakerService = new SpeakerService(
                                sessionProposalRepository,
                                speakerApplicationRepository,
                                approvalDecisionRepository,
                                notificationService,
                                speakerFlairRepository,
                                speakerProfileRepository);
        }

        @Test
        void createProposalShouldSaveProposal() {

                UUID speakerId = UUID.randomUUID();
                UUID trackId = UUID.randomUUID();

                when(sessionProposalRepository
                                .save(any(SessionProposal.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                SessionProposal result = speakerService.createProposal(
                                speakerId,
                                "Building Better APIs",
                                "A session about API design.",
                                trackId);

                assertNotNull(result);
                assertEquals(
                                speakerId,
                                result.getSpeakerId());

                assertEquals(
                                trackId,
                                result.getTrackId());

                assertEquals(
                                "Building Better APIs",
                                result.getTitle());
        }

        @Test
        void createProposalShouldRejectBlankTitle() {

                assertThrows(
                                IllegalArgumentException.class,
                                () -> speakerService.createProposal(
                                                UUID.randomUUID(),
                                                " ",
                                                "Description",
                                                UUID.randomUUID()));
        }

        @Test
        void createSpeakerApplicationShouldSaveApplication() {

                UUID speakerId = UUID.randomUUID();
                UUID sessionId = UUID.randomUUID();

                when(speakerApplicationRepository
                                .findBySpeakerId(speakerId))
                                .thenReturn(List.of());

                when(speakerApplicationRepository
                                .save(any(SpeakerApplication.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                SpeakerApplication result = speakerService.createSpeakerApplication(
                                speakerId,
                                sessionId);

                assertNotNull(result);

                assertEquals(
                                speakerId,
                                result.getSpeakerId());

                assertEquals(
                                sessionId,
                                result.getSessionId());
        }

        @Test
        void duplicateSpeakerApplicationShouldFail() {

                UUID speakerId = UUID.randomUUID();
                UUID sessionId = UUID.randomUUID();

                SpeakerApplication existing = new SpeakerApplication();

                existing.setSpeakerId(speakerId);
                existing.setSessionId(sessionId);

                when(speakerApplicationRepository
                                .findBySpeakerId(speakerId))
                                .thenReturn(List.of(existing));

                assertThrows(
                                IllegalArgumentException.class,
                                () -> speakerService
                                                .createSpeakerApplication(
                                                                speakerId,
                                                                sessionId));
        }

        @Test
        void approveProposalShouldCreateNotification() {

                UUID proposalId = UUID.randomUUID();
                UUID adminId = UUID.randomUUID();
                UUID speakerId = UUID.randomUUID();

                SessionProposal proposal = new SessionProposal();

                proposal.setSpeakerId(speakerId);
                proposal.setTitle("Java APIs");

                when(sessionProposalRepository
                                .findById(proposalId))
                                .thenReturn(Optional.of(proposal));

                when(sessionProposalRepository
                                .save(any(SessionProposal.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                when(approvalDecisionRepository
                                .save(any(ApprovalDecision.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                speakerService.makeProposalDecision(
                                proposalId,
                                adminId,
                                ApprovalDecisionType.APPROVE,
                                "Looks good.");

                assertEquals(
                                ProposalStatus.APPROVED,
                                proposal.getStatus());

                verify(notificationService)
                                .createNotification(
                                                speakerId,
                                                "Your proposal \"Java APIs\" was approved.",
                                                NotificationType.PROPOSAL_APPROVED);
        }

        @Test
        void rejectProposalShouldCreateNotification() {

                UUID proposalId = UUID.randomUUID();
                UUID speakerId = UUID.randomUUID();

                SessionProposal proposal = new SessionProposal();

                proposal.setSpeakerId(speakerId);
                proposal.setTitle("Java APIs");

                when(sessionProposalRepository
                                .findById(proposalId))
                                .thenReturn(Optional.of(proposal));

                when(sessionProposalRepository
                                .save(any(SessionProposal.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                when(approvalDecisionRepository
                                .save(any(ApprovalDecision.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                speakerService.makeProposalDecision(
                                proposalId,
                                UUID.randomUUID(),
                                ApprovalDecisionType.REJECT,
                                "Needs work.");

                assertEquals(
                                ProposalStatus.REJECTED,
                                proposal.getStatus());

                verify(notificationService)
                                .createNotification(
                                                speakerId,
                                                "Your proposal \"Java APIs\" was rejected.",
                                                NotificationType.PROPOSAL_REJECTED);
        }

        @Test
        void decisionShouldThrowWhenProposalMissing() {

                UUID proposalId = UUID.randomUUID();

                when(sessionProposalRepository
                                .findById(proposalId))
                                .thenReturn(Optional.empty());

                assertThrows(
                                IllegalArgumentException.class,
                                () -> speakerService
                                                .makeProposalDecision(
                                                                proposalId,
                                                                UUID.randomUUID(),
                                                                ApprovalDecisionType.APPROVE,
                                                                "Approved"));
        }

        @Test
        void speakerApplicationStatusShouldUpdateAndNotify() {

                UUID applicationId = UUID.randomUUID();
                UUID speakerId = UUID.randomUUID();

                SpeakerApplication application = new SpeakerApplication();

                application.setSpeakerId(speakerId);

                when(speakerApplicationRepository
                                .findById(applicationId))
                                .thenReturn(Optional.of(application));

                when(speakerApplicationRepository
                                .save(application))
                                .thenReturn(application);

                SpeakerApplication result = speakerService
                                .updateSpeakerApplicationStatus(
                                                applicationId,
                                                ApplicationStatus.APPROVED);

                assertEquals(
                                ApplicationStatus.APPROVED,
                                result.getStatus());

                verify(notificationService)
                                .createNotification(
                                                speakerId,
                                                "Your speaker application status changed to APPROVED.",
                                                NotificationType.SPEAKER_APPLICATION_UPDATED);
        }

        @Test
        void missingSpeakerApplicationShouldFail() {

                UUID applicationId = UUID.randomUUID();

                when(speakerApplicationRepository
                                .findById(applicationId))
                                .thenReturn(Optional.empty());

                assertThrows(
                                IllegalArgumentException.class,
                                () -> speakerService
                                                .updateSpeakerApplicationStatus(
                                                                applicationId,
                                                                ApplicationStatus.APPROVED));
        }

        @Test
        void shouldReturnProposalForOwner() {

                UUID proposalId = UUID.randomUUID();
                UUID speakerId = UUID.randomUUID();

                SessionProposal proposal = new SessionProposal();

                proposal.setSpeakerId(speakerId);

                when(sessionProposalRepository
                                .findById(proposalId))
                                .thenReturn(
                                                Optional.of(proposal));

                SessionProposal result = speakerService
                                .getProposalForSpeaker(
                                                proposalId,
                                                speakerId);

                assertEquals(
                                proposal,
                                result);
        }

        @Test
        void shouldRejectProposalForWrongOwner() {

                UUID proposalId = UUID.randomUUID();

                SessionProposal proposal = new SessionProposal();

                proposal.setSpeakerId(
                                UUID.randomUUID());

                when(sessionProposalRepository
                                .findById(proposalId))
                                .thenReturn(
                                                Optional.of(proposal));

                assertThrows(
                                IllegalArgumentException.class,
                                () -> speakerService
                                                .getProposalForSpeaker(
                                                                proposalId,
                                                                UUID.randomUUID()));
        }

        @Test
        void draftProposalShouldBeEditable() {

                UUID proposalId = UUID.randomUUID();
                UUID speakerId = UUID.randomUUID();

                SessionProposal proposal = new SessionProposal();

                proposal.setSpeakerId(speakerId);
                proposal.setTitle("Old");
                proposal.setDescription("Old description");
                proposal.setStatus(
                                ProposalStatus.DRAFT);

                when(sessionProposalRepository
                                .findById(proposalId))
                                .thenReturn(
                                                Optional.of(proposal));

                when(sessionProposalRepository
                                .save(proposal))
                                .thenReturn(proposal);

                SessionProposal result = speakerService.updateProposal(
                                proposalId,
                                speakerId,
                                "New title",
                                "New description",
                                UUID.randomUUID());

                assertEquals(
                                "New title",
                                result.getTitle());

                assertEquals(
                                "New description",
                                result.getDescription());
        }

        @Test
        void approvedProposalShouldNotBeEditable() {

                UUID proposalId = UUID.randomUUID();
                UUID speakerId = UUID.randomUUID();

                SessionProposal proposal = new SessionProposal();

                proposal.setSpeakerId(speakerId);
                proposal.setStatus(
                                ProposalStatus.APPROVED);

                when(sessionProposalRepository
                                .findById(proposalId))
                                .thenReturn(
                                                Optional.of(proposal));

                assertThrows(
                                IllegalArgumentException.class,
                                () -> speakerService
                                                .updateProposal(
                                                                proposalId,
                                                                speakerId,
                                                                "Change",
                                                                null,
                                                                null));
        }

        @Test
        void shouldWithdrawOwnedProposal() {

                UUID proposalId = UUID.randomUUID();
                UUID speakerId = UUID.randomUUID();

                SessionProposal proposal = new SessionProposal();

                proposal.setSpeakerId(speakerId);
                proposal.setStatus(
                                ProposalStatus.SUBMITTED);

                when(sessionProposalRepository
                                .findById(proposalId))
                                .thenReturn(
                                                Optional.of(proposal));

                speakerService.withdrawProposal(
                                proposalId,
                                speakerId);

                assertEquals(
                                ProposalStatus.WITHDRAWN,
                                proposal.getStatus());

                verify(sessionProposalRepository)
                                .save(proposal);
        }

        @Test
        void dashboardShouldReturnSpeakerData() {

                UUID speakerId = UUID.randomUUID();

                SessionProposal proposal = new SessionProposal();

                proposal.setSpeakerId(speakerId);

                SpeakerApplication application = new SpeakerApplication();

                application.setSpeakerId(speakerId);

                when(sessionProposalRepository
                                .findBySpeakerId(speakerId))
                                .thenReturn(
                                                List.of(proposal));

                when(speakerApplicationRepository
                                .findBySpeakerId(speakerId))
                                .thenReturn(
                                                List.of(application));

                when(approvalDecisionRepository
                                .findAll())
                                .thenReturn(List.of());

                SpeakerDashboardResponse result = speakerService
                                .getDashboard(
                                                speakerId);

                assertEquals(
                                speakerId,
                                result.speakerId());

                assertEquals(
                                1,
                                result.proposals().size());

                assertEquals(
                                1,
                                result.applications().size());
        }

        @Test
        void directoryShouldContainApprovedSpeakers() {

                UUID speakerId = UUID.randomUUID();

                SessionProposal proposal = new SessionProposal();

                proposal.setSpeakerId(speakerId);
                proposal.setTitle("Java APIs");
                proposal.setStatus(
                                ProposalStatus.APPROVED);

                when(sessionProposalRepository
                                .findByStatus(
                                                ProposalStatus.APPROVED))
                                .thenReturn(
                                                List.of(proposal));

                when(speakerFlairRepository.findAll())
                                .thenReturn(List.of());

                List<SpeakerDirectoryEntry> result = speakerService
                                .getPublicSpeakerDirectory();

                assertEquals(1, result.size());

                assertEquals(
                                speakerId,
                                result.get(0).speakerId());

                assertEquals(
                                "Java APIs",
                                result.get(0)
                                                .approvedProposalTitles()
                                                .get(0));
        }
}