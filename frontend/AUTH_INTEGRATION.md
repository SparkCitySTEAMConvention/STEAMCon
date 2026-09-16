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

These adapters are not complete end-to-end features. Bill Nye's dashboard remains intentionally mock-backed, draft edits remain in memory, notifications are not active in that demo, forums have no UI connection, and the Propose button is not connected. Backend proposal GET/update/dashboard endpoints remain unavailable.

Permanent tests in `tests/apiRepositories.test.js` verify adapter contracts, validation, responses and failures. Existing speaker tests preserve mock lookup/dashboard/editing coverage. `tests/viteProxy.test.js` checks the proxy and confirms production browser output excludes the default and overridden Spring Boot targets. These tests do not prove live backend integration.

## TODOs and blockers

1. Backend A current-user/session validation endpoint: replace deliberate backend restoration refusal with its verified contract.
2. Backend A authenticated-user roles/display name and server role enforcement: replace the null real role without email inference.
3. Backend A logout/revocation endpoint: call it in the service while keeping cleanup on every failure path.
4. Configure the production same-origin API deployment; the existing proxy is development-only.
5. Seed backend demo accounts and roles; replace adapter dispatch with real endpoint login, then disable/remove frontend demo identities.
6. Backend owner must supply supported proposal GET/update/dashboard endpoints before replacing mock reads and in-memory edits.
7. UI integration remains future work for the existing notification, forum and proposal-creation adapters; use verified backend identity and real UUIDs.
8. Backend owner must correct `CommunicationService` referencing `ForumScope.GENERAL`, absent from the current enum. This prevents successful backend compilation; no backend fix is included here.

## Login navigation

The logged-out public header links directly to `/login`. Its labeled native portal selector populates credentials from demoConfig.js without signing in. Both fields remain editable and submission uses their current values; selection never grants a role. Successful configured logins open `/attendee` or `/speaker` (Bill Nye), while roleless backend sessions open Access Denied with a distinct account-role explanation. The authenticated account menu retains portal navigation, Escape/outside-click dismissal, and logout.
