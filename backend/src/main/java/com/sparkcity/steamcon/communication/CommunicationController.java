package com.sparkcity.steamcon.communication;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CommunicationController {

    private final CommunicationService communicationService;

    public CommunicationController(
            CommunicationService communicationService) {

        this.communicationService = communicationService;
    }

    @GetMapping("/forums")
    public ResponseEntity<List<Forum>> getForums(
            @RequestParam(required = false) ForumScope scope) {

        if (scope != null) {
            return ResponseEntity.ok(
                    communicationService.getForumsByScope(scope));
        }

        return ResponseEntity.ok(
                communicationService.getForums());
    }

    @GetMapping("/forums/{id}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                communicationService.getMessagesForForum(id));
    }

    @PostMapping("/forums/{id}/messages")
    public ResponseEntity<Message> createMessage(
            @PathVariable UUID id,
            @RequestBody CreateMessageRequest request) {

        Message message =
                communicationService.createMessage(
                        id,
                        request.authorId(),
                        request.body(),
                        request.speakerFlairId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(message);
    }
}