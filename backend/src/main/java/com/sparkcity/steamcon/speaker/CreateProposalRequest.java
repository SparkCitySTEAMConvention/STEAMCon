package com.sparkcity.steamcon.speaker;

import java.util.UUID;

public record CreateProposalRequest(
        UUID speakerId,
        String title,
        String description,
        UUID trackId) {
}