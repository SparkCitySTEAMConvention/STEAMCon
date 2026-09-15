package com.sparkcity.steamcon.auth;

import com.sparkcity.steamcon.identity.AuthSession;
import com.sparkcity.steamcon.identity.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthSession login(@RequestBody LoginRequest request) {
        return authService.login(request.email(), request.password());
    }

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {

        User user = authService.register(
                request.email(),
                request.displayName(),
                request.password()
        );

        return UserResponse.from(user);
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