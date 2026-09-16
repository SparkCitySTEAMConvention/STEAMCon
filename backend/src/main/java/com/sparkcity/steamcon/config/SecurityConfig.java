package com.sparkcity.steamcon.config;

import com.sparkcity.steamcon.auth.SessionAuthenticationFilter;
import com.sparkcity.steamcon.identity.AuthSessionRepository;
import com.sparkcity.steamcon.identity.UserRoleRepository;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.time.Instant;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthSessionRepository authSessionRepository,
            UserRoleRepository userRoleRepository
    ) throws Exception {

        SessionAuthenticationFilter sessionFilter =
                new SessionAuthenticationFilter(
                        authSessionRepository,
                        userRoleRepository);

        return http
                .csrf(csrf -> csrf.disable())

                .exceptionHandling(exception ->
                        exception
                                .authenticationEntryPoint(
                                        authenticationEntryPoint())
                                .accessDeniedHandler(
                                        accessDeniedHandler()))

                .addFilterBefore(
                        sessionFilter,
                        UsernamePasswordAuthenticationFilter.class)

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                "/api/health",
                                "/api/auth/login",
                                "/api/auth/register"
                        ).permitAll()

                        .requestMatchers(
                                "/api/auth/me",
                                "/api/auth/logout"
                        ).authenticated()

                        .requestMatchers(
                                "/api/proposals",
                                "/api/speaker-applications"
                        ).hasRole("SPEAKER")

                        .requestMatchers(
                                "/api/proposals/*/decision",
                                "/api/speaker-applications/*/status"
                        ).hasRole("ADMIN")

                        .anyRequest()
                        .authenticated()
                )

                .build();
    }

    @Bean
    AuthenticationEntryPoint authenticationEntryPoint() {

        return (request, response, exception) -> {

            response.setStatus(401);
            response.setContentType("application/json");

            response.getWriter().write("""
                    {
                      "status": 401,
                      "error": "Unauthorized",
                      "message": "Authentication is required"
                    }
                    """);
        };
    }

    @Bean
    AccessDeniedHandler accessDeniedHandler() {

        return (request, response, exception) -> {

            response.setStatus(403);
            response.setContentType("application/json");

            response.getWriter().write("""
                    {
                      "status": 403,
                      "error": "Forbidden",
                      "message": "You do not have permission to access this resource"
                    }
                    """);
        };
    }
}
