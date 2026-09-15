package com.sparkcity.steamcon.communication;

import java.util.UUID;

import com.sparkcity.steamcon.identity.Role;

public record CreateMessageRequest(
        UUID authorId,
        String body,
        Role role,
        ForumPermission permission) {
}