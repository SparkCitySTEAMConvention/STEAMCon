package com.sparkcity.steamcon.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import java.util.UUID;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TrackController.class)
@AutoConfigureMockMvc(addFilters = false)
class TrackControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TrackRepository trackRepository;

    @Test
    void shouldGetAllTracks() throws Exception {

        Track track = new Track("Robotics");

        when(trackRepository.findAll())
                .thenReturn(List.of(track));

        mockMvc.perform(get("/api/tracks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldReturnTrackWhenFound() throws Exception {

        UUID id = UUID.randomUUID();
        Track track = new Track("Robotics");

        when(trackRepository.findById(id))
                .thenReturn(java.util.Optional.of(track));

        mockMvc.perform(get("/api/tracks/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Robotics"));
    }

    @Test
    void shouldReturnNotFoundWhenTrackDoesNotExist() throws Exception {

        UUID id = UUID.randomUUID();

        when(trackRepository.findById(id))
                .thenReturn(java.util.Optional.empty());

        mockMvc.perform(get("/api/tracks/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldCreateTrack() throws Exception {

        Track track = new Track("Robotics");

        when(trackRepository.save(any(Track.class)))
                .thenReturn(track);

        CreateTrackRequest request =
                new CreateTrackRequest(
                        "Robotics",
                        "Robotics and engineering sessions");

        mockMvc.perform(post("/api/tracks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Robotics"));
    }

    @Test
    void shouldRejectInvalidTrack() throws Exception {

        CreateTrackRequest request =
                new CreateTrackRequest("", "Invalid track");

        mockMvc.perform(post("/api/tracks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}