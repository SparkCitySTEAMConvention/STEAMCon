package com.sparkcity.steamcon.communication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        notificationService =
                new NotificationService(
                        notificationRepository);
    }

    @Test
    void createNotificationShouldSaveNotification() {

        UUID userId = UUID.randomUUID();

        when(notificationRepository
                .save(any(Notification.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Notification result =
                notificationService.createNotification(
                        userId,
                        "Your proposal was approved.",
                        NotificationType.PROPOSAL_APPROVED);

        assertNotNull(result);

        assertEquals(
                userId,
                result.getUserId());

        assertEquals(
                "Your proposal was approved.",
                result.getMessage());

        assertEquals(
                NotificationType.PROPOSAL_APPROVED,
                result.getType());

        assertFalse(result.isRead());

        verify(notificationRepository)
                .save(any(Notification.class));
    }

    @Test
    void createNotificationShouldRejectBlankMessage() {

        assertThrows(
                IllegalArgumentException.class,
                () -> notificationService
                        .createNotification(
                                UUID.randomUUID(),
                                "   ",
                                NotificationType.GENERAL));
    }

    @Test
    void getNotificationsShouldReturnUserNotifications() {

        UUID userId = UUID.randomUUID();

        Notification notification =
                new Notification();

        notification.setUserId(userId);
        notification.setMessage(
                "Proposal updated.");

        when(notificationRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId))
                .thenReturn(List.of(notification));

        List<Notification> result =
                notificationService
                        .getNotificationsForUser(
                                userId);

        assertEquals(1, result.size());

        assertEquals(
                userId,
                result.get(0).getUserId());
    }

    @Test
    void markAsReadShouldUpdateNotification() {

        UUID notificationId =
                UUID.randomUUID();

        Notification notification =
                new Notification();

        notification.setRead(false);

        when(notificationRepository
                .findById(notificationId))
                .thenReturn(
                        Optional.of(notification));

        when(notificationRepository
                .save(notification))
                .thenReturn(notification);

        Notification result =
                notificationService
                        .markAsRead(
                                notificationId);

        assertTrue(result.isRead());

        verify(notificationRepository)
                .save(notification);
    }

    @Test
    void markAsReadShouldThrowWhenMissing() {

        UUID notificationId =
                UUID.randomUUID();

        when(notificationRepository
                .findById(notificationId))
                .thenReturn(Optional.empty());

        assertThrows(
                IllegalArgumentException.class,
                () -> notificationService
                        .markAsRead(
                                notificationId));
    }
}