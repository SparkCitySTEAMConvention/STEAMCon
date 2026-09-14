package com.sparkcity.steamcon.communication;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="speaker_flair") public class SpeakerFlair { @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private UUID userId; private String label; private String displayStyle; public SpeakerFlair(){} public UUID getId(){return id;} public UUID getUserId(){return userId;} public void setUserId(UUID v){userId=v;} public String getLabel(){return label;} public void setLabel(String v){label=v;} public String getDisplayStyle(){return displayStyle;} public void setDisplayStyle(String v){displayStyle=v;} }
