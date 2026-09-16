package com.sparkcity.steamcon.speaker;

import java.util.List;
import java.util.UUID;

public record SpeakerPublicProfileResponse(
        UUID speakerId,
        String flairLabel,
        String displayStyle,
        List<SessionProposal> approvedProposals) {
}