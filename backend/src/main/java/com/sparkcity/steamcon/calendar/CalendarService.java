package com.sparkcity.steamcon.calendar;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.sparkcity.steamcon.booking.CarRentalRepository;
import com.sparkcity.steamcon.booking.HotelReservationRepository;
import com.sparkcity.steamcon.booking.TravelLegRepository;
import com.sparkcity.steamcon.events.AttendeeSessionEnrollment;
import com.sparkcity.steamcon.events.AttendeeSessionEnrollmentRepository;
import com.sparkcity.steamcon.events.EnrollmentStatus;
import com.sparkcity.steamcon.events.SessionOccurrence;
import com.sparkcity.steamcon.events.SessionOccurrenceRepository;

@Service
public class CalendarService {

    private final TravelLegRepository travelLegRepository;
    private final CarRentalRepository carRentalRepository;
    private final HotelReservationRepository hotelReservationRepository;
    private final AttendeeSessionEnrollmentRepository enrollmentRepository;
    private final SessionOccurrenceRepository sessionOccurrenceRepository;

    public CalendarService(
            TravelLegRepository travelLegRepository,
            CarRentalRepository carRentalRepository,
            HotelReservationRepository hotelReservationRepository,
            AttendeeSessionEnrollmentRepository enrollmentRepository,
            SessionOccurrenceRepository sessionOccurrenceRepository) {

        this.travelLegRepository = travelLegRepository;
        this.carRentalRepository = carRentalRepository;
        this.hotelReservationRepository = hotelReservationRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.sessionOccurrenceRepository = sessionOccurrenceRepository;
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

    private List<ItineraryEntryResponse> resolveSessionEntries(
            UUID userId) {

        List<AttendeeSessionEnrollment> enrollments =
                enrollmentRepository.findByAttendeeIdAndStatus(
                        userId,
                        EnrollmentStatus.ENROLLED);

        if (enrollments.isEmpty()) {
            return List.of();
        }

        List<UUID> occurrenceIds = enrollments.stream()
                .map(AttendeeSessionEnrollment::getSessionOccurrenceId)
                .toList();

        Map<UUID, SessionOccurrence> occurrencesById =
                sessionOccurrenceRepository.findAllById(occurrenceIds)
                        .stream()
                        .collect(Collectors.toMap(
                                SessionOccurrence::getId,
                                occurrence -> occurrence));

        return enrollments.stream()
                .map(enrollment -> occurrencesById.get(
                        enrollment.getSessionOccurrenceId()))
                .filter(Objects::nonNull)
                .map(ItineraryEntryResponse::fromSessionOccurrence)
                .toList();
    }
}
