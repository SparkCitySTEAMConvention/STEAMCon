package com.sparkcity.steamcon.booking;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/travel-legs")
public class TravelLegController {

    private final BookingService bookingService;

    public TravelLegController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/me")
    public ResponseEntity<List<TravelLeg>> getMyTravelLegs(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(bookingService.getTravelLegsForUser(userId));
    }

    @PostMapping
    public ResponseEntity<TravelLeg> createTravelLeg(
            @RequestBody CreateTravelLegRequest request,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        TravelLeg travelLeg = bookingService.bookTravelLeg(
                userId, request.origin(), request.destination(), request.departureAt(), request.arrivalAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(travelLeg);
    }
}
