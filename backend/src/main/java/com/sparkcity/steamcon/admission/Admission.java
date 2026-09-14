package com.sparkcity.steamcon.admission;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Inheritance(strategy=InheritanceType.JOINED) @Table(name="admissions") public abstract class Admission {
 @Id @GeneratedValue(strategy=GenerationType.UUID) protected UUID id; @Column(nullable=false) protected UUID userId; @Enumerated(EnumType.STRING) protected AdmissionStatus status=AdmissionStatus.ACTIVE; protected Instant issuedAt=Instant.now();
 public UUID getId(){return id;} public UUID getUserId(){return userId;} public AdmissionStatus getStatus(){return status;} public void setStatus(AdmissionStatus s){status=s;} public Instant getIssuedAt(){return issuedAt;}
}
