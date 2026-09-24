# Authenticated portal route audit

Audited `src/App.jsx`, `auth/AuthContext.jsx`, `auth/useAuth.js`,
`auth/ProtectedRoute.jsx`, `auth/RoleRoute.jsx`, existing dashboard headers,
sections, booking links and speaker itinerary/notification components.

| Destination | Attendee | Speaker |
| --- | --- | --- |
| Explore | `/events` (public event discovery) | `/events` |
| Calendar | `/attendee#schedule` (existing My schedule section) | Unavailable: no separate calendar destination; personal calendar entries appear in My itinerary |
| My itinerary | `/attendee#itinerary` | `/speaker#speaker-itinerary` |
| Travel | `/attendee/travel` (booking) | Unavailable: `/travel` is public planning information; no Speaker booking destination exists |
| Hotel | `/attendee/hotel` | Unavailable: existing booking route requires ATTENDEE |
| Car rental | `/attendee/car` | Unavailable: existing booking route requires ATTENDEE |
| Forums | Unavailable: no attendee forum destination | `/speaker/forums` |
| Notifications | Unavailable: no attendee notification destination | `/speaker#speaker-updates` (Organizer Updates disclosure) |
| Account | `/attendee` (existing identity/admission overview; no account-edit route) | `/speaker#speaker-profile` (existing identity section) |
| Overview | Not shown | `/speaker` |
| My proposals | Not shown | `/speaker#speaker-proposals` |
| Speaking schedule | Not shown | `/speaker#speaker-engagements` |

Other existing speaker destinations are `/speaker/profile/edit`,
`/speaker/proposals/new`, and `/speaker/proposals/:proposalId`. Account uses
its existing overview rather than assuming profile editing is available in
all authentication sources. There is no working global search destination.
No search field is provided.

ProtectedRoute requires an authenticated session; RoleRoute checks centralized
`user.roles` or `user.role`. Booking routes are nested under ATTENDEE and speaker
routes under SPEAKER. A speaker-only user must never be sent to attendee booking
routes. For users with both roles, available attendee booking/calendar routes
are reused, with speaker identity and itinerary taking precedence.

The shell consumes the authentication context and invokes its existing logout
callback (which clears the session and navigates home). It is intended for use
inside ProtectedRoute; it is not a replacement for route guards. This task
adds no destinations. Both guarded route families now use one persistent shell
per portal, with page content rendered through Outlet. All live/preview
boundaries and endpoint adapters remain untouched.

Mobile navigation uses 760px, the existing attendee navigation breakpoint.
Speaker layouts also have content breakpoints at 900px and 600px; those remain
unchanged. New shell styles are scoped under `.steam-portal-shell`.

## Complete Speaker route family

Inside ProtectedRoute and RoleRoute(SPEAKER), one PortalShell wraps:

- `/speaker` — overview with profile, updates, proposals, engagements and itinerary targets
- `/speaker/proposals/new` — proposal creation
- `/speaker/proposals/:proposalId` — details, inline editing and withdrawal
- `/speaker/forums` — forum directory and conversations
- `/speaker/profile/edit` — local demo profile editing; live editing stays unavailable

There are no separate speaking schedule or itinerary routes. `/speakers` remains
the public directory outside both shells and all authentication guards. Proposal
creation/detail routes select My proposals; profile editing selects Account.
No newly merged profile, assignment or change-request endpoints are connected.
