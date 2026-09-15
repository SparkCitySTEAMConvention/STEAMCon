package com.sparkcity.steamcon.communication;

import java.util.UUID;

public record CreateMessageRequest(
        UUID authorId,
        String body,
        UUID speakerFlairId) {
}