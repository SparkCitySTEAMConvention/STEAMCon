package com.sparkcity.steamcon.events;

import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "session_occurrences")
public class SessionOccurrence {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(nullable = false)
    private UUID sessionId;

    @NotNull
    @Column(nullable = false)
    private Instant startsAt;

    @NotNull
    @Column(nullable = false)
    private Instant endsAt;

    public SessionOccurrence() {
    }

    public UUID getId() {
        return id;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public Instant getStartsAt() {
        return startsAt;
    }

    public void setStartsAt(Instant startsAt) {
        this.startsAt = startsAt;
    }

    public Instant getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(Instant endsAt) {
        this.endsAt = endsAt;
    }

    @AssertTrue(message = "End time must be after start time")
    public boolean isEndAfterStart() {
        if (startsAt == null || endsAt == null) {
            return true;
        }

        return endsAt.isAfter(startsAt);
    }
}