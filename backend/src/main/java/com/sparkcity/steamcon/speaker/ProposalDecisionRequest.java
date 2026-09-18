package com.sparkcity.steamcon.speaker;

public record ProposalDecisionRequest(
        ApprovalDecisionType decision,
        String comment) {
}