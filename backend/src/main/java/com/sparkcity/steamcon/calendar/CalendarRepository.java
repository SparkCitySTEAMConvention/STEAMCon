package com.sparkcity.steamcon.calendar;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CalendarRepository extends JpaRepository<Calendar, UUID> {}
