package com.sparkcity.steamcon.events;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tracks")
public class TrackController {

    private final TrackRepository trackRepository;

    public TrackController(TrackRepository trackRepository) {
        this.trackRepository = trackRepository;
    }

    @GetMapping
    public ResponseEntity<List<TrackResponse>> getAllTracks() {

        List<TrackResponse> tracks = trackRepository.findAll()
                .stream()
                .map(TrackResponse::from)
                .toList();

        return ResponseEntity.ok(tracks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrackResponse> getTrack(
            @PathVariable UUID id) {

        return trackRepository.findById(id)
                .map(track -> ResponseEntity.ok(
                        TrackResponse.from(track)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TrackResponse> createTrack(
            @Valid @RequestBody CreateTrackRequest request) {

        Track track = new Track(request.name());
        track.setDescription(request.description());

        Track savedTrack = trackRepository.save(track);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(TrackResponse.from(savedTrack));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrackResponse> updateTrack(
            @PathVariable UUID id,
            @Valid @RequestBody CreateTrackRequest request) {

        return trackRepository.findById(id)
                .map(track -> {

                    track.setName(request.name());
                    track.setDescription(request.description());

                    Track updatedTrack =
                            trackRepository.save(track);

                    return ResponseEntity.ok(
                            TrackResponse.from(updatedTrack));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrack(
            @PathVariable UUID id) {

        if (!trackRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        trackRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}