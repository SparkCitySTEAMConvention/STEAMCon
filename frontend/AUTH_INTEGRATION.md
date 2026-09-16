# Shared frontend authentication

Hybrid: normal editable credentials use real backend login; isolated frontend demo identities use a demonstration adapter. Demo access is not production authentication or server authorization.

## Existing Backend A contract

Inspected AuthController, AuthService, AuthSession, SessionAuthenticationFilter and SecurityConfig; no backend files changed.

- POST `/api/auth/login`, JSON `{ email, password }`, returns `id`, `userId`, `createdAt`, `expiresAt`, `status`. Active sessions expire after eight hours.
- Authenticated requests use exactly `X-Session-Id`, the session ID UUID. The filter authenticates user ID with an empty authorities list.
- POST `/api/auth/register` returns `id`, `email`, `displayName`; that is not the login response.
- Invalid credentials throw a runtime exception with no explicit HTTP error mapping. Explicit 401/403 or the implemented invalid-credentials message are recognized; opaque 500 responses show a general error.
- No roles in login, current-user/session restoration, logout endpoint or seeded demo accounts were found.

Real login establishes a session but cannot open role-protected portals until Backend A supplies roles. Cached backend identity is deliberately discarded on refresh because it cannot be validated/restored. Logout clears local state only; backend sessions remain active until expiry. Frontend route guards do not enforce backend security.

## Public demo configuration

`src/auth/demoConfig.js` contains all demo credentials and identities:

| Role | Email | Password | Display name |
| --- | --- | --- | --- |
| ATTENDEE | attendee@steamcon.demo | SteamConDemo! | Demo Attendee |
| SPEAKER | speaker@steamcon.demo | SteamConDemo! | Bill Nye |

These are frontend identities, not PostgreSQL accounts. The adapter is enabled for this demonstration build including previews. Set `VITE_ENABLE_DEMO_AUTH=false` to disable it in deployments. Only configured credentials receive demo roles; arbitrary email addresses never gain roles. Forms remain editable after populating demos. Passwords are never stored. Demo sessions survive same-tab refresh for eight hours in sessionStorage and never send fake session headers.

The service owns requests, storage, restoration, demo dispatch and local logout. AuthContext owns reactive state; ProtectedRoute and RoleRoute centralize route decisions. authenticatedFetch preserves caller headers and attaches backend session headers only to same-origin requests.

## Current API adapters and development proxy

The Vite development server proxies `/api` to `http://localhost:8080` by default. `VITE_API_PROXY_TARGET` overrides the target through Vite's `loadEnv` API. Proxying is disabled for production build and preview; deployed browser requests still require an API at the application origin.

Non-demo credentials use the real POST `/api/auth/login` endpoint. The notification repository implements GET `/api/notifications/me?userId=…` and POST `/api/notifications/{id}/read`. The forum repository implements GET `/api/forums` with optional scope, GET `/api/forums/{id}/messages` with role/permission, and POST to that messages path with `{ authorId, body, role, permission }`. `speakerRepository.createProposal` posts `{ speakerId, title, description, trackId }` to `/api/proposals`.

All protected adapters reuse `authenticatedFetch`, reject missing required values before fetching, and return backend JSON. Message bodies and proposal title/description are trimmed. Extra frontend fields are excluded from POST bodies. Live use requires a backend-authenticated account and real UUIDs; adapters do not generate fake UUIDs or translate mock/demo IDs into backend IDs.

These adapters are not complete end-to-end features. Bill Nye's dashboard remains intentionally mock-backed, draft edits remain in memory, notifications use isolated frontend preview data, the speaker forum UI uses isolated local data during demo authentication, and proposal creation uses the guarded source described below. Backend proposal GET/update/dashboard endpoints remain unavailable.

Permanent tests in `tests/apiRepositories.test.js` verify adapter contracts, validation, responses and failures. Existing speaker tests preserve mock lookup/dashboard/editing coverage. `tests/viteProxy.test.js` checks the proxy and confirms production browser output excludes the default and overridden Spring Boot targets. These tests do not prove live backend integration.

The shared `eventRepository` now reads `/api/tracks`, `/api/sessions` and `/api/session-occurrences`, including `/{id}` details, through `authenticatedFetch`. These return TrackResponse, SessionResponse and SessionOccurrenceResponse records unchanged. Track reads supply real backend UUIDs for the guarded proposal form. Although intended for shared browsing, these routes require authentication under current SecurityConfig. Enrollment POST/DELETE belongs to Frontend A; event writes and speaker application status belong to admin/unassigned. See BACKEND_STRUCTURE.md for exact contracts. CommunicationService now uses CONCIERGE; the prior enum blocker is resolved in source. Maven compilation was not tested. Global and speaker/communication exception handlers map IllegalArgumentException to HTTP 400 with timestamp/status/error/message; login RuntimeException failures are not covered by that mapping.

## TODOs and blockers

1. Backend A current-user/session validation endpoint: replace deliberate backend restoration refusal with its verified contract.
2. Backend A authenticated-user roles/display name and server role enforcement: replace the null real role without email inference.
3. Backend A logout/revocation endpoint: call it in the service while keeping cleanup on every failure path.
4. Configure the production same-origin API deployment; the existing proxy is development-only.
5. Seed backend demo accounts and roles; replace adapter dispatch with real endpoint login, then disable/remove frontend demo identities.
6. Backend owner must supply supported proposal GET/update/dashboard endpoints before replacing mock reads and in-memory edits.
7. Live forum access remains blocked by missing backend roles; live notifications remain blocked by missing backend roles; live proposal creation remains guarded by missing backend roles. Use verified backend identity and real UUIDs.

## Login navigation

The logged-out public header links directly to `/login`. Its labeled native portal selector populates credentials from demoConfig.js without signing in. Both fields remain editable and submission uses their current values; selection never grants a role. Successful configured logins open `/attendee` or `/speaker` (Bill Nye), while roleless backend sessions open Access Denied with a distinct account-role explanation. The authenticated account menu retains portal navigation, Escape/outside-click dismissal, and logout.

## Speaker Forum interface

`/speaker/forums` remains behind ProtectedRoute and the SPEAKER RoleRoute. AuthContext exposes the existing session source without changing login, restoration or logout. `speakerForumSource` isolates demo forum examples and in-memory messages from all backend requests. Examples live in `mocks/forumData.js`, not JSX, and are labeled on the page. Leaving the page discards demo messages.

Backend dispatch requires a backend session source, SPEAKER role and valid user UUID, then uses the existing forumRepository with exact scope values, READ for message reads, and POST plus the authenticated author ID and trimmed body for submissions. Backend login currently supplies no role, so real users still reach Access Denied; no role is inferred. Forum policies remain enforced by the backend. The UI preserves failed drafts, guards duplicate submissions, and handles loading, empty data and retry states. It displays returned author/flair IDs because no name/flair lookup contract is available.

Permanent `speakerForumSource.test.js` tests cover demo isolation, incomplete identities, exact dispatch and errors. Adapter tests continue to cover HTTP contracts and failures. Run these tests with `npm test` from `frontend/`. These checks do not establish live backend integration.

## Speaker notifications

The existing `/speaker` section uses `speakerNotificationSource`. Bill Nye preview notifications live in `mocks/notificationData.js`. Preview reads and mark-as-read never call the API. Read state stays in memory for the application session, including dashboard navigation, and resets on login or refresh. Scheduling dates remain nullable in shared proposal/session fixtures; the proposed-participant disclaimer remains intact.

Live reads require a real backend user UUID, backend session source, and active session. AuthContext exposes only a read-only `hasBackendSession` flag. GET `/api/notifications/me?userId={userId}` and POST `/api/notifications/{notificationId}/read` use the unchanged notificationRepository and authenticatedFetch with `X-Session-Id`. Returned fields are `id`, `userId`, `message`, `type`, `read`, `createdAt`; mark-as-read returns the updated notification. There is no title or scheduled-date field. Missing identity/session prevents requests. Errors offer retry, and failed updates preserve unread state.

Backend login still supplies no roles, preventing real accounts from entering the SPEAKER route. Backend current-user/session validation and role contracts remain blockers for live portal access and restoration. Permanent source tests verify isolation, exact dispatch, responses, guards, and retry. Existing adapter tests verify HTTP/session handling. No component test framework exists; UI states, semantic markup and 320/768/1440px responsive behavior are reviewed in component/CSS code. Tests do not establish a deployed backend connection.


## Propose a Session

`/speaker/proposals/new` uses the existing protected SPEAKER route. `speakerProposalSource` isolates preview track loading and submission: neither calls fetch or a live adapter. Trimmed preview records use SUBMITTED and stay in memory for the current AuthContext user, including navigation back to the dashboard. A new login or application refresh resets them; existing Bill Nye fixtures remain unchanged. Dashboard preview submissions are shown separately with no scheduling data or unsupported detail links.

Live tracks use eventRepository GET `/api/tracks`. Live submission requires a backend speaker UUID, SPEAKER role, backend authentication source, active backend session flag, and a loaded backend track UUID. It uses speakerRepository POST `/api/proposals` with exactly speakerId, title, description and trackId. Backend JSON is returned unchanged: id, speakerId, title, description, trackId, status. SessionProposal has no submittedAt getter. Status values are SUBMITTED, APPROVED, REJECTED. Title and description use default JPA string columns (255 characters); the form rejects longer trimmed values without truncation.

There are no live proposal GET/dashboard endpoints. Successful live submission does not manufacture dashboard persistence. Backend login still supplies no roles, so live speaker access remains blocked until that contract is provided. Current-user/session validation and restoration remain backend blockers. Permanent proposal source tests cover preview isolation, session reset, validation, exact live dispatch, identity/session/role/track guards, and failures with retry. UI accessibility and responsive states are reviewed in component/CSS code; these checks do not establish live backend integration.

## Proposal removal

Preview-created proposals are session-local and deletable only by the source instance that created them, while SUBMITTED and unscheduled. Original fixtures, approved proposals, scheduled proposals and existing panel memberships are protected; deletion never mutates shared fixtures or calls fetch/the live repository. The dashboard requires explicit confirmation naming the proposal, supports cancellation, prevents duplicate pending deletion, preserves proposals on failure, announces success, and restores focus to the Delete button after cancellation or the local-proposals heading after deletion. The existing source remains the sole owner of local records; the dashboard rereads it after successful deletion without a reload.

The current SpeakerController/SpeakerService have no proposal DELETE, cancellation or withdrawal contract. POST `/api/proposals/{id}/decision` supports only APPROVE/REJECT; speaker-application status updates are not proposal withdrawal. SecurityConfig requires authentication but supplies no proposal-removal ownership/status rules because no such operation exists. No live deletion repository operation or enabled live Delete button is added. A backend deletion/withdrawal endpoint with server-enforced ownership, authorization and allowed statuses remains required for live removal.


## Speaker profile editing

`/speaker/profile/edit` is inside the existing ProtectedRoute and SPEAKER RoleRoute. Logged-out navigation follows the login return-path flow; other roles receive Access Denied. Edit Profile links here from the existing SpeakerHeader. Cancel returns to `/speaker` without invoking an update.

`speakerProfileSource` owns a cloned Bill Nye preview profile. The form and dashboard use the same WeakMap-cached source for the current AuthContext user. Reads, track choices and saves never call fetch or any live repository. Edits survive portal navigation, stay in memory only, and reset on new login or application refresh. No component reads sessionStorage. Public speaker-directory fixtures, proposals, forums and notifications remain unchanged. The proposed-participant disclaimer is unchanged.

Editable presentation fields are `name` (display name), `role` (professional current title, not authentication role), `organization`, `bio`, and primary track (`trackIds[0]`, selected using fixture track IDs). `firstName` is derived from the trimmed name; the dashboard greeting displays the full saved `name`. Successful updates increment a source revision and notify subscribers. The dashboard subscribes with useSyncExternalStore and reloads its profile when the revision changes. Text is trimmed on save. Display name, title and organization allow 255 characters; biography allows 2000. All are required, as is a known primary track. These are frontend validation limits; display name and organization also match the default JPA User string column limit. No silent truncation occurs.

Inspected SpeakerController/SpeakerService, speaker request records/entities, User, AuthController/AuthService/UserResponse, SessionAuthenticationFilter and SecurityConfig. There is no UserController/UserService or verified profile GET/PUT/PATCH endpoint, request record, or response contract. User has `displayName` and `organization`, but title, biography and primary profile track are preview-only fields with no matching backend profile property. UserRole is an authentication role; proposal `trackId` belongs to a proposal. Neither is a profile-editing field. Registration POST `/api/auth/register` accepts email/displayName/password and returns id/email/displayName; it is not a profile update.

Live editing is disabled with explanatory text and no enabled Save action. The source rejects missing backend user UUID, backend source, SPEAKER role or active session before checking the unavailable contract. Valid backend identities still cannot read/update a profile and make no network request. There are no profile ownership or role rules to preserve yet. Existing SecurityConfig requires authenticated protected requests; SessionAuthenticationFilter accepts active, unexpired X-Session-Id sessions with empty authorities. Login still supplies no roles. Backend owners must provide a profile read/update contract with exact supported fields, response shape, validation limits and server-enforced ownership/role authorization before live editing can be connected through authenticatedFetch.

Permanent speakerProfileSource tests cover no-network preview operations, cancellation, validation/limits, returned-copy and session isolation, dashboard-facing updates, fixture and other portal state preservation, and live identity/session/role guards. UI states and responsive behavior are reviewed in JSX/CSS; the repository has no component/browser testing framework, and no browser harness is added.
