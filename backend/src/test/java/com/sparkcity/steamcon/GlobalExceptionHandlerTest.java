package com.sparkcity.steamcon;

import com.sparkcity.steamcon.common.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler =
            new GlobalExceptionHandler();

    @Test
    void shouldReturnBadRequestForIllegalArgumentException() {

        IllegalArgumentException exception =
                new IllegalArgumentException("Session not found");

        ResponseEntity<GlobalExceptionHandler.ErrorResponse> response =
                handler.handleIllegalArgumentException(exception);

        assertEquals(400, response.getStatusCode().value());

        assertNotNull(response.getBody());

        assertEquals(400, response.getBody().status());
        assertEquals("Bad Request", response.getBody().error());
        assertEquals("Session not found", response.getBody().message());
        assertNotNull(response.getBody().timestamp());
    }
}
