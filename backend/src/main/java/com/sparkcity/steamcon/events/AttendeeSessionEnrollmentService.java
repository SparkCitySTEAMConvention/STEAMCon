package com.sparkcity.steamcon.events;

import com.sparkcity.steamcon.admission.AdmissionService;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AttendeeSessionEnrollmentService {

    private final AttendeeSessionEnrollmentRepository enrollmentRepository;
    private final SessionRepository sessionRepository;
    private final AdmissionService admissionService;

    public AttendeeSessionEnrollmentService(
            AttendeeSessionEnrollmentRepository enrollmentRepository,
            SessionRepository sessionRepository,
            AdmissionService admissionService) {

        this.enrollmentRepository = enrollmentRepository;
        this.sessionRepository = sessionRepository;
        this.admissionService = admissionService;
    }

    public AttendeeSessionEnrollment enroll(
            UUID attendeeId,
            UUID sessionId) {

        if (attendeeId == null || sessionId == null) {
            throw new IllegalArgumentException(
                    "Attendee and session are required");
        }

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Session not found"));

        boolean hasAdmission = admissionService.hasAccessToTrack(
                attendeeId,
                session.getTrackId());

        if (!hasAdmission) {
            throw new IllegalArgumentException(
                    "Attendee does not have admission for this track");
        }

        boolean alreadyEnrolled =
                enrollmentRepository
                        .findByAttendeeIdAndSessionIdAndStatus(
                                attendeeId,
                                sessionId,
                                EnrollmentStatus.ENROLLED)
                        .isPresent();

        if (alreadyEnrolled) {
            throw new IllegalArgumentException(
                    "Attendee is already enrolled in this session");
        }

        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(
                        attendeeId,
                        sessionId);

        return enrollmentRepository.save(enrollment);
    }

    public void cancelEnrollment(
            UUID attendeeId,
            UUID sessionId) {

        AttendeeSessionEnrollment enrollment =
                enrollmentRepository
                        .findByAttendeeIdAndSessionIdAndStatus(
                                attendeeId,
                                sessionId,
                                EnrollmentStatus.ENROLLED)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Active enrollment not found"));

        enrollment.setStatus(EnrollmentStatus.CANCELLED);

        enrollmentRepository.save(enrollment);
    }

    public AttendeeSessionEnrollment autoEnrollMandatorySession(
            UUID attendeeId,
            UUID sessionId) {

        if (attendeeId == null || sessionId == null) {
            throw new IllegalArgumentException(
                    "Attendee and session are required");
        }

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Session not found"));

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
                        .findByAttendeeIdAndSessionIdAndStatus(
                                attendeeId,
                                sessionId,
                                EnrollmentStatus.ENROLLED)
                        .isPresent();

        if (alreadyEnrolled) {
            throw new IllegalArgumentException(
                    "Attendee is already enrolled in this session");
        }

        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(
                        attendeeId,
                        sessionId);

        return enrollmentRepository.save(enrollment);
    }
}