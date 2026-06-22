# Application Architecture

## High-level shape

One Next.js application serves the guest experience and the protected admin console. Server-side boundaries prevent the browser from directly searching guest records or mutating operational data.

```text
Guest/Admin Browser
        |
        v
Next.js on Vercel
  - Server Components
  - Server Actions
  - Route Handlers
  - Guest session validation
  - Admin authorization
        |
        +------> Supabase Auth (admin only)
        |
        +------> Supabase PostgreSQL
        |
        +------> Supabase Storage
        |
        +------> Resend email API
        |
        +------> Rate-limit store
```

## Route plan

### Guest routes

| Route | Purpose |
| --- | --- |
| `/` | Closed/open envelope and invitation lookup |
| `/rsvp` | Detailed RSVP confirmation step; may be modal-driven but a route is better for recovery and accessibility |
| `/celebration` | Personalized single-scroll wedding page |
| `/pass` | Focused wedding-pass view and downloads |
| `/api/pass/[token]/image` | Protected/generated pass image, if server-generated |
| `/api/email/resend` | Rate-limited resend request |

### Admin routes

| Route | Purpose |
| --- | --- |
| `/admin/login` | Admin sign-in |
| `/admin` | Operational dashboard |
| `/admin/guests` | One-to-one guest invitations |
| `/admin/tables` | Table capacity and assignments |
| `/admin/attendance` | Attendance list/manual check-in |
| `/admin/attendance/scan` | Camera scanner |
| `/admin/content` | P1 wedding content and media |
| `/admin/settings` | Event configuration |
| `/admin/audit` | Audit history |

## Rendering boundaries

- Scenic and mostly static wedding sections should be Server Components.
- Personal name, RSVP state, and wedding-pass data are rendered only after guest-session validation.
- Envelope animation, navbar behavior, carousels, accordion, downloads, and scanner are Client Components.
- Admin tables may use client-side interaction while queries and mutations remain server-authorized.
- Never place service-role credentials in a Client Component or `NEXT_PUBLIC_*` variable.

## Guest session model

Name matching alone is an invitation discovery step, not a permanent authenticated identity. After a safe confirmation:

1. Create a short-lived `guest_sessions` record referencing the invitation party.
2. Store a high-entropy session token hash in the database.
3. Set the raw token in an HTTP-only, secure, same-site cookie.
4. Rotate or expire the session based on configured policy.
5. Require re-verification for sensitive changes after long inactivity.

This avoids repeatedly exposing name lookup and allows personalized routes without creating guest accounts.

## RSVP transaction

One server transaction should:

1. Parse the server-only `RSVP_DEADLINE` configuration and compare it with the current server time.
2. Reject guest-created or guest-updated responses when `now >= RSVP_DEADLINE`.
3. Validate guest session.
4. Lock or safely update the invitation party.
5. Validate that exactly one invitee belongs to the invitation.
6. Upsert the named guest’s RSVP response.
7. Issue a QR pass if one does not exist.
8. Write an audit/domain event.
9. Commit.

Email is attempted after commit. An email failure must not roll back the RSVP.

The deadline check belongs in the shared server-side RSVP service used by every guest mutation path. Client-side checks exist for immediate feedback only. Admin late-response operations use a separate authorized path and record the override reason.

## Name matching pipeline

1. Normalize input:
   - Unicode normalization;
   - lowercase;
   - trim and collapse whitespace;
   - remove punctuation that is not meaningful;
   - optionally normalize common prefixes/suffixes;
   - preserve the original input only transiently unless needed for security logs.
2. Look for exact normalized-name and configured alias matches.
3. If none, query a small candidate set using `pg_trgm`.
4. Compute confidence signals:
   - trigram similarity;
   - token overlap;
   - first/last token compatibility;
   - party code if supplied.
5. Auto-proceed only when:
   - top score meets the threshold, initially 0.85;
   - second-best score is sufficiently lower, for example by 0.08;
   - the candidate is active;
   - no duplicate/ambiguity flag exists.
6. Otherwise return a generic ambiguous/not-found result.

Thresholds must be calibrated against anonymized examples from the real guest list before launch.

## QR design

- QR payload should be a URL containing a random 128-bit-or-greater token, not a guest ID or name.
- Store a peppered hash for validation lookup. If returning guests must render
  the same pass, store the raw token only as authenticated server-side
  ciphertext under a separate encryption key.
- Token has status: active, revoked, replaced.
- Validation is server-side.
- Scans are idempotent.
- A revoked token never reveals why it was revoked to an unauthenticated caller.
- QR rendering uses high error correction only if the visual size remains practical; maintain the required quiet zone.

## Email architecture

- React Email template for the invitation/pass.
- Provider call through a server-only module.
- Store provider message ID and status.
- Use an idempotency key based on invitation party, template version, and send purpose.
- Handle provider webhooks for delivered, bounced, and complained status if enabled.
- Verify webhook signatures.
- Do not attach huge images; prefer optimized inline/hosted assets and a pass download link.

## Storage

Suggested buckets:

- `wedding-public`: optimized public scenic/media assets approved for public access.
- `wedding-private`: invitation/pass documents if stored.
- `admin-imports`: short-lived private CSV imports if imports are persisted.

Use signed URLs for private objects. Define file size, dimensions, MIME type, and administrator authorization rules.

## Content strategy

Initial release may use typed configuration for stable content and database records for operational data. If admin content editing is included, move timeline, venues, FAQ, entourage, gift accounts, and galleries into dedicated tables/storage metadata. Do not block RSVP launch on a full CMS.

## Observability

- Structured request/error logs with correlation IDs.
- Redact full names, emails, QR values, session tokens, and account numbers.
- Record domain audit events separately from application logs.
- Monitor RSVP failures, email failures, scanner errors, and suspicious lookup volume.
