package com.sparkcity.steamcon.events;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
            @Valid @RequestBody CreateEnrollmentRequest request) {

        AttendeeSessionEnrollment enrollment =
                enrollmentService.enroll(
                        request.attendeeId(),
                        request.sessionId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(EnrollmentResponse.from(enrollment));
    }

    @DeleteMapping
    public ResponseEntity<Void> cancelEnrollment(
            @RequestParam UUID attendeeId,
            @RequestParam UUID sessionId) {

        enrollmentService.cancelEnrollment(attendeeId, sessionId);

        return ResponseEntity.noContent().build();
    }
}