package com.sparkcity.steamcon.communication;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sparkcity.steamcon.identity.Role;

@RestController
@RequestMapping("/api")
public class CommunicationController {

    private final CommunicationService communicationService;

    public CommunicationController(
            CommunicationService communicationService) {

        this.communicationService =
                communicationService;
    }

    @GetMapping("/forums")
    public ResponseEntity<List<Forum>> getForums(
            @RequestParam(required = false)
            ForumScope scope) {

        if (scope != null) {
            return ResponseEntity.ok(
                    communicationService
                            .getForumsByScope(scope));
        }

        return ResponseEntity.ok(
                communicationService.getForums());
    }

    @GetMapping("/forums/{id}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable UUID id,
            Authentication authentication) {

        List<Role> roles =
                getAuthenticatedRoles(
                        authentication);

        return ResponseEntity.ok(
                communicationService
                        .getMessagesForForum(
                                id,
                                roles,
                                ForumPermission.READ));
    }

    @PostMapping("/forums/{id}/messages")
    public ResponseEntity<Message> createMessage(
            @PathVariable UUID id,
            @RequestBody
            CreateMessageRequest request,
            Authentication authentication) {

        UUID userId =
                getAuthenticatedUserId(
                        authentication);

        List<Role> roles =
                getAuthenticatedRoles(
                        authentication);

        Message message =
                communicationService.createMessage(
                        id,
                        userId,
                        request.body(),
                        roles);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(message);
    }

    private UUID getAuthenticatedUserId(
            Authentication authentication) {

        if (authentication == null
                || authentication.getPrincipal()
                        == null) {

            throw new IllegalStateException(
                    "Authenticated user is required");
        }

        return (UUID)
                authentication.getPrincipal();
    }

    private List<Role> getAuthenticatedRoles(
            Authentication authentication) {

        if (authentication == null) {
            throw new IllegalStateException(
                    "Authenticated user is required");
        }

        return authentication
                .getAuthorities()
                .stream()
                .map(authority ->
                        authority.getAuthority())
                .filter(authority ->
                        authority.startsWith(
                                "ROLE_"))
                .map(authority ->
                        authority.substring(
                                "ROLE_".length()))
                .map(Role::valueOf)
                .toList();
    }
}