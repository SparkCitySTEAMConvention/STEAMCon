package com.sparkcity.steamcon.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SessionController.class)
@AutoConfigureMockMvc(addFilters = false)
class SessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SessionRepository sessionRepository;

    @Test
    void shouldGetAllSessions() throws Exception {

        Session session = new Session();
        session.setTitle("Robotics Workshop");
        session.setTrackId(UUID.randomUUID());
        session.setMandatory(false);

        when(sessionRepository.findAll())
                .thenReturn(List.of(session));

        mockMvc.perform(get("/api/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldReturnSessionWhenFound() throws Exception {

        UUID id = UUID.randomUUID();

        Session session = new Session();
        session.setTitle("Robotics Workshop");
        session.setTrackId(UUID.randomUUID());
        session.setMandatory(false);

        when(sessionRepository.findById(id))
                .thenReturn(Optional.of(session));

        mockMvc.perform(get("/api/sessions/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title")
                        .value("Robotics Workshop"));
    }

    @Test
    void shouldReturnNotFoundWhenSessionDoesNotExist() throws Exception {

        UUID id = UUID.randomUUID();

        when(sessionRepository.findById(id))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/sessions/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldCreateSession() throws Exception {

        UUID trackId = UUID.randomUUID();

        Session session = new Session();
        session.setTitle("Robotics Workshop");
        session.setDescription("Learn robotics and engineering");
        session.setTrackId(trackId);
        session.setMandatory(false);

        when(sessionRepository.save(any(Session.class)))
                .thenReturn(session);

        CreateSessionRequest request =
                new CreateSessionRequest(
                        "Robotics Workshop",
                        "Learn robotics and engineering",
                        trackId,
                        false);

        mockMvc.perform(post("/api/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title")
                        .value("Robotics Workshop"));
    }

    @Test
    void shouldRejectInvalidSession() throws Exception {

        CreateSessionRequest request =
                new CreateSessionRequest(
                        "",
                        "Invalid session",
                        null,
                        false);

        mockMvc.perform(post("/api/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}