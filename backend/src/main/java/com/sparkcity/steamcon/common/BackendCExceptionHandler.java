package com.sparkcity.steamcon.common;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = {
                "com.sparkcity.steamcon.speaker",
                "com.sparkcity.steamcon.communication"
        })
public class BackendCExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>>
            handleIllegalArgument(
                    IllegalArgumentException exception) {

        Map<String, Object> body =
                new LinkedHashMap<>();

        body.put(
                "timestamp",
                Instant.now());

        body.put(
                "status",
                HttpStatus.BAD_REQUEST.value());

        body.put(
                "error",
                "Bad Request");

        body.put(
                "message",
                exception.getMessage());

        return ResponseEntity
                .badRequest()
                .body(body);
    }
}