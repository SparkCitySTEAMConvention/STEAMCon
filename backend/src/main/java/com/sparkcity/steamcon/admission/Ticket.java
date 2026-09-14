package com.sparkcity.steamcon.admission;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="tickets") public class Ticket extends Admission {
 @Column(nullable=false) private UUID trackId; public Ticket(){} public Ticket(UUID userId,UUID trackId){this.userId=userId;this.trackId=trackId;} public UUID getTrackId(){return trackId;} public void setTrackId(UUID v){trackId=v;}
}
