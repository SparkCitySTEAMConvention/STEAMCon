# Public Events experience

`/events` is public. The header uses native details/summary: Enter or Space
toggles Events, Tab reaches its links, Escape closes it and focuses the summary,
and pointer interaction outside closes it. Selecting a link closes the disclosure.

`experience` accepts `workshops`, `talks`, `special`, `showcase`, and `schedule`.
Missing, empty, or invalid values default to `schedule`. These values select
editorial experience introductions and their proposed event collections, not
classifications of backend session records. Only Schedule displays the complete
track program and schedule. Selection is derived from useSearchParams on every
render, so navigation and Back/Forward update the heading, active link, description,
featured concept, and collection without a refresh.

The compact introduction leads directly to the experience controls and selected
heading. Featured content and matching cards precede shared visit planning.
Query changes within the mounted page focus the selected heading (tabindex -1),
with scrolling prevented unless the heading is outside the viewport. In that case
it is brought into view instantly, with no scroll animation, including under
reduced motion. Initial arrivals use the compact layout and existing route focus.

Experience metadata in `config/eventExperiences.js` is proposed programming.
It supplies no confirmed date, room, speaker, session ID, or API relationship.
Anonymous/demo schedule entries remain explicitly labeled demonstration data.
Live sessions use the existing public program adapter and published occurrences;
no preview metadata is merged into them. Events offers navigation only and does
not enroll, book, or save a schedule.

Node tests render public routes and navigation, test query selection and data
boundaries, and dispatch dismissal events against a disclosure fixture. A jsdom
test mounts the public page once, clicks header links, and traverses router
history to verify immediate content updates without a remount or API requests. Native
browser Enter/Space/Tab handling, visual layout, and screen reader announcements
still require a browser/manual check.
