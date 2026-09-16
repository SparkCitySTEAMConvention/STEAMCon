package com.sparkcity.steamcon.auth;

import com.sparkcity.steamcon.identity.Role;
import com.sparkcity.steamcon.identity.User;
import com.sparkcity.steamcon.identity.UserRole;

import java.util.List;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String displayName,
        String organization,
        List<Role> roles
) {

    public static UserResponse from(
            User user,
            List<UserRole> userRoles) {

        List<Role> roles = userRoles.stream()
                .filter(UserRole::isActive)
                .map(UserRole::getRole)
                .toList();

        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getOrganization(),
                roles
        );
    }
}
