package com.sparkcity.steamcon.identity;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="user_roles")
public class UserRole {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false) private UUID userId; @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role;
 private Instant assignedAt=Instant.now(); private boolean active=true;
 public UserRole() {} public UserRole(UUID userId,Role role){this.userId=userId;this.role=role;}
 public UUID getId(){return id;} public UUID getUserId(){return userId;} public Role getRole(){return role;} public void setRole(Role r){role=r;}
 public Instant getAssignedAt(){return assignedAt;} public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
}
