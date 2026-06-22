# Open Questions and Decisions

## P0 — required before implementation

1. What is the final wedding date, start time, and timezone?
2. What exact ISO 8601 timestamp and UTC offset should be configured in `RSVP_DEADLINE`? The current artwork displays July 10, 2026 and must be replaced if the configured date differs.
3. What fields are required in the RSVP besides attendance and optional email?
4. Are guests allowed to update responses, and until when?
5. What contact method should appear when name lookup fails?
6. Should ambiguous name matches use an invitation code, manual support, or another verification detail?
7. Are there multiple admins/check-in devices, or only one seeded account?
8. What are the final Preparation, Wedding, and Reception venue details?
9. Which country/timezone should drive displayed dates? `Asia/Manila` is proposed but must be confirmed.

## P1 — required before content completion

1. Confirm the exact navigation labels and whether every section is visible.
2. Provide timeline entries and photos.
3. Provide featured and gallery pre-wedding photos.
4. Provide invitation carousel images.
5. Provide entourage portraits, names, roles, and descriptions.
6. Approve FAQ answers.
7. Approve Love Gift wording and account details.
8. Confirm photographer/artist credits.
9. Confirm whether `bg6.png` should represent the Wedding Venue.
10. Confirm whether admin content editing is needed at launch or typed configuration is acceptable.
11. Confirm whether guests need a PDF in addition to a PNG pass.
12. Confirm production domain and email-sending domain.
13. Approve the generated background direction and whether desktop/mobile variants are required for every missing section or only the composition-sensitive sections.

## Recommended defaults if decisions are deferred

- Use Supabase.
- Use `Asia/Manila`.
- Issue one QR pass for each invitation’s single named guest.
- Allow RSVP edits until the deadline.
- Use optional email plus a private invitation-code fallback for ambiguous names.
- Start with one `admin` role, but structure authorization for a later `check_in_staff` role.
- Keep wedding content in typed configuration for launch; store operational records in PostgreSQL.
- Use a PNG pass for P0 and defer PDF to P1.
- Use `bg6.png` only for the Wedding Venue, subject to couple approval.

## Decision log

Record approved decisions here during planning:

| Date | Decision | Owner | Notes |
| --- | --- | --- | --- |
| TBD | Supabase preferred over Neon | Project | Auth, storage, RLS, and PostgreSQL in one service |
| TBD | 85% similarity is a candidate threshold, not automatic identity proof | Project | Requires ambiguity gap and fallback |
