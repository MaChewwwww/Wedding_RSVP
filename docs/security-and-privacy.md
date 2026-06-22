# Security and Privacy Plan

## Security objectives

- Only invited guests can access their own personalized RSVP/pass data.
- Only authorized administrators can access guest, seating, email, and attendance records.
- QR codes cannot be guessed or decoded into personal information.
- Name search cannot enumerate the guest list.
- Operational changes are attributable and reversible where appropriate.

## Admin authentication

- Use Supabase Auth email/password for the seeded admin.
- Disable public sign-up.
- Seed through a secure deployment/admin procedure, never a SQL file containing a plaintext password.
- Require a unique production password stored in a password manager.
- Enable MFA before production if supported by the chosen admin workflow.
- Validate the session and active admin profile on every protected route and mutation.
- Do not rely only on hidden navbar links or client-side route guards.

## Authorization and RLS

- Enable RLS on every table exposed through the Supabase Data API.
- Anonymous users receive no direct select access to guest, RSVP, QR, seating, attendance, email, or audit tables.
- Guest operations go through server-only functions/actions using the validated guest session.
- Admin policies require an authenticated active admin role.
- Service-role keys are server-only and used narrowly.
- Storage policies mirror database authorization.

## Name-lookup protection

An 85% fuzzy score is only a candidate threshold. It is not sufficient identity proof in isolation.

Required safeguards:

- Execute lookup server-side.
- Return generic not-found/ambiguous messages.
- Never return lists of similar guest names to unauthenticated users.
- Rate-limit by IP/device/session signals.
- Add increasing cooldowns after repeated failures.
- Use an invitation code or administrator support path for ambiguous names.
- Normalize invitation codes consistently and store only a server-peppered hash.
- A successful name/code lookup creates only a short-lived pending confirmation;
  issue the invitation-scoped guest session after the guest confirms the
  displayed invited name.
- Record suspicious volume using minimized, privacy-aware logs.
- Do not expose exact similarity scores.

## Guest session security

- High-entropy random token.
- Store a cryptographic hash in the database.
- HTTP-only, Secure, SameSite cookie.
- Explicit expiration and revocation.
- Rotate after sensitive changes where practical.
- Do not cache personalized responses publicly.
- Include CSRF protections appropriate to Server Actions/route handlers and same-site cookies.

## RSVP deadline enforcement

- Treat `RSVP_DEADLINE` as a server authorization rule, not a client display preference.
- Reject all guest RSVP inserts and updates when `current time >= RSVP_DEADLINE`.
- Recheck the deadline inside the mutation path so stale browser pages cannot bypass closure.
- Do not trust a browser-supplied timestamp, timezone, or open/closed flag.
- Keep admin late-response operations on a separate authorized path with an audit reason.
- Continue allowing existing guests to view their celebration page and pass unless separately revoked.

## QR security

- Encode only an opaque URL/token.
- At least 128 bits of cryptographically secure randomness.
- Hash tokens at rest where practical.
- Store any recoverable QR payload only as authenticated server-side ciphertext;
  keep the peppered hash as the validation lookup key.
- Validate server-side and require admin authentication to check in.
- Support revocation/reissue.
- Do not put guest name, table number, email, or database UUID directly in the QR.
- Make check-in idempotent and log every state change.

## Input and output handling

- Validate all inputs with Zod on the server.
- Enforce length limits for names, notes, search terms, and imported fields.
- Escape output through React defaults; do not render unsanitized HTML from content fields.
- Restrict uploads by MIME type, extension, file size, and image dimensions.
- Strip metadata from uploaded public images if privacy requires it.
- Treat CSV cells beginning with formula characters as dangerous when exporting.

## Email

- Require consent before sending to a guest-provided email.
- Verify the sending domain and configure SPF, DKIM, and DMARC.
- Do not expose provider API keys.
- Verify webhook signatures.
- Rate-limit resend.
- Avoid including sensitive notes, full account information, or raw QR tokens outside the intended pass URL.

## Privacy and retention

Data classification:

- High sensitivity: QR/session tokens, admin credentials.
- Personal: names, emails, attendance, seating, notes.
- Public wedding content: approved photos, venues, FAQs.

Retention proposal:

- Delete guest sessions shortly after the event.
- Revoke QR passes after the event.
- Delete dietary/accessibility notes when no longer operationally necessary.
- Archive or export attendance and RSVP data only with the couple’s approval.
- Remove temporary imports and failed upload artifacts promptly.
- Document a final data-deletion date.

## Logging

Never log:

- raw session or QR tokens;
- admin passwords or auth headers;
- full RSVP notes;
- complete account numbers;
- full guest lists in error payloads.

Use correlation IDs and entity IDs for debugging. Mask emails and names where a human-readable diagnostic is unavoidable.

## Threat checklist

- Guest-list enumeration through search.
- False-positive fuzzy match.
- Stolen/shared wedding pass.
- Replayed QR scan.
- Brute-force admin login.
- Public Supabase table or bucket.
- Service-role key leaked to client bundle.
- CSV formula injection.
- Malicious upload.
- Email resend abuse.
- Personalized page cached for another user.
- Unauthorized check-in reversal.

Each item requires a test or deployment review before launch.
