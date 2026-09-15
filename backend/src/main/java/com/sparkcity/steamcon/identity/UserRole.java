package com.sparkcity.steamcon.identity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_roles")
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
private Role role;

    @Column(nullable = false)
private Instant assignedAt = Instant.now();

    @Column(nullable = false)
private boolean active = true;

public UserRole() {
    }

public UserRole(User user, Role role) {
this.user = user;
this.role = role;
    }

public UUID getId() {
return id;
    }

public User getUser() {
return user;
    }

public Role getRole() {
return role;
    }

public Instant getAssignedAt() {
return assignedAt;
    }

public boolean isActive() {
return active;
    }

public void setActive(boolean active) {
this.active = active;
    }
}