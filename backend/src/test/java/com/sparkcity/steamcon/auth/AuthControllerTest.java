package com.sparkcity.steamcon.auth;

import com.sparkcity.steamcon.identity.AuthSession;
import com.sparkcity.steamcon.identity.AuthSessionRepository;
import com.sparkcity.steamcon.identity.AuthSessionStatus;
import com.sparkcity.steamcon.identity.Role;
import com.sparkcity.steamcon.identity.User;
import com.sparkcity.steamcon.identity.UserRepository;
import com.sparkcity.steamcon.identity.UserRole;
import com.sparkcity.steamcon.identity.UserRoleRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private AuthSessionRepository authSessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String email;
    private String password;

    @BeforeEach
    void setUp() {

        email = "auth-test-" + UUID.randomUUID()
                + "@example.com";

        password = "Password123!";

        User user = new User(
                email,
                "Auth Test User",
                passwordEncoder.encode(password));

        user = userRepository.save(user);

        UserRole role =
                new UserRole(user, Role.ATTENDEE);

        userRoleRepository.save(role);
    }

    @Test
    void loginShouldReturnSessionUserAndRoles()
            throws Exception {

        mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId")
                        .exists())
                .andExpect(jsonPath("$.createdAt")
                        .exists())
                .andExpect(jsonPath("$.expiresAt")
                        .exists())
                .andExpect(jsonPath("$.status",
                        is("ACTIVE")))
                .andExpect(jsonPath("$.user.email",
                        is(email)))
                .andExpect(jsonPath("$.user.displayName",
                        is("Auth Test User")))
                .andExpect(jsonPath("$.user.roles",
                        hasItem("ATTENDEE")));
    }

    @Test
    void loginShouldRejectInvalidPassword()
            throws Exception {

        mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "WrongPassword"
                                }
                                """.formatted(email)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginShouldRejectUnknownEmail()
            throws Exception {

        mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "does-not-exist@example.com",
                                  "password": "%s"
                                }
                                """.formatted(password)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meShouldReturnCurrentSession()
            throws Exception {

        AuthSession session =
                new AuthSession(
                        userRepository
                                .findByEmail(email)
                                .orElseThrow()
                                .getId(),
                        Instant.now()
                                .plus(Duration.ofHours(8)));

        session =
                authSessionRepository.save(session);

        mockMvc.perform(
                get("/api/auth/me")
                        .header(
                                "X-Session-Id",
                                session.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId",
                        is(session.getId().toString())))
                .andExpect(jsonPath("$.status",
                        is("ACTIVE")))
                .andExpect(jsonPath("$.user.email",
                        is(email)))
                .andExpect(jsonPath("$.user.roles",
                        hasItem("ATTENDEE")));
    }

    @Test
    void meShouldRejectMissingSession()
            throws Exception {

        mockMvc.perform(
                get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meShouldRejectInvalidSession()
            throws Exception {

        mockMvc.perform(
                get("/api/auth/me")
                        .header(
                                "X-Session-Id",
                                UUID.randomUUID().toString()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logoutShouldRevokeSession()
            throws Exception {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow();

        AuthSession session =
                new AuthSession(
                        user.getId(),
                        Instant.now()
                                .plus(Duration.ofHours(8)));

        session =
                authSessionRepository.save(session);

        mockMvc.perform(
                post("/api/auth/logout")
                        .header(
                                "X-Session-Id",
                                session.getId().toString()))
                .andExpect(status().isNoContent());

        AuthSession revoked =
                authSessionRepository
                        .findById(session.getId())
                        .orElseThrow();

        org.junit.jupiter.api.Assertions.assertEquals(
                AuthSessionStatus.REVOKED,
                revoked.getStatus());
    }

    @Test
    void meShouldRejectRevokedSession()
            throws Exception {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow();

        AuthSession session =
                new AuthSession(
                        user.getId(),
                        Instant.now()
                                .plus(Duration.ofHours(8)));

        session.setStatus(
                AuthSessionStatus.REVOKED);

        session =
                authSessionRepository.save(session);

        mockMvc.perform(
                get("/api/auth/me")
                        .header(
                                "X-Session-Id",
                                session.getId().toString()))
                .andExpect(status().isUnauthorized());
    }
}
