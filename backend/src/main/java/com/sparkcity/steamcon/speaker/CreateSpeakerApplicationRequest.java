package com.sparkcity.steamcon.speaker;

import java.util.UUID;

public record CreateSpeakerApplicationRequest(
        UUID sessionId) {
}