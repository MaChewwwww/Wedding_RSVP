# Implementation Roadmap

No implementation should begin until the P0 open questions are answered or explicit defaults are approved.

## Phase 0 — Decisions and content preparation

Deliverables:

- Confirm wedding date, RSVP deadline, timezone, and support contact.
- Configure the approved deadline as an absolute ISO 8601 `RSVP_DEADLINE` server environment value.
- Confirm the one-pass-per-invited-guest policy.
- Confirm the one-invitation-per-guest policy.
- Confirm Supabase, Vercel, Resend, and domain ownership.
- Prepare synthetic guest data.
- Approve section-to-asset mapping.
- Request higher-resolution or mobile-specific artwork if needed.
- Generate and approve the missing background set defined in `background-art-plan.md`.

Exit criteria:

- P0 questions resolved.
- No date conflict between configuration and envelope artwork.

## Phase 1 — Foundation

Deliverables:

- Next.js project and quality tooling.
- Supabase environments, migrations, RLS baseline, and seeded admin.
- Design tokens, typography, root layouts, error/loading patterns.
- CI pipeline and preview deployment.

Exit criteria:

- Protected admin shell works.
- Anonymous database access is denied.
- Build, lint, type check, and tests pass.

## Phase 2 — Invitation lookup and RSVP

Deliverables:

- Closed/open envelope experience.
- Accessible lookup form.
- Server-enforced RSVP deadline and closed-state experience.
- Server-side normalization and candidate matching.
- Invited-name confirmation and single-guest RSVP form.
- Guest session.
- Admin guest-invitation CRUD and CSV import.

Exit criteria:

- Critical guest RSVP scenarios pass.
- Guest submission and updates fail at and after the exact configured deadline, including stale-page requests.
- Matching evaluation has no known false-positive auto-match.
- Search does not reveal guest candidates.

## Phase 3 — Wedding pass and email

Deliverables:

- QR issuance and validation.
- Pass screen and PNG download.
- Resend/React Email integration.
- Delivery tracking and retry path.
- Admin QR status controls.

Exit criteria:

- QR contains no personal data.
- RSVP remains successful during email failure.
- Revocation and resend are tested.

## Phase 4 — Main wedding page

Deliverables:

- Approved optimized desktop/mobile background assets for all planned sections.
- Sticky anchored navbar.
- Welcome and pass sections.
- Timeline.
- Featured pre-wedding section.
- Photo and invitation carousels.
- Announcement and venues.
- Entourage, FAQ, Love Gift, footer.
- Responsive, reduced-motion, and image optimization work.

Exit criteria:

- All sections satisfy content and visual acceptance checks.
- Generated backgrounds have no accidental text, visual artifacts, or unsafe text overlap.
- Every guest section and primary action passes the 320px, 375px, and 390px mobile acceptance checks.
- No production placeholders remain unless explicitly accepted.
- Accessibility review passes.

## Phase 5 — Seating and attendance

Deliverables:

- Table CRUD and capacity management.
- Invitee assignments and exports.
- QR scanner and manual attendance.
- Idempotent attendance events and reversal audit.
- Phone-focused check-in interface.

Exit criteria:

- Capacity cannot be exceeded through concurrency.
- Duplicate scans are harmless.
- Manual fallback is operational.

## Phase 6 — Hardening and launch

Deliverables:

- Production content import.
- Security review and RLS verification.
- Full E2E/UAT.
- Email-domain verification.
- Performance optimization.
- Backup/export and event-day runbook.
- Production deployment and monitoring.

Exit criteria:

- Couple approves content and guest experience.
- Coordinator completes a rehearsal check-in.
- Recovery contacts and support process are documented.

## Optional post-launch work

- Separate check-in staff role.
- Offline-tolerant check-in queue.
- Drag-and-drop seating/floor plan.
- Full wedding content editor.
- PDF invitation generation.
- Privacy-respecting analytics dashboard.

## Suggested workstreams

Work may be parallelized after Phase 1:

- Guest invitation/RSVP and matching.
- Main-page content/design.
- Admin guest/seating operations.
- QR/email integration.

Database contracts, authorization, and design tokens should be agreed before parallel implementation to avoid incompatible assumptions.

## Definition of done

A feature is done only when:

- server and UI validation exist;
- authorization is tested;
- loading, empty, success, and error states exist;
- keyboard and mobile behavior are verified;
- sensitive data is not logged;
- relevant automated tests pass;
- operational/admin impact is documented;
- final content replaces placeholders.
