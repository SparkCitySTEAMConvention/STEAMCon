package com.sparkcity.steamcon.communication;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.sparkcity.steamcon.identity.Role;

@Service
public class CommunicationService {

    private final ForumRepository forumRepository;
    private final MessageRepository messageRepository;
    private final ForumAccessPolicyRepository forumAccessPolicyRepository;
    private final SpeakerFlairRepository speakerFlairRepository;

    public CommunicationService(
            ForumRepository forumRepository,
            MessageRepository messageRepository,
            ForumAccessPolicyRepository forumAccessPolicyRepository,
            SpeakerFlairRepository speakerFlairRepository) {

        this.forumRepository = forumRepository;
        this.messageRepository = messageRepository;
        this.forumAccessPolicyRepository = forumAccessPolicyRepository;
        this.speakerFlairRepository = speakerFlairRepository;
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

    public List<Message> getMessagesForForum(
            UUID forumId,
            Role userRole,
            ForumPermission permission) {

        Forum forum = getForum(forumId);

        validateForumAccess(
                forum,
                userRole,
                permission);

        return messageRepository.findAll()
                .stream()
                .filter(message ->
                        forumId.equals(message.getForumId()))
                .filter(message ->
                        message.getStatus() == MessageStatus.ACTIVE)
                .toList();
    }

    public Message createMessage(
            UUID forumId,
            UUID authorId,
            String body,
            Role userRole,
            ForumPermission permission) {

        Forum forum = getForum(forumId);

        validateForumAccess(
                forum,
                userRole,
                permission);

        if (body == null || body.isBlank()) {
            throw new IllegalArgumentException(
                    "Message body cannot be empty");
        }

        Message message = new Message();

        message.setForumId(forumId);
        message.setAuthorId(authorId);
        message.setBody(body);

        SpeakerFlair flair = findSpeakerFlair(authorId);

        if (flair != null) {
            message.setSpeakerFlairId(flair.getId());
        }

        return messageRepository.save(message);
    }

    public void validateForumAccess(
            Forum forum,
            Role userRole,
            ForumPermission permission) {

        if (forum.getScope() == ForumScope.GENERAL) {
            return;
        }

        List<ForumAccessPolicy> policies =
                forumAccessPolicyRepository.findAll()
                        .stream()
                        .filter(policy ->
                                forum.getId()
                                        .equals(policy.getForumId()))
                        .toList();

        boolean allowed = policies.stream()
                .anyMatch(policy ->
                        policy.getRole() == userRole
                                && policy.getPermission()
                                == permission);

        if (!allowed) {
            throw new IllegalArgumentException(
                    "Forum access denied");
        }
    }

    private SpeakerFlair findSpeakerFlair(UUID userId) {

        return speakerFlairRepository.findAll()
                .stream()
                .filter(flair ->
                        userId.equals(flair.getUserId()))
                .findFirst()
                .orElse(null);
    }
}