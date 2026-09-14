package com.sparkcity.steamcon.calendar;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="calendars") public class Calendar { @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private UUID userId; private String timezone; public Calendar(){} public UUID getId(){return id;} public UUID getUserId(){return userId;} public void setUserId(UUID v){userId=v;} public String getTimezone(){return timezone;} public void setTimezone(String v){timezone=v;} }
