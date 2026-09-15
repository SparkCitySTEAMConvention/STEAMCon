package com.sparkcity.steamcon.booking;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hotel-reservations")
public class HotelReservationController {

    private final BookingService bookingService;

    public HotelReservationController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<HotelReservation> createHotelReservation(
            @RequestBody CreateHotelReservationRequest request) {

        HotelReservation reservation = bookingService.bookHotelReservation(
                request.userId(),
                request.hotelId(),
                request.checkIn(),
                request.checkOut());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(reservation);
    }
}
