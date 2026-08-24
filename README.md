# Koro

The public-facing Koro website — a language-discovery experience for visitors and normal
authenticated users, built on top of the existing Spring Boot + MongoDB + JWT backend. No admin
or reviewer UI is implemented here by design (see `plan` / `website-plan` at the repo root).

## Stack

Next.js (App Router, TypeScript) · TanStack Query · Tailwind CSS v4 · Radix UI primitives ·
React Hook Form + Zod · Recharts

## Getting started

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at your backend
npm run dev
```

Visit `http://localhost:3000`. The public site (`/`, `/languages`, `/dictionary`, `/about`,
`/search`) works without a backend connection — data-fetching sections fall back to empty/error
states. Anything under `/app` requires a logged-in session against a running backend.

## Project layout

```text
src/
├── app/
│   ├── (public)/        # /, /languages, /dictionary, /about, /search — full nav + footer
│   ├── (auth)/           # /login, /register, /forgot-password, /reset-password — minimal shell
│   ├── app/               # /app/** — authenticated shell, redirects to /login if signed out
│   └── api/auth/           # route handlers that proxy auth calls and hold the refresh cookie
├── components/
│   ├── ui/                 # design-system primitives (button, card, dialog, select, toast, …)
│   ├── layout/              # header/footer/sidebar/nav for public vs. authenticated shells
│   ├── search/, language/, dictionary/, save-to-book/, books/, state/
├── features/                # one folder per domain: auth, languages, dictionary, translations,
│                             # books, scan, submissions, activity, profile, export
│   └── <domain>/hooks.ts    # TanStack Query hooks — the only place components should fetch from
├── lib/
│   ├── api/                 # client.ts (fetch wrapper + 401 refresh), endpoints.ts (all routes)
│   ├── auth/                 # in-memory access-token store, server-side cookie helpers
│   └── utils/
└── types/                    # shared domain types (Language, Concept, Book, Submission, …)
```

## Authentication

Access tokens live in memory only (`lib/auth/token-store.ts`) — never in `localStorage`. The
refresh token is set as an `httpOnly` cookie by the `/api/auth/*` route handlers in
`src/app/api/auth/`, which proxy to the backend's `/auth/login`, `/auth/register`, and
`/auth/refresh`. `lib/api/client.ts` retries once on a `401` by calling `/api/auth/refresh`, then
signs the user out if that also fails.

## Connecting the real backend

The exact backend contract (`api_documentation.md`) wasn't available while building this, so
`src/lib/api/endpoints.ts` encodes reasonable REST shapes inferred from the plan (e.g.
`POST /translations/search`, `GET /categories/{slug}/concepts`, `POST /collections/{id}/items`).
If the live Swagger contract differs in a path or field name, that file — plus the three
`accessToken`/`refreshToken` field lookups in `src/app/api/auth/{login,register,refresh}/route.ts`
— are the only places that should need reconciling; nothing above the API layer depends on the
specific shape.

Set `NEXT_PUBLIC_API_BASE_URL` (and optionally a server-only `API_BASE_URL` if the Next.js server
reaches the backend over a different internal address) in `.env.local`.

## Indigenous script support

`lib/utils/script-font.ts` maps a language code to a dedicated Unicode font loaded in
`app/layout.tsx` (Noto Sans Bengali, Noto Sans Chakma, Noto Sans Myanmar for Marma), applied via
`.script-bn` / `.script-ccp` / `.script-mya` utility classes wherever translated text renders, so
scripts beyond Latin/Bangla don't fall back to tofu boxes.
