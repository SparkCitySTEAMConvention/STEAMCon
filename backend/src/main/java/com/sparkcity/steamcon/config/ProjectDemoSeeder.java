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
        // STEAMCON 2027 DEMO DATA
        // Jacob K. Javits Convention Center, New York City
        // November 3-5, 2027
        // All demo passwords are: demo
        // ---------------------------------------------------------

        // ---------------------------------------------------------
        // USERS + AUTH ROLES
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

        User attendeeThree = ensureUser(
                "maker@steamcon.demo",
                "Taylor Morgan",
                "Delaware STEM Alliance",
                "demo");

        User attendeeFour = ensureUser(
                "teacher@steamcon.demo",
                "Casey Nguyen",
                "Hudson Valley Public Schools",
                "demo");

        User bill = ensureUser(
                "bill.nye@steamcon.demo",
                "Bill Nye",
                "The Planetary Society",
                "demo");

        User mae = ensureUser(
                "mae.jemison@steamcon.demo",
                "Mae Jemison",
                "100 Year Starship",
                "demo");

        User ada = ensureUser(
                "ada.lovelace@steamcon.demo",
                "Ada Lovelace",
                "STEAMCon",
                "demo");

        User lena = ensureUser(
                "lena.ortiz@steamcon.demo",
                "Dr. Lena Ortiz",
                "Horizon Space Institute",
                "demo");

        User marcus = ensureUser(
                "marcus.chen@steamcon.demo",
                "Marcus Chen",
                "Civic AI Lab",
                "demo");

        User priya = ensureUser(
                "priya.shah@steamcon.demo",
                "Priya Shah",
                "Atlas Robotics",
                "demo");

        User noah = ensureUser(
                "noah.bennett@steamcon.demo",
                "Noah Bennett",
                "Sentinel Security Labs",
                "demo");

        User sofia = ensureUser(
                "sofia.martinez@steamcon.demo",
                "Sofia Martinez",
                "Lightwave Studio",
                "demo");

        User jamal = ensureUser(
                "jamal.brooks@steamcon.demo",
                "Jamal Brooks",
                "Open Metrics Collective",
                "demo");

        User elena = ensureUser(
                "elena.rossi@steamcon.demo",
                "Dr. Elena Rossi",
                "Earth Systems Collective",
                "demo");

        User avery = ensureUser(
                "avery.thompson@steamcon.demo",
                "Avery Thompson",
                "MakerBridge Education",
                "demo");

        User admin = ensureUser(
                "admin@steamcon.demo",
                "STEAMCon Organizer",
                "STEAMCon",
                "demo");

        for (User demoAttendee : List.of(
                attendee,
                attendeeTwo,
                attendeeThree,
                attendeeFour)) {
            ensureRole(demoAttendee, Role.ATTENDEE);
        }

        for (User speaker : List.of(
                bill,
                mae,
                ada,
                lena,
                marcus,
                priya,
                noah,
                sofia,
                jamal,
                elena,
                avery)) {
            ensureRole(speaker, Role.SPEAKER);
            ensureRole(speaker, Role.ATTENDEE);
        }

        ensureRole(admin, Role.ADMIN);
        ensureRole(admin, Role.ATTENDEE);

        // ---------------------------------------------------------
        // FIVE OFFICIAL TRACKS
        // ---------------------------------------------------------

        Track science = ensureTrack(
                "Science",
                "Discovery, experimentation, research, climate, space, health, and the natural world.");

        Track technology = ensureTrack(
                "Technology",
                "Software, artificial intelligence, cybersecurity, data systems, and emerging technology.");

        Track engineering = ensureTrack(
                "Engineering",
                "Robotics, aerospace, infrastructure, design, systems thinking, and hands-on problem solving.");

        Track arts = ensureTrack(
                "Arts",
                "Creative technology, music, design, digital media, storytelling, and interactive experiences.");

        Track mathematics = ensureTrack(
                "Mathematics",
                "Data, statistics, modeling, optimization, patterns, and quantitative thinking.");

        List<UUID> allTracks = List.of(
                science.getId(),
                technology.getId(),
                engineering.getId(),
                arts.getId(),
                mathematics.getId());

        // ---------------------------------------------------------
        // PUBLISHED PROGRAM
        // November 3-5, 2027
        // Times are stored as UTC. New York is UTC-4 during these dates.
        // ---------------------------------------------------------

        Session openingKeynote = ensureSession(
                "Science Changes Everything",
                "Opening keynote on curiosity, evidence, discovery, and the role of science in everyday life.",
                science.getId(),
                true);

        Session futureSpace = ensureSession(
                "Engineering Beyond Earth",
                "Designing reliable aerospace systems for exploration, extreme environments, and future missions.",
                engineering.getId(),
                false);

        Session responsibleAi = ensureSession(
                "Building Responsible AI",
                "A practical discussion of AI systems, transparency, safety, ethics, and real-world deployment.",
                technology.getId(),
                false);

        Session climateSignals = ensureSession(
                "Reading the Planet: Climate Signals in Data",
                "How scientists combine observations, models, and uncertainty to understand a changing planet.",
                science.getId(),
                false);

        Session robotics = ensureSession(
                "Robotics from Concept to Competition",
                "Design, build, test, and iterate on autonomous robotic systems using an engineering workflow.",
                engineering.getId(),
                false);

        Session cyber = ensureSession(
                "Cybersecurity for Everyone",
                "A practical introduction to digital security, privacy, identity, and safer connected systems.",
                technology.getId(),
                false);

        Session creativeTech = ensureSession(
                "Where Art Meets Technology",
                "Explore how software, digital media, projection, sound, and design create new forms of expression.",
                arts.getId(),
                false);

        Session mathData = ensureSession(
                "The Mathematics Behind Data",
                "Probability, statistics, modeling, and the mathematics that power modern analytics.",
                mathematics.getId(),
                false);

        Session quantum = ensureSession(
                "Quantum Ideas Without the Hype",
                "A clear introduction to quantum concepts, what quantum computers can do, and what remains difficult.",
                science.getId(),
                false);

        Session aiWorkshop = ensureSession(
                "Hands-On AI: From Prompt to Prototype",
                "A workshop on turning a problem statement into a small, testable AI-assisted prototype.",
                technology.getId(),
                false);

        Session buildChallenge = ensureSession(
                "Rapid Engineering Design Challenge",
                "Teams move from constraints to prototype while balancing cost, reliability, and usability.",
                engineering.getId(),
                false);

        Session musicCode = ensureSession(
                "Coding Music: Algorithms, Rhythm, and Sound",
                "A creative session connecting programming structures with rhythm, composition, and digital audio.",
                arts.getId(),
                false);

        Session visualization = ensureSession(
                "Tell the Truth with Data Visualization",
                "How to communicate quantitative information clearly without hiding uncertainty or distorting scale.",
                mathematics.getId(),
                false);

        Session educationPanel = ensureSession(
                "The Future of STEAM Education",
                "Educators and practitioners discuss project-based learning, access, curiosity, and career readiness.",
                science.getId(),
                false);

        Session smartCities = ensureSession(
                "Engineering Smarter Cities",
                "Systems thinking for transportation, energy, sensors, infrastructure, and resilient urban design.",
                engineering.getId(),
                false);

        Session secureAi = ensureSession(
                "Securing AI Systems",
                "Threat modeling, data protection, model misuse, and practical safeguards for AI-enabled software.",
                technology.getId(),
                false);

        Session mathGames = ensureSession(
                "The Mathematics of Games and Strategy",
                "Explore probability, optimization, decision-making, and game theory through interactive examples.",
                mathematics.getId(),
                false);

        Session immersiveStory = ensureSession(
                "Immersive Storytelling and Spatial Media",
                "How creators blend interaction, visual design, sound, and physical space to tell stories.",
                arts.getId(),
                false);

        Session spacePanel = ensureSession(
                "Humans Beyond Earth: What Comes Next?",
                "A multidisciplinary panel on exploration, engineering, medicine, science, and long-duration missions.",
                engineering.getId(),
                false);

        Session careerPanel = ensureSession(
                "Breaking Into STEAM Careers",
                "A practical conversation about portfolios, internships, technical interviews, mentorship, and career pivots.",
                technology.getId(),
                false);

        Session closingKeynote = ensureSession(
                "Build the Future Together",
                "Closing keynote connecting science, technology, engineering, arts, mathematics, and public impact.",
                science.getId(),
                true);

        Session concert = ensureSession(
                "STEAMCon Night Lab: Music, Light, and Code",
                "An evening showcase of live music, interactive visuals, creative coding, and digital art.",
                arts.getId(),
                true);

        // Day 1 - Wednesday, November 3, 2027
        SessionOccurrence openingOcc = ensureOccurrence(
                openingKeynote.getId(),
                "2027-11-03T13:00:00Z",
                "2027-11-03T14:00:00Z");

        SessionOccurrence responsibleAiOcc = ensureOccurrence(
                responsibleAi.getId(),
                "2027-11-03T14:30:00Z",
                "2027-11-03T15:30:00Z");

        SessionOccurrence roboticsOcc = ensureOccurrence(
                robotics.getId(),
                "2027-11-03T14:30:00Z",
                "2027-11-03T16:00:00Z");

        SessionOccurrence climateOcc = ensureOccurrence(
                climateSignals.getId(),
                "2027-11-03T16:00:00Z",
                "2027-11-03T17:00:00Z");

        SessionOccurrence cyberOcc = ensureOccurrence(
                cyber.getId(),
                "2027-11-03T16:00:00Z",
                "2027-11-03T17:00:00Z");

        SessionOccurrence creativeOcc = ensureOccurrence(
                creativeTech.getId(),
                "2027-11-03T17:30:00Z",
                "2027-11-03T18:30:00Z");

        SessionOccurrence mathOcc = ensureOccurrence(
                mathData.getId(),
                "2027-11-03T17:30:00Z",
                "2027-11-03T18:30:00Z");

        // Day 2 - Thursday, November 4, 2027
        SessionOccurrence futureSpaceOcc = ensureOccurrence(
                futureSpace.getId(),
                "2027-11-04T13:00:00Z",
                "2027-11-04T14:00:00Z");

        SessionOccurrence quantumOcc = ensureOccurrence(
                quantum.getId(),
                "2027-11-04T14:30:00Z",
                "2027-11-04T15:30:00Z");

        SessionOccurrence aiWorkshopOcc = ensureOccurrence(
                aiWorkshop.getId(),
                "2027-11-04T14:30:00Z",
                "2027-11-04T16:00:00Z");

        SessionOccurrence buildChallengeOcc = ensureOccurrence(
                buildChallenge.getId(),
                "2027-11-04T16:00:00Z",
                "2027-11-04T17:30:00Z");

        SessionOccurrence musicCodeOcc = ensureOccurrence(
                musicCode.getId(),
                "2027-11-04T16:00:00Z",
                "2027-11-04T17:00:00Z");

        SessionOccurrence visualizationOcc = ensureOccurrence(
                visualization.getId(),
                "2027-11-04T17:30:00Z",
                "2027-11-04T18:30:00Z");

        SessionOccurrence educationPanelOcc = ensureOccurrence(
                educationPanel.getId(),
                "2027-11-04T19:00:00Z",
                "2027-11-04T20:00:00Z");

        SessionOccurrence concertOcc = ensureOccurrence(
                concert.getId(),
                "2027-11-05T00:00:00Z",
                "2027-11-05T02:00:00Z");

        // Day 3 - Friday, November 5, 2027
        SessionOccurrence smartCitiesOcc = ensureOccurrence(
                smartCities.getId(),
                "2027-11-05T13:00:00Z",
                "2027-11-05T14:00:00Z");

        SessionOccurrence secureAiOcc = ensureOccurrence(
                secureAi.getId(),
                "2027-11-05T14:30:00Z",
                "2027-11-05T15:30:00Z");

        SessionOccurrence mathGamesOcc = ensureOccurrence(
                mathGames.getId(),
                "2027-11-05T14:30:00Z",
                "2027-11-05T15:30:00Z");

        SessionOccurrence immersiveStoryOcc = ensureOccurrence(
                immersiveStory.getId(),
                "2027-11-05T16:00:00Z",
                "2027-11-05T17:00:00Z");

        SessionOccurrence spacePanelOcc = ensureOccurrence(
                spacePanel.getId(),
                "2027-11-05T16:00:00Z",
                "2027-11-05T17:00:00Z");

        SessionOccurrence careerPanelOcc = ensureOccurrence(
                careerPanel.getId(),
                "2027-11-05T17:30:00Z",
                "2027-11-05T18:30:00Z");

        SessionOccurrence closingOcc = ensureOccurrence(
                closingKeynote.getId(),
                "2027-11-05T19:00:00Z",
                "2027-11-05T20:00:00Z");

        // ---------------------------------------------------------
        // ADMISSIONS
        // ---------------------------------------------------------

        for (User fullPassUser : List.of(
                attendee,
                attendeeThree,
                attendeeFour,
                bill,
                mae,
                ada,
                lena,
                marcus,
                priya,
                noah,
                sofia,
                jamal,
                elena,
                avery)) {
            ensureFullPass(fullPassUser, allTracks);
        }

        ensureTicket(attendeeTwo, technology.getId());
        ensureTicket(attendeeTwo, mathematics.getId());

        // ---------------------------------------------------------
        // ATTENDEE ENROLLMENTS
        // ---------------------------------------------------------

        ensureEnrollment(attendee, openingKeynote, openingOcc);
        ensureEnrollment(attendee, responsibleAi, responsibleAiOcc);
        ensureEnrollment(attendee, climateSignals, climateOcc);
        ensureEnrollment(attendee, futureSpace, futureSpaceOcc);
        ensureEnrollment(attendee, educationPanel, educationPanelOcc);
        ensureEnrollment(attendee, concert, concertOcc);
        ensureEnrollment(attendee, careerPanel, careerPanelOcc);
        ensureEnrollment(attendee, closingKeynote, closingOcc);

        ensureEnrollment(attendeeTwo, responsibleAi, responsibleAiOcc);
        ensureEnrollment(attendeeTwo, cyber, cyberOcc);
        ensureEnrollment(attendeeTwo, aiWorkshop, aiWorkshopOcc);
        ensureEnrollment(attendeeTwo, visualization, visualizationOcc);
        ensureEnrollment(attendeeTwo, secureAi, secureAiOcc);

        ensureEnrollment(attendeeThree, robotics, roboticsOcc);
        ensureEnrollment(attendeeThree, buildChallenge, buildChallengeOcc);
        ensureEnrollment(attendeeThree, smartCities, smartCitiesOcc);
        ensureEnrollment(attendeeThree, spacePanel, spacePanelOcc);

        ensureEnrollment(attendeeFour, creativeTech, creativeOcc);
        ensureEnrollment(attendeeFour, musicCode, musicCodeOcc);
        ensureEnrollment(attendeeFour, educationPanel, educationPanelOcc);
        ensureEnrollment(attendeeFour, immersiveStory, immersiveStoryOcc);
        ensureEnrollment(attendeeFour, closingKeynote, closingOcc);

        // ---------------------------------------------------------
        // HOTELS + TRAVEL + CAR RENTALS
        // Convention venue: Jacob K. Javits Convention Center, NYC.
        // ---------------------------------------------------------

        Hotel hudsonYardsHotel = ensureHotel(
                "STEAMCon Hudson Yards Hotel",
                "Hudson Yards, New York, NY");

        Hotel midtownHotel = ensureHotel(
                "STEAMCon Midtown Hotel",
                "Midtown Manhattan, New York, NY");

        Hotel chelseaHotel = ensureHotel(
                "STEAMCon Chelsea Hotel",
                "Chelsea, New York, NY");

        Hotel timesSquareHotel = ensureHotel(
                "STEAMCon Times Square Hotel",
                "Times Square, New York, NY");

        Hotel downtownManhattanHotel = ensureHotel(
                "STEAMCon Downtown Manhattan Hotel",
                "Lower Manhattan, New York, NY");

        ensureHotelReservation(
                attendee,
                hudsonYardsHotel,
                "2027-11-02T20:00:00Z",
                "2027-11-06T16:00:00Z",
                "SC-ALEX-NYC-2027");

        ensureHotelReservation(
                attendeeTwo,
                midtownHotel,
                "2027-11-02T21:00:00Z",
                "2027-11-06T16:00:00Z",
                "SC-JORDAN-NYC-2027");

        ensureHotelReservation(
                attendeeThree,
                chelseaHotel,
                "2027-11-02T21:30:00Z",
                "2027-11-06T16:00:00Z",
                "SC-TAYLOR-NYC-2027");

        ensureHotelReservation(
                bill,
                hudsonYardsHotel,
                "2027-11-02T19:00:00Z",
                "2027-11-06T15:00:00Z",
                "SC-BILL-NYC-2027");

        ensureHotelReservation(
                mae,
                hudsonYardsHotel,
                "2027-11-03T00:00:00Z",
                "2027-11-06T15:00:00Z",
                "SC-MAE-NYC-2027");

        ensureHotelReservation(
                marcus,
                midtownHotel,
                "2027-11-02T22:00:00Z",
                "2027-11-06T15:00:00Z",
                "SC-MARCUS-NYC-2027");

        ensureHotelReservation(
                priya,
                chelseaHotel,
                "2027-11-02T23:00:00Z",
                "2027-11-06T15:00:00Z",
                "SC-PRIYA-NYC-2027");

        ensureHotelReservation(
                sofia,
                timesSquareHotel,
                "2027-11-03T00:30:00Z",
                "2027-11-06T15:00:00Z",
                "SC-SOFIA-NYC-2027");

        // Attendee travel
        ensureTravelLeg(
                attendee,
                "Dover, DE",
                "Moynihan Train Hall, New York, NY",
                "2027-11-02T15:00:00Z",
                "2027-11-02T19:00:00Z");

        ensureTravelLeg(
                attendee,
                "Moynihan Train Hall, New York, NY",
                "Dover, DE",
                "2027-11-06T17:00:00Z",
                "2027-11-06T21:00:00Z");

        ensureTravelLeg(
                attendeeTwo,
                "Wilmington, DE",
                "Moynihan Train Hall, New York, NY",
                "2027-11-02T18:00:00Z",
                "2027-11-02T20:15:00Z");

        ensureTravelLeg(
                attendeeTwo,
                "Moynihan Train Hall, New York, NY",
                "Wilmington, DE",
                "2027-11-06T18:30:00Z",
                "2027-11-06T20:45:00Z");

        ensureTravelLeg(
                attendeeThree,
                "Philadelphia, PA",
                "Moynihan Train Hall, New York, NY",
                "2027-11-02T19:00:00Z",
                "2027-11-02T20:45:00Z");

        ensureTravelLeg(
                attendeeThree,
                "Moynihan Train Hall, New York, NY",
                "Philadelphia, PA",
                "2027-11-06T18:00:00Z",
                "2027-11-06T19:45:00Z");

        ensureTravelLeg(
                attendeeFour,
                "Albany, NY",
                "Grand Central Terminal, New York, NY",
                "2027-11-03T10:00:00Z",
                "2027-11-03T12:30:00Z");

        // Speaker travel examples from several regions
        ensureTravelLeg(
                bill,
                "Washington, DC",
                "Moynihan Train Hall, New York, NY",
                "2027-11-02T16:00:00Z",
                "2027-11-02T19:15:00Z");

        ensureTravelLeg(
                bill,
                "Moynihan Train Hall, New York, NY",
                "Washington, DC",
                "2027-11-06T16:30:00Z",
                "2027-11-06T19:45:00Z");

        ensureTravelLeg(
                mae,
                "Chicago O'Hare International Airport",
                "LaGuardia Airport, New York, NY",
                "2027-11-02T20:00:00Z",
                "2027-11-02T22:30:00Z");

        ensureTravelLeg(
                marcus,
                "Boston South Station",
                "Moynihan Train Hall, New York, NY",
                "2027-11-02T17:30:00Z",
                "2027-11-02T21:30:00Z");

        ensureTravelLeg(
                priya,
                "Newark Liberty International Airport",
                "Hudson Yards, New York, NY",
                "2027-11-02T21:00:00Z",
                "2027-11-02T22:00:00Z");

        ensureTravelLeg(
                sofia,
                "John F. Kennedy International Airport",
                "Times Square, New York, NY",
                "2027-11-02T22:00:00Z",
                "2027-11-03T00:00:00Z");

        ensureTravelLeg(
                jamal,
                "Baltimore Penn Station",
                "Moynihan Train Hall, New York, NY",
                "2027-11-03T10:00:00Z",
                "2027-11-03T12:45:00Z");

        ensureTravelLeg(
                elena,
                "New Haven Union Station",
                "Grand Central Terminal, New York, NY",
                "2027-11-03T10:30:00Z",
                "2027-11-03T12:30:00Z");

        ensureCarRental(
                attendee,
                "Newark Liberty International Airport",
                "Newark Liberty International Airport",
                "2027-11-02T19:30:00Z",
                "2027-11-06T16:30:00Z");

        ensureCarRental(
                priya,
                "Newark Liberty International Airport",
                "Newark Liberty International Airport",
                "2027-11-02T21:15:00Z",
                "2027-11-06T14:30:00Z");

        // ---------------------------------------------------------
        // SPEAKER PROFILES
        // ---------------------------------------------------------

        ensureSpeakerProfile(
                bill,
                "Bill Nye",
                "Science Communicator",
                "The Planetary Society",
                "Science educator and communicator focused on scientific literacy, exploration, and curiosity.");

        ensureSpeakerProfile(
                mae,
                "Mae Jemison",
                "Physician, Engineer, and Astronaut",
                "100 Year Starship",
                "Physician, engineer, astronaut, and advocate for science, technology, and human exploration.");

        ensureSpeakerProfile(
                ada,
                "Ada Lovelace",
                "Featured Computing Speaker",
                "STEAMCon",
                "Featured demo speaker focused on algorithms, computation, creativity, and the history of computing ideas.");

        ensureSpeakerProfile(
                lena,
                "Dr. Lena Ortiz",
                "Astrophysicist",
                "Horizon Space Institute",
                "Astrophysicist working on planetary science, observation, and making complex space science accessible.");

        ensureSpeakerProfile(
                marcus,
                "Marcus Chen",
                "AI Systems Engineer",
                "Civic AI Lab",
                "Engineer focused on responsible AI systems, evaluation, transparency, and practical public-interest applications.");

        ensureSpeakerProfile(
                priya,
                "Priya Shah",
                "Robotics Engineer",
                "Atlas Robotics",
                "Robotics engineer working across sensing, controls, rapid prototyping, and autonomous systems.");

        ensureSpeakerProfile(
                noah,
                "Noah Bennett",
                "Security Architect",
                "Sentinel Security Labs",
                "Cybersecurity practitioner focused on threat modeling, secure design, identity, and resilient software systems.");

        ensureSpeakerProfile(
                sofia,
                "Sofia Martinez",
                "Creative Technologist",
                "Lightwave Studio",
                "Creative technologist blending code, visual design, sound, projection, and interactive installations.");

        ensureSpeakerProfile(
                jamal,
                "Jamal Brooks",
                "Data Scientist",
                "Open Metrics Collective",
                "Data scientist focused on statistics, visualization, reproducible analysis, and communicating uncertainty.");

        ensureSpeakerProfile(
                elena,
                "Dr. Elena Rossi",
                "Climate Scientist",
                "Earth Systems Collective",
                "Climate scientist working with observational data, models, and public communication around Earth systems.");

        ensureSpeakerProfile(
                avery,
                "Avery Thompson",
                "STEAM Educator",
                "MakerBridge Education",
                "Educator focused on project-based learning, maker education, student creativity, and career-connected learning.");

        ensureSpeakerFlair(bill, "Featured Speaker", "featured");
        ensureSpeakerFlair(mae, "Featured Speaker", "featured");
        ensureSpeakerFlair(ada, "Featured Speaker", "featured");
        ensureSpeakerFlair(lena, "Speaker", "speaker");
        ensureSpeakerFlair(marcus, "Speaker", "speaker");
        ensureSpeakerFlair(priya, "Speaker", "speaker");
        ensureSpeakerFlair(noah, "Speaker", "speaker");
        ensureSpeakerFlair(sofia, "Speaker", "speaker");
        ensureSpeakerFlair(jamal, "Speaker", "speaker");
        ensureSpeakerFlair(elena, "Speaker", "speaker");
        ensureSpeakerFlair(avery, "Speaker", "speaker");

        // ---------------------------------------------------------
        // PROPOSALS + APPROVALS
        // ---------------------------------------------------------

        SessionProposal billApproved = ensureProposal(
                bill,
                "Science Changes Everything",
                "Opening keynote on curiosity, evidence, discovery, and science literacy.",
                science.getId(),
                ProposalStatus.APPROVED);

        SessionProposal maeApproved = ensureProposal(
                mae,
                "Engineering Beyond Earth",
                "Engineering for aerospace systems, human spaceflight, and extreme environments.",
                engineering.getId(),
                ProposalStatus.APPROVED);

        SessionProposal adaApproved = ensureProposal(
                ada,
                "The Mathematics Behind Data",
                "A featured session connecting computation, algorithms, mathematics, and modern data systems.",
                mathematics.getId(),
                ProposalStatus.APPROVED);

        SessionProposal lenaApproved = ensureProposal(
                lena,
                "Quantum Ideas Without the Hype",
                "A grounded introduction to quantum ideas and what current technology can realistically do.",
                science.getId(),
                ProposalStatus.APPROVED);

        SessionProposal marcusApproved = ensureProposal(
                marcus,
                "Building Responsible AI",
                "Responsible AI development, evaluation, transparency, and deployment practices.",
                technology.getId(),
                ProposalStatus.APPROVED);

        SessionProposal priyaApproved = ensureProposal(
                priya,
                "Robotics from Concept to Competition",
                "A practical engineering workflow for autonomous robotics.",
                engineering.getId(),
                ProposalStatus.APPROVED);

        SessionProposal noahApproved = ensureProposal(
                noah,
                "Cybersecurity for Everyone",
                "Practical security concepts for developers, students, educators, and connected organizations.",
                technology.getId(),
                ProposalStatus.APPROVED);

        SessionProposal sofiaApproved = ensureProposal(
                sofia,
                "Where Art Meets Technology",
                "Creative coding, sound, projection, and interactive design as artistic tools.",
                arts.getId(),
                ProposalStatus.APPROVED);

        SessionProposal jamalApproved = ensureProposal(
                jamal,
                "Tell the Truth with Data Visualization",
                "Clear visual communication, uncertainty, scale, and responsible quantitative storytelling.",
                mathematics.getId(),
                ProposalStatus.APPROVED);

        SessionProposal elenaApproved = ensureProposal(
                elena,
                "Reading the Planet: Climate Signals in Data",
                "Using observations and models to understand climate signals and uncertainty.",
                science.getId(),
                ProposalStatus.APPROVED);

        SessionProposal averyApproved = ensureProposal(
                avery,
                "The Future of STEAM Education",
                "Project-based learning, maker education, access, and career-connected instruction.",
                science.getId(),
                ProposalStatus.APPROVED);

        SessionProposal billDraft = ensureProposal(
                bill,
                "Communicating Science in a Noisy World",
                "A draft session about explaining technical ideas clearly to broad audiences.",
                science.getId(),
                ProposalStatus.DRAFT);

        SessionProposal marcusSubmitted = ensureProposal(
                marcus,
                "AI Agents in Real Workflows",
                "A submitted session exploring agentic software patterns, evaluation, and operational safeguards.",
                technology.getId(),
                ProposalStatus.SUBMITTED);

        SessionProposal sofiaSubmitted = ensureProposal(
                sofia,
                "Designing Interactive Public Spaces",
                "A submitted session on creative technology in museums, festivals, and civic spaces.",
                arts.getId(),
                ProposalStatus.SUBMITTED);

        SessionProposal maeRejected = ensureProposal(
                mae,
                "Future Mission Concepts",
                "A proposed session exploring future human spaceflight concepts.",
                engineering.getId(),
                ProposalStatus.REJECTED);

        for (SessionProposal approved : List.of(
                billApproved,
                maeApproved,
                adaApproved,
                lenaApproved,
                marcusApproved,
                priyaApproved,
                noahApproved,
                sofiaApproved,
                jamalApproved,
                elenaApproved,
                averyApproved)) {
            ensureApprovalDecision(
                    approved,
                    admin,
                    ApprovalDecisionType.APPROVE,
                    "Approved for the STEAMCon 2027 program.");
        }

        ensureApprovalDecision(
                maeRejected,
                admin,
                ApprovalDecisionType.REJECT,
                "Strong topic, but the published program is already full in this time block.");

        // ---------------------------------------------------------
        // SPEAKER APPLICATIONS
        // ---------------------------------------------------------

        ensureSpeakerApplication(bill, openingKeynote, ApplicationStatus.APPROVED);
        ensureSpeakerApplication(mae, futureSpace, ApplicationStatus.APPROVED);
        ensureSpeakerApplication(ada, mathData, ApplicationStatus.APPROVED);
        ensureSpeakerApplication(lena, quantum, ApplicationStatus.APPROVED);
        ensureSpeakerApplication(marcus, responsibleAi, ApplicationStatus.APPROVED);
        ensureSpeakerApplication(priya, robotics, ApplicationStatus.APPROVED);
        ensureSpeakerApplication(noah, cyber, ApplicationStatus.APPROVED);
        ensureSpeakerApplication(sofia, creativeTech, ApplicationStatus.APPROVED);
        ensureSpeakerApplication(jamal, visualization, ApplicationStatus.APPROVED);
        ensureSpeakerApplication(elena, climateSignals, ApplicationStatus.APPROVED);
        ensureSpeakerApplication(avery, educationPanel, ApplicationStatus.APPROVED);
        ensureSpeakerApplication(marcus, secureAi, ApplicationStatus.SUBMITTED);
        ensureSpeakerApplication(sofia, immersiveStory, ApplicationStatus.SUBMITTED);

        // ---------------------------------------------------------
        // LIVE SESSION ASSIGNMENTS
        // ---------------------------------------------------------

        SpeakerSessionAssignment billAssignment = ensureAssignment(
                billApproved,
                openingKeynote,
                SpeakerRole.PRIMARY_SPEAKER);

        SpeakerSessionAssignment maeAssignment = ensureAssignment(
                maeApproved,
                futureSpace,
                SpeakerRole.PRIMARY_SPEAKER);

        ensureAssignment(adaApproved, mathData, SpeakerRole.PRIMARY_SPEAKER);
        ensureAssignment(lenaApproved, quantum, SpeakerRole.PRIMARY_SPEAKER);
        ensureAssignment(marcusApproved, responsibleAi, SpeakerRole.PRIMARY_SPEAKER);
        ensureAssignment(priyaApproved, robotics, SpeakerRole.PRIMARY_SPEAKER);
        ensureAssignment(noahApproved, cyber, SpeakerRole.PRIMARY_SPEAKER);
        ensureAssignment(sofiaApproved, creativeTech, SpeakerRole.PRIMARY_SPEAKER);
        ensureAssignment(jamalApproved, visualization, SpeakerRole.PRIMARY_SPEAKER);
        ensureAssignment(elenaApproved, climateSignals, SpeakerRole.PRIMARY_SPEAKER);
        ensureAssignment(averyApproved, educationPanel, SpeakerRole.PRIMARY_SPEAKER);

        // Additional panel and workshop memberships.
        ensureDirectAssignment(marcus, aiWorkshop, SpeakerRole.PRIMARY_SPEAKER);
        ensureDirectAssignment(noah, secureAi, SpeakerRole.PRIMARY_SPEAKER);
        ensureDirectAssignment(priya, buildChallenge, SpeakerRole.PRIMARY_SPEAKER);
        ensureDirectAssignment(sofia, musicCode, SpeakerRole.PRIMARY_SPEAKER);
        ensureDirectAssignment(jamal, mathGames, SpeakerRole.PRIMARY_SPEAKER);
        ensureDirectAssignment(sofia, immersiveStory, SpeakerRole.PRIMARY_SPEAKER);
        ensureDirectAssignment(mae, spacePanel, SpeakerRole.PRIMARY_SPEAKER);
        ensureDirectAssignment(lena, spacePanel, SpeakerRole.PANELIST);
        ensureDirectAssignment(priya, spacePanel, SpeakerRole.PANELIST);
        ensureDirectAssignment(avery, careerPanel, SpeakerRole.PRIMARY_SPEAKER);
        ensureDirectAssignment(marcus, careerPanel, SpeakerRole.PANELIST);
        ensureDirectAssignment(priya, careerPanel, SpeakerRole.PANELIST);
        ensureDirectAssignment(jamal, careerPanel, SpeakerRole.PANELIST);
        ensureDirectAssignment(bill, closingKeynote, SpeakerRole.CO_SPEAKER);
        ensureDirectAssignment(mae, closingKeynote, SpeakerRole.CO_SPEAKER);
        ensureDirectAssignment(ada, closingKeynote, SpeakerRole.CO_SPEAKER);

        ensureScheduleChangeRequest(
                maeAssignment,
                "Travel conflict",
                "2027-11-04T14:00:00Z",
                "If possible, please keep this session in the morning block because of an evening travel commitment.");

        ensureScheduleChangeRequest(
                billAssignment,
                "Media availability",
                "2027-11-03T13:00:00Z",
                "Please preserve the opening keynote time to avoid a conflict with scheduled media availability.");

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

            ensureForumPolicy(forum, Role.ATTENDEE, ForumPermission.READ);
            ensureForumPolicy(forum, Role.ATTENDEE, ForumPermission.POST);
            ensureForumPolicy(forum, Role.SPEAKER, ForumPermission.READ);
            ensureForumPolicy(forum, Role.SPEAKER, ForumPermission.POST);
            ensureForumPolicy(forum, Role.ADMIN, ForumPermission.MODERATE);
        }

        ensureForumPolicy(concierge, Role.ATTENDEE, ForumPermission.READ);
        ensureForumPolicy(concierge, Role.ATTENDEE, ForumPermission.POST);
        ensureForumPolicy(concierge, Role.SPEAKER, ForumPermission.READ);
        ensureForumPolicy(concierge, Role.SPEAKER, ForumPermission.POST);
        ensureForumPolicy(concierge, Role.ADMIN, ForumPermission.MODERATE);

        ensureForumPolicy(organizerForum, Role.ADMIN, ForumPermission.READ);
        ensureForumPolicy(organizerForum, Role.ADMIN, ForumPermission.POST);
        ensureForumPolicy(organizerForum, Role.ADMIN, ForumPermission.MODERATE);

        // ---------------------------------------------------------
        // FORUM MESSAGES
        // ---------------------------------------------------------

        ensureMessage(
                concierge,
                admin,
                "Welcome to STEAMCon 2027 at the Jacob K. Javits Convention Center. Use this forum for general convention questions.");

        ensureMessage(
                concierge,
                attendee,
                "What is the easiest way to get from Moynihan Train Hall to the Javits Center?");

        ensureMessage(
                concierge,
                attendeeFour,
                "Will there be a staffed help desk throughout all three convention days?");

        ensureMessage(
                scienceForum,
                bill,
                "Looking forward to opening STEAMCon and meeting everyone in the Science track.");

        ensureMessage(
                scienceForum,
                elena,
                "I will share a short reading list after the climate-data session.");

        ensureMessage(
                scienceForum,
                attendee,
                "Will the climate session include time for audience questions about interpreting uncertainty?");

        ensureMessage(
                technologyForum,
                marcus,
                "I will post the responsible-AI evaluation checklist after the session.");

        ensureMessage(
                technologyForum,
                noah,
                "The cybersecurity session is beginner-friendly, and we will build from first principles.");

        ensureMessage(
                technologyForum,
                attendeeTwo,
                "Is the hands-on AI workshop okay for someone who is still learning backend development?");

        ensureMessage(
                engineeringForum,
                priya,
                "Bring questions about prototyping, controls, sensors, and robotics competitions.");

        ensureMessage(
                engineeringForum,
                mae,
                "Excited for the space engineering sessions and the multidisciplinary Friday panel.");

        ensureMessage(
                engineeringForum,
                attendeeThree,
                "Will the rapid design challenge be team-based or individual?");

        ensureMessage(
                artsForum,
                sofia,
                "The Night Lab will combine live visuals, music, creative coding, and interactive installations.");

        ensureMessage(
                artsForum,
                attendeeFour,
                "Really looking forward to the immersive storytelling session and Night Lab.");

        ensureMessage(
                mathForum,
                jamal,
                "The visualization session will include examples of misleading charts and better alternatives.");

        ensureMessage(
                mathForum,
                ada,
                "Mathematics and computation have always been deeply connected; I am excited to explore that theme with everyone.");

        ensureMessage(
                organizerForum,
                admin,
                "STEAMCon 2027 local demo data is active. Verify schedules, bookings, forums, notifications, and portal flows before integration testing.");

        // ---------------------------------------------------------
        // NOTIFICATIONS
        // ---------------------------------------------------------

        ensureNotification(
                attendee,
                "Welcome to STEAMCon 2027. Your attendee portal is ready.",
                NotificationType.GENERAL,
                false);

        ensureNotification(
                attendee,
                "Your hotel stay near Hudson Yards is confirmed for November 2-6.",
                NotificationType.GENERAL,
                false);

        ensureNotification(
                attendee,
                "Science Changes Everything has been added to your schedule.",
                NotificationType.GENERAL,
                true);

        ensureNotification(
                attendeeTwo,
                "Your Technology and Mathematics track access is active.",
                NotificationType.GENERAL,
                false);

        ensureNotification(
                attendeeThree,
                "Your engineering sessions are ready in My itinerary.",
                NotificationType.GENERAL,
                false);

        ensureNotification(
                attendeeFour,
                "Your STEAMCon 2027 attendee account is ready.",
                NotificationType.GENERAL,
                false);

        ensureNotification(
                bill,
                "Your proposal \"Science Changes Everything\" was approved for STEAMCon 2027.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                bill,
                "Your opening keynote assignment is confirmed for November 3.",
                NotificationType.GENERAL,
                true);

        ensureNotification(
                mae,
                "Your proposal \"Engineering Beyond Earth\" was approved.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                mae,
                "A schedule-change request is pending organizer review.",
                NotificationType.GENERAL,
                false);

        ensureNotification(
                ada,
                "Your proposal \"The Mathematics Behind Data\" was approved.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                lena,
                "Your proposal \"Quantum Ideas Without the Hype\" was approved.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                marcus,
                "Your proposal \"Building Responsible AI\" was approved.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                marcus,
                "Your application for Securing AI Systems is still under review.",
                NotificationType.SPEAKER_APPLICATION_UPDATED,
                false);

        ensureNotification(
                priya,
                "Your robotics session assignment is confirmed.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                noah,
                "Your Cybersecurity for Everyone session is confirmed for November 3.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                sofia,
                "Your Art and Technology session was approved.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                jamal,
                "Your data visualization session is confirmed for November 4.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                elena,
                "Your climate-data session is confirmed for November 3.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                avery,
                "Your STEAM education panel is confirmed for November 4.",
                NotificationType.PROPOSAL_APPROVED,
                false);

        ensureNotification(
                admin,
                "STEAMCon 2027 local demo data is ready for integration testing.",
                NotificationType.GENERAL,
                false);

        System.out.println();
        System.out.println("========================================================");
        System.out.println("STEAMCon 2027 demo data ready.");
        System.out.println("Venue: Jacob K. Javits Convention Center, New York City");
        System.out.println("Dates: November 3-5, 2027");
        System.out.println("All demo passwords: demo");
        System.out.println("attendee@steamcon.demo -> ATTENDEE");
        System.out.println("student@steamcon.demo -> ATTENDEE");
        System.out.println("maker@steamcon.demo -> ATTENDEE");
        System.out.println("teacher@steamcon.demo -> ATTENDEE");
        System.out.println("bill.nye@steamcon.demo -> SPEAKER + ATTENDEE");
        System.out.println("mae.jemison@steamcon.demo -> SPEAKER + ATTENDEE");
        System.out.println("ada.lovelace@steamcon.demo -> SPEAKER + ATTENDEE");
        System.out.println("marcus.chen@steamcon.demo -> SPEAKER + ATTENDEE");
        System.out.println("priya.shah@steamcon.demo -> SPEAKER + ATTENDEE");
        System.out.println("admin@steamcon.demo -> ADMIN + ATTENDEE");
        System.out.println("========================================================");
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
