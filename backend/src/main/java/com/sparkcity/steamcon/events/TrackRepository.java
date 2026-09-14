package com.sparkcity.steamcon.events;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TrackRepository extends JpaRepository<Track, UUID> {}
