package com.sparkcity.steamcon.speaker;

import java.util.List;
import java.util.UUID;

public record SpeakerDirectoryEntry(
        UUID speakerId,
        String name,
        String bio,
        String role,
        String organization,
        List<UUID> trackIds,
        String flairLabel,
        String displayStyle,
        int approvedProposalCount,
        List<String> approvedProposalTitles) {
}