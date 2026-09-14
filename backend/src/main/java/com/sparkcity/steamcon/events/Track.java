package com.sparkcity.steamcon.events;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="tracks") public class Track {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; @Column(nullable=false) private String name;
 private String description; public Track(){} public Track(String name){this.name=name;} public UUID getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;}
}
