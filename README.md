# Pulse (MVP)

Pulse is a modern, youth-focused social check-in app MVP built with:

- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Prisma** + **SQLite** for local MVP development
- Local credentials auth for MVP development
- Supabase identities can be verified and mapped into app users through a server sync endpoint
- **Supabase Postgres/Auth** can still be reintroduced later for full hosted production flows

---

## ✅ Getting started (local dev)

### 1) Install dependencies

```bash
npm install
```

### 2) Create a `.env.local` file

This project now uses a **local SQLite database** for development.

Set `DATABASE_URL` to the local SQLite file:

```bash
DATABASE_URL="file:./prisma/dev.db"
```

You can keep this in either `.env` or `.env.local`. `prisma.config.ts` loads both explicitly for Prisma commands.

### 3) Create the local database and Prisma migration

Run:

```bash
npx prisma migrate dev --name init-sqlite
```

This creates the local SQLite database file at `prisma/dev.db`, applies the migration, and regenerates the Prisma client.

If Prisma returns a generic schema engine error in your local environment, retry with advisory locking disabled:

```bash
PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1 npx prisma migrate dev --name init-sqlite
```

### 4) Run the dev server

```bash
npm run dev
```

Then open http://localhost:3000.

---

## 🧩 Prisma / database

### Set `DATABASE_URL` before running migrations

Prisma reads `DATABASE_URL` from the environment. If this is not set, `npx prisma migrate dev` will fail.

For local MVP development, use:

```bash
npx prisma migrate dev --name init-sqlite
```

Fallback for environments where Prisma's advisory lock fails locally:

```bash
PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1 npx prisma migrate dev --name init-sqlite
```

### (Optional) Seed data

The project includes seed data scaffolding; once your database is ready you can run:

```bash
npx prisma db seed
```

---

## 🧠 What is real vs. mocked

✅ **Real**
- The app is wired to use Prisma via `DATABASE_URL`.
- Local development now targets SQLite.
- The UI is structured for real check-ins, challenges, and profiles.
- Local credentials auth, persisted sessions, onboarding, and protected create/join/post actions are implemented.

⚠️ **Mocked / placeholder**
- The initial content displayed in the UI is seeded/mock data.
- Discovery content, challenge listings, and profile/social data are still mocked.
- Supabase storage is not implemented yet.
- Full Supabase client-side sign-in UI is not implemented yet.
- Supabase Postgres is not required for local MVP development right now.

## SQLite compatibility notes

- The current Prisma schema only changes the datasource provider from `postgresql` to `sqlite`.
- The schema now includes local MVP models for users, sessions, joins, and posts.
- Auth currently uses the local SQLite database for credentials, sessions, onboarding state, and protected actions.
- The `User` model includes `authProvider` and `providerUserId` fields so Supabase auth identities can be mapped into app users later.
- When moving back to Postgres later, the main change will be switching the datasource provider and `DATABASE_URL` back to a Postgres connection string, then generating a fresh Postgres migration history as needed.

## Auth flow

- `GET /login` and `GET /signup` provide local credentials auth pages.
- `POST /api/auth/signup`, `POST /api/auth/login`, and `POST /api/auth/logout` handle account creation, login, and logout.
- `POST /api/auth/supabase/session` verifies a Supabase access token against JWKS, maps it into an app user, and creates the normal Pulse session cookie.
- `GET /onboarding` and `POST /api/auth/onboarding` complete required username setup plus optional bio and avatar placeholder.
- Sessions persist with an HTTP-only cookie backed by the `Session` table in SQLite.
- Guests can browse public pages, but protected create/join/post actions redirect through auth and onboarding first.

---

## Deploy

For production later, `DATABASE_URL` can be pointed back to Supabase Postgres and Supabase can also be introduced for auth and storage once those features are implemented.
