package com.sparkcity.steamcon.booking;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="travel_legs") public class TravelLeg {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private UUID userId; private String origin; private String destination; private Instant departureAt; private Instant arrivalAt; @Enumerated(EnumType.STRING) private BookingStatus status=BookingStatus.PLANNED;
 public TravelLeg(){} public UUID getId(){return id;} public UUID getUserId(){return userId;} public void setUserId(UUID v){userId=v;} public String getOrigin(){return origin;} public void setOrigin(String v){origin=v;} public String getDestination(){return destination;} public void setDestination(String v){destination=v;} public Instant getDepartureAt(){return departureAt;} public void setDepartureAt(Instant v){departureAt=v;} public Instant getArrivalAt(){return arrivalAt;} public void setArrivalAt(Instant v){arrivalAt=v;} public BookingStatus getStatus(){return status;} public void setStatus(BookingStatus v){status=v;}
}
