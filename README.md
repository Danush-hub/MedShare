# MedShare

A professional hospital-to-hospital **medical equipment sharing platform**.
Hospitals and clinics can discover available equipment, request it,
approve sharing and track transfers. (In this prototype every institution is
fictional demo data — there is no hospital verification process yet.)

> **Frontend prototype — no backend.** The full application runs entirely
> locally in **mock mode**: a working landing page, authentication, dashboard,
> equipment inventory, discovery, requests, transfers, hospital directory,
> activity history and settings, all backed by an in-browser centralized store.
> The service layer, shared TypeScript models, HTTP client and REST contract
> are prepared for a future **Java + Spring Boot** backend, but **no HTTP
> request is made and no database or Spring Boot project exists yet.**

## Tech stack

- **React 18 + TypeScript** (strict) + **Vite**
- **React Router v6** — public / auth / guarded app routes
- **Tailwind CSS** — design tokens via CSS variables
- **Lucide React** — icons
- **Axios** — configured client (not called in mock mode)
- **React Hook Form + Zod** — form validation

## Prerequisites

- Node.js `>= 20`
- npm `>= 10`

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. (Optional) copy the environment template. Mock mode is the default, so the
#    app runs with no .env file at all.
Copy-Item .env.example .env.local   # PowerShell

# 3. Start the dev server
npm run dev
```

Sign in with the demo credentials **`admin` / `1234`**. These are **public
demonstration credentials compiled into the browser bundle** — they live only
in the mock authentication service, are visible to anyone who views the site
source, and are **not** real, secure authentication. Never treat them (or the
role-preview switcher) as access control.

### Routes

| Path                  | Screen                                     |
| --------------------- | ------------------------------------------ |
| `/`                   | Public landing                             |
| `/login` `/signup`    | Authentication                             |
| `/app`                | Dashboard                                  |
| `/app/equipment`      | Equipment inventory (CRUD)                 |
| `/app/find-equipment` | Discovery + request equipment              |
| `/app/requests`       | Incoming/outgoing requests (approval flow) |
| `/app/transfers`      | Transfer tracking (movement workflow)      |
| `/app/hospitals`      | Hospital directory (read-only)             |
| `/app/activity`       | Activity history                           |
| `/app/settings`       | Institution / user / preference settings   |
| anything else         | Not-found page                             |

## Scripts

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start Vite dev server                          |
| `npm run build`     | Type-check (`tsc --noEmit`) + production build |
| `npm run preview`   | Preview the production build locally           |
| `npm run typecheck` | TypeScript type-check only                     |
| `npm run lint`      | Run ESLint                                     |
| `npm run lint:fix`  | Run ESLint with autofix                        |
| `npm run test`      | Run the existing Vitest suite once             |
| `npm run format`    | Format `src` with Prettier                     |

> Note: `npm run format:check` currently reports pre-existing Prettier drift in
> a large share of `src` files (the repo was not written with Prettier as the
> enforced formatter). It is intentionally not reformat-enforced yet — a
> repo-wide `npm run format` would rewrite ~100 files unrelated to any given
> change. `npm run lint` and `npm run build` are clean and are the checks used
> before pushing.

## Environment variables

See [`.env.example`](.env.example). All are prefixed `VITE_` and exposed to the
client:

- `VITE_DATA_MODE` — `mock` (default) or `api`. Selects the service
  implementation. Any other value shows a clear configuration error instead of
  silently pretending a backend exists.
- `VITE_API_BASE_URL` — base URL of the future Spring Boot API (unused while in
  mock mode).
- `VITE_APP_ENV` — `development` | `production`.

Never commit real secrets; `.env*` files are gitignored except `.env.example`.

### First Git commit

Version control is set up by you — this repository ships with `.gitignore` but
without Git history. From the project root:

```powershell
git init
git add .
git status            # verify: no node_modules, no dist, no .env files
git commit -m "Initial MedShare frontend prototype"
```

`git status` should list only source, config and documentation files. If a
`.env.local` you created yourself ever appears in `git add` output, stop and
check `.gitignore` before committing.

## How mock mode works

The UI never touches a data source directly. Every feature — for **reads and
mutations alike** — calls a **service contract**, and a small factory decides
which implementation answers.

```
src/services/
  contracts/   interfaces per feature (Auth, Hospital, Equipment, Request,
               Transfer, Activity, Settings) — no implementation details
  mock/        implementations backed by the centralized workspace store
  http/        REST placeholders — throw NOT_IMPLEMENTED (no requests)
  config/      resolveDataMode(VITE_DATA_MODE) + createServices() factory
  api/         the configured Axios client + error normalization
  errors.ts    the shared ServiceError used by every data source
  ServiceProvider.tsx   useServices() + the DataModeGate config guard
```

- **Centralized state**: `src/features/workspace` holds one `useReducer` store
  (persisted to `localStorage` under `medshare.workspace.v1`, with a one-time
  migration from any older `sessionStorage` snapshot) containing a single,
  cross-referenced dataset. Equipment, requests, transfers, dashboard metrics
  and activity all read and mutate the **same** records through the service
  contracts, so the workflow stays consistent and demo changes survive a browser
  or tab restart. Presentation pages fetch reads via `useServiceQuery()` (which
  refreshes after mutations and handles loading/error/empty states) instead of
  reading store state directly; the store itself is kept for mutations and
  session context (`currentInstitutionId`, `demoRole`). Pure business rules live
  in `src/features/workspace/rules.ts`.
- **Business rules are enforced by services, not components.** A mutation either
  succeeds or throws a `ServiceError` (`VALIDATION`, `NOT_FOUND`, `FORBIDDEN`,
  `CONFLICT`, …). Not every operation succeeds — e.g. deleting equipment that is
  reserved, or approving a request whose units are gone, fails with a clear
  message. No stack traces are ever shown to users.
- **Equipment lifecycle**: availability distinguishes `Available`, `Partially
Available`, `Reserved`, `Unavailable`, `Under Maintenance` and `Retired`. The
  last three are **manual flags** — the store never auto-reopens them — and
  equipment in any of them is blocked from discovery and from being requested
  (enforced in `rules.ts` and again in the mock request service).
- **Workflow invariants**: a request must be approved before dispatch; approval
  ≠ dispatch; dispatch ≠ receipt; receipt ≠ return; availability accounts for
  reservations and releases only on completion. Passwords are never persisted.
- **Error boundary**: the whole provider tree is wrapped in a top-level
  `ErrorBoundary` (`src/components/common/ErrorBoundary.tsx`) that renders a
  calm fallback screen instead of a blank page when an unexpected UI failure
  occurs, and logs the error to the console only (nothing leaves the browser).

## Roles & permissions (demo only)

A lightweight, **centralized** authorization model lives in
`src/features/workspace/permissions.ts` as a capability list (`Permission`) and
a role→capability matrix. Four demo roles are defined — **Hospital
Administrator**, **Equipment Coordinator**, **Request Approver** and **Viewer**
(read-only) — and the active role is stored in the workspace state
(`demoRole`, persisted to `localStorage`).

- Feature code reads capabilities through the `usePermissions()` hook
  (`can('equipment:manage')`, …) to **hide or disable** unauthorized actions and
  to **guard event handlers** across equipment, discovery, requests, transfers
  and settings — so an unauthorized action can't slip through a stale view.
- A **role-preview switcher** in the top-bar profile menu lets you see the
  product from each role's perspective without touching the demo login.

> This is a frontend UX demonstration of least-privilege interfaces. It is
> **not** real security: capabilities live in the browser and enforce nothing
> server-side (there is no server). Real authorization must be enforced by the
> future backend.

## Switching to the backend (once a real API exists)

1. Implement the method bodies in `src/services/http` against `apiClient`
   (they are sketched with their proposed endpoint already).
2. Point `VITE_API_BASE_URL` at the running Spring Boot service.
3. Set `VITE_DATA_MODE=api` and restart.

No page, component or contract changes are required — that is the point of the
seam. Until then, `VITE_DATA_MODE=api` only produces explicit
`NOT_IMPLEMENTED` errors.

## Deploying (Netlify / static hosting)

MedShare is a pure static SPA — any static host works. [`netlify.toml`](netlify.toml)
is committed with the correct settings, so Netlify needs no manual config:

| Setting           | Value                                                                                |
| ----------------- | ------------------------------------------------------------------------------------ |
| Build command     | `npm run build`                                                                      |
| Publish directory | `dist`                                                                               |
| Node version      | 20 (set in `netlify.toml`; matches `engines` in `package.json`)                      |
| SPA fallback      | `/* → /index.html (200)` — `netlify.toml` + [`public/_redirects`](public/_redirects) |

Steps:

1. Push this repository to GitHub (or another Git host).
2. In Netlify: **Add new site → Import an existing project**, select the repo.
3. The values above are picked up from `netlify.toml` — deploy.

**Environment variables:** none are _required_ (the app defaults to mock mode).
`VITE_*` variables are baked in at build time; to change them, set them under
**Site configuration → Environment variables** and trigger a rebuild. For a
deployment, keep `VITE_DATA_MODE=mock` (until a real backend exists) and
`VITE_APP_ENV=production`. Never put real secrets in `VITE_*` variables — they
are embedded in the public JavaScript bundle.

The SPA fallback is what makes direct navigation and refreshes on routes like
`/app/equipment`, `/app/requests` or `/app/transfers` work; without it the host
returns 404. `public/_redirects` is the portable equivalent understood by most
static hosts, so the same repo deploys to Cloudflare Pages, Vercel-style
`/*` rewrite setups, etc., with the same build command and output directory.

## Security & limitations of this demo

MedShare is an honest **frontend prototype**. It is _not_ secure for real use:

- **Mock authentication.** `admin` / `1234` is a public demo credential inside
  the bundle; the "session" is a plain object in `sessionStorage` and can be
  forged or bypassed by any visitor. There is no server-side authentication.
- **Client-side permissions.** The role/capability gating hides and disables
  UI actions only. It is a UX demonstration of least-privilege interfaces —
  not authorization. Real permissions must be enforced by the future backend.
- **localStorage data.** The workspace demo data persists to `localStorage`
  under `medshare.workspace.v1`, per browser and per device. It is never
  shared, uploaded or durable server-side, and deliberately contains **no
  passwords, tokens or credentials** (the demo session object holds only a
  non-sensitive user profile).
- **No backend, no real integrations.** No HTTP requests are made; hospitals,
  users and equipment are fictional sample data.
- **Dependency advisories** (from `npm audit`, static frontend scope):
  the runtime-relevant one is the React Router advisory range `6.0.0 – 7.17.0`
  (open-redirect via unusual backslash URLs in `<Link>`/`navigate`, moderate);
  MedShare only navigates to its own literal routes, so exposure is low, and
  every published 6.x release (including the locked 6.30.6) falls inside the
  advisory range — a fix requires the breaking major upgrade to react-router-dom 7,
  deliberately not performed here. The remaining advisories
  (vitest/tinypool, vite/esbuild dev server, tailwind/braces, postcss-selector-parser)
  affect **dev/test tooling only** and are not present in the deployed bundle.
  Run `npm audit` for current details before upgrading anything.

## Project structure

Feature-oriented layout — see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

```
src/
  app/         App, providers, router, NotFoundPage
  components/  ui/ · layout/ · common/ (design system + composites)
  features/    landing · auth · dashboard · equipment · findEquipment ·
               requests · transfers · hospitals · activity · settings ·
               workspace (the centralized store + rules)
  layouts/     PublicLayout · AuthLayout · AppLayout
  services/    contracts/ · mock/ · http/ · config/ · api/ · errors.ts
  types/       canonical domain + API types
  lib/ hooks/ constants/ styles/ test/
docs/          ARCHITECTURE.md · API_CONTRACT.md
```

## Design system

Brand and semantic colors are defined once as CSS variables in
`src/styles/globals.css` and consumed by `tailwind.config.ts`. Reusable
primitives (`Button`, `Card`, `Badge`, `Input`, `Label`, `PageContainer`) and
the `MedShareLogo` SVG keep every screen visually consistent and accessible.

## What is proposed vs. what exists

- **Real, working today (mock):** the entire UI, the auth/login flow, the
  centralized store, all service contracts and their mock implementations.
- **Proposed only (not implemented):** every endpoint in
  [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md), the `src/services/http`
  placeholders, and the Axios client. No backend, database or Spring Boot
  project exists.
- **Demo-only:** the `admin` / `1234` mock login, the browser-persisted store
  (`localStorage`), the role-preview switcher (client-side capability gating,
  not real security), and the "Reset demo data" action.

All institutions, users and equipment are fictional sample data. MedShare is a
prototype and implies no real partnerships; it makes no clinical, regulatory or
data-privacy claims.
