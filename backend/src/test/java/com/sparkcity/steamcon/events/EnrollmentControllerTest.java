package com.sparkcity.steamcon.events;

import com.sparkcity.steamcon.admission.AdmissionService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EnrollmentController.class)
@AutoConfigureMockMvc(addFilters = false)
class EnrollmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AttendeeSessionEnrollmentService enrollmentService;

    @MockBean
    private AdmissionService admissionService;

    @Test
    void shouldEnrollAttendee() throws Exception {

        UUID attendeeId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();

        AttendeeSessionEnrollment enrollment =
                new AttendeeSessionEnrollment(attendeeId, sessionId);

        when(enrollmentService.enroll(attendeeId, sessionId))
                .thenReturn(enrollment);

        CreateEnrollmentRequest request =
                new CreateEnrollmentRequest(
                        attendeeId,
                        sessionId);

        mockMvc.perform(post("/api/enrollments")
                        .principal(new UsernamePasswordAuthenticationToken(
                                attendeeId, null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.attendeeId")
                        .value(attendeeId.toString()))
                .andExpect(jsonPath("$.sessionId")
                        .value(sessionId.toString()));
    }

    @Test
    void shouldCancelEnrollment() throws Exception {

        UUID attendeeId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();

        doNothing().when(enrollmentService)
                .cancelEnrollment(attendeeId, sessionId);

        mockMvc.perform(delete("/api/enrollments")
                        .param("attendeeId", attendeeId.toString())
                        .param("sessionId", sessionId.toString()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldRejectEnrollmentWithMissingAttendeeId()
            throws Exception {

        UUID sessionId = UUID.randomUUID();

        CreateEnrollmentRequest request =
                new CreateEnrollmentRequest(
                        null,
                        sessionId);

        mockMvc.perform(post("/api/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectEnrollmentWithMissingSessionId()
            throws Exception {

        UUID attendeeId = UUID.randomUUID();

        CreateEnrollmentRequest request =
                new CreateEnrollmentRequest(
                        attendeeId,
                        null);

        mockMvc.perform(post("/api/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnBadRequestWhenEnrollmentFails()
            throws Exception {

        UUID attendeeId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();

        when(enrollmentService.enroll(attendeeId, sessionId))
                .thenThrow(new IllegalArgumentException(
                        "Attendee does not have admission for this track"));

        CreateEnrollmentRequest request =
                new CreateEnrollmentRequest(
                        attendeeId,
                        sessionId);

        mockMvc.perform(post("/api/enrollments")
                        .principal(new UsernamePasswordAuthenticationToken(
                                attendeeId, null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error")
                        .value("Bad Request"))
                .andExpect(jsonPath("$.message")
                        .value("Attendee does not have admission for this track"));
    }
}