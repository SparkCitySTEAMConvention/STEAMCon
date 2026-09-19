package com.sparkcity.steamcon.speaker;

import java.util.List;
import java.util.UUID;

public record SpeakerDashboardResponse(
        UUID speakerId,
        List<SessionProposal> proposals,
        List<SpeakerApplication> applications,
        List<ApprovalDecision> feedback) {
}