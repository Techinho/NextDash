# Agency Dashboard (NextDash)

Agency Dashboard (NextDash) is a Next.js application that provides a secure, monetized directory of government agencies and their contacts. It uses Clerk for authentication, Supabase for data storage, and implements daily view limits and a rotating feed to protect data value.

Key goals:
- Provide a fast, modern dashboard for browsing agencies and contacts
- Enforce per-user daily viewing limits (default: 50) for non-admins
- Keep user data synchronized via Clerk webhooks and Supabase

---

## Features

- Dashboard: overall counts, usage summary, recent agencies and contacts
- Agencies directory: searchable, paginated, with rich metadata
- Contacts database: paginated search with daily view limits and usage tracking
- Authentication via Clerk and server-side user sync (webhooks)
- Supabase (Postgres) with Row-Level Security patterns for data safety
- Built with Next.js App Router, Tailwind CSS, and Shadcn/Radix UI components

---

## Quick Start

Prerequisites:

- Node.js 18+ (or compatible)
- npm or pnpm
- A Supabase project (URL, anon key, service role key)
- A Clerk project (publishable key, secret key, webhook secret)

1. Clone the repo:

```bash
git clone https://github.com/Techinho/NextDash.git
cd NextDash
```

2. Install dependencies:

```bash
# npm
npm install

# or pnpm
pnpm install
```

3. Create environment variables. Copy `.env.example` (if present) or create `.env.local` with the variables below.

Required environment variables:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

```

4. Run the development server:

```bash
# npm
npm run dev

# or pnpm
pnpm dev
```

Open http://localhost:3000 and sign in with Clerk.

---

## Development Notes

- The app uses the Next.js App Router (`app/`) and contains both server and client components.
- Server-side Supabase access is provided by `lib/supabase-server.ts` using the `SUPABASE_SERVICE_ROLE_KEY`.
- Client-side Supabase access uses `lib/supabase-client.ts` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Clerk webhooks are handled in `app/api/webhooks/clerk/route.ts` and must be configured in the Clerk dashboard (use `CLERK_WEBHOOK_SECRET`).

Important files and folders:

- `app/` — Next.js pages and API routes
- `components/` — UI components (includes `components/ui` primitives)
- `lib/` — helpers and Supabase/Clerk integration code
- `app/api/` — serverless API routes (contacts, agencies, dashboard stats, webhooks)

---

## API Endpoints (Overview)

- `GET /api/dashboard/stats` — Dashboard counts & recent items (authenticated)
- `GET /api/agencies` — Paginated agencies list
- `GET /api/contacts` — Paginated contacts list with usage enforcement
- `POST /api/webhooks/clerk` — Clerk webhook receiver (svix verification)

Refer to `app/api/*/route.ts` files for the exact implementation and params.

---

## Troubleshooting

- Dashboard data not loading on first render: ensure Clerk client has hydrated (`isLoaded`) before fetching. See `app/dashboard/page.tsx` for client-side fetch logic.
- 401 from API routes: confirm `CLERK_SECRET_KEY` and Clerk setup; also ensure cookies are available for server-side auth when running locally.
- Webhook verification failures: verify `CLERK_WEBHOOK_SECRET` matches the secret shown in Clerk and that your webhook receiver is accessible (use ngrok for local testing).

---

## Deployment

- Recommended hosting: Vercel for Next.js with environment variables added in the project settings.
- Ensure server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`) are set in the deployment provider and not exposed to the client.

Basic steps:

1. Push the repository to your Git provider (GitHub/GitLab).
2. Create a new Vercel project and link the repository.
3. Add all required environment variables in the Vercel dashboard.
4. Deploy — Vercel will build and publish the app.

 follow the existing code style (TypeScript, React, Tailwind conventions).


