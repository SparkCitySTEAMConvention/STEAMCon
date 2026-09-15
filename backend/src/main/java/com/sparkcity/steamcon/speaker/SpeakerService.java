package com.sparkcity.steamcon.speaker;

import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class SpeakerService {

    private final SessionProposalRepository sessionProposalRepository;
    private final SpeakerApplicationRepository speakerApplicationRepository;
    private final ApprovalDecisionRepository approvalDecisionRepository;

    public SpeakerService(
            SessionProposalRepository sessionProposalRepository,
            SpeakerApplicationRepository speakerApplicationRepository,
            ApprovalDecisionRepository approvalDecisionRepository) {

        this.sessionProposalRepository = sessionProposalRepository;
        this.speakerApplicationRepository = speakerApplicationRepository;
        this.approvalDecisionRepository = approvalDecisionRepository;
    }

    public SessionProposal createProposal(
            UUID speakerId,
            String title,
            String description,
            UUID trackId) {

        SessionProposal proposal = new SessionProposal();

        proposal.setSpeakerId(speakerId);
        proposal.setTitle(title);
        proposal.setDescription(description);
        proposal.setTrackId(trackId);

        return sessionProposalRepository.save(proposal);
    }

    public SpeakerApplication createSpeakerApplication(
            UUID speakerId,
            UUID sessionId) {

        SpeakerApplication application = new SpeakerApplication();

        application.setSpeakerId(speakerId);
        application.setSessionId(sessionId);

        return speakerApplicationRepository.save(application);
    }

    public ApprovalDecision makeProposalDecision(
            UUID proposalId,
            UUID adminReviewerId,
            ApprovalDecisionType decisionType,
            String comment) {

        SessionProposal proposal = sessionProposalRepository.findById(proposalId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Proposal not found"));

        if (decisionType == ApprovalDecisionType.APPROVE) {
            proposal.setStatus(ProposalStatus.APPROVED);
        } else {
            proposal.setStatus(ProposalStatus.REJECTED);
        }

        sessionProposalRepository.save(proposal);

        ApprovalDecision approvalDecision = new ApprovalDecision();

        // Existing entity currently calls this applicationId.
        // We are using it to store the proposal ID until that entity
        // is refactored by the team.
        approvalDecision.setApplicationId(proposalId);
        approvalDecision.setAdminReviewerId(adminReviewerId);
        approvalDecision.setDecision(decisionType);
        approvalDecision.setComment(comment);

        return approvalDecisionRepository.save(approvalDecision);
    }
}