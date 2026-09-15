package com.sparkcity.steamcon.booking;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<TravelLeg> createTravelLeg(
            @RequestBody CreateTravelLegRequest request) {

        TravelLeg travelLeg = bookingService.bookTravelLeg(
                request.userId(),
                request.origin(),
                request.destination(),
                request.departureAt(),
                request.arrivalAt());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(travelLeg);
    }
}
