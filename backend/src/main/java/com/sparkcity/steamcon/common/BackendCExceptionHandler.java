package com.sparkcity.steamcon.common;

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

    @ExceptionHandler(
            IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>>
            handleIllegalArgument(
                    IllegalArgumentException exception) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "status",
                HttpStatus.BAD_REQUEST.value());

        response.put(
                "code",
                "VALIDATION_ERROR");

        response.put(
                "message",
                exception.getMessage());

        response.put(
                "fieldErrors",
                Map.of());

        return ResponseEntity
                .badRequest()
                .body(response);
    }

    @ExceptionHandler(
            IllegalStateException.class)
    public ResponseEntity<Map<String, Object>>
            handleIllegalState(
                    IllegalStateException exception) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "status",
                HttpStatus.UNAUTHORIZED.value());

        response.put(
                "code",
                "AUTHENTICATION_REQUIRED");

        response.put(
                "message",
                exception.getMessage());

        response.put(
                "fieldErrors",
                Map.of());

        return ResponseEntity
                .status(
                        HttpStatus.UNAUTHORIZED)
                .body(response);
    }
}