package com.sparkcity.steamcon.communication;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService
            notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService =
                notificationService;
    }

    @GetMapping("/me")
    public ResponseEntity<List<Notification>>
            getMyNotifications(
                    Authentication authentication) {

        UUID userId =
                (UUID)
                        authentication
                                .getPrincipal();

        return ResponseEntity.ok(
                notificationService
                        .getNotificationsForUser(
                                userId));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Notification>
            markAsRead(
                    @PathVariable UUID id,
                    Authentication authentication) {

        UUID userId =
                (UUID)
                        authentication
                                .getPrincipal();

        return ResponseEntity.ok(
                notificationService
                        .markAsRead(
                                id,
                                userId));
    }
}