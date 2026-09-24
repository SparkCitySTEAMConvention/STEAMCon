package com.sparkcity.steamcon.communication;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationRepository
            notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository) {

        this.notificationRepository =
                notificationRepository;
    }

    public Notification createNotification(
            UUID userId,
            String message,
            NotificationType type) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "Notification user ID is required");
        }

        if (message == null
                || message.isBlank()) {

            throw new IllegalArgumentException(
                    "Notification message cannot be empty");
        }

        Notification notification =
                new Notification();

        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setType(type);

        return notificationRepository
                .save(notification);
    }

    public List<Notification>
            getNotificationsForUser(
                    UUID userId) {

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId);
    }

    public Notification markAsRead(
            UUID notificationId,
            UUID userId) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found"));

        if (!userId.equals(
                notification.getUserId())) {

            throw new IllegalArgumentException(
                    "Notification does not belong to authenticated user");
        }

        notification.setRead(true);

        return notificationRepository
                .save(notification);
    }

    /*
     * Kept temporarily so existing unit tests/services
     * do not break.
     */
    public Notification markAsRead(
            UUID notificationId) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found"));

        notification.setRead(true);

        return notificationRepository
                .save(notification);
    }
}