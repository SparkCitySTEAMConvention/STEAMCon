package com.sparkcity.steamcon.speaker;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.sparkcity.steamcon.communication.NotificationService;
import com.sparkcity.steamcon.communication.NotificationType;
import com.sparkcity.steamcon.communication.SpeakerFlair;
import com.sparkcity.steamcon.communication.SpeakerFlairRepository;

@Service
public class SpeakerService {

    private final SessionProposalRepository sessionProposalRepository;
    private final SpeakerApplicationRepository speakerApplicationRepository;
    private final ApprovalDecisionRepository approvalDecisionRepository;
    private final NotificationService notificationService;
    private final SpeakerFlairRepository speakerFlairRepository;

    public SpeakerService(
            SessionProposalRepository sessionProposalRepository,
            SpeakerApplicationRepository speakerApplicationRepository,
            ApprovalDecisionRepository approvalDecisionRepository,
            NotificationService notificationService,
            SpeakerFlairRepository speakerFlairRepository) {

        this.sessionProposalRepository = sessionProposalRepository;
        this.speakerApplicationRepository = speakerApplicationRepository;
        this.approvalDecisionRepository = approvalDecisionRepository;
        this.notificationService = notificationService;
        this.speakerFlairRepository = speakerFlairRepository;
    }

    // ---------------------------------------------------------
    // PROPOSAL CREATION
    // ---------------------------------------------------------

    public SessionProposal createProposal(
            UUID speakerId,
            String title,
            String description,
            UUID trackId) {

        return createProposal(
                speakerId,
                title,
                description,
                trackId,
                ProposalStatus.SUBMITTED);
    }

    public SessionProposal createProposal(
            UUID speakerId,
            String title,
            String description,
            UUID trackId,
            ProposalStatus requestedStatus) {

        validateProposalInput(
                speakerId,
                title,
                description,
                trackId);

        ProposalStatus status =
                requestedStatus == null
                        ? ProposalStatus.SUBMITTED
                        : requestedStatus;

        if (status != ProposalStatus.DRAFT
                && status != ProposalStatus.SUBMITTED) {

            throw new IllegalArgumentException(
                    "New proposals may only be DRAFT or SUBMITTED");
        }

        SessionProposal proposal =
                new SessionProposal();

        proposal.setSpeakerId(speakerId);
        proposal.setTitle(title);
        proposal.setDescription(description);
        proposal.setTrackId(trackId);
        proposal.setStatus(status);

        return sessionProposalRepository.save(proposal);
    }

    // ---------------------------------------------------------
    // PROPOSAL READ
    // ---------------------------------------------------------

    public SessionProposal getProposal(UUID proposalId) {

        return sessionProposalRepository
                .findById(proposalId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Proposal not found"));
    }

    public SessionProposal getProposalForSpeaker(
            UUID proposalId,
            UUID speakerId) {

        SessionProposal proposal =
                getProposal(proposalId);

        requireProposalOwner(
                proposal,
                speakerId);

        return proposal;
    }

    public List<SessionProposal> getProposalsForSpeaker(
            UUID speakerId) {

        if (speakerId == null) {
            throw new IllegalArgumentException(
                    "Speaker ID is required");
        }

        return sessionProposalRepository
                .findBySpeakerId(speakerId)
                .stream()
                .filter(proposal ->
                        proposal.getStatus()
                                != ProposalStatus.WITHDRAWN)
                .toList();
    }

    // ---------------------------------------------------------
    // PROPOSAL EDITING
    // ---------------------------------------------------------

    public SessionProposal updateProposal(
            UUID proposalId,
            UUID speakerId,
            String title,
            String description,
            UUID trackId) {

        SessionProposal proposal =
                getProposalForSpeaker(
                        proposalId,
                        speakerId);

        if (proposal.getStatus()
                != ProposalStatus.DRAFT
                && proposal.getStatus()
                != ProposalStatus.SUBMITTED) {

            throw new IllegalArgumentException(
                    "Only draft or submitted proposals can be edited");
        }

        if (title != null) {

            if (title.isBlank()) {
                throw new IllegalArgumentException(
                        "Proposal title cannot be blank");
            }

            proposal.setTitle(title);
        }

        if (description != null) {

            if (description.isBlank()) {
                throw new IllegalArgumentException(
                        "Proposal description cannot be blank");
            }

            proposal.setDescription(description);
        }

        if (trackId != null) {
            proposal.setTrackId(trackId);
        }

        return sessionProposalRepository.save(
                proposal);
    }

    // ---------------------------------------------------------
    // WITHDRAWAL
    // ---------------------------------------------------------

    public void withdrawProposal(
            UUID proposalId,
            UUID speakerId) {

        SessionProposal proposal =
                getProposalForSpeaker(
                        proposalId,
                        speakerId);

        if (proposal.getStatus()
                == ProposalStatus.WITHDRAWN) {

            throw new IllegalArgumentException(
                    "Proposal is already withdrawn");
        }

        proposal.setStatus(
                ProposalStatus.WITHDRAWN);

        sessionProposalRepository.save(
                proposal);
    }

    // ---------------------------------------------------------
    // APPLICATIONS
    // ---------------------------------------------------------

    public SpeakerApplication createSpeakerApplication(
            UUID speakerId,
            UUID sessionId) {

        if (speakerId == null) {
            throw new IllegalArgumentException(
                    "Speaker ID is required");
        }

        if (sessionId == null) {
            throw new IllegalArgumentException(
                    "Session ID is required");
        }

        boolean duplicate =
                speakerApplicationRepository
                        .findBySpeakerId(speakerId)
                        .stream()
                        .anyMatch(application ->
                                sessionId.equals(
                                        application.getSessionId()));

        if (duplicate) {
            throw new IllegalArgumentException(
                    "Speaker has already applied to this session");
        }

        SpeakerApplication application =
                new SpeakerApplication();

        application.setSpeakerId(speakerId);
        application.setSessionId(sessionId);

        return speakerApplicationRepository
                .save(application);
    }

    public SpeakerApplication updateSpeakerApplicationStatus(
            UUID applicationId,
            ApplicationStatus status) {

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
                speakerApplicationRepository
                        .save(application);

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

    // ---------------------------------------------------------
    // ORGANIZER DECISIONS
    // ---------------------------------------------------------

    public ApprovalDecision makeProposalDecision(
            UUID proposalId,
            UUID adminReviewerId,
            ApprovalDecisionType decisionType,
            String comment) {

        if (adminReviewerId == null) {
            throw new IllegalArgumentException(
                    "Admin reviewer ID is required");
        }

        if (decisionType == null) {
            throw new IllegalArgumentException(
                    "Decision is required");
        }

        SessionProposal proposal =
                getProposal(proposalId);

        if (proposal.getStatus()
                == ProposalStatus.WITHDRAWN) {

            throw new IllegalArgumentException(
                    "Withdrawn proposals cannot be reviewed");
        }

        NotificationType notificationType;
        String notificationMessage;

        if (decisionType
                == ApprovalDecisionType.APPROVE) {

            proposal.setStatus(
                    ProposalStatus.APPROVED);

            notificationType =
                    NotificationType
                            .PROPOSAL_APPROVED;

            notificationMessage =
                    "Your proposal \""
                            + proposal.getTitle()
                            + "\" was approved.";

        } else {

            proposal.setStatus(
                    ProposalStatus.REJECTED);

            notificationType =
                    NotificationType
                            .PROPOSAL_REJECTED;

            notificationMessage =
                    "Your proposal \""
                            + proposal.getTitle()
                            + "\" was rejected.";
        }

        sessionProposalRepository
                .save(proposal);

        ApprovalDecision approvalDecision =
                new ApprovalDecision();

        // Existing entity currently calls this applicationId.
        // For proposal decisions we store proposalId here.
        approvalDecision.setApplicationId(
                proposalId);

        approvalDecision.setAdminReviewerId(
                adminReviewerId);

        approvalDecision.setDecision(
                decisionType);

        approvalDecision.setComment(
                comment);

        ApprovalDecision savedDecision =
                approvalDecisionRepository
                        .save(approvalDecision);

        if (proposal.getSpeakerId() != null) {

            notificationService
                    .createNotification(
                            proposal.getSpeakerId(),
                            notificationMessage,
                            notificationType);
        }

        return savedDecision;
    }

    // ---------------------------------------------------------
    // SPEAKER DASHBOARD
    // ---------------------------------------------------------

    public SpeakerDashboardResponse getDashboard(
            UUID speakerId) {

        List<SessionProposal> proposals =
                getProposalsForSpeaker(
                        speakerId);

        List<SpeakerApplication> applications =
                speakerApplicationRepository
                        .findBySpeakerId(
                                speakerId);

        Set<UUID> proposalIds =
                new LinkedHashSet<>();

        for (SessionProposal proposal
                : proposals) {

            if (proposal.getId() != null) {
                proposalIds.add(
                        proposal.getId());
            }
        }

        List<ApprovalDecision> feedback =
                approvalDecisionRepository
                        .findAll()
                        .stream()
                        .filter(decision ->
                                proposalIds.contains(
                                        decision
                                                .getApplicationId()))
                        .toList();

        return new SpeakerDashboardResponse(
                speakerId,
                proposals,
                applications,
                feedback);
    }

    // ---------------------------------------------------------
    // PUBLIC SPEAKER DIRECTORY
    // ---------------------------------------------------------

    public List<SpeakerDirectoryEntry>
            getPublicSpeakerDirectory() {

        List<SessionProposal> approved =
                sessionProposalRepository
                        .findByStatus(
                                ProposalStatus.APPROVED);

        Set<UUID> speakerIds =
                new LinkedHashSet<>();

        for (SessionProposal proposal
                : approved) {

            if (proposal.getSpeakerId()
                    != null) {

                speakerIds.add(
                        proposal.getSpeakerId());
            }
        }

        List<SpeakerDirectoryEntry> result =
                new ArrayList<>();

        for (UUID speakerId
                : speakerIds) {

            List<SessionProposal>
                    speakerProposals =
                    approved.stream()
                            .filter(proposal ->
                                    speakerId.equals(
                                            proposal
                                                    .getSpeakerId()))
                            .toList();

            SpeakerFlair flair =
                    getSpeakerFlair(
                            speakerId);

            result.add(
                    new SpeakerDirectoryEntry(
                            speakerId,
                            flair == null
                                    ? null
                                    : flair.getLabel(),
                            flair == null
                                    ? null
                                    : flair.getDisplayStyle(),
                            speakerProposals.size(),
                            speakerProposals
                                    .stream()
                                    .map(
                                            SessionProposal
                                                    ::getTitle)
                                    .toList()));
        }

        return result;
    }

    public SpeakerPublicProfileResponse
            getPublicSpeakerProfile(
                    UUID speakerId) {

        List<SessionProposal> approved =
                sessionProposalRepository
                        .findBySpeakerId(
                                speakerId)
                        .stream()
                        .filter(proposal ->
                                proposal.getStatus()
                                        == ProposalStatus.APPROVED)
                        .toList();

        if (approved.isEmpty()) {
            throw new IllegalArgumentException(
                    "Public speaker profile not found");
        }

        SpeakerFlair flair =
                getSpeakerFlair(
                        speakerId);

        return new SpeakerPublicProfileResponse(
                speakerId,
                flair == null
                        ? null
                        : flair.getLabel(),
                flair == null
                        ? null
                        : flair.getDisplayStyle(),
                approved);
    }

    // ---------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------

    private void validateProposalInput(
            UUID speakerId,
            String title,
            String description,
            UUID trackId) {

        if (speakerId == null) {
            throw new IllegalArgumentException(
                    "Speaker ID is required");
        }

        if (title == null
                || title.isBlank()) {

            throw new IllegalArgumentException(
                    "Proposal title is required");
        }

        if (description == null
                || description.isBlank()) {

            throw new IllegalArgumentException(
                    "Proposal description is required");
        }

        if (trackId == null) {
            throw new IllegalArgumentException(
                    "Track ID is required");
        }
    }

    private void requireProposalOwner(
            SessionProposal proposal,
            UUID speakerId) {

        if (speakerId == null) {
            throw new IllegalArgumentException(
                    "Speaker ID is required");
        }

        if (!speakerId.equals(
                proposal.getSpeakerId())) {

            throw new IllegalArgumentException(
                    "Speaker does not own this proposal");
        }
    }

    private SpeakerFlair getSpeakerFlair(
            UUID speakerId) {

        return speakerFlairRepository
                .findAll()
                .stream()
                .filter(flair ->
                        speakerId.equals(
                                flair.getUserId()))
                .findFirst()
                .orElse(null);
    }
}