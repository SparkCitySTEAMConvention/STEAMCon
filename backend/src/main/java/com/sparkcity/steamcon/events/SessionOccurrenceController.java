package com.sparkcity.steamcon.events;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/session-occurrences")
public class SessionOccurrenceController {

    private final SessionOccurrenceRepository occurrenceRepository;

    public SessionOccurrenceController(
            SessionOccurrenceRepository occurrenceRepository) {

        this.occurrenceRepository = occurrenceRepository;
    }

    @GetMapping
    public ResponseEntity<List<SessionOccurrenceResponse>>
            getAllOccurrences() {

        List<SessionOccurrenceResponse> occurrences =
                occurrenceRepository.findAll()
                        .stream()
                        .map(SessionOccurrenceResponse::from)
                        .toList();

        return ResponseEntity.ok(occurrences);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionOccurrenceResponse>
            getOccurrence(@PathVariable UUID id) {

        return occurrenceRepository.findById(id)
                .map(occurrence -> ResponseEntity.ok(
                        SessionOccurrenceResponse.from(occurrence)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SessionOccurrenceResponse>
            createOccurrence(
                    @Valid @RequestBody
                    CreateSessionOccurrenceRequest request) {

        SessionOccurrence occurrence =
                new SessionOccurrence();

        occurrence.setSessionId(request.sessionId());
        occurrence.setStartsAt(request.startsAt());
        occurrence.setEndsAt(request.endsAt());

        SessionOccurrence savedOccurrence =
                occurrenceRepository.save(occurrence);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SessionOccurrenceResponse.from(
                        savedOccurrence));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionOccurrenceResponse>
            updateOccurrence(
                    @PathVariable UUID id,
                    @Valid @RequestBody
                    CreateSessionOccurrenceRequest request) {

        return occurrenceRepository.findById(id)
                .map(occurrence -> {

                    occurrence.setSessionId(
                            request.sessionId());

                    occurrence.setStartsAt(
                            request.startsAt());

                    occurrence.setEndsAt(
                            request.endsAt());

                    SessionOccurrence updatedOccurrence =
                            occurrenceRepository.save(occurrence);

                    return ResponseEntity.ok(
                            SessionOccurrenceResponse.from(
                                    updatedOccurrence));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOccurrence(
            @PathVariable UUID id) {

        if (!occurrenceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        occurrenceRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}