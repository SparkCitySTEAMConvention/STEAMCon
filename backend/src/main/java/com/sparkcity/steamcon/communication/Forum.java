package com.sparkcity.steamcon.communication;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="forums") public class Forum { @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private String name; private UUID trackId; @Enumerated(EnumType.STRING) private ForumScope scope; public Forum(){} public UUID getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;} public UUID getTrackId(){return trackId;} public void setTrackId(UUID v){trackId=v;} public ForumScope getScope(){return scope;} public void setScope(ForumScope v){scope=v;} }
