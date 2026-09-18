package com.sparkcity.steamcon.calendar;

import java.time.Instant;
import java.util.UUID;

import com.sparkcity.steamcon.booking.CarRental;
import com.sparkcity.steamcon.booking.HotelReservation;
import com.sparkcity.steamcon.booking.TravelLeg;
import com.sparkcity.steamcon.events.SessionOccurrence;

public record ItineraryEntryResponse(
        UUID sourceId,
        ItineraryEntryType entryType,
        Instant startsAt,
        Instant endsAt) {

    public static ItineraryEntryResponse fromTravelLeg(
            TravelLeg travelLeg) {

        return new ItineraryEntryResponse(
                travelLeg.getId(),
                ItineraryEntryType.TRAVEL,
                travelLeg.getDepartureAt(),
                travelLeg.getArrivalAt());
    }

    public static ItineraryEntryResponse fromCarRental(
            CarRental carRental) {

        return new ItineraryEntryResponse(
                carRental.getId(),
                ItineraryEntryType.CAR_RENTAL,
                carRental.getPickupAt(),
                carRental.getDropoffAt());
    }

    public static ItineraryEntryResponse fromHotelReservation(
            HotelReservation hotelReservation) {

        return new ItineraryEntryResponse(
                hotelReservation.getId(),
                ItineraryEntryType.HOTEL,
                hotelReservation.getCheckin(),
                hotelReservation.getCheckOut());
    }

    public static ItineraryEntryResponse fromSessionOccurrence(
            SessionOccurrence sessionOccurrence) {

        return new ItineraryEntryResponse(
                sessionOccurrence.getId(),
                ItineraryEntryType.SESSION,
                sessionOccurrence.getStartsAt(),
                sessionOccurrence.getEndsAt());
    }
}
