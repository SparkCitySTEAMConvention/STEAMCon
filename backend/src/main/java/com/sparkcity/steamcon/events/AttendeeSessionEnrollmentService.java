package com.sparkcity.steamcon.events;

import com.sparkcity.steamcon.admission.AdmissionService;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AttendeeSessionEnrollmentService {

    private final AttendeeSessionEnrollmentRepository enrollmentRepository;
    private final SessionRepository sessionRepository;
    private final SessionOccurrenceRepository sessionOccurrenceRepository;
    private final AdmissionService admissionService;

    public AttendeeSessionEnrollmentService(
            AttendeeSessionEnrollmentRepository enrollmentRepository,
            SessionRepository sessionRepository,
            SessionOccurrenceRepository sessionOccurrenceRepository,
            AdmissionService admissionService) {

        this.enrollmentRepository = enrollmentRepository;
        this.sessionRepository = sessionRepository;
        this.sessionOccurrenceRepository = sessionOccurrenceRepository;
        this.admissionService = admissionService;
    }

    public AttendeeSessionEnrollment enroll(
            UUID attendeeId,
            UUID sessionOccurrenceId) {

        if (attendeeId == null || sessionOccurrenceId == null) {
            throw new IllegalArgumentException(
                    "Attendee and session occurrence are required");
        }

        SessionOccurrence occurrence =
                sessionOccurrenceRepository.findById(sessionOccurrenceId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Session occurrence not found"));

        UUID sessionId = occurrence.getSessionId();

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Session not found"));

        boolean hasAdmission = admissionService.hasAccessToTrack(
                attendeeId,
                session.getTrackId());

        if (!hasAdmission) {
            throw new IllegalArgumentException(
                    "Attendee does not have admission for this track");
        }

        boolean alreadyEnrolled =
                enrollmentRepository
                        .findByAttendeeIdAndSessionOccurrenceIdAndStatus(
                                attendeeId,
                                sessionOccurrenceId,
                                EnrollmentStatus.ENROLLED)
                        .isPresent();

        if (alreadyEnrolled) {
            throw new IllegalArgumentException(
                    "Attendee is already enrolled in this session occurrence");
        }

        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(
                        attendeeId,
                        sessionId,
                        sessionOccurrenceId);

        return enrollmentRepository.save(enrollment);
    }

    public void cancelEnrollment(
            UUID attendeeId,
            UUID sessionOccurrenceId) {

        AttendeeSessionEnrollment enrollment =
                enrollmentRepository
                        .findByAttendeeIdAndSessionOccurrenceIdAndStatus(
                                attendeeId,
                                sessionOccurrenceId,
                                EnrollmentStatus.ENROLLED)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Active enrollment not found"));

        enrollment.setStatus(EnrollmentStatus.CANCELLED);

        enrollmentRepository.save(enrollment);
    }

    public AttendeeSessionEnrollment autoEnrollMandatorySession(
            UUID attendeeId,
            UUID sessionOccurrenceId) {

        if (attendeeId == null || sessionOccurrenceId == null) {
            throw new IllegalArgumentException(
                    "Attendee and session occurrence are required");
        }

        SessionOccurrence occurrence =
                sessionOccurrenceRepository.findById(sessionOccurrenceId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Session occurrence not found"));

        UUID sessionId = occurrence.getSessionId();

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Session not found"));

        if (!session.isMandatory()) {
            throw new IllegalArgumentException(
                    "Session is not mandatory");
        }

        boolean hasAdmission = admissionService.hasAccessToTrack(
                attendeeId,
                session.getTrackId());

        if (!hasAdmission) {
            throw new IllegalArgumentException(
                    "Attendee does not have admission for this track");
        }

        boolean alreadyEnrolled =
                enrollmentRepository
                        .findByAttendeeIdAndSessionOccurrenceIdAndStatus(
                                attendeeId,
                                sessionOccurrenceId,
                                EnrollmentStatus.ENROLLED)
                        .isPresent();

        if (alreadyEnrolled) {
            throw new IllegalArgumentException(
                    "Attendee is already enrolled in this session occurrence");
        }

        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(
                        attendeeId,
                        sessionId,
                        sessionOccurrenceId);

        return enrollmentRepository.save(enrollment);
    }
}