# Operations

## Database setup

1. Install Docker and initialize Supabase with `pnpm dlx supabase init`.
2. Start the local stack with `pnpm dlx supabase start`.
3. Configure `.env.local` from `.env.example`.
4. Apply migrations and the SQL seed with `pnpm db:reset:local`.
5. Run `pnpm seed` when invitation-code hashes are required in synthetic data.

## Reset commands

### Local schema reset

```powershell
pnpm db:reset:local
```

This invokes `supabase db reset --local`, recreates the local database, applies
all migrations, and runs `supabase/seed.sql`.

### Linked project reset

This drops user-created remote database entities and reapplies local migrations.
Take a backup first.

```powershell
.\scripts\reset-database.ps1 `
  -Target linked `
  -Confirmation "RESET LINKED WEDDING DATABASE"
```

### Operational-data-only reset

This preserves schema, Supabase Auth users, and admin profiles by default.

```powershell
$env:RESET_DATABASE_CONFIRM="RESET WEDDING RSVP OPERATIONAL DATA"
pnpm db:reset:data
```

Set `RESET_INCLUDE_ADMIN_PROFILES=true` to also remove admin profiles.
Production-like hostnames are refused unless `ALLOW_PRODUCTION_RESET=true`.

## Event-day preparation

- Export the guest/seating roster from `/admin/guests`.
- Confirm the imported roster contains exactly one named guest per invitation.
- Verify at least two authenticated admin/check-in devices.
- Confirm camera permission and manual check-in fallback.
- Keep a recent CSV export available if venue connectivity is weak.
- Rehearse check-in, duplicate scan, and reversal procedures.
- Confirm support contact and database backup ownership.
