package com.sparkcity.steamcon.config;

import java.time.Instant;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.sparkcity.steamcon.communication.Forum;
import com.sparkcity.steamcon.communication.ForumRepository;
import com.sparkcity.steamcon.communication.ForumScope;
import com.sparkcity.steamcon.communication.SpeakerFlair;
import com.sparkcity.steamcon.communication.SpeakerFlairRepository;
import com.sparkcity.steamcon.events.Session;
import com.sparkcity.steamcon.events.SessionOccurrence;
import com.sparkcity.steamcon.events.SessionOccurrenceRepository;
import com.sparkcity.steamcon.events.SessionRepository;
import com.sparkcity.steamcon.events.Track;
import com.sparkcity.steamcon.events.TrackRepository;
import com.sparkcity.steamcon.identity.User;
import com.sparkcity.steamcon.identity.UserRepository;
import com.sparkcity.steamcon.speaker.ProposalStatus;
import com.sparkcity.steamcon.speaker.SessionProposal;
import com.sparkcity.steamcon.speaker.SessionProposalRepository;

@Component
@ConditionalOnProperty(
        name = "app.seed.enabled",
        havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {

    private final TrackRepository trackRepository;
    private final SessionRepository sessionRepository;
    private final SessionOccurrenceRepository occurrenceRepository;
    private final UserRepository userRepository;
    private final SessionProposalRepository proposalRepository;
    private final SpeakerFlairRepository flairRepository;
    private final ForumRepository forumRepository;

    public DemoDataSeeder(
            TrackRepository trackRepository,
            SessionRepository sessionRepository,
            SessionOccurrenceRepository occurrenceRepository,
            UserRepository userRepository,
            SessionProposalRepository proposalRepository,
            SpeakerFlairRepository flairRepository,
            ForumRepository forumRepository) {

        this.trackRepository = trackRepository;
        this.sessionRepository = sessionRepository;
        this.occurrenceRepository = occurrenceRepository;
        this.userRepository = userRepository;
        this.proposalRepository = proposalRepository;
        this.flairRepository = flairRepository;
        this.forumRepository = forumRepository;
    }

    @Override
    public void run(String... args) {

        if (trackRepository.count() > 0) {
            System.out.println(
                    "Seed skipped: program data already exists.");
            return;
        }

        seedData();

        System.out.println(
                "STEAMCon demo data seeded successfully.");
    }

    private void seedData() {

        // -------------------------------------------------
        // TRACKS
        // -------------------------------------------------

        Track science = createTrack(
                "Science",
                "Discovery, experimentation, research, and the natural world.");

        Track technology = createTrack(
                "Technology",
                "Software, emerging technology, AI, cybersecurity, and computing.");

        Track engineering = createTrack(
                "Engineering",
                "Design, systems thinking, robotics, aerospace, and problem solving.");

        Track arts = createTrack(
                "Arts",
                "Creative technology, visual design, music, media, and storytelling.");

        Track mathematics = createTrack(
                "Mathematics",
                "Applied mathematics, data, analytics, patterns, and quantitative thinking.");

        trackRepository.saveAll(
                List.of(
                        science,
                        technology,
                        engineering,
                        arts,
                        mathematics));

        // -------------------------------------------------
        // USERS
        // -------------------------------------------------

        User bill = new User(
                "bill.nye@steamcon.demo",
                "Bill Nye",
                "{noop}demo");

        bill.setOrganization(
                "The Planetary Society");

        User ada = new User(
                "ada.lovelace@steamcon.demo",
                "Ada Lovelace",
                "{noop}demo");

        ada.setOrganization(
                "STEAMCon");

        User mae = new User(
                "mae.jemison@steamcon.demo",
                "Mae Jemison",
                "{noop}demo");

        mae.setOrganization(
                "100 Year Starship");

        userRepository.saveAll(
                List.of(
                        bill,
                        ada,
                        mae));

        // -------------------------------------------------
        // SESSIONS
        // -------------------------------------------------

        Session keynote = createSession(
                "Science Changes Everything",
                "Opening keynote exploring how curiosity, evidence, and discovery shape the future.",
                science.getId(),
                true);

        Session ai = createSession(
                "Building Responsible AI",
                "A practical discussion of modern AI systems, ethics, and real-world applications.",
                technology.getId(),
                false);

        Session robotics = createSession(
                "Robotics from Concept to Competition",
                "Designing, building, testing, and improving autonomous systems.",
                engineering.getId(),
                false);

        Session creativeTech = createSession(
                "Where Art Meets Technology",
                "How software, design, music, and digital tools create new forms of expression.",
                arts.getId(),
                false);

        Session data = createSession(
                "The Mathematics Behind Data",
                "Using probability, statistics, and modeling to understand real-world information.",
                mathematics.getId(),
                false);

        Session concert = createSession(
                "STEAMCon Evening Concert",
                "An evening celebration featuring live music and special guests.",
                arts.getId(),
                true);

        sessionRepository.saveAll(
                List.of(
                        keynote,
                        ai,
                        robotics,
                        creativeTech,
                        data,
                        concert));

        // -------------------------------------------------
        // OCCURRENCES — APRIL 6–8, 2027
        // -------------------------------------------------

        occurrenceRepository.saveAll(
                List.of(
                        createOccurrence(
                                keynote.getId(),
                                "2027-04-06T13:00:00Z",
                                "2027-04-06T14:00:00Z"),

                        createOccurrence(
                                ai.getId(),
                                "2027-04-06T15:00:00Z",
                                "2027-04-06T16:00:00Z"),

                        createOccurrence(
                                robotics.getId(),
                                "2027-04-07T14:00:00Z",
                                "2027-04-07T15:30:00Z"),

                        createOccurrence(
                                creativeTech.getId(),
                                "2027-04-07T17:00:00Z",
                                "2027-04-07T18:00:00Z"),

                        createOccurrence(
                                concert.getId(),
                                "2027-04-08T00:00:00Z",
                                "2027-04-08T02:00:00Z"),

                        createOccurrence(
                                data.getId(),
                                "2027-04-08T14:00:00Z",
                                "2027-04-08T15:00:00Z")));

        // -------------------------------------------------
        // APPROVED SPEAKER PROPOSALS
        // -------------------------------------------------

        SessionProposal billProposal =
                createApprovedProposal(
                        bill.getId(),
                        "Science Changes Everything",
                        "Opening keynote on curiosity, science, and evidence.",
                        science.getId());

        SessionProposal adaProposal =
                createApprovedProposal(
                        ada.getId(),
                        "Building Responsible AI",
                        "Responsible AI development and the future of computing.",
                        technology.getId());

        SessionProposal maeProposal =
                createApprovedProposal(
                        mae.getId(),
                        "Robotics from Concept to Competition",
                        "Engineering systems through iteration and testing.",
                        engineering.getId());

        proposalRepository.saveAll(
                List.of(
                        billProposal,
                        adaProposal,
                        maeProposal));

        // -------------------------------------------------
        // SPEAKER FLAIR
        // -------------------------------------------------

        flairRepository.saveAll(
                List.of(
                        createFlair(
                                bill.getId(),
                                "Featured Speaker",
                                "featured"),

                        createFlair(
                                ada.getId(),
                                "Speaker",
                                "speaker"),

                        createFlair(
                                mae.getId(),
                                "Speaker",
                                "speaker")));

        // -------------------------------------------------
        // FORUMS
        // -------------------------------------------------

        Forum concierge = new Forum();
        concierge.setName(
                "STEAMCon Concierge");
        concierge.setScope(
                ForumScope.CONCIERGE);

        Forum scienceForum = new Forum();
        scienceForum.setName(
                "Science Track");
        scienceForum.setScope(
                ForumScope.TRACK);
        scienceForum.setTrackId(
                science.getId());

        Forum technologyForum = new Forum();
        technologyForum.setName(
                "Technology Track");
        technologyForum.setScope(
                ForumScope.TRACK);
        technologyForum.setTrackId(
                technology.getId());

        Forum adminForum = new Forum();
        adminForum.setName(
                "Organizer Forum");
        adminForum.setScope(
                ForumScope.ADMIN);

        forumRepository.saveAll(
                List.of(
                        concierge,
                        scienceForum,
                        technologyForum,
                        adminForum));
    }

    private Track createTrack(
            String name,
            String description) {

        Track track = new Track();

        track.setName(name);
        track.setDescription(description);

        return track;
    }

    private Session createSession(
            String title,
            String description,
            java.util.UUID trackId,
            boolean mandatory) {

        Session session = new Session();

        session.setTitle(title);
        session.setDescription(description);
        session.setTrackId(trackId);
        session.setMandatory(mandatory);

        return session;
    }

    private SessionOccurrence createOccurrence(
            java.util.UUID sessionId,
            String startsAt,
            String endsAt) {

        SessionOccurrence occurrence =
                new SessionOccurrence();

        occurrence.setSessionId(
                sessionId);

        occurrence.setStartsAt(
                Instant.parse(startsAt));

        occurrence.setEndsAt(
                Instant.parse(endsAt));

        return occurrence;
    }

    private SessionProposal createApprovedProposal(
            java.util.UUID speakerId,
            String title,
            String description,
            java.util.UUID trackId) {

        SessionProposal proposal =
                new SessionProposal();

        proposal.setSpeakerId(
                speakerId);

        proposal.setTitle(title);
        proposal.setDescription(
                description);

        proposal.setTrackId(
                trackId);

        proposal.setStatus(
                ProposalStatus.APPROVED);

        return proposal;
    }

    private SpeakerFlair createFlair(
            java.util.UUID userId,
            String label,
            String style) {

        SpeakerFlair flair =
                new SpeakerFlair();

        flair.setUserId(userId);
        flair.setLabel(label);
        flair.setDisplayStyle(style);

        return flair;
    }
}