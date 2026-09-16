# Public program data

Homepage tracks, sessions and schedule use PublicProgram → publicProgramSource → eventRepository → authenticatedFetch. Anonymous/demo authentication explicitly uses publicProgramPreview, never sending demo IDs or credentials to event APIs. Backend mode requires authenticated context, UUID user/session IDs and nonexpired stored backend authentication. Invalid backend context shows an error. Live loads are atomic across the three lists; failures never substitute mocks and retry reloads all lists.

Confirmed Backend B contracts from the three controllers and response records:

- GET /api/tracks: array of {id, name, description}; GET /api/tracks/{id}: single record.
- GET /api/sessions: array of {id, title, description, trackId, mandatory}; GET /api/sessions/{id}: single record.
- GET /api/session-occurrences: array of {id, sessionId, startsAt, endsAt}; GET /api/session-occurrences/{id}: single record.

Detail endpoints return 404 for unknown UUIDs. Times are Java Instant ISO timestamps. Only trackId → track.id and sessionId → session.id are joined. Unmatched occurrences are not attributed. Missing tracks stay null. Room, event timezone, speaker and format are not supplied. Schedule labels use shared scheduleLabel with explicitly labeled UTC display; the model event timezone stays null. No enrollment controls are added.

The speaker directory, biographies and panels remain independent preview fixtures. Bill Nye's dashboard scheduling remains preview: SessionProposal contains speakerId but no sessionId/occurrenceId; SessionResponse contains no proposalId/speakerId. Title matching cannot establish relationships. Room and event timezone contracts are also missing.

Backend login supplies userId/session ID but no role/display name, and there is no current-user endpoint. Public program does not require a speaker role, so active backend login can read it. Role-protected speaker screens cannot verify backend speaker identity, and backend login cannot be restored on reload under the existing login policy. The login flow is preserved.
