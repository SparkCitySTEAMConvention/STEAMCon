package com.sparkcity.steamcon.booking;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="hotels") public class Hotel { @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private String name; private String address; public Hotel(){} public UUID getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;} public String getAddress(){return address;} public void setAddress(String v){address=v;} }
