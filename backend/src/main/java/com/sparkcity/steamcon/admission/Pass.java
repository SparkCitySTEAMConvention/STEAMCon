package com.sparkcity.steamcon.admission;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "passes")
public class Pass extends Admission {

    @Column(nullable = false)
    private String passType;

    @ElementCollection
    @CollectionTable(
        name = "pass_tracks",
        joinColumns = @JoinColumn(name = "pass_id")
    )
    @Column(name = "track_id")
    private Set<UUID> trackIds = new HashSet<>();

    public Pass() {
    }

    public Pass(UUID userId, String passType) {
        this.userId = userId;
        this.passType = passType;
    }

    public String getPassType() {
        return passType;
    }

    public void setPassType(String passType) {
        this.passType = passType;
    }

    public Set<UUID> getTrackIds() {
        return trackIds;
    }

    public void addTrack(UUID trackId) {
        trackIds.add(trackId);
    }

    public void removeTrack(UUID trackId) {
        trackIds.remove(trackId);
    }
}