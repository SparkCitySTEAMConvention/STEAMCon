package com.sparkcity.steamcon.communication;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.sparkcity.steamcon.identity.Role;

@Service
public class CommunicationService {

    private final ForumRepository forumRepository;
    private final MessageRepository messageRepository;
    private final ForumAccessPolicyRepository
            forumAccessPolicyRepository;
    private final SpeakerFlairRepository
            speakerFlairRepository;

    public CommunicationService(
            ForumRepository forumRepository,
            MessageRepository messageRepository,
            ForumAccessPolicyRepository
                    forumAccessPolicyRepository,
            SpeakerFlairRepository
                    speakerFlairRepository) {

        this.forumRepository =
                forumRepository;

        this.messageRepository =
                messageRepository;

        this.forumAccessPolicyRepository =
                forumAccessPolicyRepository;

        this.speakerFlairRepository =
                speakerFlairRepository;
    }

    public List<Forum> getForums() {
        return forumRepository.findAll();
    }

    public List<Forum> getForumsByScope(
            ForumScope scope) {

        return forumRepository
                .findAll()
                .stream()
                .filter(forum ->
                        forum.getScope()
                                == scope)
                .toList();
    }

    public Forum getForum(UUID forumId) {

        return forumRepository
                .findById(forumId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Forum not found"));
    }

    // =====================================================
    // NEW AUTH-AWARE METHODS
    // =====================================================

    public List<Message> getMessagesForForum(
            UUID forumId,
            List<Role> userRoles,
            ForumPermission permission) {

        Forum forum =
                getForum(forumId);

        validateForumAccess(
                forum,
                userRoles,
                permission);

        return messageRepository
                .findAll()
                .stream()
                .filter(message ->
                        Objects.equals(
                                forumId,
                                message.getForumId()))
                .filter(message ->
                        message.getStatus()
                                == MessageStatus.ACTIVE)
                .toList();
    }

    public Message createMessage(
            UUID forumId,
            UUID authorId,
            String body,
            List<Role> userRoles) {

        if (authorId == null) {
            throw new IllegalArgumentException(
                    "Author ID is required");
        }

        if (body == null
                || body.isBlank()) {

            throw new IllegalArgumentException(
                    "Message body cannot be empty");
        }

        Forum forum =
                getForum(forumId);

        validateForumAccess(
                forum,
                userRoles,
                ForumPermission.POST);

        Message message =
                new Message();

        message.setForumId(forumId);
        message.setAuthorId(authorId);
        message.setBody(body);

        SpeakerFlair flair =
                findSpeakerFlair(
                        authorId);

        if (flair != null) {
            message.setSpeakerFlairId(
                    flair.getId());
        }

        return messageRepository.save(
                message);
    }

    public void validateForumAccess(
            Forum forum,
            List<Role> userRoles,
            ForumPermission permission) {

        if (forum == null) {
            throw new IllegalArgumentException(
                    "Forum is required");
        }

        if (userRoles == null
                || userRoles.isEmpty()) {

            throw new IllegalArgumentException(
                    "User role is required");
        }

        if (permission == null) {
            throw new IllegalArgumentException(
                    "Forum permission is required");
        }

        if (forum.getScope()
                == ForumScope.CONCIERGE) {

            return;
        }

        boolean allowed =
                forumAccessPolicyRepository
                        .findAll()
                        .stream()
                        .filter(policy ->
                                Objects.equals(
                                        forum.getId(),
                                        policy.getForumId()))
                        .anyMatch(policy ->
                                userRoles.contains(
                                        policy.getRole())
                                        &&
                                policy.getPermission()
                                        == permission);

        if (!allowed) {
            throw new IllegalArgumentException(
                    "Forum access denied");
        }
    }

    // =====================================================
    // OLD METHODS KEPT FOR EXISTING TESTS
    // =====================================================

    public List<Message> getMessagesForForum(
            UUID forumId,
            Role userRole,
            ForumPermission permission) {

        return getMessagesForForum(
                forumId,
                List.of(userRole),
                permission);
    }

    public Message createMessage(
            UUID forumId,
            UUID authorId,
            String body,
            Role userRole,
            ForumPermission permission) {

        Forum forum =
                getForum(forumId);

        validateForumAccess(
                forum,
                userRole,
                permission);

        if (authorId == null) {
            throw new IllegalArgumentException(
                    "Author ID is required");
        }

        if (body == null
                || body.isBlank()) {

            throw new IllegalArgumentException(
                    "Message body cannot be empty");
        }

        Message message =
                new Message();

        message.setForumId(forumId);
        message.setAuthorId(authorId);
        message.setBody(body);

        SpeakerFlair flair =
                findSpeakerFlair(
                        authorId);

        if (flair != null) {
            message.setSpeakerFlairId(
                    flair.getId());
        }

        return messageRepository.save(
                message);
    }

    public void validateForumAccess(
            Forum forum,
            Role userRole,
            ForumPermission permission) {

        validateForumAccess(
                forum,
                List.of(userRole),
                permission);
    }

    private SpeakerFlair findSpeakerFlair(
            UUID userId) {

        return speakerFlairRepository
                .findAll()
                .stream()
                .filter(flair ->
                        Objects.equals(
                                userId,
                                flair.getUserId()))
                .findFirst()
                .orElse(null);
    }
}