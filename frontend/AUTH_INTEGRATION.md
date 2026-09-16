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

Title and description are trimmed. No `speakerId`, `status`, abstract, format, duration or other frontend field reaches the live request. Speaker identity belongs to the authenticated backend session, rather than a caller-supplied ownership field. `speakerId` is added only to preview/mock proposal ownership records; preview records also use local SUBMITTED status.

Validation follows the text limits in `CreateProposalRequest`: title permits 200 characters and description permits 2,000 characters. The form requires nonblank title/description and a selected track, rejects overlong trimmed values without truncating, and requires a loaded backend track UUID for live submission. Live creation also requires a verified backend speaker UUID, SPEAKER role and active session flag. Tracks load through the existing eventRepository GET `/api/tracks`; backend responses are returned unchanged. Submission failures preserve entries for retry.

The local backend still needs synchronization before end-to-end proposal validation: SpeakerController references an undefined `authenticatedUserId` in proposal creation and uses `Authentication` without an import. The request record also retains a status field, and SessionProposal retains default JPA string columns despite the request's 2,000-character description limit. The frontend follows the exact three-field body and request validation limits documented here; backend compilation and persistence have not been verified.

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

Verified backend roles unlock the existing speaker forum, notification and proposal creation sources. Demos continue to use isolated local data, without backend requests.

- notificationRepository uses GET `/api/notifications/me?userId=…` and POST `/api/notifications/{id}/read`. Live reads require a backend user UUID and active session; failed updates preserve unread state.
- forumRepository uses GET `/api/forums` with optional scope, GET `/api/forums/{id}/messages` with role/permission, and POST to that messages path with `{ authorId, body, role, permission }`. Speaker sources use READ for reads and POST for submissions, preserve failed drafts and provide retry states. Forum policies remain backend-enforced.
- eventRepository reads `/api/tracks`, `/api/sessions`, `/api/session-occurrences` and their `/{id}` details through authenticatedFetch, returning backend records unchanged. These routes require authentication under current SecurityConfig.

## Still unavailable in the live frontend

The following integrations remain unavailable and are not unlocked by authentication:

- Proposal list/read/update/delete. The existing dashboard, detail and draft-edit flows remain mock-backed; live deletion is disabled. Local SpeakerController contains read/update/withdrawal routes with caller-supplied speakerId, but they have not been integrated or established as working secured ownership contracts. Live creation does not manufacture dashboard persistence.
- Profile update. No verified editable profile read/update contract supports the preview's complete fields; backend profile editing remains disabled. Authentication identity fields are not a profile update API.
- Speaker application list/status reads. No live application listing or status-reading adapter/UI is integrated. Creation and admin status-write endpoints do not provide these reads.
- Speaker-to-session scheduling reads. Shared sessions and occurrences do not establish a verified speaker/proposal scheduling relationship. The frontend does not invent assignments, dates or calendar eligibility.

Supported backend ownership, authorization, response and validation contracts must be confirmed before connecting these operations. No new Tracks-page speaker buttons are added.

## Development proxy and verification

The Vite development server proxies `/api` to `http://localhost:8080`; `VITE_API_PROXY_TARGET` overrides the target through loadEnv. Production build and preview do not provide this proxy, so deployment requires an API at the application origin.

Run `npm test`, `npm run lint` and `npm run build` from `frontend/`, and `git diff --check` from the repository. Tests cover nested authentication, demo restoration/isolation, backend roles, current-session restoration, logout cleanup, exact adapter bodies and headers, proposal limit boundaries, and preservation of existing preview behavior. These checks verify frontend contracts; they do not establish a running backend connection or successful backend persistence.
