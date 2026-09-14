package com.sparkcity.steamcon.communication;
import com.sparkcity.steamcon.identity.Role;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="forum_access_policies") public class ForumAccessPolicy { @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; private UUID forumId; @Enumerated(EnumType.STRING) private Role role; @Enumerated(EnumType.STRING) private ForumPermission permission; public ForumAccessPolicy(){} public UUID getId(){return id;} public UUID getForumId(){return forumId;} public void setForumId(UUID v){forumId=v;} public Role getRole(){return role;} public void setRole(Role v){role=v;} public ForumPermission getPermission(){return permission;} public void setPermission(ForumPermission v){permission=v;} }
