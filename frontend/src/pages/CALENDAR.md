# Calendar page

`/calendar` is public and reachable ahead of the protected routes, matching
`/events` and `/tracks`. It uses the same `usePublicProgram` source as those
pages, so it shows the same live/preview/unavailable boundary: anonymous and
demo visitors see preview data, an authenticated backend session with a valid
session sees the live program from `/api/tracks`, `/api/sessions`, and
`/api/session-occurrences`, and any other authenticated backend identity
sees the unavailable state. No new endpoint or fetch is introduced.

"Approved sessions" means every `Session` record the events API returns.
The backend has no separate approval/publication flag on `Session` today
(only `SessionProposal.status` does, and it is not linked back to a
published `Session`), so a returned Session is, by this codebase's existing
convention (see `PUBLIC_PROGRAM.md`), already the confirmed/published set.
If a real approval flag is added to `Session` later, filter it in
`publicProgramSource.js` before it reaches this page; `CalendarView` stays
a dumb, prop-driven component either way.

`CalendarView` groups the joined schedule by convention day (from
`programCalendar`) and offers independent STEAM category filter chips
(S/T/E/A/M plus All), all checked by default. `src/utils/trackCategory.js`
maps a track's name to its single-letter code and a CSS-safe slug; a track
name outside the five STEAM tracks has no code and always renders when no
category is being used to hide it. Unchecking every category shows an
empty state with a "Show every category" reset, matching the schedule
empty state used on `/tracks` and `/events`.
