package com.sparkcity.steamcon.config;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.sparkcity.steamcon.admission.AdmissionStatus;
import com.sparkcity.steamcon.admission.Pass;
import com.sparkcity.steamcon.admission.PassRepository;
import com.sparkcity.steamcon.admission.Ticket;
import com.sparkcity.steamcon.admission.TicketRepository;
import com.sparkcity.steamcon.booking.BookingStatus;
import com.sparkcity.steamcon.booking.CarRental;
import com.sparkcity.steamcon.booking.CarRentalRepository;
import com.sparkcity.steamcon.booking.Hotel;
import com.sparkcity.steamcon.booking.HotelRepository;
import com.sparkcity.steamcon.booking.HotelReservation;
import com.sparkcity.steamcon.booking.HotelReservationRepository;
import com.sparkcity.steamcon.booking.TravelLeg;
import com.sparkcity.steamcon.booking.TravelLegRepository;
import com.sparkcity.steamcon.communication.Forum;
import com.sparkcity.steamcon.communication.ForumAccessPolicy;
import com.sparkcity.steamcon.communication.ForumAccessPolicyRepository;
import com.sparkcity.steamcon.communication.ForumPermission;
import com.sparkcity.steamcon.communication.ForumRepository;
import com.sparkcity.steamcon.communication.ForumScope;
import com.sparkcity.steamcon.communication.Message;
import com.sparkcity.steamcon.communication.MessageRepository;
import com.sparkcity.steamcon.communication.Notification;
import com.sparkcity.steamcon.communication.NotificationRepository;
import com.sparkcity.steamcon.communication.NotificationType;
import com.sparkcity.steamcon.communication.SpeakerFlair;
import com.sparkcity.steamcon.communication.SpeakerFlairRepository;
import com.sparkcity.steamcon.events.AttendeeSessionEnrollment;
import com.sparkcity.steamcon.events.AttendeeSessionEnrollmentRepository;
import com.sparkcity.steamcon.events.EnrollmentStatus;
import com.sparkcity.steamcon.events.Session;
import com.sparkcity.steamcon.events.SessionOccurrence;
import com.sparkcity.steamcon.events.SessionOccurrenceRepository;
import com.sparkcity.steamcon.events.SessionRepository;
import com.sparkcity.steamcon.events.Track;
import com.sparkcity.steamcon.events.TrackRepository;
import com.sparkcity.steamcon.identity.Role;
import com.sparkcity.steamcon.identity.User;
import com.sparkcity.steamcon.identity.UserRepository;
import com.sparkcity.steamcon.identity.UserRole;
import com.sparkcity.steamcon.identity.UserRoleRepository;
import com.sparkcity.steamcon.speaker.ApplicationStatus;
import com.sparkcity.steamcon.speaker.ApprovalDecision;
import com.sparkcity.steamcon.speaker.ApprovalDecisionRepository;
import com.sparkcity.steamcon.speaker.ApprovalDecisionType;
import com.sparkcity.steamcon.speaker.ProposalStatus;
import com.sparkcity.steamcon.speaker.ScheduleChangeRequest;
import com.sparkcity.steamcon.speaker.ScheduleChangeRequestRepository;
import com.sparkcity.steamcon.speaker.SessionProposal;
import com.sparkcity.steamcon.speaker.SessionProposalRepository;
import com.sparkcity.steamcon.speaker.SpeakerApplication;
import com.sparkcity.steamcon.speaker.SpeakerApplicationRepository;
import com.sparkcity.steamcon.speaker.SpeakerProfile;
import com.sparkcity.steamcon.speaker.SpeakerProfileRepository;
import com.sparkcity.steamcon.speaker.SpeakerRole;
import com.sparkcity.steamcon.speaker.SpeakerSessionAssignment;
import com.sparkcity.steamcon.speaker.SpeakerSessionAssignmentRepository;

@Component
@ConditionalOnProperty(
        name = "app.seed.project-enabled",
        havingValue = "true")
public class ProjectDemoSeeder implements CommandLineRunner {

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    private final TrackRepository trackRepository;
    private final SessionRepository sessionRepository;
    private final SessionOccurrenceRepository occurrenceRepository;
    private final AttendeeSessionEnrollmentRepository enrollmentRepository;

    private final PassRepository passRepository;
    private final TicketRepository ticketRepository;

    private final HotelRepository hotelRepository;
    private final HotelReservationRepository hotelReservationRepository;
    private final TravelLegRepository travelLegRepository;
    private final CarRentalRepository carRentalRepository;

    private final SessionProposalRepository proposalRepository;
    private final SpeakerApplicationRepository speakerApplicationRepository;
    private final ApprovalDecisionRepository approvalDecisionRepository;
    private final SpeakerProfileRepository speakerProfileRepository;
    private final SpeakerSessionAssignmentRepository assignmentRepository;
    private final ScheduleChangeRequestRepository scheduleChangeRequestRepository;

    private final ForumRepository forumRepository;
    private final ForumAccessPolicyRepository forumAccessPolicyRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final SpeakerFlairRepository speakerFlairRepository;

    public ProjectDemoSeeder(
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            UserRoleRepository userRoleRepository,
            TrackRepository trackRepository,
            SessionRepository sessionRepository,
            SessionOccurrenceRepository occurrenceRepository,
            AttendeeSessionEnrollmentRepository enrollmentRepository,
            PassRepository passRepository,
            TicketRepository ticketRepository,
            HotelRepository hotelRepository,
            HotelReservationRepository hotelReservationRepository,
            TravelLegRepository travelLegRepository,
            CarRentalRepository carRentalRepository,
            SessionProposalRepository proposalRepository,
            SpeakerApplicationRepository speakerApplicationRepository,
            ApprovalDecisionRepository approvalDecisionRepository,
            SpeakerProfileRepository speakerProfileRepository,
            SpeakerSessionAssignmentRepository assignmentRepository,
            ScheduleChangeRequestRepository scheduleChangeRequestRepository,
            ForumRepository forumRepository,
            ForumAccessPolicyRepository forumAccessPolicyRepository,
            MessageRepository messageRepository,
            NotificationRepository notificationRepository,
            SpeakerFlairRepository speakerFlairRepository) {

        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.trackRepository = trackRepository;
        this.sessionRepository = sessionRepository;
        this.occurrenceRepository = occurrenceRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.passRepository = passRepository;
        this.ticketRepository = ticketRepository;
        this.hotelRepository = hotelRepository;
        this.hotelReservationRepository = hotelReservationRepository;
        this.travelLegRepository = travelLegRepository;
        this.carRentalRepository = carRentalRepository;
        this.proposalRepository = proposalRepository;
        this.speakerApplicationRepository = speakerApplicationRepository;
        this.approvalDecisionRepository = approvalDecisionRepository;
        this.speakerProfileRepository = speakerProfileRepository;
        this.assignmentRepository = assignmentRepository;
        this.scheduleChangeRequestRepository = scheduleChangeRequestRepository;
        this.forumRepository = forumRepository;
        this.forumAccessPolicyRepository = forumAccessPolicyRepository;
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;
        this.speakerFlairRepository = speakerFlairRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {

        // ---------------------------------------------------------
        // USERS + AUTH ROLES
        // All demo passwords are: demo
        // ---------------------------------------------------------

        User attendee = ensureUser(
                "attendee@steamcon.demo",
                "Alex Rivera",
                "STEAMCon Guest",
                "demo");

        User attendeeTwo = ensureUser(
                "student@steamcon.demo",
                "Jordan Lee",
                "Zip Code Wilmington",
                "demo");

        User bill = ensureUser(
                "bill.nye@steamcon.demo",
                "Bill Nye",
                "The Planetary Society",
                "demo");

        User ada = ensureUser(
                "ada.lovelace@steamcon.demo",
                "Ada Lovelace",
                "STEAMCon",
                "demo");

        User mae = ensureUser(
                "mae.jemison@steamcon.demo",
                "Mae Jemison",
                "100 Year Starship",
                "demo");

        User admin = ensureUser(
                "admin@steamcon.demo",
                "STEAMCon Organizer",
                "STEAMCon",
                "demo");

        ensureRole(attendee, Role.ATTENDEE);
        ensureRole(attendeeTwo, Role.ATTENDEE);

        // Speakers can still use attendee-facing features.
        ensureRole(bill, Role.SPEAKER);
        ensureRole(bill, Role.ATTENDEE);
        ensureRole(ada, Role.SPEAKER);
        ensureRole(ada, Role.ATTENDEE);
        ensureRole(mae, Role.SPEAKER);
        ensureRole(mae, Role.ATTENDEE);

        ensureRole(admin, Role.ADMIN);
        ensureRole(admin, Role.ATTENDEE);

        // ---------------------------------------------------------
        // FIVE OFFICIAL TRACKS
        // ---------------------------------------------------------

        Track science = ensureTrack(
                "Science",
                "Discovery, experimentation, research, and the natural world.");

        Track technology = ensureTrack(
                "Technology",
                "Software, artificial intelligence, cybersecurity, and emerging technology.");

        Track engineering = ensureTrack(
                "Engineering",
                "Robotics, aerospace, design, systems thinking, and hands-on problem solving.");

        Track arts = ensureTrack(
                "Arts",
                "Creative technology, music, design, digital media, and storytelling.");

        Track mathematics = ensureTrack(
                "Mathematics",
                "Data, statistics, modeling, patterns, and quantitative thinking.");

        // ---------------------------------------------------------
        // PUBLISHED PROGRAM
        // April 6–8, 2027
        // ---------------------------------------------------------

        Session keynote = ensureSession(
                "Science Changes Everything",
                "Opening keynote on curiosity, evidence, discovery, and the future of science.",
                science.getId(),
                true);

        Session responsibleAi = ensureSession(
                "Building Responsible AI",
                "A practical conversation about AI systems, ethics, safety, and real-world use.",
                technology.getId(),
                false);

        Session robotics = ensureSession(
                "Robotics from Concept to Competition",
                "Design, build, test, and iterate on autonomous robotic systems.",
                engineering.getId(),
                false);

        Session creativeTech = ensureSession(
                "Where Art Meets Technology",
                "Explore how software, digital media, music, and design create new forms of expression.",
                arts.getId(),
                false);

        Session mathData = ensureSession(
                "The Mathematics Behind Data",
                "Probability, statistics, modeling, and the mathematics behind modern analytics.",
                mathematics.getId(),
                false);

        Session aerospace = ensureSession(
                "Engineering Beyond Earth",
                "Aerospace engineering, human spaceflight, and designing systems for extreme environments.",
                engineering.getId(),
                false);

        Session cyber = ensureSession(
                "Cybersecurity for Everyone",
                "A practical introduction to digital security, privacy, and safer connected systems.",
                technology.getId(),
                false);

        Session concert = ensureSession(
                "STEAMCon Evening Concert",
                "An evening music celebration featuring special guests and collaborative performances.",
                arts.getId(),
                true);

        SessionOccurrence keynoteOcc = ensureOccurrence(
                keynote.getId(),
                "2027-04-06T13:00:00Z",
                "2027-04-06T14:00:00Z");

        SessionOccurrence aiOcc = ensureOccurrence(
                responsibleAi.getId(),
                "2027-04-06T15:00:00Z",
                "2027-04-06T16:00:00Z");

        SessionOccurrence cyberOcc = ensureOccurrence(
                cyber.getId(),
                "2027-04-06T17:00:00Z",
                "2027-04-06T18:00:00Z");

        SessionOccurrence roboticsOcc = ensureOccurrence(
                robotics.getId(),
                "2027-04-07T14:00:00Z",
                "2027-04-07T15:30:00Z");

        SessionOccurrence creativeOcc = ensureOccurrence(
                creativeTech.getId(),
                "2027-04-07T17:00:00Z",
                "2027-04-07T18:00:00Z");

        SessionOccurrence concertOcc = ensureOccurrence(
                concert.getId(),
                "2027-04-08T00:00:00Z",
                "2027-04-08T02:00:00Z");

        SessionOccurrence mathOcc = ensureOccurrence(
                mathData.getId(),
                "2027-04-08T14:00:00Z",
                "2027-04-08T15:00:00Z");

        SessionOccurrence aerospaceOcc = ensureOccurrence(
                aerospace.getId(),
                "2027-04-08T16:00:00Z",
                "2027-04-08T17:00:00Z");

        // ---------------------------------------------------------
        // ADMISSIONS
        // ---------------------------------------------------------

        ensureFullPass(attendee, List.of(
                science.getId(),
                technology.getId(),
                engineering.getId(),
                arts.getId(),
                mathematics.getId()));

        ensureFullPass(bill, List.of(
                science.getId(),
                technology.getId(),
                engineering.getId(),
                arts.getId(),
                mathematics.getId()));

        ensureFullPass(ada, List.of(
                science.getId(),
                technology.getId(),
                engineering.getId(),
                arts.getId(),
                mathematics.getId()));

        ensureFullPass(mae, List.of(
                science.getId(),
                technology.getId(),
                engineering.getId(),
                arts.getId(),
                mathematics.getId()));

        // A second attendee demonstrates a single-track ticket.
        ensureTicket(
                attendeeTwo,
                technology.getId());

        // ---------------------------------------------------------
        // ATTENDEE ENROLLMENTS
        // ---------------------------------------------------------

        ensureEnrollment(attendee, keynote, keynoteOcc);
        ensureEnrollment(attendee, responsibleAi, aiOcc);
        ensureEnrollment(attendee, robotics, roboticsOcc);
        ensureEnrollment(attendee, concert, concertOcc);

        ensureEnrollment(attendeeTwo, responsibleAi, aiOcc);
        ensureEnrollment(attendeeTwo, cyber, cyberOcc);

        // ---------------------------------------------------------
        // HOTELS + TRAVEL + CAR RENTAL
        // Calendar /api/calendar/me derives from these records.
        // ---------------------------------------------------------

        Hotel downtownHotel = ensureHotel(
                "STEAMCon Downtown Hotel",
                "100 Convention Way, Wilmington, DE");

        Hotel riverfrontHotel = ensureHotel(
                "Riverfront Conference Hotel",
                "500 Riverfront Drive, Wilmington, DE");

        ensureHotelReservation(
                attendee,
                downtownHotel,
                "2027-04-05T20:00:00Z",
                "2027-04-09T15:00:00Z",
                "SC-ALEX-2027");

        ensureHotelReservation(
                bill,
                riverfrontHotel,
                "2027-04-05T19:00:00Z",
                "2027-04-08T16:00:00Z",
                "SC-BILL-2027");

        ensureTravelLeg(
                attendee,
                "Dover, DE",
                "Wilmington, DE",
                "2027-04-05T17:00:00Z",
                "2027-04-05T18:30:00Z");

        ensureTravelLeg(
                attendee,
                "Wilmington, DE",
                "Dover, DE",
                "2027-04-09T16:00:00Z",
                "2027-04-09T17:30:00Z");

        ensureCarRental(
                attendee,
                "Wilmington Train Station",
                "Wilmington Train Station",
                "2027-04-05T18:45:00Z",
                "2027-04-09T15:30:00Z");

        // ---------------------------------------------------------
        // SPEAKER PROFILES + PROPOSALS
        // ---------------------------------------------------------

        ensureSpeakerProfile(
                bill,
                "Bill Nye",
                "Chief Ambassador",
                "The Planetary Society",
                "Science educator and advocate focused on science literacy, exploration, and the future.");

        ensureSpeakerProfile(
                ada,
                "Ada Lovelace",
                "Featured Technology Speaker",
                "STEAMCon",
                "Technology speaker focused on computing, algorithms, creativity, and responsible innovation.");

        ensureSpeakerProfile(
                mae,
                "Mae Jemison",
                "Physician, Engineer, and Astronaut",
                "100 Year Starship",
                "Physician, engineer, astronaut, and advocate for science, technology, and human exploration.");

        ensureSpeakerFlair(bill, "Featured Speaker", "featured");
        ensureSpeakerFlair(ada, "Speaker", "speaker");
        ensureSpeakerFlair(mae, "Speaker", "speaker");

        SessionProposal billApproved = ensureProposal(
                bill,
                "Science Changes Everything",
                "Opening keynote on curiosity, evidence, discovery, and science literacy.",
                science.getId(),
                ProposalStatus.APPROVED);

        SessionProposal adaApproved = ensureProposal(
                ada,
                "Building Responsible AI",
                "Responsible AI development, ethics, safety, and the future of computing.",
                technology.getId(),
                ProposalStatus.APPROVED);

        SessionProposal maeApproved = ensureProposal(
                mae,
                "Engineering Beyond Earth",
                "Engineering for aerospace systems, human spaceflight, and extreme environments.",
                engineering.getId(),
                ProposalStatus.APPROVED);

        // Extra proposal states make the dashboard more useful.
        SessionProposal billDraft = ensureProposal(
                bill,
                "Communicating Science in a Noisy World",
                "A draft session about explaining technical ideas clearly to broad audiences.",
                science.getId(),
                ProposalStatus.DRAFT);

        SessionProposal adaSubmitted = ensureProposal(
                ada,
                "Algorithms and Imagination",
                "How mathematical thinking and creative problem solving shape computing.",
                mathematics.getId(),
                ProposalStatus.SUBMITTED);

        SessionProposal maeRejected = ensureProposal(
                mae,
                "Future Mission Concepts",
                "A proposed session exploring future human spaceflight concepts.",
                engineering.getId(),
                ProposalStatus.REJECTED);

        ensureApprovalDecision(
                billApproved,
                admin,
                ApprovalDecisionType.APPROVE,
                "Approved for the opening keynote.");

        ensureApprovalDecision(
                adaApproved,
                admin,
                ApprovalDecisionType.APPROVE,
                "Approved for the Technology track.");

        ensureApprovalDecision(
                maeApproved,
                admin,
                ApprovalDecisionType.APPROVE,
                "Approved for the Engineering track.");

        ensureApprovalDecision(
                maeRejected,
                admin,
                ApprovalDecisionType.REJECT,
                "Strong topic, but the published program is already full.");

        // ---------------------------------------------------------
        // SPEAKER APPLICATIONS
        // ---------------------------------------------------------

        ensureSpeakerApplication(
                bill,
                keynote,
                ApplicationStatus.APPROVED);

        ensureSpeakerApplication(
                ada,
                responsibleAi,
                ApplicationStatus.APPROVED);

        ensureSpeakerApplication(
                mae,
                aerospace,
                ApplicationStatus.APPROVED);

        ensureSpeakerApplication(
                ada,
                mathData,
                ApplicationStatus.SUBMITTED);

        // ---------------------------------------------------------
        // APPROVED PROPOSAL -> LIVE SESSION ASSIGNMENTS
        // ---------------------------------------------------------

        SpeakerSessionAssignment billAssignment = ensureAssignment(
                billApproved,
                keynote,
                SpeakerRole.PRIMARY_SPEAKER);

        ensureAssignment(
                adaApproved,
                responsibleAi,
                SpeakerRole.PRIMARY_SPEAKER);

        SpeakerSessionAssignment maeAssignment = ensureAssignment(
                maeApproved,
                aerospace,
                SpeakerRole.PRIMARY_SPEAKER);

        // Demonstrates a panelist/co-speaker membership.
        ensureDirectAssignment(
                ada,
                keynote,
                SpeakerRole.PANELIST);

        ensureDirectAssignment(
                mae,
                keynote,
                SpeakerRole.CO_SPEAKER);

        ensureScheduleChangeRequest(
                maeAssignment,
                "Travel conflict",
                "2027-04-08T17:00:00Z",
                "If possible, please schedule this session no earlier than 5 PM.");

        // ---------------------------------------------------------
        // FORUMS + ACCESS POLICIES
        // ---------------------------------------------------------

        Forum concierge = ensureForum(
                "STEAMCon Concierge",
                null,
                ForumScope.CONCIERGE);

        Forum scienceForum = ensureForum(
                "Science Track",
                science.getId(),
                ForumScope.TRACK);

        Forum technologyForum = ensureForum(
                "Technology Track",
                technology.getId(),
                ForumScope.TRACK);

        Forum engineeringForum = ensureForum(
                "Engineering Track",
                engineering.getId(),
                ForumScope.TRACK);

        Forum artsForum = ensureForum(
                "Arts Track",
                arts.getId(),
                ForumScope.TRACK);

        Forum mathForum = ensureForum(
                "Mathematics Track",
                mathematics.getId(),
                ForumScope.TRACK);

        Forum organizerForum = ensureForum(
                "Organizer Forum",
                null,
                ForumScope.ADMIN);

        for (Forum forum : List.of(
                scienceForum,
                technologyForum,
                engineeringForum,
                artsForum,
                mathForum)) {

            ensureForumPolicy(
                    forum,
                    Role.ATTENDEE,
                    ForumPermission.READ);

            ensureForumPolicy(
                    forum,
                    Role.ATTENDEE,
                    ForumPermission.POST);

            ensureForumPolicy(
                    forum,
                    Role.SPEAKER,
                    ForumPermission.READ);

            ensureForumPolicy(
                    forum,
                    Role.SPEAKER,
                    ForumPermission.POST);

            ensureForumPolicy(
                    forum,
                    Role.ADMIN,
                    ForumPermission.MODERATE);
        }

        ensureForumPolicy(
                organizerForum,
                Role.ADMIN,
                ForumPermission.READ);

        ensureForumPolicy(
                organizerForum,
                Role.ADMIN,
                ForumPermission.POST);

        ensureForumPolicy(
                organizerForum,
                Role.ADMIN,
                ForumPermission.MODERATE);

        // ---------------------------------------------------------
        // FORUM MESSAGES
        // ---------------------------------------------------------

        ensureMessage(
                concierge,
                bill,
                "Welcome to STEAMCon! The Concierge forum is a good place for general convention questions.");

        ensureMessage(
                concierge,
                attendee,
                "Where can I find the latest schedule for today?");

        ensureMessage(
                concierge,
                ada,
                "The Program page is backed by the live session schedule and will show the latest times.");

        ensureMessage(
                scienceForum,
                bill,
                "Looking forward to meeting everyone in the Science track.");

        ensureMessage(
                scienceForum,
                attendee,
                "Will there be audience Q&A after the opening keynote?");

        ensureMessage(
                technologyForum,
                ada,
                "I'll post follow-up resources after the Responsible AI session.");

        ensureMessage(
                technologyForum,
                attendeeTwo,
                "Is the cybersecurity session designed for beginners?");

        ensureMessage(
                engineeringForum,
                mae,
                "Excited to talk about aerospace engineering and designing for extreme environments.");

        ensureMessage(
                artsForum,
                attendee,
                "Really looking forward to the evening concert.");

        ensureMessage(
                mathForum,
                ada,
                "The Mathematics Behind Data session pairs nicely with the Responsible AI discussion.");

        ensureMessage(
                organizerForum,
                admin,
                "Demo organizer forum is active and restricted to administrators.");

        // ---------------------------------------------------------
        // NOTIFICATIONS
        // ---------------------------------------------------------

        ensureNotification(
                attendee,
                "Welcome to STEAMCon. Your attendee portal is ready.",
                NotificationType.GENERAL,
                false);

        ensureNotification(
                attendee,
                "Your convention schedule now includes the opening keynote.",
                NotificationType.GENERAL,
                true);

        ensureNotification(
                bill,
                "Your proposal \"Science Changes Everything\" was approved.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                bill,
                "Welcome to the STEAMCon Speaker Portal.",
                NotificationType.GENERAL,
                true);

        ensureNotification(
                ada,
                "Your proposal \"Building Responsible AI\" was approved.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                ada,
                "Your speaker application status changed to APPROVED.",
                NotificationType.SPEAKER_APPLICATION_UPDATED,
                false);

        ensureNotification(
                mae,
                "Your proposal \"Engineering Beyond Earth\" was approved.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                mae,
                "A schedule-change request is pending review.",
                NotificationType.GENERAL,
                false);

        ensureNotification(
                admin,
                "STEAMCon demo data is ready for integration testing.",
                NotificationType.GENERAL,
                false);

        System.out.println();
        System.out.println("==============================================");
        System.out.println("STEAMCon project demo data ready.");
        System.out.println("All demo passwords: demo");
        System.out.println("attendee@steamcon.demo  -> ATTENDEE");
        System.out.println("student@steamcon.demo   -> ATTENDEE");
        System.out.println("bill.nye@steamcon.demo  -> SPEAKER + ATTENDEE");
        System.out.println("ada.lovelace@steamcon.demo -> SPEAKER + ATTENDEE");
        System.out.println("mae.jemison@steamcon.demo  -> SPEAKER + ATTENDEE");
        System.out.println("admin@steamcon.demo     -> ADMIN + ATTENDEE");
        System.out.println("==============================================");
        System.out.println();
    }

    // =========================================================
    // USER HELPERS
    // =========================================================

    private User ensureUser(
            String email,
            String displayName,
            String organization,
            String password) {

        User user = userRepository
                .findByEmail(email)
                .orElseGet(() ->
                        new User(
                                email,
                                displayName,
                                passwordEncoder.encode(password)));

        user.setDisplayName(displayName);
        user.setOrganization(organization);

        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(
                        password,
                        user.getPasswordHash())) {

            user.setPasswordHash(
                    passwordEncoder.encode(password));
        }

        return userRepository.save(user);
    }

    private void ensureRole(
            User user,
            Role role) {

        boolean exists = userRoleRepository
                .findByUserIdAndActiveTrue(user.getId())
                .stream()
                .anyMatch(existing ->
                        existing.getRole() == role);

        if (!exists) {
            userRoleRepository.save(
                    new UserRole(
                            user,
                            role));
        }
    }

    // =========================================================
    // PROGRAM HELPERS
    // =========================================================

    private Track ensureTrack(
            String name,
            String description) {

        Track track = trackRepository
                .findAll()
                .stream()
                .filter(existing ->
                        name.equalsIgnoreCase(
                                existing.getName()))
                .findFirst()
                .orElseGet(Track::new);

        track.setName(name);
        track.setDescription(description);

        return trackRepository.save(track);
    }

    private Session ensureSession(
            String title,
            String description,
            UUID trackId,
            boolean mandatory) {

        Session session = sessionRepository
                .findAll()
                .stream()
                .filter(existing ->
                        title.equalsIgnoreCase(
                                existing.getTitle()))
                .findFirst()
                .orElseGet(Session::new);

        session.setTitle(title);
        session.setDescription(description);
        session.setTrackId(trackId);
        session.setMandatory(mandatory);

        return sessionRepository.save(session);
    }

    private SessionOccurrence ensureOccurrence(
            UUID sessionId,
            String startsAt,
            String endsAt) {

        Instant start =
                Instant.parse(startsAt);

        SessionOccurrence occurrence =
                occurrenceRepository
                        .findAll()
                        .stream()
                        .filter(existing ->
                                sessionId.equals(
                                        existing.getSessionId())
                                && start.equals(
                                        existing.getStartsAt()))
                        .findFirst()
                        .orElseGet(
                                SessionOccurrence::new);

        occurrence.setSessionId(sessionId);
        occurrence.setStartsAt(start);
        occurrence.setEndsAt(
                Instant.parse(endsAt));

        return occurrenceRepository.save(
                occurrence);
    }

    // =========================================================
    // ADMISSION + ENROLLMENT
    // =========================================================

    private void ensureFullPass(
            User user,
            List<UUID> trackIds) {

        Pass pass = passRepository
                .findByUserIdAndStatus(
                        user.getId(),
                        AdmissionStatus.ACTIVE)
                .orElseGet(() ->
                        new Pass(
                                user.getId(),
                                "FULL_CONFERENCE"));

        pass.setPassType(
                "FULL_CONFERENCE");

        for (UUID trackId : trackIds) {
            pass.addTrack(trackId);
        }

        passRepository.save(pass);
    }

    private void ensureTicket(
            User user,
            UUID trackId) {

        if (ticketRepository
                .findByUserIdAndTrackIdAndStatus(
                        user.getId(),
                        trackId,
                        AdmissionStatus.ACTIVE)
                .isEmpty()) {

            ticketRepository.save(
                    new Ticket(
                            user.getId(),
                            trackId));
        }
    }

    private void ensureEnrollment(
            User attendee,
            Session session,
            SessionOccurrence occurrence) {

        if (enrollmentRepository
                .findByAttendeeIdAndSessionOccurrenceIdAndStatus(
                        attendee.getId(),
                        occurrence.getId(),
                        EnrollmentStatus.ENROLLED)
                .isEmpty()) {

            enrollmentRepository.save(
                    new AttendeeSessionEnrollment(
                            attendee.getId(),
                            session.getId(),
                            occurrence.getId()));
        }
    }

    // =========================================================
    // BOOKING
    // =========================================================

    private Hotel ensureHotel(
            String name,
            String address) {

        Hotel hotel = hotelRepository
                .findAll()
                .stream()
                .filter(existing ->
                        name.equalsIgnoreCase(
                                existing.getName()))
                .findFirst()
                .orElseGet(Hotel::new);

        hotel.setName(name);
        hotel.setAddress(address);

        return hotelRepository.save(hotel);
    }

    private void ensureHotelReservation(
            User user,
            Hotel hotel,
            String checkin,
            String checkout,
            String confirmation) {

        boolean exists =
                hotelReservationRepository
                        .findByUserId(user.getId())
                        .stream()
                        .anyMatch(existing ->
                                confirmation.equals(
                                        existing.getConfirmationCode()));

        if (!exists) {

            HotelReservation reservation =
                    new HotelReservation();

            reservation.setUserId(
                    user.getId());

            reservation.setHotelId(
                    hotel.getId());

            reservation.setCheckin(
                    Instant.parse(checkin));

            reservation.setCheckOut(
                    Instant.parse(checkout));

            reservation.setConfirmationCode(
                    confirmation);

            reservation.setStatus(
                    BookingStatus.CONFIRMED);

            hotelReservationRepository.save(
                    reservation);
        }
    }

    private void ensureTravelLeg(
            User user,
            String origin,
            String destination,
            String departure,
            String arrival) {

        Instant departureAt =
                Instant.parse(departure);

        boolean exists =
                travelLegRepository
                        .findByUserId(user.getId())
                        .stream()
                        .anyMatch(existing ->
                                origin.equals(
                                        existing.getOrigin())
                                && destination.equals(
                                        existing.getDestination())
                                && departureAt.equals(
                                        existing.getDepartureAt()));

        if (!exists) {

            TravelLeg travel =
                    new TravelLeg();

            travel.setUserId(
                    user.getId());

            travel.setOrigin(origin);
            travel.setDestination(
                    destination);

            travel.setDepartureAt(
                    departureAt);

            travel.setArrivalAt(
                    Instant.parse(arrival));

            travel.setStatus(
                    BookingStatus.CONFIRMED);

            travelLegRepository.save(
                    travel);
        }
    }

    private void ensureCarRental(
            User user,
            String pickupLocation,
            String dropoffLocation,
            String pickupAt,
            String dropoffAt) {

        Instant pickup =
                Instant.parse(pickupAt);

        boolean exists =
                carRentalRepository
                        .findByUserId(user.getId())
                        .stream()
                        .anyMatch(existing ->
                                pickup.equals(
                                        existing.getPickupAt()));

        if (!exists) {

            CarRental rental =
                    new CarRental();

            rental.setUserId(
                    user.getId());

            rental.setPickupLocation(
                    pickupLocation);

            rental.setDropoffLocation(
                    dropoffLocation);

            rental.setPickupAt(pickup);

            rental.setDropoffAt(
                    Instant.parse(dropoffAt));

            rental.setStatus(
                    BookingStatus.CONFIRMED);

            carRentalRepository.save(
                    rental);
        }
    }

    // =========================================================
    // SPEAKER
    // =========================================================

    private void ensureSpeakerProfile(
            User speaker,
            String displayName,
            String title,
            String organization,
            String biography) {

        SpeakerProfile profile =
                speakerProfileRepository
                        .findBySpeakerId(
                                speaker.getId())
                        .orElseGet(
                                SpeakerProfile::new);

        profile.setSpeakerId(
                speaker.getId());

        profile.setDisplayName(
                displayName);

        profile.setTitle(title);

        profile.setOrganization(
                organization);

        profile.setBiography(
                biography);

        speakerProfileRepository.save(
                profile);
    }

    private void ensureSpeakerFlair(
            User speaker,
            String label,
            String displayStyle) {

        SpeakerFlair flair =
                speakerFlairRepository
                        .findAll()
                        .stream()
                        .filter(existing ->
                                speaker.getId()
                                        .equals(
                                                existing.getUserId()))
                        .findFirst()
                        .orElseGet(
                                SpeakerFlair::new);

        flair.setUserId(
                speaker.getId());

        flair.setLabel(label);

        flair.setDisplayStyle(
                displayStyle);

        speakerFlairRepository.save(
                flair);
    }

    private SessionProposal ensureProposal(
            User speaker,
            String title,
            String description,
            UUID trackId,
            ProposalStatus status) {

        SessionProposal proposal =
                proposalRepository
                        .findBySpeakerId(
                                speaker.getId())
                        .stream()
                        .filter(existing ->
                                title.equalsIgnoreCase(
                                        existing.getTitle()))
                        .findFirst()
                        .orElseGet(
                                SessionProposal::new);

        proposal.setSpeakerId(
                speaker.getId());

        proposal.setTitle(title);

        proposal.setDescription(
                description);

        proposal.setTrackId(
                trackId);

        proposal.setStatus(status);

        return proposalRepository.save(
                proposal);
    }

    private void ensureApprovalDecision(
            SessionProposal proposal,
            User admin,
            ApprovalDecisionType decision,
            String comment) {

        boolean exists =
                approvalDecisionRepository
                        .findAll()
                        .stream()
                        .anyMatch(existing ->
                                proposal.getId()
                                        .equals(
                                                existing.getApplicationId()));

        if (!exists) {

            ApprovalDecision approval =
                    new ApprovalDecision();

            approval.setApplicationId(
                    proposal.getId());

            approval.setAdminReviewerId(
                    admin.getId());

            approval.setDecision(
                    decision);

            approval.setComment(
                    comment);

            approvalDecisionRepository.save(
                    approval);
        }
    }

    private void ensureSpeakerApplication(
            User speaker,
            Session session,
            ApplicationStatus status) {

        SpeakerApplication application =
                speakerApplicationRepository
                        .findBySpeakerId(
                                speaker.getId())
                        .stream()
                        .filter(existing ->
                                session.getId()
                                        .equals(
                                                existing.getSessionId()))
                        .findFirst()
                        .orElseGet(
                                SpeakerApplication::new);

        application.setSpeakerId(
                speaker.getId());

        application.setSessionId(
                session.getId());

        application.setStatus(
                status);

        speakerApplicationRepository.save(
                application);
    }

    private SpeakerSessionAssignment ensureAssignment(
            SessionProposal proposal,
            Session session,
            SpeakerRole role) {

        Optional<SpeakerSessionAssignment> existing =
                assignmentRepository
                        .findByProposalId(
                                proposal.getId());

        if (existing.isPresent()) {
            return existing.get();
        }

        SpeakerSessionAssignment assignment =
                new SpeakerSessionAssignment();

        assignment.setSpeakerId(
                proposal.getSpeakerId());

        assignment.setProposalId(
                proposal.getId());

        assignment.setSessionId(
                session.getId());

        assignment.setRole(role);

        return assignmentRepository.save(
                assignment);
    }

    private SpeakerSessionAssignment ensureDirectAssignment(
            User speaker,
            Session session,
            SpeakerRole role) {

        Optional<SpeakerSessionAssignment> existing =
                assignmentRepository
                        .findBySpeakerId(
                                speaker.getId())
                        .stream()
                        .filter(assignment ->
                                session.getId()
                                        .equals(
                                                assignment.getSessionId()))
                        .findFirst();

        if (existing.isPresent()) {
            return existing.get();
        }

        SpeakerSessionAssignment assignment =
                new SpeakerSessionAssignment();

        assignment.setSpeakerId(
                speaker.getId());

        assignment.setSessionId(
                session.getId());

        assignment.setRole(role);

        return assignmentRepository.save(
                assignment);
    }

    private void ensureScheduleChangeRequest(
            SpeakerSessionAssignment assignment,
            String reason,
            String requestedStartsAt,
            String message) {

        boolean exists =
                scheduleChangeRequestRepository
                        .findByAssignmentId(
                                assignment.getId())
                        .stream()
                        .anyMatch(existing ->
                                reason.equals(
                                        existing.getReason()));

        if (!exists) {

            ScheduleChangeRequest request =
                    new ScheduleChangeRequest();

            request.setAssignmentId(
                    assignment.getId());

            request.setReason(reason);

            request.setRequestedStartsAt(
                    Instant.parse(
                            requestedStartsAt));

            request.setMessage(message);

            scheduleChangeRequestRepository.save(
                    request);
        }
    }

    // =========================================================
    // COMMUNICATION
    // =========================================================

    private Forum ensureForum(
            String name,
            UUID trackId,
            ForumScope scope) {

        Forum forum =
                forumRepository
                        .findAll()
                        .stream()
                        .filter(existing ->
                                name.equalsIgnoreCase(
                                        existing.getName()))
                        .findFirst()
                        .orElseGet(
                                Forum::new);

        forum.setName(name);
        forum.setTrackId(trackId);
        forum.setScope(scope);

        return forumRepository.save(
                forum);
    }

    private void ensureForumPolicy(
            Forum forum,
            Role role,
            ForumPermission permission) {

        boolean exists =
                forumAccessPolicyRepository
                        .findAll()
                        .stream()
                        .anyMatch(existing ->
                                forum.getId()
                                        .equals(
                                                existing.getForumId())
                                && existing.getRole()
                                        == role
                                && existing.getPermission()
                                        == permission);

        if (!exists) {

            ForumAccessPolicy policy =
                    new ForumAccessPolicy();

            policy.setForumId(
                    forum.getId());

            policy.setRole(role);

            policy.setPermission(
                    permission);

            forumAccessPolicyRepository.save(
                    policy);
        }
    }

    private void ensureMessage(
            Forum forum,
            User author,
            String body) {

        boolean exists =
                messageRepository
                        .findAll()
                        .stream()
                        .anyMatch(existing ->
                                forum.getId()
                                        .equals(
                                                existing.getForumId())
                                && body.equals(
                                        existing.getBody()));

        if (!exists) {

            Message message =
                    new Message();

            message.setForumId(
                    forum.getId());

            message.setAuthorId(
                    author.getId());

            message.setBody(body);

            speakerFlairRepository
                    .findAll()
                    .stream()
                    .filter(flair ->
                            author.getId()
                                    .equals(
                                            flair.getUserId()))
                    .findFirst()
                    .ifPresent(flair ->
                            message.setSpeakerFlairId(
                                    flair.getId()));

            messageRepository.save(
                    message);
        }
    }

    private void ensureNotification(
            User user,
            String message,
            NotificationType type,
            boolean read) {

        Notification notification =
                notificationRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                user.getId())
                        .stream()
                        .filter(existing ->
                                message.equals(
                                        existing.getMessage()))
                        .findFirst()
                        .orElseGet(
                                Notification::new);

        notification.setUserId(
                user.getId());

        notification.setMessage(
                message);

        notification.setType(type);

        notification.setRead(read);

        notificationRepository.save(
                notification);
    }
}
