package com.sparkcity.steamcon.booking;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private final TravelLegRepository travelLegRepository;
    private final CarRentalRepository carRentalRepository;
    private final HotelRepository hotelRepository;
    private final HotelReservationRepository hotelReservationRepository;

    public BookingService(
            TravelLegRepository travelLegRepository,
            CarRentalRepository carRentalRepository,
            HotelRepository hotelRepository,
            HotelReservationRepository hotelReservationRepository) {

        this.travelLegRepository = travelLegRepository;
        this.carRentalRepository = carRentalRepository;
        this.hotelRepository = hotelRepository;
        this.hotelReservationRepository = hotelReservationRepository;
    }

    public TravelLeg bookTravelLeg(
            UUID userId,
            String origin,
            String destination,
            Instant departureAt,
            Instant arrivalAt) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "Travel leg user ID is required");
        }

        TravelLeg travelLeg = new TravelLeg();

        travelLeg.setUserId(userId);
        travelLeg.setOrigin(origin);
        travelLeg.setDestination(destination);
        travelLeg.setDepartureAt(departureAt);
        travelLeg.setArrivalAt(arrivalAt);

        return travelLegRepository.save(travelLeg);
    }

    public CarRental bookCarRental(
            UUID userId,
            Instant pickupAt,
            Instant dropoffAt,
            String pickupLocation,
            String dropoffLocation) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "Car rental user ID is required");
        }

        CarRental carRental = new CarRental();

        carRental.setUserId(userId);
        carRental.setPickupAt(pickupAt);
        carRental.setDropoffAt(dropoffAt);
        carRental.setPickupLocation(pickupLocation);
        carRental.setDropoffLocation(dropoffLocation);

        return carRentalRepository.save(carRental);
    }


    public List<TravelLeg> getTravelLegsForUser(UUID userId) {
        return travelLegRepository.findByUserId(userId);
    }

    public List<CarRental> getCarRentalsForUser(UUID userId) {
        return carRentalRepository.findByUserId(userId);
    }

    public List<HotelReservation> getHotelReservationsForUser(UUID userId) {
        return hotelReservationRepository.findByUserId(userId);
    }

    public List<Hotel> getHotels() {

        return hotelRepository.findAll();
    }

    public HotelReservation bookHotelReservation(
            UUID userId,
            UUID hotelId,
            Instant checkIn,
            Instant checkOut) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "Hotel reservation user ID is required");
        }

        hotelRepository.findById(hotelId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Hotel not found"));

        HotelReservation reservation = new HotelReservation();

        reservation.setUserId(userId);
        reservation.setHotelId(hotelId);
        reservation.setCheckin(checkIn);
        reservation.setCheckOut(checkOut);

        return hotelReservationRepository.save(reservation);
    }
}
