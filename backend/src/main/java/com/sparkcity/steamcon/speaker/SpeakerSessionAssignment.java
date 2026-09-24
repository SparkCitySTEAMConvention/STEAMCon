package com.sparkcity.steamcon.speaker;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "speaker_session_assignments",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "speaker_id",
                                "session_id"
                        })
        })
public class SpeakerSessionAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "speaker_id",
            nullable = false)
    private UUID speakerId;

    @Column(
            name = "session_id",
            nullable = false)
    private UUID sessionId;

    @Column(name = "proposal_id")
    private UUID proposalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpeakerRole role;

    public UUID getId() {
        return id;
    }

    public UUID getSpeakerId() {
        return speakerId;
    }

    public void setSpeakerId(UUID speakerId) {
        this.speakerId = speakerId;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public UUID getProposalId() {
        return proposalId;
    }

    public void setProposalId(UUID proposalId) {
        this.proposalId = proposalId;
    }

    public SpeakerRole getRole() {
        return role;
    }

    public void setRole(SpeakerRole role) {
        this.role = role;
    }
}