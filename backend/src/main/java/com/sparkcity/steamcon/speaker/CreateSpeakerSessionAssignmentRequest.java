package com.sparkcity.steamcon.speaker;

import java.util.UUID;

public record CreateSpeakerSessionAssignmentRequest(
        UUID proposalId,
        UUID sessionId,
        SpeakerRole role) {
}