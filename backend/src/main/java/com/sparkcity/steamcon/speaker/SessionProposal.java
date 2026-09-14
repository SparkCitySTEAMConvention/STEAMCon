package com.sparkcity.steamcon.speaker;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="session_proposals") public class SessionProposal {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private UUID speakerId; private String title; private String description; private UUID trackId; private Instant submittedAt=Instant.now(); @Enumerated(EnumType.STRING) private ProposalStatus status=ProposalStatus.SUBMITTED;
 public SessionProposal(){} public UUID getId(){return id;} public UUID getSpeakerId(){return speakerId;} public void setSpeakerId(UUID v){speakerId=v;} public String getTitle(){return title;} public void setTitle(String v){title=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;} public UUID getTrackId(){return trackId;} public void setTrackId(UUID v){trackId=v;} public ProposalStatus getStatus(){return status;} public void setStatus(ProposalStatus v){status=v;}
}
