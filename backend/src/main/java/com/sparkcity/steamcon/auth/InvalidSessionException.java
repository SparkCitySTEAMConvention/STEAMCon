package com.sparkcity.steamcon.auth;

public class InvalidSessionException extends RuntimeException {

    public InvalidSessionException() {
        super("Invalid or expired session");
    }
}
