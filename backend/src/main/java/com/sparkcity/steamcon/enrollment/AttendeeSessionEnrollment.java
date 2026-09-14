package com.sparkcity.steamcon.enrollment;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="attendee_session_enrollments", uniqueConstraints=@UniqueConstraint(columnNames={"userId","occurrenceId"})) public class AttendeeSessionEnrollment {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private UUID userId; private UUID occurrenceId; private UUID admissionId; private UUID calendarId; private Instant enrolledAt=Instant.now(); @Enumerated(EnumType.STRING) private EnrollmentStatus status;
 public AttendeeSessionEnrollment(){} public UUID getId(){return id;} public UUID getUserId(){return userId;} public void setUserId(UUID v){userId=v;} public UUID getOccurrenceId(){return occurrenceId;} public void setOccurrenceId(UUID v){occurrenceId=v;} public UUID getAdmissionId(){return admissionId;} public void setAdmissionId(UUID v){admissionId=v;} public UUID getCalendarId(){return calendarId;} public void setCalendarId(UUID v){calendarId=v;} public Instant getEnrolledAt(){return enrolledAt;} public EnrollmentStatus getStatus(){return status;} public void setStatus(EnrollmentStatus v){status=v;}
}
