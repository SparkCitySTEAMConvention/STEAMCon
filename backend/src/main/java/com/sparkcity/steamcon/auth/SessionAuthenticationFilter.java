package com.sparkcity.steamcon.auth;

import com.sparkcity.steamcon.identity.AuthSession;
import com.sparkcity.steamcon.identity.AuthSessionRepository;
import com.sparkcity.steamcon.identity.AuthSessionStatus;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

public class SessionAuthenticationFilter extends OncePerRequestFilter {

    private final AuthSessionRepository authSessionRepository;

    public SessionAuthenticationFilter(AuthSessionRepository authSessionRepository) {
        this.authSessionRepository = authSessionRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String sessionId = request.getHeader("X-Session-Id");

        if (sessionId != null) {
            try {
                UUID id = UUID.fromString(sessionId);

                AuthSession session = authSessionRepository
                        .findByIdAndStatus(id, AuthSessionStatus.ACTIVE)
                        .orElse(null);

                if (session != null && session.getExpiresAt().isAfter(Instant.now())) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    session.getUserId(),
                                    null,
                                    java.util.Collections.emptyList()
                            );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }

            } catch (IllegalArgumentException ignored) {
                // Invalid session ID; request remains unauthenticated.
            }
        }

        filterChain.doFilter(request, response);
    }
}