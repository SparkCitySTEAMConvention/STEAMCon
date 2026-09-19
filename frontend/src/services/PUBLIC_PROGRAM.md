# Public program data

Homepage tracks, sessions and schedule use PublicProgram → publicProgramSource → eventRepository → authenticatedFetch. Anonymous/demo authentication explicitly uses publicProgramPreview, never sending demo IDs or credentials to event APIs. Backend mode requires authenticated context, UUID user/session IDs and nonexpired stored backend authentication. Invalid backend context shows an error. Live loads are atomic across the three lists; failures never substitute mocks and retry reloads all lists.

Confirmed Backend B contracts from the three controllers and response records:

- GET /api/tracks: array of {id, name, description}; GET /api/tracks/{id}: single record.
- GET /api/sessions: array of {id, title, description, trackId, mandatory}; GET /api/sessions/{id}: single record.
- GET /api/session-occurrences: array of {id, sessionId, startsAt, endsAt}; GET /api/session-occurrences/{id}: single record.

Detail endpoints return 404 for unknown UUIDs. Times are Java Instant ISO timestamps. Only trackId → track.id and sessionId → session.id are joined. Unmatched occurrences are not attributed. Missing tracks stay null. Room, event timezone, speaker and format are not supplied. Adapter schedule labels retain their UTC display; programCalendar groups and formats public calendar occurrences in the confirmed America/New_York convention timezone. The backend model timezone stays null. No enrollment controls are added.

The speaker directory, biographies and panels remain independent preview fixtures. Bill Nye's dashboard scheduling remains preview: SessionProposal contains speakerId but no sessionId/occurrenceId; SessionResponse contains no proposalId/speakerId. Title matching cannot establish relationships. Room and event timezone contracts are also missing; conventionConfig supplies the confirmed display timezone.

Backend login supplies userId/session ID but no role/display name, and there is no current-user endpoint. Public program does not require a speaker role, so active backend login can read it. Role-protected speaker screens cannot verify backend speaker identity, and backend login cannot be restored on reload under the existing login policy. The login flow is preserved.

## Public Tracks calendar

`/tracks` reuses `ScheduleByDay` below the selected track experience. Track and date filters are controlled by URL search parameters, including `track=all`; missing or invalid values retain the first-track and first-date fallbacks. History navigation updates both controls without moving focus. Known tracks retain their illustrations; All tracks uses a static summary.

`publicPreviewOccurrences` in `mocks/publicProgram.js` centralizes ISO demonstration timestamps and joins sessions by session ID. No component converts attendee day labels into convention dates. Calendar rows show occurrence times in Eastern Time and unconfirmed rooms. Preview schedules never substitute for failed live loads. `/api/calendar/me` is a separate authenticated personal itinerary and is not used here.

The homepage countdown targets the configured first-date midnight, displays days/hours/minutes, and updates once per minute. Convention date states do not confirm an opening or closing time. No countdown appears on Events.
