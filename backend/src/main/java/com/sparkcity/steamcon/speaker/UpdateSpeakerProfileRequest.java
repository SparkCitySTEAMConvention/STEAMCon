package com.sparkcity.steamcon.speaker;

public record UpdateSpeakerProfileRequest(
        String displayName,
        String title,
        String organization,
        String biography) {
}