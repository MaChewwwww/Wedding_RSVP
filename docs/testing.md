# Testing Strategy

## Test layers

### Unit tests

- Name normalization.
- Similarity decision rules and ambiguity gap.
- RSVP schema validation.
- One-guest-per-invitation rule.
- QR token generation/hash verification.
- Attendance state derivation.
- Table capacity calculations.
- Deadline and timezone behavior.
- Sensitive-data redaction.

### Database/integration tests

- RLS denies anonymous access.
- Admin role can perform only intended operations.
- Guest session is restricted to one named guest invitation.
- RSVP transaction accepts exactly one invitee belonging to the invitation.
- Declining removes or rejects seating assignments.
- Concurrent table assignments cannot exceed capacity.
- Repeated check-in request is idempotent.
- Revoked QR cannot check in.
- Email status updates are idempotent.

### Component tests

- Envelope can be opened by mouse, touch, Enter, and Space.
- RSVP fields have labels and announced errors.
- Navbar anchors and mobile menu work.
- Accordion keyboard behavior.
- Carousel pause/manual controls.
- Copy and download feedback.
- Admin table filters and dialogs.

### End-to-end tests

Critical scenarios:

1. Exact-name RSVP, no email.
2. Safe typo match and invited-name confirmation.
3. Ambiguous name produces no data leak.
4. Decline flow.
5. Single-guest decline flow.
6. RSVP update before deadline.
7. Update rejected after deadline.
8. First RSVP submission rejected at and after the exact deadline.
9. Stale pre-deadline page cannot submit after the deadline passes.
10. Admin late-response override succeeds and records a reason.
11. QR pass download.
12. Email send failure does not lose RSVP.
13. Admin login/logout and protected-route redirect.
14. CSV import preview and duplicate warning.
15. Table assignment and capacity block.
16. QR check-in, repeated scan, and reversal.
17. Manual search/check-in.

## Name-matching evaluation

Build a pre-launch test corpus from the production roster without committing personal data to the repository.

For each invitee, generate or manually define:

- exact name;
- extra/missing spaces;
- punctuation/hyphen variants;
- transposed letters;
- one-character typo;
- missing or added middle name;
- nickname where approved;
- surname-first format if culturally expected.

Measure:

- true-match rate;
- false-positive rate;
- ambiguous rate;
- no-match rate.

Release criterion: zero known false-positive auto-matches in the evaluation set. It is acceptable to send uncertain guests to fallback verification.

## Accessibility testing

- Automated axe checks on all primary routes.
- Keyboard-only walkthrough.
- Screen-reader spot checks for lookup, RSVP, pass, FAQ, and scanner status.
- 200% zoom and text scaling.
- Reduced-motion behavior.
- Contrast testing on every actual background/crop.
- Touch targets on mobile.

## Visual and responsive testing

Test at:

- 320×568;
- 375×667;
- 390×844;
- 768×1024;
- 1024×768;
- 1366×768;
- 1440×900.

Review:

- envelope scaling and form safe area;
- `bg2` text readability;
- QR quiet zone;
- `bg4` couple/photo overlap;
- lace announcement framing;
- sticky nav section offsets;
- carousel image crops;
- long names and translated/expanded content.
- portrait and landscape phone orientation;
- no horizontal overflow at any supported width;
- touch controls without hover;
- mobile-specific background focal points;
- responsive image payloads without unnecessary desktop downloads;
- software-keyboard behavior on the RSVP form;
- safe-area insets on notched devices;
- sticky/mobile navigation without covering anchored headings.

Release criterion: any blocked primary flow, unreadable section, clipped action, broken crop, or horizontal overflow at 320–390px is a launch blocker.

## Performance targets

- Good Core Web Vitals on a representative mobile connection.
- Initial envelope asset prioritized; below-fold galleries lazy-loaded.
- Avoid loading scanner code until the admin scanner route is opened.
- Avoid loading all gallery originals at once.
- Main guest route remains usable if email or analytics services fail.

## Security verification

- Attempt guest enumeration.
- Attempt direct Supabase table access with anon key.
- Verify service-role key is absent from browser bundles.
- Brute-force/rate-limit checks.
- QR token guessing/replay checks.
- CSRF/session-cookie checks.
- Upload and CSV injection tests.
- Cache-control review for personalized responses.
- Admin authorization tests for every mutation.

## User acceptance testing

Run with:

- couple/primary administrator;
- one coordinator using a phone;
- several invited users of different ages;
- at least one user with limited technical familiarity;
- one weak-network test.

Record confusion points, time-to-RSVP, failed name attempts, and check-in scan speed.
