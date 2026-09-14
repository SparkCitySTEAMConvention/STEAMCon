package com.sparkcity.steamcon.events;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="session_occurrences") public class SessionOccurrence {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; @Column(nullable=false) private UUID sessionId; @Column(nullable=false) private Instant startsAt; @Column(nullable=false) private Instant endsAt;
 public SessionOccurrence(){} public UUID getId(){return id;} public UUID getSessionId(){return sessionId;} public void setSessionId(UUID v){sessionId=v;} public Instant getStartsAt(){return startsAt;} public void setStartsAt(Instant v){startsAt=v;} public Instant getEndsAt(){return endsAt;} public void setEndsAt(Instant v){endsAt=v;}
}
