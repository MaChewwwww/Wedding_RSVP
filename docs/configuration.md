# Configuration Plan

## Environment separation

Maintain separate Supabase projects and Vercel environments for:

- local development;
- preview/staging;
- production.

Do not use production guest data in preview deployments. Use generated fixtures.

## Environment variables

Names are proposed and may be adjusted during implementation.

### Public

```dotenv
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_EVENT_TIMEZONE=Asia/Manila
```

Only values safe for every browser belong under `NEXT_PUBLIC_*`.

### Server-only

```dotenv
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_WEBHOOK_SECRET=
GUEST_SESSION_SECRET=
QR_TOKEN_PEPPER=
QR_TOKEN_ENCRYPTION_KEY=
INVITATION_CODE_PEPPER=
RATE_LIMIT_REDIS_URL=
RATE_LIMIT_REDIS_TOKEN=
ADMIN_SEED_EMAIL=
RSVP_DEADLINE=2026-07-10T23:59:59+08:00
```

Do not store a seeded admin plaintext password in a committed `.env.example`. Provision it interactively or through a secure secret manager.

### Feature and policy configuration

```dotenv
WEDDING_DATE=
NAME_MATCH_THRESHOLD=0.85
NAME_MATCH_MIN_GAP=0.08
GUEST_SESSION_TTL_DAYS=30
ENABLE_EMAIL_DELIVERY=true
ENABLE_RSVP_UPDATES=true
ENABLE_CONTENT_ADMIN=false
CHECK_IN_MODE=invitee
```

Policy values should eventually live in validated site settings if administrators need to change them without deployment.

## RSVP deadline behavior

- `RSVP_DEADLINE` is required in preview and production.
- Use an ISO 8601 timestamp with an explicit UTC offset, for example `2026-07-10T23:59:59+08:00`.
- It is server-only and must not use the `NEXT_PUBLIC_` prefix.
- The server validates it during application startup/build and fails clearly if it is missing or invalid.
- Guest RSVP creation and updates are allowed only while `current time < RSVP_DEADLINE`.
- At exactly the configured timestamp, guest mutations close.
- Every mutation checks the deadline on the server to prevent bypass through stale pages or direct requests.
- The browser may receive only the formatted deadline and open/closed status needed for display.
- Changing a Vercel environment variable requires a deployment or redeployment before the new value is active.
- Admin late-response overrides remain available and must record administrator, timestamp, and reason.
- Deadline comparisons use the absolute timestamp. `NEXT_PUBLIC_EVENT_TIMEZONE` controls presentation, not authorization.

## Site content configuration

Minimum typed configuration:

```text
couple
  partnerOneName
  partnerTwoName
  displayName
  monogram

event
  weddingDate
  timezone
  rsvpDeadline
  supportContact

navigation
  visibleSections
  labels

copy
  welcome
  announcement
  giftMessage
  footer

social
  hashtag
  shareImage
```

Operational guest data must not be mixed into this public configuration.

## Asset configuration

Each image record should support:

- source path or storage key;
- width and height;
- alt text;
- focal point;
- section role;
- sort order;
- visibility;
- optional caption/credit;
- mobile-specific alternative when needed.

## Venue configuration

Each venue:

```text
type: preparation | ceremony | reception
name
address
date
startTime
endTime
description
arrivalNotes
parkingNotes
accessibilityNotes
googleMapsUrl
latitude/longitude (optional)
image
```

Use explicit Google Maps URLs rather than constructing unsafe URLs from untrusted text.

## Supabase setup checklist

- Create projects for each environment.
- Apply migrations through the Supabase CLI.
- Enable required extensions, including `pg_trgm`.
- Configure Auth site URL and approved redirect URLs.
- Disable public sign-up.
- Create storage buckets and policies.
- Enable RLS and review advisors.
- Seed synthetic development data.
- Provision production admin securely.
- Configure backups and recovery expectations.

## Vercel setup checklist

- Connect repository.
- Configure environment variables by environment.
- Set production and preview domains.
- Confirm Node runtime compatibility.
- Configure function region near primary users/database when possible.
- Configure logs and alerting.
- Protect preview deployments if they contain realistic wedding content.
- Add cron only if a retry/cleanup job is implemented.

## Email setup checklist

- Verify sending domain.
- Configure SPF, DKIM, and DMARC.
- Set sender name such as “Jobert & April”.
- Configure webhook endpoint and signature secret.
- Test delivery to common providers.
- Confirm invitation images and pass links display correctly on mobile email clients.

## Content freeze checklist

Before production:

- `RSVP_DEADLINE` has the approved absolute timestamp and UTC offset.
- The displayed deadline matches the server configuration.
- The embedded envelope artwork matches the configured deadline; otherwise replace the artwork.
- Wedding date/time and timezone are final.
- Every venue link opens the correct location.
- No placeholders remain.
- Gift account details are approved.
- Entourage names and roles are approved.
- Photo usage and credits are approved.
- Support contact is monitored.
