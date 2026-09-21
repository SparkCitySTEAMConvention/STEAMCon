package com.sparkcity.steamcon.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SessionOccurrenceController.class)
@AutoConfigureMockMvc(addFilters = false)
class SessionOccurrenceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SessionOccurrenceRepository occurrenceRepository;

    @Test
    void shouldGetAllOccurrences() throws Exception {

        UUID sessionId = UUID.randomUUID();

        SessionOccurrence occurrence = new SessionOccurrence();
        occurrence.setSessionId(sessionId);
        occurrence.setStartsAt(
                Instant.parse("2026-10-01T10:00:00Z"));
        occurrence.setEndsAt(
                Instant.parse("2026-10-01T11:00:00Z"));

        when(occurrenceRepository.findAll())
                .thenReturn(List.of(occurrence));

        mockMvc.perform(get("/api/session-occurrences"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldReturnOccurrenceWhenFound() throws Exception {

        UUID id = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();

        SessionOccurrence occurrence = new SessionOccurrence();
        occurrence.setSessionId(sessionId);
        occurrence.setStartsAt(
                Instant.parse("2026-10-01T10:00:00Z"));
        occurrence.setEndsAt(
                Instant.parse("2026-10-01T11:00:00Z"));

        when(occurrenceRepository.findById(id))
                .thenReturn(Optional.of(occurrence));

        mockMvc.perform(get("/api/session-occurrences/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId")
                        .value(sessionId.toString()));
    }

    @Test
    void shouldReturnNotFoundWhenOccurrenceDoesNotExist()
            throws Exception {

        UUID id = UUID.randomUUID();

        when(occurrenceRepository.findById(id))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/session-occurrences/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldCreateOccurrence() throws Exception {

        UUID sessionId = UUID.randomUUID();

        SessionOccurrence occurrence = new SessionOccurrence();
        occurrence.setSessionId(sessionId);
        occurrence.setStartsAt(
                Instant.parse("2026-10-01T10:00:00Z"));
        occurrence.setEndsAt(
                Instant.parse("2026-10-01T11:00:00Z"));

        when(occurrenceRepository.save(any(SessionOccurrence.class)))
                .thenReturn(occurrence);

        CreateSessionOccurrenceRequest request =
                new CreateSessionOccurrenceRequest(
                        sessionId,
                        Instant.parse("2026-10-01T10:00:00Z"),
                        Instant.parse("2026-10-01T11:00:00Z"));

        mockMvc.perform(post("/api/session-occurrences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sessionId")
                        .value(sessionId.toString()));
    }

    @Test
    void shouldRejectInvalidOccurrence() throws Exception {

        UUID sessionId = UUID.randomUUID();

        CreateSessionOccurrenceRequest request =
                new CreateSessionOccurrenceRequest(
                        sessionId,
                        Instant.parse("2026-10-01T11:00:00Z"),
                        Instant.parse("2026-10-01T10:00:00Z"));

        mockMvc.perform(post("/api/session-occurrences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}