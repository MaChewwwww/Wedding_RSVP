# User Flows

## Guest: successful RSVP

1. Guest opens `/`.
2. The closed envelope is displayed with an “Open invitation” action.
3. Guest opens the envelope.
4. The open-envelope artwork appears and the full-name form is revealed.
5. Guest submits a name.
6. Server normalizes the input, retrieves a small candidate set, and evaluates match confidence.
7. If the match is safe and unambiguous, the guest confirms the invited name.
8. Guest chooses their attendance, adds optional email and notes, and submits.
9. Server validates the one-to-one invitation relationship, stores the RSVP transactionally, and creates or reuses the QR token.
10. Guest is redirected to the personalized wedding pass/main page.
11. If email was supplied and consented, email delivery is queued after the RSVP succeeds.

## Guest: ambiguous or failed name lookup

1. Guest submits a name.
2. The server finds no safe match, or the two best candidates are too close.
3. The UI does not display possible guest names.
4. Guest is prompted to:
   - check spelling and spacing;
   - try the name printed on the invitation;
   - enter an invitation code if available; or
   - contact the configured RSVP support person.
5. Repeated attempts trigger a short cooldown or challenge.

## Guest: returning after RSVP

Preferred approach:

1. After the first successful lookup, issue an encrypted, HTTP-only, same-site guest session cookie scoped to the named guest invitation.
2. A returning guest may access `/celebration` and `/pass` while the guest session remains valid.
3. The cookie contains or references only an opaque session identifier.
4. If the session expires, the guest repeats invitation lookup or uses a private link from their email.

The guest session is not an account and must not grant access to any other invitation.

## Guest: update RSVP

1. Guest enters through an active guest session or verifies the invitation again.
2. Existing response is displayed.
3. Server checks the current time against `RSVP_DEADLINE`.
4. Guest edits attendance/email/notes only when the deadline has not passed.
5. Server validates the deadline again when the update is submitted, then validates the invited guest and records the update.
6. The QR token remains stable unless revoked for a security reason.
7. The guest can request an updated email.

At and after the deadline, the site shows the response as read-only, removes or disables submission actions, and provides the configured contact path. Direct or replayed mutation requests are rejected by the server. Administrators can still update the response through an audited override.

## Guest: first visit after the RSVP deadline

1. Guest opens and views the invitation.
2. The server determines that the deadline has passed.
3. Name lookup may continue only to recover an existing guest session/pass if that behavior is enabled.
4. A guest without an RSVP cannot create one through the guest interface.
5. The UI displays “RSVPs closed on {formatted deadline}” and the support contact.
6. An administrator may record a late response manually.

## Guest: download wedding pass

1. Guest opens the Pass section or `/pass`.
2. Site renders a high-contrast QR code and the invited guest’s name.
3. Guest selects Download PNG or, if implemented, Download PDF.
4. Server or client generates the file without encoding personal details in the QR value.
5. Download includes an instruction such as “Present this pass at check-in.”

## Administrator: create guest list

1. Admin signs in at `/admin/login`.
2. Admin creates one invitation for each named guest manually or imports CSV.
3. Import preview identifies missing names, duplicates, invalid emails, and capacity conflicts.
4. Admin confirms the import.
5. System generates normalized search fields and optional invitation codes.
6. Admin reviews pending or suspicious duplicates.

## Administrator: seating

1. Admin creates tables and capacities.
2. Admin filters to attending, unassigned invitees.
3. Admin assigns invitees to tables.
4. System updates capacity counts transactionally.
5. Over-capacity assignment is blocked unless a future privileged override is explicitly designed.
6. Admin exports a seating list.

## Check-in staff: QR check-in

1. Authorized user opens `/admin/attendance/scan`.
2. Browser requests camera permission only after an explicit action.
3. Scanner reads an opaque token.
4. Server validates token status and associated RSVP.
5. UI displays the guest, table, and current status.
6. Staff confirms check-in or the configured fast mode checks in immediately.
7. Server writes an idempotent attendance event.
8. UI returns one of: checked in, already checked in, invalid/revoked pass, or not marked attending.

## Check-in staff: manual check-in

1. Staff opens manual search.
2. Staff searches by name; this authenticated admin search may show candidate names.
3. Staff selects the correct invited guest.
4. Staff confirms check-in.
5. The same attendance event and audit rules used by QR check-in apply.

## Email failure

1. RSVP transaction succeeds.
2. Email provider request fails or later reports a delivery failure.
3. Guest still sees the pass and a non-blocking email status message.
4. Failure is recorded without exposing provider secrets.
5. Admin can resend after correcting the email.
