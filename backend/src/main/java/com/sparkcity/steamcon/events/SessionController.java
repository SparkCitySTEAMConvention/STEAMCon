package com.sparkcity.steamcon.events;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionRepository sessionRepository;

    public SessionController(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @GetMapping
    public ResponseEntity<List<SessionResponse>> getAllSessions() {

        List<SessionResponse> sessions = sessionRepository.findAll()
                .stream()
                .map(SessionResponse::from)
                .toList();

        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionResponse> getSession(
            @PathVariable UUID id) {

        return sessionRepository.findById(id)
                .map(session -> ResponseEntity.ok(
                        SessionResponse.from(session)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SessionResponse> createSession(
            @Valid @RequestBody CreateSessionRequest request) {

        Session session = new Session();

        session.setTitle(request.title());
        session.setDescription(request.description());
        session.setTrackId(request.trackId());
        session.setMandatory(request.mandatory());

        Session savedSession = sessionRepository.save(session);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SessionResponse.from(savedSession));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionResponse> updateSession(
            @PathVariable UUID id,
            @Valid @RequestBody CreateSessionRequest request) {

        return sessionRepository.findById(id)
                .map(session -> {

                    session.setTitle(request.title());
                    session.setDescription(request.description());
                    session.setTrackId(request.trackId());
                    session.setMandatory(request.mandatory());

                    Session updatedSession =
                            sessionRepository.save(session);

                    return ResponseEntity.ok(
                            SessionResponse.from(updatedSession));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(
            @PathVariable UUID id) {

        if (!sessionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        sessionRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}