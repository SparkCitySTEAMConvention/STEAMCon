package com.sparkcity.steamcon.speaker;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="speaker_applications") public class SpeakerApplication {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private UUID speakerId; private UUID sessionId; private Instant submittedAt=Instant.now(); @Enumerated(EnumType.STRING) private ApplicationStatus status=ApplicationStatus.SUBMITTED;
 public SpeakerApplication(){} public UUID getId(){return id;} public UUID getSpeakerId(){return speakerId;} public void setSpeakerId(UUID v){speakerId=v;} public UUID getSessionId(){return sessionId;} public void setSessionId(UUID v){sessionId=v;} public ApplicationStatus getStatus(){return status;} public void setStatus(ApplicationStatus v){status=v;}
}
