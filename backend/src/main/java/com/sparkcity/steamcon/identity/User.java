package com.sparkcity.steamcon.identity;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="users")
public class User {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false, unique=true) private String email;
 @Column(nullable=false) private String displayName;
 private String organization;
 public User() {}
 public User(String email,String displayName){this.email=email;this.displayName=displayName;}
 public UUID getId(){return id;} public String getEmail(){return email;} public void setEmail(String v){email=v;}
 public String getDisplayName(){return displayName;} public void setDisplayName(String v){displayName=v;}
 public String getOrganization(){return organization;} public void setOrganization(String v){organization=v;}
}
