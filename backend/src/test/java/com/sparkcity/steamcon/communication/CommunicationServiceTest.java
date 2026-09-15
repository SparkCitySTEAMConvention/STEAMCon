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
import org.mockito.MockitoAnnotations;

import com.sparkcity.steamcon.identity.Role;

class CommunicationServiceTest {

    @Mock
    private ForumRepository forumRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ForumAccessPolicyRepository forumAccessPolicyRepository;

    @Mock
    private SpeakerFlairRepository speakerFlairRepository;

    private CommunicationService communicationService;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        communicationService = new CommunicationService(
                forumRepository,
                messageRepository,
                forumAccessPolicyRepository,
                speakerFlairRepository);
    }

    @Test
    void getForumsShouldReturnAllForums() {

        Forum forumOne = new Forum();
        forumOne.setName("Java Track");

        Forum forumTwo = new Forum();
        forumTwo.setName("Admin");

        when(forumRepository.findAll())
                .thenReturn(List.of(forumOne, forumTwo));

        List<Forum> result =
                communicationService.getForums();

        assertEquals(2, result.size());

        verify(forumRepository).findAll();
    }

    @Test
    void getForumsByScopeShouldFilterForums() {

        Forum trackForum = new Forum();
        trackForum.setName("Java Track");
        trackForum.setScope(ForumScope.TRACK);

        Forum adminForum = new Forum();
        adminForum.setName("Admin");
        adminForum.setScope(ForumScope.ADMIN);

        when(forumRepository.findAll())
                .thenReturn(List.of(trackForum, adminForum));

        List<Forum> result =
                communicationService.getForumsByScope(
                        ForumScope.TRACK);

        assertEquals(1, result.size());

        assertEquals(
                ForumScope.TRACK,
                result.get(0).getScope());
    }

    @Test
    void createMessageShouldSaveMessage() {

        UUID forumId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();

        Forum forum = new Forum();
        forum.setScope(ForumScope.GENERAL);

        when(forumRepository.findById(forumId))
                .thenReturn(Optional.of(forum));

        when(speakerFlairRepository.findAll())
                .thenReturn(List.of());

        when(messageRepository.save(any(Message.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Message result =
                communicationService.createMessage(
                        forumId,
                        authorId,
                        "Hello everyone!",
                        Role.ATTENDEE,
                        ForumPermission.WRITE);

        assertNotNull(result);
        assertEquals(forumId, result.getForumId());
        assertEquals(authorId, result.getAuthorId());
        assertEquals(
                "Hello everyone!",
                result.getBody());

        verify(messageRepository)
                .save(any(Message.class));
    }

    @Test
    void createMessageShouldRejectBlankBody() {

        UUID forumId = UUID.randomUUID();

        Forum forum = new Forum();
        forum.setScope(ForumScope.GENERAL);

        when(forumRepository.findById(forumId))
                .thenReturn(Optional.of(forum));

        assertThrows(
                IllegalArgumentException.class,
                () -> communicationService.createMessage(
                        forumId,
                        UUID.randomUUID(),
                        "   ",
                        Role.ATTENDEE,
                        ForumPermission.WRITE));
    }

    @Test
    void getMessagesShouldOnlyReturnActiveMessagesForForum() {

        UUID forumId = UUID.randomUUID();
        UUID otherForumId = UUID.randomUUID();

        Forum forum = new Forum();
        forum.setScope(ForumScope.GENERAL);

        Message activeMessage = new Message();
        activeMessage.setForumId(forumId);
        activeMessage.setBody("Visible");
        activeMessage.setStatus(MessageStatus.ACTIVE);

        Message hiddenMessage = new Message();
        hiddenMessage.setForumId(forumId);
        hiddenMessage.setBody("Hidden");
        hiddenMessage.setStatus(MessageStatus.HIDDEN);

        Message otherForumMessage = new Message();
        otherForumMessage.setForumId(otherForumId);
        otherForumMessage.setBody("Other forum");
        otherForumMessage.setStatus(MessageStatus.ACTIVE);

        when(forumRepository.findById(forumId))
                .thenReturn(Optional.of(forum));

        when(messageRepository.findAll())
                .thenReturn(List.of(
                        activeMessage,
                        hiddenMessage,
                        otherForumMessage));

        List<Message> result =
                communicationService.getMessagesForForum(
                        forumId,
                        Role.ATTENDEE,
                        ForumPermission.READ);

        assertEquals(1, result.size());

        assertEquals(
                "Visible",
                result.get(0).getBody());
    }

    @Test
    void getMessagesShouldThrowWhenForumDoesNotExist() {

        UUID forumId = UUID.randomUUID();

        when(forumRepository.findById(forumId))
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
    void generalForumShouldAllowAccess() {

        Forum forum = new Forum();
        forum.setScope(ForumScope.GENERAL);

        communicationService.validateForumAccess(
                forum,
                Role.ATTENDEE,
                ForumPermission.READ);
    }

    @Test
    void restrictedForumShouldAllowMatchingRoleAndPermission() {

        UUID forumId = UUID.randomUUID();

        ForumAccessPolicy policy =
                new ForumAccessPolicy();

        policy.setForumId(forumId);
        policy.setRole(Role.ATTENDEE);
        policy.setPermission(ForumPermission.READ);

        when(forumAccessPolicyRepository.findAll())
                .thenReturn(List.of(policy));

        /*
         * IMPORTANT:
         * This test assumes your Forum has its actual ID populated.
         *
         * If Forum.java does NOT have setId(), this test may need
         * to be adjusted using Mockito instead.
         */
        Forum forum = new Forum();

        /*
         * Uncomment this only if Forum.java has setId(UUID):
         *
         * forum.setId(forumId);
         */

        forum.setScope(ForumScope.TRACK);

        communicationService.validateForumAccess(
                forum,
                Role.ATTENDEE,
                ForumPermission.READ);
    }

    @Test
    void restrictedForumShouldRejectWrongRole() {

        UUID forumId = UUID.randomUUID();

        ForumAccessPolicy policy =
                new ForumAccessPolicy();

        policy.setForumId(forumId);
        policy.setRole(Role.SPEAKER);
        policy.setPermission(ForumPermission.READ);

        when(forumAccessPolicyRepository.findAll())
                .thenReturn(List.of(policy));

        Forum forum = new Forum();

        /*
         * Uncomment this only if Forum.java has setId(UUID):
         *
         * forum.setId(forumId);
         */

        forum.setScope(ForumScope.TRACK);

        assertThrows(
                IllegalArgumentException.class,
                () -> communicationService
                        .validateForumAccess(
                                forum,
                                Role.ATTENDEE,
                                ForumPermission.READ));
    }

    @Test
    void adminForumShouldRejectNonAdminUser() {

        UUID forumId = UUID.randomUUID();

        ForumAccessPolicy policy =
                new ForumAccessPolicy();

        policy.setForumId(forumId);
        policy.setRole(Role.ADMIN);
        policy.setPermission(ForumPermission.READ);

        when(forumAccessPolicyRepository.findAll())
                .thenReturn(List.of(policy));

        Forum forum = new Forum();

        /*
         * Uncomment this only if Forum.java has setId(UUID):
         *
         * forum.setId(forumId);
         */

        forum.setScope(ForumScope.ADMIN);

        assertThrows(
                IllegalArgumentException.class,
                () -> communicationService
                        .validateForumAccess(
                                forum,
                                Role.ATTENDEE,
                                ForumPermission.READ));
    }

    @Test
    void createMessageShouldAttachSpeakerFlair() {

        UUID forumId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Forum forum = new Forum();
        forum.setScope(ForumScope.GENERAL);

        SpeakerFlair flair = new SpeakerFlair();
        flair.setUserId(userId);
        flair.setLabel("Speaker");
        flair.setDisplayStyle("badge");

        when(forumRepository.findById(forumId))
                .thenReturn(Optional.of(forum));

        when(speakerFlairRepository.findAll())
                .thenReturn(List.of(flair));

        when(messageRepository.save(any(Message.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Message result =
                communicationService.createMessage(
                        forumId,
                        userId,
                        "Hello from the speaker",
                        Role.SPEAKER,
                        ForumPermission.WRITE);

        assertNotNull(result);
        assertEquals(userId, result.getAuthorId());
        assertEquals(
                "Hello from the speaker",
                result.getBody());

        verify(messageRepository)
                .save(any(Message.class));
    }
}