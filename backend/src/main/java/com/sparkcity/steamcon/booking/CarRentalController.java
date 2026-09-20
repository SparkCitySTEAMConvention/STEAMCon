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
@RequestMapping("/api/car-rentals")
public class CarRentalController {
    private final BookingService bookingService;
    public CarRentalController(BookingService bookingService) { this.bookingService = bookingService; }

    @GetMapping("/me")
    public ResponseEntity<List<CarRental>> getMyCarRentals(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(bookingService.getCarRentalsForUser(userId));
    }

    @PostMapping
    public ResponseEntity<CarRental> createCarRental(
            @RequestBody CreateCarRentalRequest request, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CarRental carRental = bookingService.bookCarRental(
                userId, request.pickupAt(), request.dropoffAt(), request.pickupLocation(), request.dropoffLocation());
        return ResponseEntity.status(HttpStatus.CREATED).body(carRental);
    }
}
