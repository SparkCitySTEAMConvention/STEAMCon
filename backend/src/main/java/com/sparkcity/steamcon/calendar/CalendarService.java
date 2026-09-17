package com.sparkcity.steamcon.calendar;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.sparkcity.steamcon.booking.CarRentalRepository;
import com.sparkcity.steamcon.booking.HotelReservationRepository;
import com.sparkcity.steamcon.booking.TravelLegRepository;

@Service
public class CalendarService {

    private final TravelLegRepository travelLegRepository;
    private final CarRentalRepository carRentalRepository;
    private final HotelReservationRepository hotelReservationRepository;

    public CalendarService(
            TravelLegRepository travelLegRepository,
            CarRentalRepository carRentalRepository,
            HotelReservationRepository hotelReservationRepository) {

        this.travelLegRepository = travelLegRepository;
        this.carRentalRepository = carRentalRepository;
        this.hotelReservationRepository = hotelReservationRepository;
    }

    public List<ItineraryEntryResponse> getItineraryForUser(
            UUID userId) {

        List<ItineraryEntryResponse> entries = new ArrayList<>();

        travelLegRepository.findByUserId(userId).stream()
                .map(ItineraryEntryResponse::fromTravelLeg)
                .forEach(entries::add);

        carRentalRepository.findByUserId(userId).stream()
                .map(ItineraryEntryResponse::fromCarRental)
                .forEach(entries::add);

        hotelReservationRepository.findByUserId(userId).stream()
                .map(ItineraryEntryResponse::fromHotelReservation)
                .forEach(entries::add);

        entries.addAll(resolveSessionEntries(userId));

        entries.sort(Comparator.comparing(
                ItineraryEntryResponse::startsAt));

        return entries;
    }

    // Domain 4 (Enrollment) links an enrollment to a Session, not a
    // specific SessionOccurrence, so there is currently no startsAt/endsAt
    // to resolve here. Pending a decision with Backend B on how enrollments
    // resolve to an occurrence's time (see Domain 8 coordination note).
    private List<ItineraryEntryResponse> resolveSessionEntries(
            UUID userId) {

        return List.of();
    }
}
