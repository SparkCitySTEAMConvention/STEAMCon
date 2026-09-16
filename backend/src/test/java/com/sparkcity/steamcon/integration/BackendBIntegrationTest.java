package com.sparkcity.steamcon.integration;

import com.sparkcity.steamcon.admission.Ticket;
import com.sparkcity.steamcon.admission.TicketRepository;
import com.sparkcity.steamcon.events.AttendeeSessionEnrollment;
import com.sparkcity.steamcon.events.AttendeeSessionEnrollmentRepository;
import com.sparkcity.steamcon.events.AttendeeSessionEnrollmentService;
import com.sparkcity.steamcon.events.EnrollmentStatus;
import com.sparkcity.steamcon.events.Session;
import com.sparkcity.steamcon.events.SessionOccurrence;
import com.sparkcity.steamcon.events.SessionOccurrenceRepository;
import com.sparkcity.steamcon.events.SessionRepository;
import com.sparkcity.steamcon.events.Track;
import com.sparkcity.steamcon.events.TrackRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class BackendBIntegrationTest {

    @Autowired
    private TrackRepository trackRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private SessionOccurrenceRepository occurrenceRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private AttendeeSessionEnrollmentRepository enrollmentRepository;

    @Autowired
    private AttendeeSessionEnrollmentService enrollmentService;

    @Test
    void shouldConnectTrackSessionAndOccurrence() {
        Track track = trackRepository.save(
                new Track("Engineering"));

        Session session = new Session();
        session.setTitle("Intro to Engineering");
        session.setTrackId(track.getId());
        session.setMandatory(false);

        session = sessionRepository.save(session);

        SessionOccurrence occurrence = new SessionOccurrence();
        occurrence.setSessionId(session.getId());
        occurrence.setStartsAt(
                Instant.parse("2026-10-01T14:00:00Z"));
        occurrence.setEndsAt(
                Instant.parse("2026-10-01T15:00:00Z"));

        occurrence = occurrenceRepository.save(occurrence);

        assertNotNull(track.getId());
        assertNotNull(session.getId());
        assertNotNull(occurrence.getId());

        assertEquals(track.getId(), session.getTrackId());
        assertEquals(session.getId(), occurrence.getSessionId());
    }

    @Test
    void shouldEnrollAttendeeWithAdmissionForSessionTrack() {
        UUID attendeeId = UUID.randomUUID();

        Track track = trackRepository.save(
                new Track("Science"));

        Session session = new Session();
        session.setTitle("Science Session");
        session.setTrackId(track.getId());
        session.setMandatory(false);

        session = sessionRepository.save(session);

        ticketRepository.save(
                new Ticket(attendeeId, track.getId()));

        AttendeeSessionEnrollment enrollment =
                enrollmentService.enroll(
                        attendeeId,
                        session.getId());

        assertNotNull(enrollment.getId());
        assertEquals(attendeeId, enrollment.getAttendeeId());
        assertEquals(session.getId(), enrollment.getSessionId());
        assertEquals(
                EnrollmentStatus.ENROLLED,
                enrollment.getStatus());

        assertTrue(
                enrollmentRepository
                        .findById(enrollment.getId())
                        .isPresent());
    }

    @Test
    void shouldRejectEnrollmentWithoutAdmission() {
        UUID attendeeId = UUID.randomUUID();

        Track track = trackRepository.save(
                new Track("Technology"));

        Session session = new Session();
        session.setTitle("Technology Session");
        session.setTrackId(track.getId());
        session.setMandatory(false);

        session = sessionRepository.save(session);

        // Store the ID in a final variable so the lambda can use it.
        final UUID sessionId = session.getId();

        assertThrows(
                IllegalArgumentException.class,
                () -> enrollmentService.enroll(
                        attendeeId,
                        sessionId));

        assertEquals(0, enrollmentRepository.count());
    }

    @Test
    void shouldRejectAdmissionForWrongTrack() {
        UUID attendeeId = UUID.randomUUID();

        Track allowedTrack = trackRepository.save(
                new Track("Robotics"));

        Track requestedTrack = trackRepository.save(
                new Track("Art"));

        Session session = new Session();
        session.setTitle("Art Session");
        session.setTrackId(requestedTrack.getId());
        session.setMandatory(false);

        session = sessionRepository.save(session);

        ticketRepository.save(
                new Ticket(
                        attendeeId,
                        allowedTrack.getId()));

        final UUID sessionId = session.getId();

        assertThrows(
                IllegalArgumentException.class,
                () -> enrollmentService.enroll(
                        attendeeId,
                        sessionId));

        assertEquals(0, enrollmentRepository.count());
    }

    @Test
    void shouldAutoEnrollMandatorySessionWithAdmission() {
        UUID attendeeId = UUID.randomUUID();

        Track track = trackRepository.save(
                new Track("Orientation"));

        Session session = new Session();
        session.setTitle("Required Orientation");
        session.setTrackId(track.getId());
        session.setMandatory(true);

        session = sessionRepository.save(session);

        ticketRepository.save(
                new Ticket(
                        attendeeId,
                        track.getId()));

        AttendeeSessionEnrollment enrollment =
                enrollmentService.autoEnrollMandatorySession(
                        attendeeId,
                        session.getId());

        assertNotNull(enrollment.getId());
        assertEquals(
                EnrollmentStatus.ENROLLED,
                enrollment.getStatus());

        assertEquals(
                attendeeId,
                enrollment.getAttendeeId());

        assertEquals(
                session.getId(),
                enrollment.getSessionId());
    }
}