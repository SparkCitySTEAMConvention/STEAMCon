package com.sparkcity.steamcon.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ForumAccessPolicyRepository extends JpaRepository<ForumAccessPolicy, UUID> {}
