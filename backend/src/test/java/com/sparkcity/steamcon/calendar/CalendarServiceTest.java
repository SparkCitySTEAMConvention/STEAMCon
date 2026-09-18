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
import org.springframework.test.util.ReflectionTestUtils;

import com.sparkcity.steamcon.booking.CarRental;
import com.sparkcity.steamcon.booking.CarRentalRepository;
import com.sparkcity.steamcon.booking.HotelReservation;
import com.sparkcity.steamcon.booking.HotelReservationRepository;
import com.sparkcity.steamcon.booking.TravelLeg;
import com.sparkcity.steamcon.booking.TravelLegRepository;
import com.sparkcity.steamcon.events.AttendeeSessionEnrollment;
import com.sparkcity.steamcon.events.AttendeeSessionEnrollmentRepository;
import com.sparkcity.steamcon.events.EnrollmentStatus;
import com.sparkcity.steamcon.events.SessionOccurrence;
import com.sparkcity.steamcon.events.SessionOccurrenceRepository;

class CalendarServiceTest {

    @Mock
    private TravelLegRepository travelLegRepository;

    @Mock
    private CarRentalRepository carRentalRepository;

    @Mock
    private HotelReservationRepository hotelReservationRepository;

    @Mock
    private AttendeeSessionEnrollmentRepository enrollmentRepository;

    @Mock
    private SessionOccurrenceRepository sessionOccurrenceRepository;

    private CalendarService calendarService;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        calendarService = new CalendarService(
                travelLegRepository,
                carRentalRepository,
                hotelReservationRepository,
                enrollmentRepository,
                sessionOccurrenceRepository);
    }

    private static SessionOccurrence sessionOccurrence(
            UUID id,
            Instant startsAt,
            Instant endsAt) {

        SessionOccurrence occurrence = new SessionOccurrence();
        ReflectionTestUtils.setField(occurrence, "id", id);
        occurrence.setSessionId(UUID.randomUUID());
        occurrence.setStartsAt(startsAt);
        occurrence.setEndsAt(endsAt);

        return occurrence;
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
        when(enrollmentRepository.findByAttendeeIdAndStatus(
                userId, EnrollmentStatus.ENROLLED))
                .thenReturn(List.of());

        List<ItineraryEntryResponse> result =
                calendarService.getItineraryForUser(userId);

        assertTrue(result.isEmpty());
    }

    @Test
    void getItineraryForUserShouldSkipSessionEntriesWhenNoEnrollments() {

        UUID userId = UUID.randomUUID();
        Instant now = Instant.now();

        TravelLeg travelLeg = new TravelLeg();
        travelLeg.setUserId(userId);
        travelLeg.setDepartureAt(now);
        travelLeg.setArrivalAt(now.plusSeconds(3_600));

        when(travelLegRepository.findByUserId(userId))
                .thenReturn(List.of(travelLeg));
        when(carRentalRepository.findByUserId(userId))
                .thenReturn(List.of());
        when(hotelReservationRepository.findByUserId(userId))
                .thenReturn(List.of());
        when(enrollmentRepository.findByAttendeeIdAndStatus(
                userId, EnrollmentStatus.ENROLLED))
                .thenReturn(List.of());

        List<ItineraryEntryResponse> result =
                calendarService.getItineraryForUser(userId);

        assertEquals(1, result.size());
        assertEquals(ItineraryEntryType.TRAVEL, result.get(0).entryType());
    }

    @Test
    void getItineraryForUserShouldMapSingleEnrollmentToSessionEntry() {

        UUID userId = UUID.randomUUID();
        UUID occurrenceId = UUID.randomUUID();
        Instant startsAt = Instant.now().plusSeconds(3_600);
        Instant endsAt = startsAt.plusSeconds(1_800);

        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(
                        userId,
                        UUID.randomUUID(),
                        occurrenceId);

        SessionOccurrence occurrence =
                sessionOccurrence(occurrenceId, startsAt, endsAt);

        when(travelLegRepository.findByUserId(userId))
                .thenReturn(List.of());
        when(carRentalRepository.findByUserId(userId))
                .thenReturn(List.of());
        when(hotelReservationRepository.findByUserId(userId))
                .thenReturn(List.of());
        when(enrollmentRepository.findByAttendeeIdAndStatus(
                userId, EnrollmentStatus.ENROLLED))
                .thenReturn(List.of(enrollment));
        when(sessionOccurrenceRepository.findAllById(
                List.of(occurrenceId)))
                .thenReturn(List.of(occurrence));

        List<ItineraryEntryResponse> result =
                calendarService.getItineraryForUser(userId);

        assertEquals(1, result.size());

        ItineraryEntryResponse entry = result.get(0);

        assertEquals(ItineraryEntryType.SESSION, entry.entryType());
        assertEquals(occurrenceId, entry.sourceId());
        assertEquals(startsAt, entry.startsAt());
        assertEquals(endsAt, entry.endsAt());
    }

    @Test
    void getItineraryForUserShouldInterleaveSessionWithOtherBookingTypes() {

        UUID userId = UUID.randomUUID();
        Instant now = Instant.now();

        // Sorted order should be: session (now), hotel (+1h),
        // car rental (+2h), travel (+3h).
        UUID occurrenceId = UUID.randomUUID();
        SessionOccurrence occurrence = sessionOccurrence(
                occurrenceId,
                now,
                now.plusSeconds(1_800));

        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(
                        userId,
                        UUID.randomUUID(),
                        occurrenceId);

        HotelReservation hotelReservation = new HotelReservation();
        hotelReservation.setUserId(userId);
        hotelReservation.setHotelId(UUID.randomUUID());
        hotelReservation.setCheckin(now.plusSeconds(3_600));
        hotelReservation.setCheckOut(now.plusSeconds(7_200));

        CarRental carRental = new CarRental();
        carRental.setUserId(userId);
        carRental.setPickupAt(now.plusSeconds(7_200));
        carRental.setDropoffAt(now.plusSeconds(10_800));

        TravelLeg travelLeg = new TravelLeg();
        travelLeg.setUserId(userId);
        travelLeg.setDepartureAt(now.plusSeconds(10_800));
        travelLeg.setArrivalAt(now.plusSeconds(14_400));

        when(travelLegRepository.findByUserId(userId))
                .thenReturn(List.of(travelLeg));
        when(carRentalRepository.findByUserId(userId))
                .thenReturn(List.of(carRental));
        when(hotelReservationRepository.findByUserId(userId))
                .thenReturn(List.of(hotelReservation));
        when(enrollmentRepository.findByAttendeeIdAndStatus(
                userId, EnrollmentStatus.ENROLLED))
                .thenReturn(List.of(enrollment));
        when(sessionOccurrenceRepository.findAllById(
                List.of(occurrenceId)))
                .thenReturn(List.of(occurrence));

        List<ItineraryEntryResponse> result =
                calendarService.getItineraryForUser(userId);

        assertEquals(4, result.size());
        assertEquals(ItineraryEntryType.SESSION, result.get(0).entryType());
        assertEquals(ItineraryEntryType.HOTEL, result.get(1).entryType());
        assertEquals(ItineraryEntryType.CAR_RENTAL, result.get(2).entryType());
        assertEquals(ItineraryEntryType.TRAVEL, result.get(3).entryType());
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
