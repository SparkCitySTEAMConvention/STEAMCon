package com.sparkcity.steamcon.communication;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="messages") public class Message { @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private String body; private Instant postedAt=Instant.now(); @Enumerated(EnumType.STRING) private MessageStatus status=MessageStatus.ACTIVE; private UUID authorId; private UUID forumId; private UUID speakerFlairId; public Message(){} public UUID getId(){return id;} public String getBody(){return body;} public void setBody(String v){body=v;} public Instant getPostedAt(){return postedAt;} public MessageStatus getStatus(){return status;} public void setStatus(MessageStatus v){status=v;} public UUID getAuthorId(){return authorId;} public void setAuthorId(UUID v){authorId=v;} public UUID getForumId(){return forumId;} public void setForumId(UUID v){forumId=v;} public UUID getSpeakerFlairId(){return speakerFlairId;} public void setSpeakerFlairId(UUID v){speakerFlairId=v;} }
