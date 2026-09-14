package com.sparkcity.steamcon.calendar;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="itinerary_entries") public class ItineraryEntry { @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private UUID calendarId; private Instant startsAt; private Instant endsAt; @Enumerated(EnumType.STRING) private ItineraryEntryType entryType; private UUID sourceId; public ItineraryEntry(){} public UUID getId(){return id;} public UUID getCalendarId(){return calendarId;} public void setCalendarId(UUID v){calendarId=v;} public Instant getStartsAt(){return startsAt;} public void setStartsAt(Instant v){startsAt=v;} public Instant getEndsAt(){return endsAt;} public void setEndsAt(Instant v){endsAt=v;} public ItineraryEntryType getEntryType(){return entryType;} public void setEntryType(ItineraryEntryType v){entryType=v;} public UUID getSourceId(){return sourceId;} public void setSourceId(UUID v){sourceId=v;} }
