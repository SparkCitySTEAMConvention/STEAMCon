package com.sparkcity.steamcon.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sparkcity.steamcon.admission.AdmissionService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.core.Authentication;

import java.util.UUID;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
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
                UUID sessionOccurrenceId = UUID.randomUUID();

                AttendeeSessionEnrollment enrollment = new AttendeeSessionEnrollment(
                                attendeeId,
                                sessionId,
                                sessionOccurrenceId);

                when(enrollmentService.enroll(
                                attendeeId,
                                sessionOccurrenceId))
                                .thenReturn(enrollment);

                CreateEnrollmentRequest request = new CreateEnrollmentRequest(
                                sessionOccurrenceId);

                mockMvc.perform(post("/api/enrollments")
                                .principal(
                                                new UsernamePasswordAuthenticationToken(
                                                                attendeeId,
                                                                null))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                                objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.attendeeId")
                                                .value(attendeeId.toString()))
                                .andExpect(jsonPath("$.sessionId")
                                                .value(sessionId.toString()))
                                .andExpect(jsonPath("$.sessionOccurrenceId")
                                                .value(sessionOccurrenceId.toString()));
        }

        @Test
        void shouldCancelEnrollment() throws Exception {

                UUID attendeeId = UUID.randomUUID();
                UUID sessionOccurrenceId = UUID.randomUUID();

                Authentication authentication = mock(Authentication.class);

                when(authentication.getPrincipal())
                                .thenReturn(attendeeId);

                doNothing().when(enrollmentService)
                                .cancelEnrollment(
                                                attendeeId,
                                                sessionOccurrenceId);

                mockMvc.perform(delete("/api/enrollments")
                                .param(
                                                "sessionOccurrenceId",
                                                sessionOccurrenceId.toString())
                                .principal(authentication))
                                .andExpect(status().isNoContent());
        }

        @Test
        void shouldRejectEnrollmentWithMissingSessionOccurrenceId()
                        throws Exception {

                CreateEnrollmentRequest request = new CreateEnrollmentRequest(null);

                mockMvc.perform(post("/api/enrollments")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                                objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void shouldReturnBadRequestWhenEnrollmentFails()
                        throws Exception {

                UUID attendeeId = UUID.randomUUID();
                UUID sessionOccurrenceId = UUID.randomUUID();

                when(enrollmentService.enroll(
                                attendeeId,
                                sessionOccurrenceId))
                                .thenThrow(
                                                new IllegalArgumentException(
                                                                "Attendee does not have admission for this track"));

                CreateEnrollmentRequest request = new CreateEnrollmentRequest(
                                sessionOccurrenceId);

                mockMvc.perform(post("/api/enrollments")
                                .principal(
                                                new UsernamePasswordAuthenticationToken(
                                                                attendeeId,
                                                                null))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                                objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.status")
                                                .value(400))
                                .andExpect(jsonPath("$.error")
                                                .value("Bad Request"))
                                .andExpect(jsonPath("$.message")
                                                .value(
                                                                "Attendee does not have admission for this track"));
        }
}