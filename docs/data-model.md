# Proposed Data Model

This is a logical schema for planning. Exact SQL belongs in implementation migrations.

## Core entities

### `admin_profiles`

Extends Supabase `auth.users`.

| Field | Notes |
| --- | --- |
| `user_id` | PK/FK to auth user |
| `role` | `admin` initially; optional `check_in_staff` later |
| `display_name` | Admin display label |
| `is_active` | Access switch |
| timestamps | Created/updated |

### `invitation_parties`

Represents the authorization/session boundary for exactly one named guest.

| Field | Notes |
| --- | --- |
| `id` | UUID PK |
| `display_name` | Same display name as the invited guest |
| `invitation_code_hash` | Optional fallback verification |
| `status` | active, archived |
| `rsvp_status` | pending, attending, declined, undecided |
| `email` | Optional invited guest email |
| `email_consent_at` | Nullable consent timestamp |
| `notes` | Guest-provided dietary/accessibility note, access-restricted |
| `responded_at` | Latest RSVP time |
| timestamps | Created/updated |

### `invitees`

Stores the single named person attached to an invitation.

| Field | Notes |
| --- | --- |
| `id` | UUID PK |
| `party_id` | FK |
| `full_name` | Single administrator-entered display field |
| `normalized_name` | Generated/maintained normalized search value |
| `rsvp_status` | pending, attending, declined |
| `dietary_notes` | Optional per-person restricted field |
| `table_id` | Nullable FK |
| `is_active` | Archive switch |
| timestamps | Created/updated |

Indexes:

- B-tree on `party_id`, `table_id`, and status fields.
- GIN trigram index on `normalized_name`.
- Non-unique duplicate-review index on `normalized_name`.

### `invitee_aliases`

Known nicknames, maiden names, spelling variants, or transliterations.

| Field | Notes |
| --- | --- |
| `id` | UUID PK |
| `invitee_id` | FK |
| `alias` | Original alias |
| `normalized_alias` | Search value |
| `source` | admin, import |

### `guest_sessions`

| Field | Notes |
| --- | --- |
| `id` | UUID PK |
| `party_id` | FK |
| `token_hash` | Unique hash |
| `expires_at` | Required |
| `last_seen_at` | Optional rotation/expiry support |
| `revoked_at` | Nullable |
| `created_ip_hash` | Optional abuse signal, not raw long-term IP |
| timestamps | Created/updated |

### `qr_passes`

| Field | Notes |
| --- | --- |
| `id` | UUID PK |
| `party_id` / `invitee_id` | Both reference the same one-guest invitation |
| `token_hash` | Unique |
| `status` | active, revoked, replaced |
| `issued_at` | Timestamp |
| `revoked_at` | Nullable |
| `replaced_by_id` | Nullable self-reference |

Issue one pass for the invitation’s single invitee.

### `tables`

| Field | Notes |
| --- | --- |
| `id` | UUID PK |
| `name` | Display name/number |
| `capacity` | Positive integer |
| `location_note` | Optional |
| `sort_order` | Admin display |
| `is_active` | Boolean |

Capacity must be validated transactionally. A computed view can expose assigned and remaining seats.

### `attendance_events`

Append-only event history.

| Field | Notes |
| --- | --- |
| `id` | UUID PK |
| `invitee_id` | Required check-in subject |
| `event_type` | checked_in, check_in_reversed |
| `method` | qr, manual |
| `performed_by` | Admin user FK |
| `occurred_at` | Timestamp |
| `reason` | Required for reversal |
| `request_id` | Idempotency/correlation key |

Current attendance should be derived through a view or maintained in a constrained summary field. The event log remains the audit source.

### `email_deliveries`

| Field | Notes |
| --- | --- |
| `id` | UUID PK |
| `party_id` | FK |
| `recipient_email` | Restricted |
| `purpose` | initial_pass, resend, update |
| `provider_message_id` | Nullable until accepted |
| `status` | queued, sent, delivered, bounced, failed, complained |
| `error_code` | Sanitized |
| timestamps | Created/updated/delivered |

### `audit_logs`

| Field | Notes |
| --- | --- |
| `id` | UUID PK |
| `actor_user_id` | Nullable for system event |
| `action` | Structured action name |
| `entity_type` / `entity_id` | Target |
| `before` / `after` | Minimized JSON; exclude secrets |
| `request_id` | Correlation |
| `created_at` | Timestamp |

## Optional content entities

P1 admin content editing may add:

- `timeline_events`
- `timeline_images`
- `gallery_images`
- `venues`
- `invitation_images`
- `entourage_members`
- `faq_items`
- `gift_accounts`
- `site_settings`

Every content table should include ordering, visibility, timestamps, and alt-text fields where media is present.

## Constraints

- Active invitees must belong to an active party.
- Every invitation has exactly one invitee. Capacity and plus-one fields are not stored.
- Attending invitees assigned to tables count toward capacity.
- Declined invitees should not retain a table assignment.
- QR tokens and guest-session tokens are globally unique after hashing.
- Attendance request IDs are unique to prevent duplicate events.
- Email consent timestamp is required before optional guest-submitted email delivery.

## Fuzzy matching examples

Likely safe normalization:

- `Maria  Dela-Cruz` → `maria dela cruz`
- `JUAN SANTOS JR.` → `juan santos jr`

Potentially unsafe cases requiring ambiguity handling:

- multiple guests named `Maria Santos`;
- input with an extra middle name that closely matches two relatives;
- nickname not present in aliases;
- one-character names or very short surnames;
- transliteration differences.

The implementation should test matching against synthetic misspellings of the real roster and produce a false-positive report before launch.
