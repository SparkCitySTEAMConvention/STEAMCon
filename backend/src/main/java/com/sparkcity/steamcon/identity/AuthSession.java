package com.sparkcity.steamcon.identity;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="auth_sessions")
public class AuthSession {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; @Column(nullable=false) private UUID userId;
 private Instant createdAt=Instant.now(); private Instant expiresAt; @Enumerated(EnumType.STRING) private AuthSessionStatus status=AuthSessionStatus.ACTIVE;
 public AuthSession() {} public AuthSession(UUID userId,Instant expiresAt){this.userId=userId;this.expiresAt=expiresAt;}
 public UUID getId(){return id;} public UUID getUserId(){return userId;} public Instant getCreatedAt(){return createdAt;} public Instant getExpiresAt(){return expiresAt;} public AuthSessionStatus getStatus(){return status;} public void setStatus(AuthSessionStatus s){status=s;}
}
