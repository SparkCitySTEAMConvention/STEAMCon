package com.sparkcity.steamcon.speaker;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="approval_decisions") public class ApprovalDecision {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private UUID applicationId; private UUID adminReviewerId; @Enumerated(EnumType.STRING) private ApprovalDecisionType decision; private Instant decidedAt=Instant.now(); private String comment;
 public ApprovalDecision(){} public UUID getId(){return id;} public UUID getApplicationId(){return applicationId;} public void setApplicationId(UUID v){applicationId=v;} public UUID getAdminReviewerId(){return adminReviewerId;} public void setAdminReviewerId(UUID v){adminReviewerId=v;} public ApprovalDecisionType getDecision(){return decision;} public void setDecision(ApprovalDecisionType v){decision=v;} public String getComment(){return comment;} public void setComment(String v){comment=v;}
}
