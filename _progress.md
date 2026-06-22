# Implementation Progress

Handoff ledger for the Jobert & April Wedding RSVP build. Statuses below were
re-audited against the repository on June 21, 2026. A checked item means code
exists and local validation passed where possible; live Supabase behavior remains
explicitly separated from local verification.

## Decisions adopted

- Backend mode: scaffold-only until a Supabase project is provisioned.
- QR passes: per invitee (`CHECK_IN_MODE=invitee`).
- Invitation policy: exactly one named guest per invitation; no grouped
  households or plus-ones.
- Timezone: Asia/Manila.
- RSVP edits allowed until the deadline.
- One extensible `admin` role initially.
- Wedding content uses typed configuration in `src/config/*`.
- PNG pass is P0; PDF is deferred.
- `RSVP_DEADLINE=2026-07-10T23:59:59+08:00`.
- Ambiguous-name fallback should use an invitation code plus support contact.

## Stack confirmed

Next.js 16.2.9 App Router, React 19.2, Tailwind CSS 4, TypeScript 5, pnpm 10,
Supabase SSR/client, Zod, React Hook Form, Motion, Embla, QRCode, ZXing, Resend,
React Email, date-fns, Lucide, TanStack Query/Table, Vitest, Testing Library,
Playwright, and axe.

## Phase 1 — Foundation

- [x] Next.js 16 + TypeScript + Tailwind scaffold
- [x] Application and development dependencies
- [x] Supplied assets copied to `public/assets/`
- [x] Design tokens and fonts
- [x] Locally owned UI primitives
- [x] Validated public/server environment access
- [x] Typed site, venue, FAQ, and entourage content
- [x] Supabase server/browser/admin clients
- [x] Structured redacting logger
- [x] Rate-limit interface with in-memory fallback
- [x] SQL migrations 0001–0009 and synthetic seed data
- [x] Next.js 16 `proxy.ts` session refresh/coarse admin guard
- [x] Protected `/admin` route group with authoritative server guard and sign-out
- [x] Root loading, not-found, route-error, and global-error patterns
- [x] Local typecheck, lint, unit tests, and production build pass
- [x] GitHub Actions quality workflow scaffold
- [ ] Preview deployment
- [ ] Live verification of Supabase auth, RLS, migrations, and admin profile guard

## Phase 2 — Invitation lookup and RSVP

- [x] Full-viewport envelope gate with pointer/keyboard opening
- [x] Reduced-motion-aware cross-fade and sessionStorage opened state
- [x] Server-only lookup action with generic failures and rate limiting
- [x] Name normalization, scoring, ambiguity-gap decision logic
- [x] Supabase matching repository, alias lookup, and `match_invitees` RPC
- [x] Peppered invitation-code verification for ambiguous-name fallback
- [x] One-to-one invitation/guest matching with ambiguity safeguards
- [x] Explicit invited-name confirmation before guest-session issuance
- [x] Short-lived signed HTTP-only pending-confirmation cookie
- [x] Guest-session token hashing, cookie, expiry, and invitation-scoped loader
- [x] `/rsvp` and `/celebration` routes
- [x] Single-guest RSVP schema, deadline checks, service, and transaction RPC
- [x] Exactly-one-guest RSVP validation in both the server service and hardened
      database transaction
- [x] Stale-page deadline race returns the closed state when the deadline passes
      during submission
- [x] Admin guest-invitation creation/archive, audited RSVP override, search, and CSV
      import/export
- [ ] Rich edit dialogs, CSV preview, and duplicate-resolution workflow
- [ ] Live database tests for lookup privacy, session scope, transaction behavior,
      exact deadline rejection, and stale-page submission

## Phase 3 — Wedding pass and email

- [x] Opaque 256-bit QR token generation, peppered hash, and verification helpers
- [x] QR/email tables and initial server modules
- [x] `/pass` route and pass-panel PNG download UI
- [x] Resend + React Email initial-send module with delivery records
- [x] Recoverable QR persistence using a peppered lookup hash plus AES-GCM
      ciphertext under a separate server key
- [x] `/pass` and celebration Pass section load active guest QR passes
- [x] Rate-limited guest resend action
- [x] Resend webhook signature verification and delivery-status updates
- [x] Admin QR revoke/reissue controls
- [ ] Live issuance, download, revocation, resend, and email-failure tests

## Phase 4 — Main wedding page

- [x] Sticky desktop navbar and mobile menu
- [x] Active-section observer
- [x] Welcome, pass, story, featured, gallery, places, invitations, entourage,
      FAQ, love-gift, and footer section scaffolds
- [x] Local browser smoke check at 390px envelope and 320px celebration page
      with no horizontal overflow or console errors
- [x] Mobile menu focus trap, scroll lock, Escape handling, and focus restoration
- [x] Back-to-top footer action
- [ ] Generated background art set and mobile variants
- [ ] Final timeline, photos, invitations, entourage, venues, FAQ, gift, support,
      wedding-date, and footer content
- [ ] Carousel/accordion component tests and full keyboard review
- [ ] Visual checks at every documented viewport and reduced-motion mode
- [ ] Image optimization/lazy-loading review with final assets

## Phase 5 — Seating and attendance

- [x] Tables, attendance-event schema, capacity trigger, and derived views
- [x] Table creation/archive and capacity-management UI
- [x] Individual invitee assignment and unassigned state
- [x] QR validation/check-in service and lazy scanner route
- [x] Manual guest search and check-in
- [x] Idempotent database check-in/reversal RPC and audit UI
- [ ] Live concurrency and repeated-scan tests

## Automated verification

Last local checkpoint before the current environment-free implementation pass:

- `pnpm typecheck` — pass
- `pnpm lint` — pass
- `pnpm test` — pass, 29 tests across 10 files
- `pnpm build` — pass

Unit coverage currently includes normalization, scoring, invitation decisions,
invitation-code hashing, pending-confirmation signing/expiry, RSVP schema,
single-guest membership, exact deadline behavior, QR token helpers, and log
redaction. Database integration, component, accessibility, and E2E suites remain.

Per user instruction, no test, typecheck, lint, build, browser, Supabase, or
database command was executed after the cross-phase implementation added on
June 21, 2026. All newly added code remains unverified until setup is complete.

## Phase 6 — Hardening and launch operations

- [x] Personalized guest routes forced to dynamic rendering
- [x] CSV formula-injection escaping
- [x] Audit-history and integration-readiness admin pages
- [x] CI workflow scaffold
- [x] Local/linked Supabase reset script
- [x] Guarded operational-data reset script preserving Auth by default
- [x] Operations and event-day runbook
- [ ] Production backup, deployment, monitoring, and rehearsal
- [ ] Security/RLS review and full validation after environment setup

## Requires user/environment input

- Provision Supabase local/preview/production projects and apply migrations.
- Provision an admin through Supabase Auth and an active `admin_profiles` row.
- Configure production secrets, Resend domain, storage buckets, and rate-limit
  infrastructure.
- Confirm real wedding date/time, venue details, support contact, guest policies,
  and production guest roster.
- Supply or approve final content and generated background artwork.

## Next verified work

Implementation scaffolding now covers all planned phases. Remaining work is
environment verification, richer admin editing/import-preview UX, final wedding
content and artwork, deployment, and launch rehearsal.

After Supabase and environment variables are configured, run the reset/migration
flow and then perform the documented typecheck, lint, build, database,
accessibility, responsive, and end-to-end verification.
