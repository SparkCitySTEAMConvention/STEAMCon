package com.sparkcity.steamcon.booking;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

class BookingServiceTest {

    @Mock
    private TravelLegRepository travelLegRepository;

    @Mock
    private CarRentalRepository carRentalRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private HotelReservationRepository hotelReservationRepository;

    private BookingService bookingService;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        bookingService = new BookingService(
                travelLegRepository,
                carRentalRepository,
                hotelRepository,
                hotelReservationRepository);
    }

    @Test
    void bookTravelLegShouldSaveTravelLeg() {

        UUID userId = UUID.randomUUID();
        Instant departureAt = Instant.now();
        Instant arrivalAt = departureAt.plusSeconds(3600);

        when(travelLegRepository.save(any(TravelLeg.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        TravelLeg result = bookingService.bookTravelLeg(
                userId,
                "SEA",
                "DEN",
                departureAt,
                arrivalAt);

        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals("SEA", result.getOrigin());
        assertEquals("DEN", result.getDestination());
        assertEquals(departureAt, result.getDepartureAt());
        assertEquals(arrivalAt, result.getArrivalAt());

        verify(travelLegRepository).save(any(TravelLeg.class));
    }

    @Test
    void bookTravelLegShouldThrowWhenUserIdMissing() {

        assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.bookTravelLeg(
                        null,
                        "SEA",
                        "DEN",
                        Instant.now(),
                        Instant.now()));
    }

    @Test
    void bookCarRentalShouldSaveCarRental() {

        UUID userId = UUID.randomUUID();
        Instant pickupAt = Instant.now();
        Instant dropoffAt = pickupAt.plusSeconds(7200);

        when(carRentalRepository.save(any(CarRental.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CarRental result = bookingService.bookCarRental(
                userId,
                pickupAt,
                dropoffAt,
                "Venue Garage",
                "Venue Garage");

        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(pickupAt, result.getPickupAt());
        assertEquals(dropoffAt, result.getDropoffAt());
        assertEquals("Venue Garage", result.getPickupLocation());

        verify(carRentalRepository).save(any(CarRental.class));
    }

    @Test
    void getHotelsShouldReturnAllHotels() {

        Hotel hotel = new Hotel();

        when(hotelRepository.findAll())
                .thenReturn(List.of(hotel));

        List<Hotel> result = bookingService.getHotels();

        assertEquals(1, result.size());

        verify(hotelRepository).findAll();
    }

    @Test
    void bookHotelReservationShouldSaveReservation() {

        UUID userId = UUID.randomUUID();
        UUID hotelId = UUID.randomUUID();
        Instant checkIn = Instant.now();
        Instant checkOut = checkIn.plusSeconds(86400);

        Hotel hotel = new Hotel();

        when(hotelRepository.findById(hotelId))
                .thenReturn(Optional.of(hotel));

        when(hotelReservationRepository.save(any(HotelReservation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        HotelReservation result = bookingService.bookHotelReservation(
                userId,
                hotelId,
                checkIn,
                checkOut);

        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(hotelId, result.getHotelId());
        assertEquals(checkIn, result.getCheckin());
        assertEquals(checkOut, result.getCheckOut());

        verify(hotelReservationRepository)
                .save(any(HotelReservation.class));
    }

    @Test
    void bookHotelReservationShouldThrowWhenHotelDoesNotExist() {

        UUID hotelId = UUID.randomUUID();

        when(hotelRepository.findById(hotelId))
                .thenReturn(Optional.empty());

        assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.bookHotelReservation(
                        UUID.randomUUID(),
                        hotelId,
                        Instant.now(),
                        Instant.now()));
    }
}
