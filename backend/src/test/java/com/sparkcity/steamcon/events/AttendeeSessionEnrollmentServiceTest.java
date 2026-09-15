package com.sparkcity.steamcon.events;

import com.sparkcity.steamcon.admission.AdmissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AttendeeSessionEnrollmentServiceTest {

    private AttendeeSessionEnrollmentRepository enrollmentRepository;
    private SessionRepository sessionRepository;
    private AdmissionService admissionService;

    private AttendeeSessionEnrollmentService enrollmentService;

    @BeforeEach
    void setUp() {
        enrollmentRepository =
                mock(AttendeeSessionEnrollmentRepository.class);

        sessionRepository =
                mock(SessionRepository.class);

        admissionService =
                mock(AdmissionService.class);

        enrollmentService =
                new AttendeeSessionEnrollmentService(
                        enrollmentRepository,
                        sessionRepository,
                        admissionService);
    }

    @Test
    void shouldAllowValidEnrollment() {

        UUID attendeeId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID trackId = UUID.randomUUID();

        Session session = new Session();
        session.setTitle("Robotics");
        session.setTrackId(trackId);

        when(sessionRepository.findById(sessionId))
                .thenReturn(Optional.of(session));

        when(admissionService.hasAccessToTrack(
                attendeeId,
                trackId))
                .thenReturn(true);

        when(enrollmentRepository
                .findByAttendeeIdAndSessionIdAndStatus(
                        attendeeId,
                        sessionId,
                        EnrollmentStatus.ENROLLED))
                .thenReturn(Optional.empty());

        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(
                        attendeeId,
                        sessionId);

        when(enrollmentRepository.save(any(
                AttendeeSessionEnrollment.class)))
                .thenReturn(enrollment);

        AttendeeSessionEnrollment result =
                enrollmentService.enroll(
                        attendeeId,
                        sessionId);

        assertNotNull(result);
        assertEquals(attendeeId, result.getAttendeeId());
        assertEquals(sessionId, result.getSessionId());

        verify(enrollmentRepository).save(any(
                AttendeeSessionEnrollment.class));
    }

    @Test
    void shouldRejectEnrollmentWithoutAdmission() {

        UUID attendeeId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID trackId = UUID.randomUUID();

        Session session = new Session();
        session.setTitle("Robotics");
        session.setTrackId(trackId);

        when(sessionRepository.findById(sessionId))
                .thenReturn(Optional.of(session));

        when(admissionService.hasAccessToTrack(
                attendeeId,
                trackId))
                .thenReturn(false);

        assertThrows(
                IllegalArgumentException.class,
                () -> enrollmentService.enroll(
                        attendeeId,
                        sessionId));

        verify(enrollmentRepository, never())
                .save(any(AttendeeSessionEnrollment.class));
    }

    @Test
    void shouldRejectDuplicateEnrollment() {

        UUID attendeeId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID trackId = UUID.randomUUID();

        Session session = new Session();
        session.setTitle("Robotics");
        session.setTrackId(trackId);

        AttendeeSessionEnrollment existing =
                new AttendeeSessionEnrollment(
                        attendeeId,
                        sessionId);

        when(sessionRepository.findById(sessionId))
                .thenReturn(Optional.of(session));

        when(admissionService.hasAccessToTrack(
                attendeeId,
                trackId))
                .thenReturn(true);

        when(enrollmentRepository
                .findByAttendeeIdAndSessionIdAndStatus(
                        attendeeId,
                        sessionId,
                        EnrollmentStatus.ENROLLED))
                .thenReturn(Optional.of(existing));

        assertThrows(
                IllegalArgumentException.class,
                () -> enrollmentService.enroll(
                        attendeeId,
                        sessionId));

        verify(enrollmentRepository, never())
                .save(any(AttendeeSessionEnrollment.class));
    }

    @Test
    void shouldCancelEnrollment() {

        UUID attendeeId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();

        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(
                        attendeeId,
                        sessionId);

        when(enrollmentRepository
                .findByAttendeeIdAndSessionIdAndStatus(
                        attendeeId,
                        sessionId,
                        EnrollmentStatus.ENROLLED))
                .thenReturn(Optional.of(enrollment));

        enrollmentService.cancelEnrollment(
                attendeeId,
                sessionId);

        assertEquals(
                EnrollmentStatus.CANCELLED,
                enrollment.getStatus());

        verify(enrollmentRepository).save(enrollment);
    }

    @Test
    void shouldRejectNullAttendee() {

        UUID sessionId = UUID.randomUUID();

        assertThrows(
                IllegalArgumentException.class,
                () -> enrollmentService.enroll(
                        null,
                        sessionId));
    }

    @Test
    void shouldRejectNullSession() {

        UUID attendeeId = UUID.randomUUID();

        assertThrows(
                IllegalArgumentException.class,
                () -> enrollmentService.enroll(
                        attendeeId,
                        null));
    }
}