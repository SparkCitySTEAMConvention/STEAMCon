package com.sparkcity.steamcon.communication;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

class CommunicationServiceTest {

    @Mock
    private ForumRepository forumRepository;

    @Mock
    private MessageRepository messageRepository;

    private CommunicationService communicationService;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        communicationService = new CommunicationService(
                forumRepository,
                messageRepository);
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

        when(forumRepository.findById(forumId))
                .thenReturn(Optional.of(forum));

        when(messageRepository.save(any(Message.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Message result =
                communicationService.createMessage(
                        forumId,
                        authorId,
                        "Hello everyone!",
                        null);

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

        when(forumRepository.findById(forumId))
                .thenReturn(Optional.of(new Forum()));

        assertThrows(
                IllegalArgumentException.class,
                () -> communicationService.createMessage(
                        forumId,
                        UUID.randomUUID(),
                        "   ",
                        null));
    }

    @Test
    void getMessagesShouldOnlyReturnActiveMessagesForForum() {

        UUID forumId = UUID.randomUUID();
        UUID otherForumId = UUID.randomUUID();

        Forum forum = new Forum();

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
                        forumId);

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
                        .getMessagesForForum(forumId));
    }
}