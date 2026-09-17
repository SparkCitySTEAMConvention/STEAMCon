package com.sparkcity.steamcon.calendar;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.sparkcity.steamcon.booking.CarRental;
import com.sparkcity.steamcon.booking.CarRentalRepository;
import com.sparkcity.steamcon.booking.HotelReservation;
import com.sparkcity.steamcon.booking.HotelReservationRepository;
import com.sparkcity.steamcon.booking.TravelLeg;
import com.sparkcity.steamcon.booking.TravelLegRepository;

class CalendarServiceTest {

    @Mock
    private TravelLegRepository travelLegRepository;

    @Mock
    private CarRentalRepository carRentalRepository;

    @Mock
    private HotelReservationRepository hotelReservationRepository;

    private CalendarService calendarService;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        calendarService = new CalendarService(
                travelLegRepository,
                carRentalRepository,
                hotelReservationRepository);
    }

    @Test
    void getItineraryForUserShouldReturnEmptyListWhenNothingBooked() {

        UUID userId = UUID.randomUUID();

        when(travelLegRepository.findByUserId(userId))
                .thenReturn(List.of());
        when(carRentalRepository.findByUserId(userId))
                .thenReturn(List.of());
        when(hotelReservationRepository.findByUserId(userId))
                .thenReturn(List.of());

        List<ItineraryEntryResponse> result =
                calendarService.getItineraryForUser(userId);

        assertTrue(result.isEmpty());
    }

    @Test
    void getItineraryForUserShouldAggregateAndSortAllBookingTypes() {

        UUID userId = UUID.randomUUID();
        Instant now = Instant.now();

        TravelLeg travelLeg = new TravelLeg();
        travelLeg.setUserId(userId);
        travelLeg.setDepartureAt(now.plusSeconds(30_000));
        travelLeg.setArrivalAt(now.plusSeconds(33_600));

        CarRental carRental = new CarRental();
        carRental.setUserId(userId);
        carRental.setPickupAt(now.plusSeconds(3_600));
        carRental.setDropoffAt(now.plusSeconds(7_200));

        HotelReservation hotelReservation = new HotelReservation();
        hotelReservation.setUserId(userId);
        hotelReservation.setHotelId(UUID.randomUUID());
        hotelReservation.setCheckin(now);
        hotelReservation.setCheckOut(now.plusSeconds(86_400));

        when(travelLegRepository.findByUserId(userId))
                .thenReturn(List.of(travelLeg));
        when(carRentalRepository.findByUserId(userId))
                .thenReturn(List.of(carRental));
        when(hotelReservationRepository.findByUserId(userId))
                .thenReturn(List.of(hotelReservation));

        List<ItineraryEntryResponse> result =
                calendarService.getItineraryForUser(userId);

        assertEquals(3, result.size());

        // Sorted by startsAt: hotel check-in, then car pickup, then travel departure.
        assertEquals(ItineraryEntryType.HOTEL, result.get(0).entryType());
        assertEquals(ItineraryEntryType.CAR_RENTAL, result.get(1).entryType());
        assertEquals(ItineraryEntryType.TRAVEL, result.get(2).entryType());
    }

    @Test
    void getItineraryForUserShouldMapHotelReservationFieldsCorrectly() {

        UUID userId = UUID.randomUUID();
        UUID hotelId = UUID.randomUUID();
        Instant checkIn = Instant.now();
        Instant checkOut = checkIn.plusSeconds(86_400);

        HotelReservation hotelReservation = new HotelReservation();
        hotelReservation.setUserId(userId);
        hotelReservation.setHotelId(hotelId);
        hotelReservation.setCheckin(checkIn);
        hotelReservation.setCheckOut(checkOut);

        when(travelLegRepository.findByUserId(userId))
                .thenReturn(List.of());
        when(carRentalRepository.findByUserId(userId))
                .thenReturn(List.of());
        when(hotelReservationRepository.findByUserId(userId))
                .thenReturn(List.of(hotelReservation));

        List<ItineraryEntryResponse> result =
                calendarService.getItineraryForUser(userId);

        ItineraryEntryResponse entry = result.get(0);

        assertEquals(ItineraryEntryType.HOTEL, entry.entryType());
        assertEquals(checkIn, entry.startsAt());
        assertEquals(checkOut, entry.endsAt());
    }
}
