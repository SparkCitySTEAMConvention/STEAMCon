package com.sparkcity.steamcon.speaker;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "speaker_profiles",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = "speaker_id")
        })
public class SpeakerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "speaker_id",
            nullable = false)
    private UUID speakerId;

    private String displayName;

    private String title;

    private String organization;

    @Column(length = 4000)
    private String biography;

    public UUID getId() {
        return id;
    }

    public UUID getSpeakerId() {
        return speakerId;
    }

    public void setSpeakerId(UUID speakerId) {
        this.speakerId = speakerId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(
            String displayName) {

        this.displayName = displayName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(
            String organization) {

        this.organization = organization;
    }

    public String getBiography() {
        return biography;
    }

    public void setBiography(
            String biography) {

        this.biography = biography;
    }
}