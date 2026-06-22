# Jobert & April Wedding RSVP — Implementation Plan

This directory defines the initial product, design, architecture, security, and delivery plan for the wedding RSVP website. It is planning documentation only; it does not contain application implementation.

## Documentation map

| Document | Purpose |
| --- | --- |
| [project-overview.md](./project-overview.md) | Goals, scope, assumptions, terminology, and success criteria |
| [features.md](./features.md) | Guest-facing and admin-facing requirements |
| [user-flows.md](./user-flows.md) | End-to-end guest and administrator journeys |
| [design.md](./design.md) | Visual direction, responsive layouts, motion, and accessibility |
| [content-and-assets.md](./content-and-assets.md) | Section copy, asset audit, placeholders, and content requirements |
| [background-art-plan.md](./background-art-plan.md) | Generated background inventory, art direction, prompts, and delivery requirements |
| [tech-stack.md](./tech-stack.md) | Recommended technologies, packages, and setup commands |
| [architecture.md](./architecture.md) | Application boundaries, route plan, services, and processing flows |
| [data-model.md](./data-model.md) | Proposed PostgreSQL schema, constraints, and matching strategy |
| [security-and-privacy.md](./security-and-privacy.md) | Authorization, data protection, abuse controls, and audit requirements |
| [configuration.md](./configuration.md) | Environment variables, configurable content, and deployment environments |
| [testing.md](./testing.md) | Test strategy and acceptance criteria |
| [implementation-roadmap.md](./implementation-roadmap.md) | Phased delivery plan, dependencies, and definition of done |
| [open-questions.md](./open-questions.md) | Decisions and content still required before implementation |
| [operations.md](./operations.md) | Setup, database reset, export, and event-day runbook |

## Agreed product shape

- A guest starts on a full-screen, navbar-free closed-envelope experience.
- Opening the envelope reveals a name-based RSVP form.
- A recognized guest submits attendance details and receives a personalized QR wedding pass.
- The authenticated-by-invitation guest experience continues into one long, scrollable wedding page with anchored navigation.
- A separate protected admin area manages invitees, table assignments, attendance, content, and QR scanning.
- The public experience is pastel, editorial, image-led, and intentionally different from the utility-focused admin interface.
- Sections without supplied artwork receive purpose-built generated backgrounds following one shared watercolor/paper art direction.

## Primary technical decisions

- Next.js App Router deployed to Vercel.
- Supabase for PostgreSQL, admin authentication, storage, and row-level security.
- Tailwind CSS and shadcn/ui for styling and accessible UI primitives.
- Server-side mutations for all guest matching, RSVP, QR, email, and admin operations.
- A server-only `RSVP_DEADLINE` environment value controls when guest RSVP creation and updates close.
- PostgreSQL `pg_trgm` similarity for candidate name matching, with ambiguity safeguards.
- Resend for optional invitation and QR email delivery.

## Planning principles

1. Never expose the guest list to the browser.
2. Do not treat an 85% fuzzy name score as proof of identity by itself.
3. Keep the QR token opaque and free of personal information.
4. Make every attendance mutation idempotent and auditable.
5. Treat image and wedding content as configuration, not hard-coded component copy.
6. Preserve a useful experience when JavaScript motion is reduced or unavailable.
7. Treat mobile layouts as the primary design target; desktop layouts are enhancements.
