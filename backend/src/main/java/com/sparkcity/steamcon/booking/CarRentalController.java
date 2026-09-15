package com.sparkcity.steamcon.booking;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/car-rentals")
public class CarRentalController {

    private final BookingService bookingService;

    public CarRentalController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<CarRental> createCarRental(
            @RequestBody CreateCarRentalRequest request) {

        CarRental carRental = bookingService.bookCarRental(
                request.userId(),
                request.pickupAt(),
                request.dropoffAt(),
                request.pickupLocation(),
                request.dropoffLocation());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(carRental);
    }
}
