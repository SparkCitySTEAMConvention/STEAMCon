package com.sparkcity.steamcon.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface HotelReservationRepository extends JpaRepository<HotelReservation, UUID> {

    List<HotelReservation> findByUserId(UUID userId);
}
