package com.sparkcity.steamcon.speaker;

import java.util.UUID;

public record UpdateProposalRequest(
        String title,
        String description,
        UUID trackId) {
}