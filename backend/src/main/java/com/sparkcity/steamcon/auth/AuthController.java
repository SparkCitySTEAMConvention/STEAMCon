package com.sparkcity.steamcon.auth;

import com.sparkcity.steamcon.identity.User;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {

        AuthResponse response =
                authService.login(
                        request.email(),
                        request.password());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(
            HttpServletRequest request) {

        UUID sessionId =
                parseSessionId(request);

        return ResponseEntity.ok(
                authService.getCurrentSession(sessionId));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request) {

        UUID sessionId =
                parseSessionId(request);

        authService.logout(sessionId);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @RequestBody RegisterRequest request) {

        User user =
                authService.register(
                        request.email(),
                        request.displayName(),
                        request.password());

        return ResponseEntity.ok(
                UserResponse.from(
                        user,
                        List.of()));
    }

    private UUID parseSessionId(
            HttpServletRequest request) {

        String header =
                request.getHeader("X-Session-Id");

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
            String password
    ) {}

    public record RegisterRequest(
            String email,
            String displayName,
            String password
    ) {}
}
