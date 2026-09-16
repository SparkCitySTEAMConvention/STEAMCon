package com.sparkcity.steamcon.communication;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.sparkcity.steamcon.identity.Role;

class CommunicationServiceTest {

    @Mock
    private ForumRepository forumRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ForumAccessPolicyRepository
            forumAccessPolicyRepository;

    @Mock
    private SpeakerFlairRepository
            speakerFlairRepository;

    private CommunicationService communicationService;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        communicationService =
                new CommunicationService(
                        forumRepository,
                        messageRepository,
                        forumAccessPolicyRepository,
                        speakerFlairRepository);
    }

    @Test
    void getForumsShouldReturnForums() {

        Forum one = new Forum();
        Forum two = new Forum();

        when(forumRepository.findAll())
                .thenReturn(
                        List.of(one, two));

        assertEquals(
                2,
                communicationService
                        .getForums()
                        .size());
    }

    @Test
    void getForumsByScopeShouldFilter() {

        Forum track = new Forum();
        track.setScope(ForumScope.TRACK);

        Forum admin = new Forum();
        admin.setScope(ForumScope.ADMIN);

        when(forumRepository.findAll())
                .thenReturn(
                        List.of(track, admin));

        List<Forum> result =
                communicationService
                        .getForumsByScope(
                                ForumScope.TRACK);

        assertEquals(1, result.size());

        assertEquals(
                ForumScope.TRACK,
                result.get(0).getScope());
    }

    @Test
    void conciergeForumShouldAllowAccess() {

        Forum forum = new Forum();
        forum.setScope(
                ForumScope.CONCIERGE);

        communicationService
                .validateForumAccess(
                        forum,
                        Role.ATTENDEE,
                        ForumPermission.READ);
    }

    @Test
    void trackForumShouldAllowMatchingPolicy() {

        UUID forumId = UUID.randomUUID();

        Forum forum = mock(Forum.class);

        when(forum.getId())
                .thenReturn(forumId);

        when(forum.getScope())
                .thenReturn(ForumScope.TRACK);

        ForumAccessPolicy policy =
                new ForumAccessPolicy();

        policy.setForumId(forumId);
        policy.setRole(Role.ATTENDEE);
        policy.setPermission(
                ForumPermission.READ);

        when(forumAccessPolicyRepository
                .findAll())
                .thenReturn(
                        List.of(policy));

        communicationService
                .validateForumAccess(
                        forum,
                        Role.ATTENDEE,
                        ForumPermission.READ);
    }

    @Test
    void trackForumShouldRejectWrongRole() {

        UUID forumId = UUID.randomUUID();

        Forum forum = mock(Forum.class);

        when(forum.getId())
                .thenReturn(forumId);

        when(forum.getScope())
                .thenReturn(ForumScope.TRACK);

        ForumAccessPolicy policy =
                new ForumAccessPolicy();

        policy.setForumId(forumId);
        policy.setRole(Role.SPEAKER);
        policy.setPermission(
                ForumPermission.READ);

        when(forumAccessPolicyRepository
                .findAll())
                .thenReturn(
                        List.of(policy));

        assertThrows(
                IllegalArgumentException.class,
                () -> communicationService
                        .validateForumAccess(
                                forum,
                                Role.ATTENDEE,
                                ForumPermission.READ));
    }

    @Test
    void adminForumShouldAllowAdmin() {

        UUID forumId = UUID.randomUUID();

        Forum forum = mock(Forum.class);

        when(forum.getId())
                .thenReturn(forumId);

        when(forum.getScope())
                .thenReturn(ForumScope.ADMIN);

        ForumAccessPolicy policy =
                new ForumAccessPolicy();

        policy.setForumId(forumId);
        policy.setRole(Role.ADMIN);
        policy.setPermission(
                ForumPermission.READ);

        when(forumAccessPolicyRepository
                .findAll())
                .thenReturn(
                        List.of(policy));

        communicationService
                .validateForumAccess(
                        forum,
                        Role.ADMIN,
                        ForumPermission.READ);
    }

    @Test
    void adminForumShouldRejectAttendee() {

        UUID forumId = UUID.randomUUID();

        Forum forum = mock(Forum.class);

        when(forum.getId())
                .thenReturn(forumId);

        when(forum.getScope())
                .thenReturn(ForumScope.ADMIN);

        ForumAccessPolicy policy =
                new ForumAccessPolicy();

        policy.setForumId(forumId);
        policy.setRole(Role.ADMIN);
        policy.setPermission(
                ForumPermission.READ);

        when(forumAccessPolicyRepository
                .findAll())
                .thenReturn(
                        List.of(policy));

        assertThrows(
                IllegalArgumentException.class,
                () -> communicationService
                        .validateForumAccess(
                                forum,
                                Role.ATTENDEE,
                                ForumPermission.READ));
    }

    @Test
    void createMessageShouldSaveMessage() {

        UUID forumId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Forum forum = new Forum();
        forum.setScope(
                ForumScope.CONCIERGE);

        when(forumRepository
                .findById(forumId))
                .thenReturn(
                        Optional.of(forum));

        when(speakerFlairRepository
                .findAll())
                .thenReturn(List.of());

        when(messageRepository
                .save(any(Message.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Message result =
                communicationService
                        .createMessage(
                                forumId,
                                userId,
                                "Hello!",
                                Role.ATTENDEE,
                                ForumPermission.POST);

        assertNotNull(result);

        assertEquals(
                "Hello!",
                result.getBody());

        verify(messageRepository)
                .save(any(Message.class));
    }

    @Test
    void blankMessageShouldFail() {

        UUID forumId = UUID.randomUUID();

        Forum forum = new Forum();
        forum.setScope(
                ForumScope.CONCIERGE);

        when(forumRepository
                .findById(forumId))
                .thenReturn(
                        Optional.of(forum));

        assertThrows(
                IllegalArgumentException.class,
                () -> communicationService
                        .createMessage(
                                forumId,
                                UUID.randomUUID(),
                                " ",
                                Role.ATTENDEE,
                                ForumPermission.POST));
    }

    @Test
    void getMessagesShouldReturnOnlyActiveForumMessages() {

        UUID forumId = UUID.randomUUID();

        Forum forum = new Forum();
        forum.setScope(
                ForumScope.CONCIERGE);

        Message active = new Message();
        active.setForumId(forumId);
        active.setBody("Visible");
        active.setStatus(
                MessageStatus.ACTIVE);

        Message hidden = new Message();
        hidden.setForumId(forumId);
        hidden.setBody("Hidden");
        hidden.setStatus(
                MessageStatus.HIDDEN);

        when(forumRepository
                .findById(forumId))
                .thenReturn(
                        Optional.of(forum));

        when(messageRepository.findAll())
                .thenReturn(
                        List.of(active, hidden));

        List<Message> result =
                communicationService
                        .getMessagesForForum(
                                forumId,
                                Role.ATTENDEE,
                                ForumPermission.READ);

        assertEquals(1, result.size());

        assertEquals(
                "Visible",
                result.get(0).getBody());
    }

    @Test
    void missingForumShouldFail() {

        UUID forumId = UUID.randomUUID();

        when(forumRepository
                .findById(forumId))
                .thenReturn(Optional.empty());

        assertThrows(
                IllegalArgumentException.class,
                () -> communicationService
                        .getMessagesForForum(
                                forumId,
                                Role.ATTENDEE,
                                ForumPermission.READ));
    }

    @Test
    void speakerMessageShouldAttachFlair() {

        UUID forumId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID flairId = UUID.randomUUID();

        Forum forum = new Forum();
        forum.setScope(
                ForumScope.CONCIERGE);

        SpeakerFlair flair =
                mock(SpeakerFlair.class);

        when(flair.getUserId())
                .thenReturn(userId);

        when(flair.getId())
                .thenReturn(flairId);

        when(forumRepository
                .findById(forumId))
                .thenReturn(
                        Optional.of(forum));

        when(speakerFlairRepository
                .findAll())
                .thenReturn(
                        List.of(flair));

        when(messageRepository
                .save(any(Message.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Message result =
                communicationService
                        .createMessage(
                                forumId,
                                userId,
                                "Speaker message",
                                Role.SPEAKER,
                                ForumPermission.POST);

        assertEquals(
                flairId,
                result.getSpeakerFlairId());
    }
}