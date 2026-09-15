package com.sparkcity.steamcon.speaker;

import java.util.UUID;

public record ProposalDecisionRequest(
        UUID adminReviewerId,
        ApprovalDecisionType decision,
        String comment) {
}