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
The dashboard picker previews all 15 identities and their own proposals.

All convention scheduling and location fields remain nullable. Display fallbacks
are shared in `utils/proposalPresentation.js`. A schedule-change action requires
approval plus a timestamp or both date and time; partial scheduling alone does
not permit a change request.

`services/speakerRepository.js` is a replaceable asynchronous frontend adapter,
not Backend C's final API contract. No endpoint, DTO, authentication or server
validation rules are assumed. Draft edits stay in memory until refresh. Only
draft title, abstract, track, format and duration are editable. Schedule requests
explain that integration is pending and never claim a request was sent.

## State review

Run `npm run dev` in `frontend`. These query overrides work only in development:

- `/speaker?preview=loading`, `?preview=error`, `?preview=empty`
- `/speaker/proposals/proposal-bill-nye` — draft and preview editing
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
- Chromium checks passed at 320px, 768px and 1440px: homepage, dashboard,
  detail/editor screens and all state previews have no horizontal overflow.
- Keyboard filters and card links, route focus, editor autofocus and return focus,
  all 15 workspace selections, reduced motion, and absence of runtime errors passed.
- Detail screenshots visually reviewed at all three widths.
- `node --test frontend/tests/speakerRepository.test.js` from repository root:
  three tests passed (relationships/nullability, schedule eligibility, draft saves).
- `npm run lint` and `npm run build` from frontend, and `git diff --check` passed.

Remaining: Backend C contract/integration, persistent draft saving and real
schedule-change submission; team review before public-figure fixtures are used
beyond development. No GitHub checklist was edited and no PR was opened.
