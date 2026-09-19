package com.sparkcity.steamcon.speaker;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class SpeakerSessionAssignmentService {

    private final SpeakerSessionAssignmentRepository
            assignmentRepository;

    private final SessionProposalRepository
            proposalRepository;

    public SpeakerSessionAssignmentService(
            SpeakerSessionAssignmentRepository assignmentRepository,
            SessionProposalRepository proposalRepository) {

        this.assignmentRepository =
                assignmentRepository;

        this.proposalRepository =
                proposalRepository;
    }

    public SpeakerSessionAssignment createAssignment(
            UUID proposalId,
            UUID sessionId,
            SpeakerRole role) {

        if (proposalId == null) {
            throw new IllegalArgumentException(
                    "Proposal ID is required");
        }

        if (sessionId == null) {
            throw new IllegalArgumentException(
                    "Session ID is required");
        }

        if (role == null) {
            throw new IllegalArgumentException(
                    "Speaker role is required");
        }

        SessionProposal proposal =
                proposalRepository
                        .findById(proposalId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Proposal not found"));

        if (proposal.getStatus()
                != ProposalStatus.APPROVED) {

            throw new IllegalArgumentException(
                    "Only approved proposals can be assigned to sessions");
        }

        UUID speakerId =
                proposal.getSpeakerId();

        if (assignmentRepository
                .existsBySpeakerIdAndSessionId(
                        speakerId,
                        sessionId)) {

            throw new IllegalArgumentException(
                    "Speaker is already assigned to this session");
        }

        if (assignmentRepository
                .findByProposalId(proposalId)
                .isPresent()) {

            throw new IllegalArgumentException(
                    "Proposal is already linked to a session");
        }

        SpeakerSessionAssignment assignment =
                new SpeakerSessionAssignment();

        assignment.setSpeakerId(speakerId);
        assignment.setProposalId(proposalId);
        assignment.setSessionId(sessionId);
        assignment.setRole(role);

        return assignmentRepository.save(
                assignment);
    }

    public List<SpeakerSessionAssignment>
            getAssignmentsForSpeaker(
                    UUID speakerId) {

        return assignmentRepository
                .findBySpeakerId(speakerId);
    }

    public SpeakerSessionAssignment getAssignment(
            UUID assignmentId) {

        return assignmentRepository
                .findById(assignmentId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Speaker assignment not found"));
    }

    public SpeakerSessionAssignment getOwnedAssignment(
            UUID assignmentId,
            UUID speakerId) {

        SpeakerSessionAssignment assignment =
                getAssignment(assignmentId);

        if (!speakerId.equals(
                assignment.getSpeakerId())) {

            throw new IllegalArgumentException(
                    "Speaker does not own this assignment");
        }

        return assignment;
    }
}