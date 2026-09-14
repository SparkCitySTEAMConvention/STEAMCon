package com.sparkcity.steamcon.booking;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="hotel_reservations") public class HotelReservation { @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private UUID userId; private UUID hotelId; private Instant checkin; private Instant checkOut; private String confirmationCode; @Enumerated(EnumType.STRING) private BookingStatus status=BookingStatus.PLANNED; public HotelReservation(){} public UUID getId(){return id;} public UUID getUserId(){return userId;} public void setUserId(UUID v){userId=v;} public UUID getHotelId(){return hotelId;} public void setHotelId(UUID v){hotelId=v;} public Instant getCheckin(){return checkin;} public void setCheckin(Instant v){checkin=v;} public Instant getCheckOut(){return checkOut;} public void setCheckOut(Instant v){checkOut=v;} public String getConfirmationCode(){return confirmationCode;} public void setConfirmationCode(String v){confirmationCode=v;} public BookingStatus getStatus(){return status;} public void setStatus(BookingStatus v){status=v;} }
