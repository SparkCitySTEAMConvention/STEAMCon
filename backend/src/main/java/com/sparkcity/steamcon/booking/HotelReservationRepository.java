package com.sparkcity.steamcon.booking;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HotelReservationRepository extends JpaRepository<HotelReservation, UUID> {

    List<HotelReservation> findByUserId(UUID userId);

    Optional<HotelReservation> findFirstByUserIdOrderByCheckinDesc(UUID userId);
}