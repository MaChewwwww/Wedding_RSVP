# Feature Requirements

Priority labels:

- **P0:** required for launch.
- **P1:** strongly recommended for launch if schedule permits.
- **P2:** post-launch enhancement.

## Guest experience

### Invitation envelope

- **P0** Full-viewport page without a navbar.
- **P0** Display `assets/enveloped_closed.png` as the primary interactive object.
- **P0** The envelope is keyboard-focusable and has an explicit “Open invitation” label.
- **P0** Click, tap, Enter, or Space starts the opening sequence.
- **P0** Transition to `assets/enveloped_open.png`, then reveal the RSVP form inside the card’s safe area.
- **P0** Reduced-motion mode replaces the animation with an immediate cross-fade.
- **P1** Persist an opened state in the current browser so returning guests may skip the full entrance.

### Invitation lookup and RSVP

- **P0** Accept a single full-name input; do not require first/middle/last fields.
- **P0** Normalize harmless formatting differences before matching.
- **P0** Search only on the server.
- **P0** Return a generic failure message without exposing candidate names.
- **P0** For an unambiguous match, ask the guest to confirm the displayed invited name.
- **P0** Capture attendance response: attending, not attending, or undecided if enabled.
- **P0** Capture one attendance response for the named guest.
- **P0** Capture optional email address.
- **P0** Capture dietary/accessibility notes in a constrained free-text field if enabled.
- **P0** Enforce exactly one named guest per invitation; no plus-ones.
- **P0** Allow RSVP creation and changes only before the server-configured deadline.
- **P0** At and after the deadline, disable guest RSVP mutation controls and show the formatted deadline plus the configured support contact.
- **P0** Enforce the deadline on every server mutation; hiding or disabling the client form is not sufficient.
- **P0** Existing respondents may still view the celebration page and wedding pass after the deadline.
- **P0** Administrators may create or edit late responses through an explicitly labeled, audited override.
- **P1** Support an admin-provided invitation code as a fallback for ambiguous names.
- **P1** Show a clear support/contact path after repeated failed searches.

### Wedding pass and email

- **P0** Generate one opaque, revocable QR token for the invitation’s named guest.
- **P0** Show a pass page immediately after successful RSVP.
- **P0** Provide a high-resolution PNG download suitable for saving to a phone.
- **P1** Provide a print-friendly PDF invitation/pass.
- **P0** Email the invitation/pass only when an email was supplied and the guest consents.
- **P0** Email sending must not block successful RSVP completion.
- **P0** Show delivery status and allow a resend request with rate limiting.

### Main single-page site

The main page has a sticky navbar on desktop and a compact accessible menu on mobile. Navigation scrolls to section anchors and accounts for the sticky header offset.

1. **Welcome**
   - Personalized “Welcome, {display name}”.
   - “Jobert & April Wedding Celebration”.
   - Thank-you message.
   - Uses `assets/bg2.png`.

2. **Wedding pass**
   - QR code, invited guest name, download action, and brief instructions.
   - Uses `assets/bg3.png`.
   - QR remains readable against a solid light plate, never directly on the patterned background.

3. **Our story timeline**
   - Central vertical line on desktop.
   - Year markers.
   - Alternating or consistent image and copy columns.
   - Image area may auto-advance but must include pause and manual controls.
   - Mobile becomes a single-column timeline with the line aligned to one side.
   - Uses a generated watercolor-paper timeline background with a calm center corridor for the timeline.

4. **Featured pre-wedding photographs**
   - Uses `assets/bg4.png`, which contains the illustrated couple.
   - Vertical editorial photo sequence placed toward the right to manage overlap with the artwork.
   - Mobile uses a separate crop/layout so the couple and photos do not obscure each other.

5. **Pre-wedding gallery**
   - Horizontal carousel with placeholders until final images are supplied.
   - Swipe, arrow, pagination, and keyboard support.
   - Lazy-load non-visible images.
   - Uses a generated panoramic pressed-flower and paper background that does not compete with the photographs.

6. **Places and venues**
   - Announcement treatment using `assets/bg5.png` and the transparent `assets/announcement.png` lace frame.
   - Venue entries for Preparation Venue, Wedding Venue, and Reception Venue.
   - Each entry includes location, date, time, description, and Google Maps action.
   - `assets/bg6.png` may be used as the wedding-venue artwork if approved.
   - Plain watercolor/paper styling is generated with CSS for venue entries that have no supplied background.

7. **Invitations**
   - Carousel of invitation artwork.
   - Placeholder images until final assets are supplied.
   - Optional download/zoom action.
   - Uses a generated stationery-table background with a quiet central presentation area.

8. **The entourage**
   - Groups such as bridesmaids and groomsmen.
   - Circular portrait, name, title/role, and short description.
   - Responsive list/grid without excessive card chrome.
   - Uses a generated pastel floral-arch background with decoration concentrated near the outer edges.

9. **Questions and answers**
   - Accessible accordion.
   - One or multiple items may be expanded, configurable.
   - Includes travel, dress code, single-guest invitation policy, children, timing, parking, and contact topics.
   - Uses a generated minimal watercolor-paper background with sparse corner botanicals.

10. **Love gift**
    - Message explaining that gifts are optional.
    - Account name/provider/details as approved by the couple.
    - QR placeholders for digital transfer.
    - Copy buttons with confirmation feedback.
    - Never process payments directly.
    - Uses a generated elegant gift-table background with subtle ribbons and flowers around the perimeter.

11. **Footer**
    - Couple’s names/monogram, wedding date, short closing line, and optional contact.
    - No admin link in the footer.
    - Uses a generated dusk meadow continuation that visually closes the opening welcome landscape.

### Navigation

- **P0** Section links: Welcome, Pass, Our Story, Gallery, Places, Invitations, Entourage, FAQ, Love Gift.
- **P0** Active section indicator.
- **P0** Admin login action at the far right on desktop and inside the mobile menu.
- **P0** Admin action routes to `/admin/login`; it does not expose admin state.
- **P1** “Back to top” control near the footer.

## Admin experience

### Authentication and access

- **P0** Seeded admin account using Supabase Auth email/password.
- **P0** No public sign-up.
- **P0** Protected `/admin/*` routes and server operations.
- **P0** Secure sign-out and session expiry.
- **P1** Password reset through a controlled admin email.
- **P1** Multi-factor authentication before production.

### Dashboard

- **P0** Summary counts: total invited, responses, attending, declined, pending, assigned seats, unassigned attendees, and checked in.
- **P1** Recent RSVP and check-in activity.
- **P1** Operational warnings such as over-capacity tables or failed emails.

### Visitor list management

- **P0** Create, edit, archive, and search invitees.
- **P0** Store `full_name` as one display field.
- **P0** Optional nickname/aliases for known name variants.
- **P0** Maintain one invitation record for each named guest.
- **P0** View RSVP, email, QR, seating, and attendance status.
- **P0** CSV import and export.
- **P0** Duplicate warning based on normalized and similar names.
- **P1** Bulk updates and import preview with row-level error reporting.

### Table management

- **P0** Create tables with name/number and capacity.
- **P0** Assign individual attending invitees to tables.
- **P0** Show remaining seats and prevent accidental over-capacity assignment.
- **P0** Filter unassigned attendees.
- **P1** Bulk assignment.
- **P2** Drag-and-drop assignment and visual floor plan.

### Attendance management

- **P0** Camera-based QR scanner.
- **P0** Manual name search and check-in.
- **P0** Show the matched invited guest and current attendance status before mutation.
- **P0** Idempotent check-in; a second scan reports “already checked in” with time.
- **P0** Allow authorized undo with reason.
- **P0** Log scan/manual method, admin, device metadata where appropriate, and timestamp.
- **P1** Fast check-in mode optimized for a phone.
- **P1** Limited cached roster for brief connectivity loss, with careful conflict reconciliation.

### Content/settings management

- **P1** Manage event dates, venues, FAQ, entourage, gift accounts, contact details, and section visibility.
- **P1** Upload final photos and invitation images to Supabase Storage.
- **P1** Reorder gallery and timeline items.

## Cross-cutting requirements

- **P0** Mobile-first responsive behavior is a release-blocking requirement, not a later optimization.
- **P0** Every guest section must have an explicitly designed layout at 320px, 375px, and 390px widths.
- **P0** No horizontal page overflow, clipped controls, unreadable background crops, or hover-only interactions.
- **P0** Navigation, RSVP, QR download, carousels, venue actions, accordion, gift details, and footer must be fully usable on a phone.
- **P0** Use mobile-specific artwork/crops where desktop backgrounds cannot preserve both content safety and composition.
- **P0** Mobile devices receive appropriately sized images rather than downloading all desktop originals.
- **P0** WCAG 2.2 AA target for interactive controls, focus states, text contrast, labels, and motion preferences.
- **P0** Optimized images and lazy loading below the fold.
- **P0** Structured error logging without guest names or tokens.
- **P0** Rate limiting on name lookup, resend, login, and QR validation.
- **P0** Audit log for admin changes and attendance mutations.
- **P1** Basic analytics using privacy-respecting, non-PII events.
