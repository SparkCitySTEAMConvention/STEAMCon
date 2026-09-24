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
@RequestMapping("/api/hotel-reservations")
public class HotelReservationController {
    private final BookingService bookingService;
    public HotelReservationController(BookingService bookingService) { this.bookingService = bookingService; }

    @GetMapping("/me")
    public ResponseEntity<List<HotelReservation>> getMyHotelReservations(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(bookingService.getHotelReservationsForUser(userId));
    }

    @PostMapping
    public ResponseEntity<HotelReservation> createHotelReservation(
            @RequestBody CreateHotelReservationRequest request, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        HotelReservation reservation = bookingService.bookHotelReservation(
                userId, request.hotelId(), request.checkIn(), request.checkOut());
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }
}
