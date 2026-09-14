package com.sparkcity.steamcon.events;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="sessions") public class Session {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; @Column(nullable=false) private String title; private String description; @Column(nullable=false) private UUID trackId; private boolean mandatory;
 public Session(){} public UUID getId(){return id;} public String getTitle(){return title;} public void setTitle(String v){title=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;} public UUID getTrackId(){return trackId;} public void setTrackId(UUID v){trackId=v;} public boolean isMandatory(){return mandatory;} public void setMandatory(boolean v){mandatory=v;}
}
