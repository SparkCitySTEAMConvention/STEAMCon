package com.sparkcity.steamcon.auth;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sparkcity.steamcon.identity.Role;
import com.sparkcity.steamcon.identity.User;
import com.sparkcity.steamcon.identity.UserRole;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        private final AuthService authService;

        public AuthController(AuthService authService) {
                this.authService = authService;
        }

        public record ProfileImageRequest(
                        String profileImageUrl) {
        }

        @PostMapping("/login")
        public ResponseEntity<AuthResponse> login(
                        @RequestBody LoginRequest request) {

                AuthResponse response = authService.login(
                                request.email(),
                                request.password());

                return ResponseEntity.ok(response);
        }

        @GetMapping("/me")
        public ResponseEntity<AuthResponse> me(
                        HttpServletRequest request) {

                UUID sessionId = parseSessionId(request);

                return ResponseEntity.ok(
                                authService.getCurrentSession(sessionId));
        }

        @PatchMapping("/me/profile-image")
        public ResponseEntity<UserResponse> updateProfileImage(
                        HttpServletRequest request,
                        @RequestBody ProfileImageRequest body) {

                UUID sessionId = parseSessionId(request);

                AuthResponse session = authService.getCurrentSession(sessionId);

                return ResponseEntity.ok(
                                authService.updateProfileImage(
                                                session.user().id(),
                                                body.profileImageUrl()));
        }

        @PostMapping("/logout")
        public ResponseEntity<Void> logout(
                        HttpServletRequest request) {

                UUID sessionId = parseSessionId(request);

                authService.logout(sessionId);

                return ResponseEntity.noContent().build();
        }

        @PostMapping("/register")
        public ResponseEntity<UserResponse> register(
                        @RequestBody RegisterRequest request) {

                Role requestedRole = "SPEAKER".equalsIgnoreCase(request.role())
                                ? Role.SPEAKER
                                : Role.ATTENDEE;

                User user = authService.register(
                                request.email(),
                                request.displayName(),
                                request.password(),
                                requestedRole);

                List<UserRole> roles = requestedRole == Role.SPEAKER
                                ? List.of(
                                                new UserRole(user, Role.SPEAKER),
                                                new UserRole(user, Role.ATTENDEE))
                                : List.of(new UserRole(user, Role.ATTENDEE));

                return ResponseEntity.ok(UserResponse.from(user, roles));
        }

        private UUID parseSessionId(
                        HttpServletRequest request) {

                String header = request.getHeader("X-Session-Id");

                if (header == null || header.isBlank()) {
                        throw new InvalidSessionException();
                }

                try {
                        return UUID.fromString(header);
                } catch (IllegalArgumentException exception) {
                        throw new InvalidSessionException();
                }
        }

        public record LoginRequest(
                        String email,
                        String password) {
        }

        public record RegisterRequest(
                        String email,
                        String displayName,
                        String password,
                        String role) {
        }
}
