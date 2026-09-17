# Speaker development fixtures

All 15 public figures and five panel concepts are UI-development placeholders.
No attendance, endorsement, partnership, booking, or affiliation with STEAM Con
is implied. Abstracts and feedback are sample UI copy, not statements by them.
Before use beyond development, the team must review representation, relevance,
tone, and whether fictional speakers should replace public figures (Issue #81).

Bill Nye's displayed title is Chief Ambassador and Vice Chairman, The Planetary
Society, verified on 2026-09-15 at https://www.planetary.org/profiles/bill-nye.
Other current titles and organizations are omitted. Biographies are brief neutral
descriptions, without quotations or session commitments.

## Presentation model and adapter

`tracks.js`, `speakers.js`, `proposals.js`, `sessions.js`, and `panels.js` contain
separate records joined by stable IDs. Speaker track membership is an array;
proposal/session/panel speaker membership is also an array. The primary speaker
is explicitly identified. `speakerData.js` assembles a selected speaker workspace.
The development-only dashboard picker previews all 15 identities and their own proposals.
The default workspace is Bill Nye, with two approved proposed sessions.

All convention scheduling and location fields remain nullable. Display fallbacks
are shared in `utils/proposalPresentation.js`. A schedule-change action requires
approval plus a valid ISO start timestamp. Calendar downloads require valid start
and end timestamps (end after start) and an event timezone. Unavailable actions
have explanatory text. All formatting uses the shared helper, never the viewer's
implicit local timezone.

### Where Data should insert confirmed details

- `conventionConfig.js`: edit the single `conventionConfig` record for event
  `startsAt`, `endsAt`, `timezone`, `venueName`, `city`, and `state`.
- `proposals.js`: edit the matching entry in `proposalSchedules`:
  `proposal-bill-nye` or `proposal-panel-space-imagination`. Set `scheduledAt`,
  `endsAt`, `timezone`, and `room`. Each entry feeds both the proposal details
  and upcoming session card; do not edit generated `sessions.js` records.
- Use ISO 8601 strings with `Z` or an explicit offset for timestamps and IANA
  timezone names. A null session timezone inherits the convention timezone.
  Keep every unknown field null. Dates without a timezone show an explanatory
  message; calendar downloads stay unavailable until the timezone is known.
- `speakers.js` contains the profile and professional biography.

`services/speakerRepository.js` is a replaceable asynchronous frontend adapter,
not Backend C's final API contract. No endpoint, DTO, authentication or server
validation rules are assumed. Draft edits stay in memory until refresh. Only
draft title, abstract, track, format and duration are editable. Schedule requests
explain that integration is pending and never claim a request was sent.

## State review

Run `npm run dev` in `frontend`. These query overrides work only in development:

- `/speaker?preview=loading`, `?preview=error`, `?preview=empty`
- `/speaker/proposals/proposal-timnit-gebru` — draft and preview editing
- `/speaker/proposals/proposal-neil-degrasse-tyson` — pending
- `/speaker/proposals/proposal-panel-space-imagination` — approved, unscheduled
- `/speaker/proposals/proposal-fei-fei-li` — rejected with feedback
- `/speaker/proposals/missing` — not found
- Append `?preview=loading`, `?preview=error`, or `?preview=empty` to any detail URL
- `/speaker/proposals/proposal-schedule-test?preview=scheduled` — isolated,
  fictional test event with a synthetic timestamp, room, and identity. This is
  never a STEAM Con date or public-figure session. A visible notice explains this.

Loading/error states use status/alert announcements; errors expose retry. The
preview error override intentionally keeps failing until removed from the URL.

## Verification completed (2026-09-15)

- Issue #80: presentation models, stable relationships, nullable event fields,
  all five track badges and filters, detail route and fields, draft editor,
  conditional schedule action, and every requested presentation state implemented.
- Issue #81: all 15 specified names, all five specified panels, neutral bios,
  source/disclaimer notes, nullable program fields and mixed state fixtures added.
- `node --test frontend/tests/speakerRepository.test.js` from repository root:
  three tests passed (relationships/nullability, schedule eligibility, draft saves).
- `npm run lint` and `npm run build` from frontend, and `git diff --check` passed.

Remaining: Backend C contract/integration, persistent draft saving and real
schedule-change submission; team review before public-figure fixtures are used
beyond development. No GitHub checklist was edited and no PR was opened.

## Bill Nye dashboard verification

From `frontend/`:

- `npm test` runs the existing repository tests plus nullable schedule,
  timezone formatting, Bill Nye programming, and calendar eligibility checks.
- `npm run lint`, `npm run build`; run `git diff --check` from the repository.

Homepage atom animation and track-card implementations are unchanged.

Backend integration still needs speaker identity/authentication, profile updates,
proposal submission and persistence, organizer feedback/notification data, confirmed
scheduling, and schedule-change requests. Edit Profile supports session-local preview edits; live profile editing awaits a verified backend contract. Propose a Session now supports local preview submission and guarded backend dispatch. Calendar downloads are generated locally when
the required schedule data exists.

## Notification preview

`notificationData.js` centralizes sample Bill Nye notifications with stable IDs, valid creation timestamps, backend types, and mixed read/unread states. Organizer feedback, proposal information and pending scheduling are sample UI copy. Scheduling dates remain null in shared proposal/session fixtures, and no attendance is confirmed. Preview read state stays in memory for the application session and never calls the API. Separate source instances are isolated for tests.


## Proposal submission preview

The five shared tracks supply preview choices. speakerProposalSource creates local SUBMITTED records without modifying the shared proposal fixtures or calling the backend. Records stay in memory per AuthContext user for the current login/application session, survive portal navigation, and reset on new login or refresh. Separate source instances are isolated. Locally submitted proposals appear separately on the dashboard; they do not imply confirmed participation or scheduling.

Preview-created SUBMITTED, unscheduled proposals may be deleted after dashboard confirmation during the current preview session. Only records owned by the current preview source can be removed. Original Bill Nye fixtures, approved/scheduled proposals and panel memberships stay protected. Deletion remains local, preserves other records, and does not call a backend endpoint; live proposal withdrawal uses a separate confirmed DELETE contract; it never removes preview fixtures.


## Speaker profile preview

`speakerProfileSource` clones the Bill Nye record and owns in-memory edits for the current login/application session. Dashboard and edit form share that source across navigation; new login or refresh resets it. Profile and track reads and saves never call the API. The public directory and imported fixtures stay unchanged, as do proposal, forum and notification state. Display name, professional title (`role`), organization, biography and primary track are editable and required; text is trimmed. Text limits are 255 characters for name/title/organization and 2000 for biography. Title, biography and primary profile track are preview-only backend fields; no profile-update endpoint exists. Edits do not imply confirmed participation, and the disclaimer remains visible.

### Authenticated speaker boundary

`services/speakerProposalSource.js` separates the Bill Nye demo from live speaker
operations. Only `authSource === 'demo'` uses fixtures and preview scenarios.
Backend speakers load `/api/speaker/dashboard` and `/api/proposals` detail/list
routes with the authenticated UUID in the temporary `speakerId` query; edits use
PATCH with title, description and trackId, and named withdrawal uses DELETE 204.
`services/speakerPresentation.js` keeps original backend records and centralizes
presentation aliases/status labels. Live errors never substitute these fixtures.
Profile updates, scheduling and speaker/session relationships still await backend
contracts. See `../../AUTH_INTEGRATION.md` for connected routes and constraints.
