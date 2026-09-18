package com.sparkcity.steamcon.speaker;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/speaker/profile")
public class SpeakerProfileController {

    private final SpeakerProfileService
            profileService;

    public SpeakerProfileController(
            SpeakerProfileService profileService) {

        this.profileService =
                profileService;
    }

    @GetMapping("/me")
    public ResponseEntity<SpeakerProfile>
            getMyProfile(
                    Authentication authentication) {

        UUID speakerId =
                (UUID)
                        authentication
                                .getPrincipal();

        return ResponseEntity.ok(
                profileService
                        .getProfile(
                                speakerId));
    }

    @PatchMapping("/me")
    public ResponseEntity<SpeakerProfile>
            updateMyProfile(
                    @RequestBody
                    UpdateSpeakerProfileRequest request,
                    Authentication authentication) {

        UUID speakerId =
                (UUID)
                        authentication
                                .getPrincipal();

        return ResponseEntity.ok(
                profileService
                        .updateProfile(
                                speakerId,
                                request));
    }
}