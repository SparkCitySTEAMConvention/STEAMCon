package com.sparkcity.steamcon.auth;

import com.sparkcity.steamcon.identity.AuthSession;
import com.sparkcity.steamcon.identity.AuthSessionRepository;
import com.sparkcity.steamcon.identity.AuthSessionStatus;
import com.sparkcity.steamcon.identity.UserRole;
import com.sparkcity.steamcon.identity.UserRoleRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class SessionAuthenticationFilter
        extends OncePerRequestFilter {

    private final AuthSessionRepository authSessionRepository;
    private final UserRoleRepository userRoleRepository;

    public SessionAuthenticationFilter(
            AuthSessionRepository authSessionRepository,
            UserRoleRepository userRoleRepository) {

        this.authSessionRepository =
                authSessionRepository;

        this.userRoleRepository =
                userRoleRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String sessionId =
                request.getHeader("X-Session-Id");

        if (sessionId != null && !sessionId.isBlank()) {

            try {

                UUID id =
                        UUID.fromString(sessionId);

                AuthSession session =
                        authSessionRepository
                                .findByIdAndStatus(
                                        id,
                                        AuthSessionStatus.ACTIVE)
                                .orElse(null);

                if (session != null
                        && session.getExpiresAt()
                        .isAfter(Instant.now())) {

                    List<UserRole> roles =
                            userRoleRepository
                                    .findByUserIdAndActiveTrue(
                                            session.getUserId());

                    var authorities =
                            roles.stream()
                                    .filter(UserRole::isActive)
                                    .map(UserRole::getRole)
                                    .map(role ->
                                            new SimpleGrantedAuthority(
                                                    "ROLE_"
                                                            + role.name()))
                                    .toList();

                    UsernamePasswordAuthenticationToken
                            authentication =
                            new UsernamePasswordAuthenticationToken(
                                    session.getUserId(),
                                    null,
                                    authorities);

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication);
                }

            } catch (IllegalArgumentException ignored) {
                // Invalid session ID leaves the request unauthenticated.
            }
        }

        filterChain.doFilter(
                request,
                response);
    }
}
