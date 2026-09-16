package com.sparkcity.steamcon.speaker;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.sparkcity.steamcon.communication.NotificationService;
import com.sparkcity.steamcon.communication.NotificationType;

@Service
public class SpeakerService {

    private final SessionProposalRepository sessionProposalRepository;
    private final SpeakerApplicationRepository speakerApplicationRepository;
    private final ApprovalDecisionRepository approvalDecisionRepository;
    private final NotificationService notificationService;

    public SpeakerService(
            SessionProposalRepository sessionProposalRepository,
            SpeakerApplicationRepository speakerApplicationRepository,
            ApprovalDecisionRepository approvalDecisionRepository,
            NotificationService notificationService) {

        this.sessionProposalRepository = sessionProposalRepository;
        this.speakerApplicationRepository = speakerApplicationRepository;
        this.approvalDecisionRepository = approvalDecisionRepository;
        this.notificationService = notificationService;
    }

    public SessionProposal createProposal(
            UUID authenticatedUserId,
            String title,
            String description,
            UUID trackId) {

        if (authenticatedUserId == null) {
            throw new IllegalArgumentException(
                    "Authenticated user ID is required");
        }

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                    "Proposal title is required");
        }

        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException(
                    "Proposal description is required");
        }

        if (trackId == null) {
            throw new IllegalArgumentException(
                    "Track ID is required");
        }

        SessionProposal proposal = new SessionProposal();

        proposal.setSpeakerId(authenticatedUserId);
        proposal.setTitle(title);
        proposal.setDescription(description);
        proposal.setTrackId(trackId);

        return sessionProposalRepository.save(proposal);
    }

    public SpeakerApplication createSpeakerApplication(
            UUID authenticatedUserId,
            UUID sessionId) {

        if (authenticatedUserId == null) {
            throw new IllegalArgumentException(
                    "Authenticated user ID is required");
        }

        if (sessionId == null) {
            throw new IllegalArgumentException(
                    "Session ID is required");
        }

        boolean duplicate =
                speakerApplicationRepository.findAll()
                        .stream()
                        .anyMatch(application ->
                                authenticatedUserId.equals(
                                        application.getSpeakerId())
                                && sessionId.equals(
                                        application.getSessionId()));

        if (duplicate) {
            throw new IllegalArgumentException(
                    "Speaker has already applied to this session");
        }

        SpeakerApplication application =
                new SpeakerApplication();

        application.setSpeakerId(authenticatedUserId);
        application.setSessionId(sessionId);

        return speakerApplicationRepository.save(application);
    }

    public ApprovalDecision makeProposalDecision(
            UUID proposalId,
            UUID authenticatedAdminId,
            ApprovalDecisionType decisionType,
            String comment) {

        if (proposalId == null) {
            throw new IllegalArgumentException(
                    "Proposal ID is required");
        }

        if (authenticatedAdminId == null) {
            throw new IllegalArgumentException(
                    "Authenticated admin ID is required");
        }

        if (decisionType == null) {
            throw new IllegalArgumentException(
                    "Decision is required");
        }

        SessionProposal proposal =
                sessionProposalRepository.findById(proposalId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Proposal not found"));

        NotificationType notificationType;
        String notificationMessage;

        if (decisionType == ApprovalDecisionType.APPROVE) {

            proposal.setStatus(ProposalStatus.APPROVED);

            notificationType =
                    NotificationType.PROPOSAL_APPROVED;

            notificationMessage =
                    "Your proposal \"" +
                    proposal.getTitle() +
                    "\" was approved.";

        } else {

            proposal.setStatus(ProposalStatus.REJECTED);

            notificationType =
                    NotificationType.PROPOSAL_REJECTED;

            notificationMessage =
                    "Your proposal \"" +
                    proposal.getTitle() +
                    "\" was rejected.";
        }

        sessionProposalRepository.save(proposal);

        ApprovalDecision approvalDecision =
                new ApprovalDecision();

        // Existing entity uses applicationId.
        // This stores the proposal ID until the team refactors the entity.
        approvalDecision.setApplicationId(proposalId);
        approvalDecision.setAdminReviewerId(
                authenticatedAdminId);
        approvalDecision.setDecision(decisionType);
        approvalDecision.setComment(comment);

        ApprovalDecision savedDecision =
                approvalDecisionRepository.save(
                        approvalDecision);

        if (proposal.getSpeakerId() != null) {
            notificationService.createNotification(
                    proposal.getSpeakerId(),
                    notificationMessage,
                    notificationType);
        }

        return savedDecision;
    }

    public SpeakerApplication updateSpeakerApplicationStatus(
            UUID applicationId,
            ApplicationStatus status) {

        if (applicationId == null) {
            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        if (status == null) {
            throw new IllegalArgumentException(
                    "Application status is required");
        }

        SpeakerApplication application =
                speakerApplicationRepository
                        .findById(applicationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Speaker application not found"));

        application.setStatus(status);

        SpeakerApplication saved =
                speakerApplicationRepository.save(
                        application);

        if (application.getSpeakerId() != null) {
            notificationService.createNotification(
                    application.getSpeakerId(),
                    "Your speaker application status changed to "
                            + status + ".",
                    NotificationType
                            .SPEAKER_APPLICATION_UPDATED);
        }

        return saved;
    }
}
