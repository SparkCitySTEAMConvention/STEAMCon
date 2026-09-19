package com.sparkcity.steamcon.speaker;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "schedule_change_requests")
public class ScheduleChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID assignmentId;

    @Column(nullable = false)
    private String reason;

    private Instant requestedStartsAt;

    @Column(length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleChangeRequestStatus status =
            ScheduleChangeRequestStatus.PENDING;

    private Instant createdAt =
            Instant.now();

    public UUID getId() {
        return id;
    }

    public UUID getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(UUID assignmentId) {
        this.assignmentId = assignmentId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Instant getRequestedStartsAt() {
        return requestedStartsAt;
    }

    public void setRequestedStartsAt(
            Instant requestedStartsAt) {

        this.requestedStartsAt =
                requestedStartsAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public ScheduleChangeRequestStatus getStatus() {
        return status;
    }

    public void setStatus(
            ScheduleChangeRequestStatus status) {

        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}