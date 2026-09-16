package com.sparkcity.steamcon.speaker;

import java.util.List;
import java.util.UUID;

public record SpeakerDirectoryEntry(
        UUID speakerId,
        String flairLabel,
        String displayStyle,
        int approvedProposalCount,
        List<String> approvedProposalTitles) {
}