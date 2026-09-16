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

## TODOs and blockers

1. Backend A current-user/session validation endpoint: replace deliberate backend restoration refusal with its verified contract.
2. Backend A authenticated-user roles/display name and server role enforcement: replace the null real role without email inference.
3. Backend A logout/revocation endpoint: call it in the service while keeping cleanup on every failure path.
4. Decide CORS versus Vite `/api` proxy. Neither is currently configured; real login requires a same-origin API deployment. No speculative URL was added.
5. Seed backend demo accounts and roles; replace adapter dispatch with real endpoint login, then disable/remove frontend demo identities.
6. Connect unchanged speakerRepository.js to Backend C once its supported contract is agreed, preserving the public interface and using authenticatedFetch.
7. Connect notifications and forums using verified authenticated identity and agreed contracts. Existing mock portal data remains unchanged.

## Login navigation

The logged-out public header links directly to `/login`. Its labeled native portal selector populates credentials from demoConfig.js without signing in. Both fields remain editable and submission uses their current values; selection never grants a role. Successful configured logins open `/attendee` or `/speaker` (Bill Nye), while roleless backend sessions open Access Denied with a distinct account-role explanation. The authenticated account menu retains portal navigation, Escape/outside-click dismissal, and logout.
