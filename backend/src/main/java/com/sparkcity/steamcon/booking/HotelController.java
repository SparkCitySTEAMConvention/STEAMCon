package com.sparkcity.steamcon.booking;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final BookingService bookingService;

    public HotelController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<Hotel>> getHotels() {

        return ResponseEntity.ok(bookingService.getHotels());
    }
}
