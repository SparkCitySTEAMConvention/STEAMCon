package com.sparkcity.steamcon.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TravelLegRepository extends JpaRepository<TravelLeg, UUID> {

    List<TravelLeg> findByUserId(UUID userId);
}
