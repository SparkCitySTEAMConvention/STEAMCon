package com.sparkcity.steamcon.booking;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="car_rentals") public class CarRental {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private UUID userId; private String pickupLocation; private String dropoffLocation; private Instant pickupAt; private Instant dropoffAt; @Enumerated(EnumType.STRING) private BookingStatus status=BookingStatus.PLANNED;
 public CarRental(){} public UUID getId(){return id;} public UUID getUserId(){return userId;} public void setUserId(UUID v){userId=v;} public String getPickupLocation(){return pickupLocation;} public void setPickupLocation(String v){pickupLocation=v;} public String getDropoffLocation(){return dropoffLocation;} public void setDropoffLocation(String v){dropoffLocation=v;} public Instant getPickupAt(){return pickupAt;} public void setPickupAt(Instant v){pickupAt=v;} public Instant getDropoffAt(){return dropoffAt;} public void setDropoffAt(Instant v){dropoffAt=v;} public BookingStatus getStatus(){return status;} public void setStatus(BookingStatus v){status=v;}
}
