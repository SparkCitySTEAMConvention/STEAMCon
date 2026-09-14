package com.sparkcity.steamcon.admission;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PassRepository extends JpaRepository<Pass, UUID> {}
