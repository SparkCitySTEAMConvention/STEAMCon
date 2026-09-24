package com.sparkcity.steamcon.calendar;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/me")
    public ResponseEntity<List<ItineraryEntryResponse>> getMyItinerary(
            Authentication authentication) {

        UUID userId = (UUID) authentication.getPrincipal();

        return ResponseEntity.ok(
                calendarService.getItineraryForUser(userId));
    }
}
