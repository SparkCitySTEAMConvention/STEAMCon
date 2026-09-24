package com.sparkcity.steamcon.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.sparkcity.steamcon.auth.AuthService;
import com.sparkcity.steamcon.auth.SessionAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthService authService) throws Exception {

        SessionAuthenticationFilter sessionFilter =
                new SessionAuthenticationFilter(authService);

        return http

                .csrf(csrf ->
                        csrf.disable())

                // We authenticate every request from X-Session-Id.
                // Do not rely on JSESSIONID / server-side HTTP sessions.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(
                                authenticationEntryPoint())
                        .accessDeniedHandler(
                                accessDeniedHandler()))

                .addFilterBefore(
                        sessionFilter,
                        UsernamePasswordAuthenticationFilter.class)

                .authorizeHttpRequests(auth -> auth

                        // Completely public endpoints
                        .requestMatchers(
                                "/error",
                                "/api/health",
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/speakers",
                                "/api/speakers/**")
                        .permitAll()

                        // Public convention/program information
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/tracks",
                                "/api/tracks/**",
                                "/api/sessions",
                                "/api/sessions/**",
                                "/api/session-occurrences",
                                "/api/session-occurrences/**",
                                "/api/hotels")
                        .permitAll()

                        // Logged-in user endpoints
                        .requestMatchers(
                                "/api/auth/me",
                                "/api/auth/logout",
                                "/api/admission/me",
                                "/api/enrollments/me",
                                "/api/travel-legs/me",
                                "/api/hotel-reservations/me",
                                "/api/car-rentals/me",
                                "/api/notifications/me")
                        .authenticated()

                        // Speaker operations
                        .requestMatchers(
                                "/api/proposals",
                                "/api/speaker-applications")
                        .hasRole("SPEAKER")

                        // Admin operations
                        .requestMatchers(
                                "/api/proposals/*/decision",
                                "/api/speaker-applications/*/status")
                        .hasRole("ADMIN")

                        // Anything else still requires authentication
                        .anyRequest()
                        .authenticated())

                .build();
    }

    @Bean
    AuthenticationEntryPoint authenticationEntryPoint() {

        return (request, response, exception) -> {

            System.out.println(
                    "401 SECURITY ENTRY POINT: "
                            + request.getMethod()
                            + " "
                            + request.getRequestURI()
                            + " auth="
                            + org.springframework.security.core.context
                                    .SecurityContextHolder
                                    .getContext()
                                    .getAuthentication());

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

            System.out.println(
                    "403 ACCESS DENIED: "
                            + request.getMethod()
                            + " "
                            + request.getRequestURI()
                            + " auth="
                            + org.springframework.security.core.context
                                    .SecurityContextHolder
                                    .getContext()
                                    .getAuthentication());

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