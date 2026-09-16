package com.sparkcity.steamcon.auth;

import com.sparkcity.steamcon.identity.AuthSession;
import com.sparkcity.steamcon.identity.User;
import com.sparkcity.steamcon.identity.UserRole;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AuthResponse(
        UUID sessionId,
        Instant createdAt,
        Instant expiresAt,
        String status,
        UserResponse user
) {

    public static AuthResponse from(
            AuthSession session,
            User user,
            List<UserRole> roles) {

        return new AuthResponse(
                session.getId(),
                session.getCreatedAt(),
                session.getExpiresAt(),
                session.getStatus().name(),
                UserResponse.from(user, roles)
        );
    }
}
