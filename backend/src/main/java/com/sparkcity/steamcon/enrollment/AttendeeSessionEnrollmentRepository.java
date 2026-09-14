package com.sparkcity.steamcon.enrollment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AttendeeSessionEnrollmentRepository extends JpaRepository<AttendeeSessionEnrollment, UUID> {}
