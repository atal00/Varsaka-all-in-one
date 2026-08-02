# Varsaka — Mock-data → production data migration

This converts the site from hardcoded/mock content into a real, database-driven application:

```
Vite + React frontend  ──HTTP──▶  Express + Mongoose API (server/)  ──▶  MongoDB
        src/                          api.varsaka.com / localhost:4000
```

The frontend stays Vite + React (per decision); a new Express + Mongoose API lives in `server/`.
Every content surface now reads/writes through the API instead of static arrays.

---

## What was removed (mock-data audit)

| Mock source | Where it lived | Replaced by |
|---|---|---|
| Blog posts (MDX + hardcoded list) | `src/content/blog/*.mdx`, `Blog.jsx` `POSTS`/`ALL` | `Blog` collection via `GET /blogs` |
| Job listings + applications (seed + localStorage) | `src/lib/careersStore.js` (`SEED_JOBS`, `SEED_APPS`, `addApplication`) | `Job` + `Application` collections via `/jobs`, `/applications` |
| Case studies (hardcoded) | `Work.jsx` `FEATURED`/`CASES`, `Admin.jsx` `INIT_CASES` | `CaseStudy` collection via `/case-studies` |
| Contact form (no-op submit) | `Contact.jsx` | `POST /contact` → `ContactSubmission` |
| Admin demo auth ("any email + password") | `Admin.jsx` `AuthScreen` | `POST /auth/login` (JWT + bcrypt) |
| Admin seed arrays | `Admin.jsx` `INIT_POSTS/INIT_CASES/INIT_APPS/INIT_CONTACTS/INIT_MEDIA/ACTIVITY/CHART_DATA` | live API calls per section + `GET /dashboard` |

> The MDX files and `careersStore.js` are intentionally **kept** — they are now used *only* as the
> one-time **seed source** (`server/src/seed/seed.js` migrates them into MongoDB). The running
> frontend no longer imports them.

---

## New code

**Backend (`server/`)** — Express + Mongoose, ESM. 10 collections with validation + indexes,
JWT auth, Multer uploads, zod validation, central error handling, a seed/migration script, and a
`GET /health` check. See `server/README.md` for the full endpoint list and run instructions.

Collections: `User, Blog, Category, Tag, Job, Application, CaseStudy, ContactSubmission, Media, Settings`.

**Frontend API layer**
- `src/lib/api.js` — typed fetch client: base URL from `VITE_API_BASE`, bearer-token auth,
  timeouts, retry/backoff on network/5xx, normalised `ApiError`, and per-resource methods.
- `src/hooks/useApi.js` — `useQuery` (loading/error/refetch) and `useMutation`.
- `src/components/Async.jsx` — on-brand `Loading` / `ErrorState` / `Empty` states.
- `src/lib/careersContent.js` — static Careers *page copy* + enums (separated from DB records).

**Pages wired to the API:** `Blog`, `BlogPost` (markdown rendered with `marked`), `Careers`,
`CareerDetail` (résumé upload via `FormData`), `Work` (case studies), `Contact`, and the full
`Admin` panel (auth + every section).

---

## How to run it for real

### 1. Backend
```bash
cd server
cp .env.example .env          # then edit .env
#   MONGODB_URI=<your Atlas or local connection string>   # REQUIRED, never commit it
#   JWT_SECRET=<long random string>
#   ADMIN_EMAIL / ADMIN_PASSWORD
npm install
npm run seed                  # migrates current content into MongoDB + creates the admin user
npm run dev                   # http://localhost:4000  (GET /health → {ok:true})
```

### 2. Frontend
```bash
cp .env.example .env          # set VITE_API_BASE=http://localhost:4000 for local dev
npm install
npm run dev
```

In production: deploy `server/` to `api.varsaka.com`, set `VITE_API_BASE=https://api.varsaka.com`
in the frontend build env, and provide the real `MONGODB_URI` to the server's environment.

---

## Verification status (be precise)

- ✅ **Backend**: `npm install` clean, all source files syntax-check, app imports, server boots,
  `GET /health` responds, unknown routes 404 cleanly, and it fails with a clear message when
  `MONGODB_URI` is absent. Seed parsing of the existing content was sanity-checked.
- ✅ **Frontend**: `npm run build` succeeds; every page renders its loading state during prerender
  and fetches on the client.
- ⚠️ **Not verified end-to-end**: live MongoDB connectivity and the full request/response cycle.
  No `MONGODB_URI` and no reachable `api.varsaka.com` exist in this build environment, so the
  data path could not be exercised here. Once you supply a `MONGODB_URI`, run `npm run seed` and
  start both servers to exercise it fully.

Nothing in the running app falls back to mock data — with no backend reachable, pages show real
loading / empty / error states (correct production behaviour), not fabricated content.
