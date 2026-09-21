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
    private SessionOccurrenceRepository sessionOccurrenceRepository;
    private AdmissionService admissionService;

    private AttendeeSessionEnrollmentService enrollmentService;

    @BeforeEach
    void setUp() {
        enrollmentRepository =
                mock(AttendeeSessionEnrollmentRepository.class);

        sessionRepository =
                mock(SessionRepository.class);

        sessionOccurrenceRepository =
                mock(SessionOccurrenceRepository.class);

        admissionService =
                mock(AdmissionService.class);

        enrollmentService =
                new AttendeeSessionEnrollmentService(
                        enrollmentRepository,
                        sessionRepository,
                        sessionOccurrenceRepository,
                        admissionService);
    }

    @Test
    void shouldAllowValidEnrollment() {
        UUID attendeeId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID sessionOccurrenceId = UUID.randomUUID();
        UUID trackId = UUID.randomUUID();

        SessionOccurrence occurrence = new SessionOccurrence();
        occurrence.setSessionId(sessionId);

        Session session = new Session();
        session.setTitle("Robotics");
        session.setTrackId(trackId);

        when(sessionOccurrenceRepository.findById(sessionOccurrenceId))
                .thenReturn(Optional.of(occurrence));

        when(sessionRepository.findById(sessionId))
                .thenReturn(Optional.of(session));

        when(admissionService.hasAccessToTrack(
                attendeeId,
                trackId))
                .thenReturn(true);

        when(enrollmentRepository
                .findByAttendeeIdAndSessionOccurrenceIdAndStatus(
                        attendeeId,
                        sessionOccurrenceId,
                        EnrollmentStatus.ENROLLED))
                .thenReturn(Optional.empty());

        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(
                        attendeeId,
                        sessionId,
                        sessionOccurrenceId);

        when(enrollmentRepository.save(any(
                AttendeeSessionEnrollment.class)))
                .thenReturn(enrollment);

        AttendeeSessionEnrollment result =
                enrollmentService.enroll(
                        attendeeId,
                        sessionOccurrenceId);

        assertNotNull(result);
        assertEquals(
                attendeeId,
                result.getAttendeeId());
        assertEquals(
                sessionId,
                result.getSessionId());
        assertEquals(
                sessionOccurrenceId,
                result.getSessionOccurrenceId());

        verify(enrollmentRepository).save(any(
                AttendeeSessionEnrollment.class));
    }

    @Test
    void shouldRejectEnrollmentWithoutAdmission() {
        UUID attendeeId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID sessionOccurrenceId = UUID.randomUUID();
        UUID trackId = UUID.randomUUID();

        SessionOccurrence occurrence = new SessionOccurrence();
        occurrence.setSessionId(sessionId);

        Session session = new Session();
        session.setTitle("Robotics");
        session.setTrackId(trackId);

        when(sessionOccurrenceRepository.findById(sessionOccurrenceId))
                .thenReturn(Optional.of(occurrence));

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
                        sessionOccurrenceId));

        verify(enrollmentRepository, never())
                .save(any(AttendeeSessionEnrollment.class));
    }

    @Test
    void shouldRejectDuplicateEnrollment() {
        UUID attendeeId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID sessionOccurrenceId = UUID.randomUUID();
        UUID trackId = UUID.randomUUID();

        SessionOccurrence occurrence = new SessionOccurrence();
        occurrence.setSessionId(sessionId);

        Session session = new Session();
        session.setTitle("Robotics");
        session.setTrackId(trackId);

        AttendeeSessionEnrollment existing =
                new AttendeeSessionEnrollment(
                        attendeeId,
                        sessionId,
                        sessionOccurrenceId);

        when(sessionOccurrenceRepository.findById(sessionOccurrenceId))
                .thenReturn(Optional.of(occurrence));

        when(sessionRepository.findById(sessionId))
                .thenReturn(Optional.of(session));

        when(admissionService.hasAccessToTrack(
                attendeeId,
                trackId))
                .thenReturn(true);

        when(enrollmentRepository
                .findByAttendeeIdAndSessionOccurrenceIdAndStatus(
                        attendeeId,
                        sessionOccurrenceId,
                        EnrollmentStatus.ENROLLED))
                .thenReturn(Optional.of(existing));

        assertThrows(
                IllegalArgumentException.class,
                () -> enrollmentService.enroll(
                        attendeeId,
                        sessionOccurrenceId));

        verify(enrollmentRepository, never())
                .save(any(AttendeeSessionEnrollment.class));
    }

    @Test
    void shouldCancelEnrollment() {
        UUID attendeeId = UUID.randomUUID();
        UUID sessionOccurrenceId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();

        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(
                        attendeeId,
                        sessionId,
                        sessionOccurrenceId);

        when(enrollmentRepository
                .findByAttendeeIdAndSessionOccurrenceIdAndStatus(
                        attendeeId,
                        sessionOccurrenceId,
                        EnrollmentStatus.ENROLLED))
                .thenReturn(Optional.of(enrollment));

        enrollmentService.cancelEnrollment(
                attendeeId,
                sessionOccurrenceId);

        assertEquals(
                EnrollmentStatus.CANCELLED,
                enrollment.getStatus());

        verify(enrollmentRepository).save(enrollment);
    }

    @Test
    void shouldRejectNullAttendee() {
        UUID sessionOccurrenceId = UUID.randomUUID();

        assertThrows(
                IllegalArgumentException.class,
                () -> enrollmentService.enroll(
                        null,
                        sessionOccurrenceId));
    }

    @Test
    void shouldRejectNullSessionOccurrence() {
        UUID attendeeId = UUID.randomUUID();

        assertThrows(
                IllegalArgumentException.class,
                () -> enrollmentService.enroll(
                        attendeeId,
                        null));
    }

    @Test
    void shouldAutoEnrollMandatorySession() {
        UUID attendeeId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID sessionOccurrenceId = UUID.randomUUID();
        UUID trackId = UUID.randomUUID();

        SessionOccurrence occurrence = new SessionOccurrence();
        occurrence.setSessionId(sessionId);

        Session session = new Session();
        session.setTitle("Opening Ceremony");
        session.setTrackId(trackId);
        session.setMandatory(true);

        when(sessionOccurrenceRepository.findById(sessionOccurrenceId))
                .thenReturn(Optional.of(occurrence));

        when(sessionRepository.findById(sessionId))
                .thenReturn(Optional.of(session));

        when(admissionService.hasAccessToTrack(
                attendeeId,
                trackId))
                .thenReturn(true);

        when(enrollmentRepository
                .findByAttendeeIdAndSessionOccurrenceIdAndStatus(
                        attendeeId,
                        sessionOccurrenceId,
                        EnrollmentStatus.ENROLLED))
                .thenReturn(Optional.empty());

        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(
                        attendeeId,
                        sessionId,
                        sessionOccurrenceId);

        when(enrollmentRepository.save(any(
                AttendeeSessionEnrollment.class)))
                .thenReturn(enrollment);

        AttendeeSessionEnrollment result =
                enrollmentService.autoEnrollMandatorySession(
                        attendeeId,
                        sessionOccurrenceId);

        assertNotNull(result);
        assertEquals(
                attendeeId,
                result.getAttendeeId());
        assertEquals(
                sessionId,
                result.getSessionId());
        assertEquals(
                sessionOccurrenceId,
                result.getSessionOccurrenceId());

        verify(enrollmentRepository).save(any(
                AttendeeSessionEnrollment.class));
    }

    @Test
    void shouldRejectAutoEnrollmentForNonMandatorySession() {
        UUID attendeeId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID sessionOccurrenceId = UUID.randomUUID();
        UUID trackId = UUID.randomUUID();

        SessionOccurrence occurrence = new SessionOccurrence();
        occurrence.setSessionId(sessionId);

        Session session = new Session();
        session.setTitle("Optional Workshop");
        session.setTrackId(trackId);
        session.setMandatory(false);

        when(sessionOccurrenceRepository.findById(sessionOccurrenceId))
                .thenReturn(Optional.of(occurrence));

        when(sessionRepository.findById(sessionId))
                .thenReturn(Optional.of(session));

        assertThrows(
                IllegalArgumentException.class,
                () -> enrollmentService.autoEnrollMandatorySession(
                        attendeeId,
                        sessionOccurrenceId));

        verify(enrollmentRepository, never())
                .save(any(AttendeeSessionEnrollment.class));
    }
}