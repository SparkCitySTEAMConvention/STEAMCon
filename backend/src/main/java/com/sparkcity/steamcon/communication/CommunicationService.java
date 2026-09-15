package com.sparkcity.steamcon.communication;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class CommunicationService {

    private final ForumRepository forumRepository;
    private final MessageRepository messageRepository;

    public CommunicationService(
            ForumRepository forumRepository,
            MessageRepository messageRepository) {

        this.forumRepository = forumRepository;
        this.messageRepository = messageRepository;
    }

    public List<Forum> getForums() {
        return forumRepository.findAll();
    }

    public List<Forum> getForumsByScope(ForumScope scope) {
        return forumRepository.findAll()
                .stream()
                .filter(forum -> forum.getScope() == scope)
                .toList();
    }

    public Forum getForum(UUID forumId) {
        return forumRepository.findById(forumId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Forum not found"));
    }

    public List<Message> getMessagesForForum(UUID forumId) {

        getForum(forumId);

        return messageRepository.findAll()
                .stream()
                .filter(message -> forumId.equals(message.getForumId()))
                .filter(message -> message.getStatus() == MessageStatus.ACTIVE)
                .toList();
    }

    public Message createMessage(
            UUID forumId,
            UUID authorId,
            String body,
            UUID speakerFlairId) {

        getForum(forumId);

        if (body == null || body.isBlank()) {
            throw new IllegalArgumentException(
                    "Message body cannot be empty");
        }

        Message message = new Message();

        message.setForumId(forumId);
        message.setAuthorId(authorId);
        message.setBody(body);
        message.setSpeakerFlairId(speakerFlairId);

        return messageRepository.save(message);
    }
}