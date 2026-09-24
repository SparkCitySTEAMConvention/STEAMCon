package com.sparkcity.steamcon.auth;

import java.io.IOException;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class SessionAuthenticationFilter
        extends OncePerRequestFilter {

    private final AuthService authService;

    public SessionAuthenticationFilter(
            AuthService authService) {

        this.authService = authService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String sessionId =
                request.getHeader("X-Session-Id");

        System.out.println(
                "SESSION FILTER HEADER: "
                        + sessionId);

        if (sessionId != null && !sessionId.isBlank()) {

            try {

                UUID id =
                        UUID.fromString(sessionId);

                AuthResponse currentSession =
                        authService.getCurrentSession(id);

                System.out.println(
                        "SESSION FILTER USER: "
                                + currentSession.user().id()
                                + " roles="
                                + currentSession.user().roles());

                var authorities =
                        currentSession.user()
                                .roles()
                                .stream()
                                .map(role ->
                                        new SimpleGrantedAuthority(
                                                "ROLE_" + role.name()))
                                .toList();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                currentSession.user().id(),
                                null,
                                authorities);

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

                System.out.println(
                        "SECURITY CONTEXT AUTH: "
                                + SecurityContextHolder
                                        .getContext()
                                        .getAuthentication());

            } catch (IllegalArgumentException
                    | InvalidSessionException exception) {

                System.out.println(
                        "SESSION FILTER REJECTED: "
                                + exception.getMessage());
            }
        }

        filterChain.doFilter(
                request,
                response);
    }
}