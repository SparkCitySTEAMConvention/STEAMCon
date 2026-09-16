package com.sparkcity.steamcon.auth;

import com.sparkcity.steamcon.identity.AuthSession;
import com.sparkcity.steamcon.identity.AuthSessionRepository;
import com.sparkcity.steamcon.identity.AuthSessionStatus;
import com.sparkcity.steamcon.identity.Role;
import com.sparkcity.steamcon.identity.User;
import com.sparkcity.steamcon.identity.UserRepository;
import com.sparkcity.steamcon.identity.UserRole;
import com.sparkcity.steamcon.identity.UserRoleRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final AuthSessionRepository authSessionRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            UserRoleRepository userRoleRepository,
            AuthSessionRepository authSessionRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.authSessionRepository = authSessionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse login(
            String email,
            String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(
                password,
                user.getPasswordHash())) {

            throw new InvalidCredentialsException();
        }

        Instant expiresAt =
                Instant.now().plus(Duration.ofHours(8));

        AuthSession session =
                new AuthSession(user.getId(), expiresAt);

        AuthSession savedSession =
                authSessionRepository.save(session);

        List<UserRole> roles =
                userRoleRepository
                        .findByUserIdAndActiveTrue(user.getId());

        return AuthResponse.from(
                savedSession,
                user,
                roles);
    }

    @Transactional
    public User register(
            String email,
            String displayName,
            String password) {

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException(
                    "Email is already registered");
        }

        String passwordHash =
                passwordEncoder.encode(password);

        User user =
                new User(
                        email,
                        displayName,
                        passwordHash);

        User savedUser =
                userRepository.save(user);

        UserRole attendeeRole =
                new UserRole(
                        savedUser,
                        Role.ATTENDEE);

        userRoleRepository.save(attendeeRole);

        return savedUser;
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentSession(
            UUID sessionId) {

        AuthSession session =
                authSessionRepository
                        .findByIdAndStatus(
                                sessionId,
                                AuthSessionStatus.ACTIVE)
                        .orElseThrow(
                                InvalidSessionException::new);

        if (!session.getExpiresAt()
                .isAfter(Instant.now())) {

            throw new InvalidSessionException();
        }

        User user =
                userRepository.findById(
                        session.getUserId())
                        .orElseThrow(
                                InvalidSessionException::new);

        List<UserRole> roles =
                userRoleRepository
                        .findByUserIdAndActiveTrue(
                                user.getId());

        return AuthResponse.from(
                session,
                user,
                roles);
    }

    @Transactional
    public void logout(UUID sessionId) {

        AuthSession session =
                authSessionRepository
                        .findByIdAndStatus(
                                sessionId,
                                AuthSessionStatus.ACTIVE)
                        .orElseThrow(
                                InvalidSessionException::new);

        session.setStatus(
                AuthSessionStatus.REVOKED);

        authSessionRepository.save(session);
    }
}
