package com.sparkcity.steamcon.speaker;

import java.util.UUID;

public record SpeakerSessionAssignmentResponse(
        UUID assignmentId,
        UUID speakerId,
        UUID proposalId,
        UUID sessionId,
        SpeakerRole role) {

    public static SpeakerSessionAssignmentResponse from(
            SpeakerSessionAssignment assignment) {

        return new SpeakerSessionAssignmentResponse(
                assignment.getId(),
                assignment.getSpeakerId(),
                assignment.getProposalId(),
                assignment.getSessionId(),
                assignment.getRole());
    }
}