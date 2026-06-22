# Wedding RSVP

A modern, responsive Wedding RSVP application built with Next.js App Router, Tailwind CSS, and Supabase.

## Getting Started

1. **Install dependencies:**
   Make sure you are using `pnpm` as your package manager.
   ```bash
   pnpm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill out your Supabase connection strings, API keys, and admin credentials.
   ```bash
   cp .env.example .env
   ```

3. **Start the Development Server:**
   ```bash
   pnpm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Management

This project uses Supabase for the database, authentication, and backend services.

### Local Database Reset & Seed

If you need to completely reset your local Supabase database, re-apply migrations, and seed it with test data (including the admin user configured in your `.env`), run:

```bash
pnpm db:reset:local
```

*Note: This command runs `supabase db reset --local` behind the scenes. Make sure you have initialized the Supabase CLI (`pnpm dlx supabase init`) before running this.*

If you only want to run the seed script (to add the admin user and test guests to an existing database without dropping all tables), run:

```bash
pnpm run seed
```

## Documentation

For more detailed technical documentation, please refer to the `docs/` folder:
- `docs/configuration.md` - Environment and site setup
- `docs/features.md` - Core application features
- `docs/security-and-privacy.md` - Security and authentication models
- `docs/tech-stack.md` - Technology stack and tools
