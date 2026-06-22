# Technical Stack

## Recommendation summary

Use a single Next.js application deployed on Vercel, backed by Supabase. Supabase is preferred over Neon for this project because it combines managed PostgreSQL with admin authentication, storage, and row-level security. Neon remains a valid database-only alternative, but it would require separate auth and storage services without a clear benefit for the initial scope.

Versions should be pinned in the lockfile at implementation time. As of June 21, 2026, the official Next.js documentation reports Next.js 16.2.9 and recommends the App Router.

## Core platform

| Concern | Choice | Reason |
| --- | --- | --- |
| Framework | Next.js 16 App Router + TypeScript | Server Components, Server Actions/route handlers, image/font optimization, Vercel integration |
| Runtime/deployment | Vercel | Native Next.js deployment, functions, preview environments, logs |
| Package manager | pnpm | Fast, strict dependency management |
| Database | Supabase PostgreSQL | Relational model, transactions, extensions, managed backups |
| Admin authentication | Supabase Auth | Seeded email/password admin and SSR session support |
| Object storage | Supabase Storage | Final galleries, invitation images, entourage portraits, generated passes if stored |
| Styling | Tailwind CSS 4 | Tokenized responsive styling and current Next.js integration |
| UI primitives | shadcn/ui | Accessible, locally owned component code; useful for admin tables, dialogs, forms, sheets, and accordions |

## Application libraries

| Concern | Choice | Notes |
| --- | --- | --- |
| Validation | Zod | Shared server/client schemas; server remains authoritative |
| Forms | React Hook Form + `@hookform/resolvers` | Admin and multi-step RSVP forms |
| Server data | Native server `fetch`, Supabase client, Server Actions | Do not add Axios without a concrete requirement |
| Client async state | TanStack Query only where needed | Primarily admin tables/scanner; avoid using it for static sections |
| Animation | Motion (`motion` package) | Envelope transitions and restrained section motion |
| Carousel | Embla Carousel | Accessible foundation with explicit custom controls |
| QR generation | `qrcode` | Render high-resolution QR PNG/data URL from opaque token URL |
| QR scanning | `@zxing/browser` | Browser camera scanning; verify target-device support in a spike |
| Email | Resend + React Email | Invitation/pass email templates and provider delivery |
| Dates | date-fns | Formatting and timezone-safe utility; persist timestamps in UTC |
| Tables | TanStack Table | Admin roster, seating, attendance, sorting, and filters |
| Icons | Lucide React | Consistent, lightweight UI icons |
| Logging | Vercel logs plus structured logger | Redact names, emails, and tokens |
| Rate limiting | Upstash Redis/Ratelimit or equivalent | Name lookup, login, resend, and scanner abuse controls |

## Development quality

| Concern | Choice |
| --- | --- |
| Linting | ESLint with Next.js defaults |
| Formatting | Prettier plus Tailwind class sorting plugin if compatible |
| Unit/integration tests | Vitest + Testing Library |
| End-to-end tests | Playwright |
| Accessibility checks | axe-core/Playwright and manual testing |
| Database migrations | Supabase CLI migrations |
| Git hooks | Optional Lefthook or simple CI checks; do not make local setup fragile |
| CI | Type check, lint, unit tests, production build, selected E2E tests |

## Initial setup commands

These are planning references and should only be run during the implementation phase.

```bash
pnpm create next-app@latest wedding-rsvp --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"
cd wedding-rsvp
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add --all -y
```

The shadcn CLI officially supports `--all`. Installing every component is requested for this project, but it increases repository size and review surface. If this requirement becomes flexible, install only components used by the guest and admin interfaces.

Suggested application dependencies:

```bash
pnpm add @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers
pnpm add motion embla-carousel-react qrcode @zxing/browser
pnpm add resend @react-email/components date-fns lucide-react
pnpm add @tanstack/react-query @tanstack/react-table
```

Suggested development dependencies:

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D @playwright/test @axe-core/playwright
```

## PostgreSQL capabilities

- Enable `pg_trgm` for trigram name similarity.
- Consider `unaccent` only if the guest list requires accent-insensitive matching and the transformation is tested carefully.
- Use database constraints and transactions for RSVP, seating capacity, QR issuance, and attendance.
- Keep fuzzy-match functions in a non-exposed schema or call them only through protected server code.
- Enable RLS on exposed tables; deny anonymous direct access by default.

## Why not Axios

Next.js server code and modern browsers already provide `fetch`. Supabase has its own client. Adding Axios would duplicate capability and increase the client bundle. Add it later only if interceptors or a third-party integration specifically justify it.

## Official references

- Next.js App Router: <https://nextjs.org/docs/app>
- Next.js installation: <https://nextjs.org/docs/app/getting-started/installation>
- Supabase SSR auth: <https://supabase.com/docs/guides/auth/server-side>
- Supabase RLS: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Supabase extensions: <https://supabase.com/docs/guides/database/extensions>
- Tailwind with Next.js: <https://tailwindcss.com/docs/guides/nextjs>
- shadcn CLI: <https://ui.shadcn.com/docs/cli>
- Resend with Next.js: <https://resend.com/docs/send-with-nextjs>
- Vercel Functions: <https://vercel.com/docs/functions>

