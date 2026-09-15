package com.sparkcity.steamcon.speaker;

import org.springframework.stereotype.Service;

import java.util.UUID;

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
}