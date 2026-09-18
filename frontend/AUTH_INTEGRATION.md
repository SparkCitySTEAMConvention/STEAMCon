# Shared frontend authentication and Speaker Portal integration

Normal editable credentials use backend authentication. Configured demo identities use an isolated frontend adapter; demo access does not grant server authorization. Backend files are unchanged.

## Completed authentication contracts

POST `/api/auth/login` accepts `{ email, password }`. Login and GET `/api/auth/me` return the nested `AuthResponse`:

```js
{
  sessionId,
  createdAt,
  expiresAt,
  status,
  user: {
    id,
    email,
    displayName,
    organization,
    roles
  }
}
```

The frontend accepts active, unexpired sessions with real session/user UUIDs and a `user.roles` array. It retains the backend identity fields and roles. A compatibility `user.role` is derived from that array for existing portal consumers: SPEAKER takes precedence over ATTENDEE; neither role yields null. Email addresses and portal selection never assign backend roles. RoleRoute checks the roles array, while the existing speaker sources use the derived SPEAKER role. Accounts without a supported portal role reach Access Denied.

Backend sessions last eight hours. On application startup, AuthContext waits for restoration before resolving protected routes. A cached backend identity is revalidated through GET `/api/auth/me` using `X-Session-Id`; the returned identity and roles replace cached values. Invalid, expired, revoked, unreadable or unverifiable sessions are discarded. Backend restoration is implemented and is no longer blocked by a missing endpoint.

Backend logout calls POST `/api/auth/logout` with `X-Session-Id`. The backend revokes the session and returns 204. Local storage is cleared even if the request fails; AuthContext clears reactive state and returns to the homepage. A failed network request cannot guarantee server revocation. Demo logout clears local state without contacting the backend.

`authenticatedFetch` preserves caller headers, attaches the backend session UUID as `X-Session-Id`, and rejects requests to another origin. SessionAuthenticationFilter verifies active, unexpired sessions and loads active roles as `ROLE_*` authorities. SecurityConfig protects current-session/logout endpoints and restricts proposal creation and speaker application creation to SPEAKER. Frontend guards supplement server authorization.

## Proposal creation contract

Live POST `/api/proposals` sends exactly:

```js
{ title, description, trackId }
```

Title and description are trimmed. No `speakerId`, `status`, abstract, format, duration or other frontend field reaches the live request. Speaker identity belongs to the authenticated backend session, rather than a caller-supplied ownership field. `speakerId` is excluded from creation bodies; it remains a temporary authenticated ownership query for live reads and mutations. Preview records also use local SUBMITTED status.

Validation follows the text limits in `CreateProposalRequest`: title permits 200 characters and description permits 2,000 characters. The form requires nonblank title/description and a selected track, rejects overlong trimmed values without truncating, and requires a loaded backend track UUID for live submission. Live creation also requires a verified backend speaker UUID, SPEAKER role and active session flag. Tracks load through the existing eventRepository GET `/api/tracks`; backend responses are returned unchanged. Submission failures preserve entries for retry.

Backend status supplied for this integration: `mvn test` passes with 104 tests. Frontend verification below tests request contracts without running backend persistence.

## Demo identities and preserved preview behavior

`src/auth/demoConfig.js` defines these public frontend identities, rather than seeded database accounts:

| Role | Email | Password | Display name |
| --- | --- | --- | --- |
| ATTENDEE | attendee@steamcon.demo | SteamConDemo! | Demo Attendee |
| SPEAKER | speaker@steamcon.demo | SteamConDemo! | Bill Nye |

Set `VITE_ENABLE_DEMO_AUTH=false` to disable the adapter. Configured credentials alone receive demo roles. Login fields remain editable after the portal selector populates them. Passwords are never stored. Demo sessions survive same-tab refresh for eight hours in sessionStorage and never send fake backend session headers.

Bill Nye's dashboard, proposal lookup and draft edits remain preview operations. Preview-created proposals are isolated in memory for the current user object and persist across portal navigation, then reset on login or refresh. Only locally created, owned, SUBMITTED and unscheduled proposals can be deleted, with explicit confirmation; original fixtures and panel memberships remain intact. Preview submissions and deletion never contact live adapters.

Profile editing remains an isolated Bill Nye preview. Saved fields and dashboard updates persist across portal navigation, then reset on login or refresh. Name, professional title and organization allow 255 characters; biography allows 2,000. The professional title is distinct from an authentication role. Public fixtures remain unchanged.

## Existing live sources and adapters

Verified backend roles unlock the speaker dashboard, proposal, forum and notification sources. Demos continue to use isolated local data, without backend requests.

- notificationRepository uses GET `/api/notifications/me` and POST `/api/notifications/{id}/read`. Live reads require a backend user UUID and active session; failed updates preserve unread state.
- forumRepository uses GET `/api/forums` with optional scope, GET `/api/forums/{id}/messages` without identity/role queries, and POST to that messages path with only `{ body: "trimmed message" }`. The backend derives identity and roles from `X-Session-Id`. Speaker sources require an authenticated speaker and active backend session, preserve failed drafts and provide retry states. Forum policies remain backend-enforced.
- eventRepository reads `/api/tracks`, `/api/sessions`, `/api/session-occurrences` and their `/{id}` details through authenticatedFetch, returning backend records unchanged. These routes require authentication under current SecurityConfig.

## Still unavailable in the live frontend

The following integrations remain unavailable and are not unlocked by authentication:

- Profile update. No verified editable profile read/update contract supports the preview's complete fields; backend profile editing remains disabled. Authentication identity fields are not a profile update API.
- Speaker-to-session scheduling reads. Shared sessions and occurrences do not establish a verified speaker/proposal scheduling relationship. The frontend does not invent assignments, dates or calendar eligibility.

Profile updates and scheduling still require supported backend contracts. No new Tracks-page speaker buttons are added.

## Development proxy and verification

The Vite development server proxies `/api` to `http://localhost:8080`; `VITE_API_PROXY_TARGET` overrides the target through loadEnv. Production build and preview do not provide this proxy, so deployment requires an API at the application origin.

Run `npm test`, `npm run lint` and `npm run build` from `frontend/`, and `git diff --check` from the repository. Tests cover nested authentication, demo restoration/isolation, backend roles, current-session restoration, logout cleanup, exact adapter bodies and headers, proposal limit boundaries, and preservation of existing preview behavior. These checks verify frontend contracts; they do not establish a running backend connection or successful backend persistence.

## Live speaker dashboard and proposals

Backend SPEAKER sessions with an active session and valid user UUID now connect
`/speaker` and `/speaker/proposals/:proposalId` to the authenticated speaker
source. The dashboard reads applications and approval feedback from the dashboard
endpoint and the visible proposal list from `/api/proposals/me`. Both reads must
succeed; failure in either exposes Retry without preview fallback.
Real users display their authenticated `displayName`; live failures expose an
accessible error and Retry rather than falling back to Bill Nye.

Connected contracts (all protected requests use `authenticatedFetch` and
`X-Session-Id`):

- `GET /api/speaker/dashboard?speakerId={authenticatedUserId}`
- `GET /api/proposals/me?speakerId={authenticatedUserId}` (visible dashboard proposal list)
- `GET /api/proposals/{proposalId}?speakerId={authenticatedUserId}`
- `POST /api/proposals` with `{title, description, trackId}`
- `PATCH /api/proposals/{proposalId}?speakerId={authenticatedUserId}` with only
  `{title, description, trackId}` (nullable fields supported by repository)
- `DELETE /api/proposals/{proposalId}?speakerId={authenticatedUserId}` returning
  204, without JSON parsing

The `speakerId` query is a temporary backend limitation. The source derives it
from a snapshot of the authenticated backend user, ignoring caller, form and route ownership values.
The backend must continue enforcing ownership; a future session-derived backend
contract can remove this query. Proposal and track identifiers are validated as
UUIDs before live dispatch.

DRAFT and SUBMITTED proposals expose editing and named withdrawal confirmation.
Live edits validate the existing title/description limits, require an available
backend track, and retain the current track while choices load or retry. Empty
or failed track loads block saving with explanatory text and Retry. Pending
saves disable inputs and reject duplicate submission.

Failed saves preserve draft inputs; failed withdrawal preserves the proposal and
confirmation for retry. Confirmation must finish or be cancelled before editing;
cancellation restores focus to the withdrawal action. Withdrawal succeeds with a live announcement and focus
on the withdrawn heading. Profile editing remains unavailable live until a
profile-update endpoint exists. Scheduling, proposal-to-session and speaker
relationships remain unavailable and receive neutral presentation.

Demo SPEAKER sessions retain Bill Nye fixtures, local proposal creation/deletion,
profile edits, notifications and forums. Development preview scenarios apply
only to demo sessions and cannot replace live results.

Notification mark-read sends no body. Repository methods return backend JSON unchanged; an empty successful mark-read response returns no record, and the UI reloads the authoritative notification list. Demo forum and notification state stays with the current login identity, with zero API requests and no live fallback.
