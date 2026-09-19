package com.sparkcity.steamcon.events;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final AttendeeSessionEnrollmentService enrollmentService;

    public EnrollmentController(
            AttendeeSessionEnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public ResponseEntity<EnrollmentResponse> enroll(
            @Valid @RequestBody CreateEnrollmentRequest request,
            Authentication authentication) {

        UUID authenticatedUserId =
                getAuthenticatedUserId(authentication);

        AttendeeSessionEnrollment enrollment =
                enrollmentService.enroll(
                        authenticatedUserId,
                        request.sessionOccurrenceId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(EnrollmentResponse.from(enrollment));
    }

    @DeleteMapping
    public ResponseEntity<Void> cancelEnrollment(
            @RequestParam UUID attendeeId,
            @RequestParam UUID sessionId) {

        enrollmentService.cancelEnrollment(
                attendeeId,
                sessionId);

        return ResponseEntity.noContent().build();
    }

    private UUID getAuthenticatedUserId(
            Authentication authentication) {

        if (authentication == null
                || authentication.getPrincipal() == null) {

            throw new IllegalStateException(
                    "Authenticated user is required");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UUID userId) {
            return userId;
        }

        try {
            return UUID.fromString(
                    principal.toString());

        } catch (IllegalArgumentException exception) {

            throw new IllegalStateException(
                    "Invalid authenticated user ID");
        }
    }
}