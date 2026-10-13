# MedShare — Frontend Architecture

This document describes how the MedShare frontend is organized and the
conventions to follow as the product grows. MedShare is currently a
**frontend-only prototype**: no database and no backend are running. The design
assumes a future **Java + Spring Boot REST API**.

## 1. Goals

- Feature-oriented, maintainable structure suitable for a small team.
- Strict separation of presentation, application logic, mock data, types and
  service contracts.
- A stable seam so swapping mock data for real HTTP calls touches only the
  service layer — never components or pages.
- A consistent, accessible design system backed by centralized tokens.

## 2. Tech stack

| Concern            | Choice                            | Notes                                   |
| ------------------ | --------------------------------- | --------------------------------------- |
| Framework          | React 18 + TypeScript             | Strict TS, function components          |
| Build / dev server | Vite                              | `@` alias resolves to `src/`            |
| Routing            | React Router v6                   | `createBrowserRouter` route tree        |
| Styling            | Tailwind CSS                      | Design tokens via CSS variables         |
| Icons              | Lucide React                      |                                         |
| HTTP client        | Axios                             | Configured; **not called in mock mode** |
| Forms/validation   | React Hook Form + Zod + resolvers | Available for future forms              |
| Testing            | Vitest + React Testing Library    | jsdom environment                       |
| Quality            | ESLint (flat config) + Prettier   | Strict, `any` disallowed                |

## 3. Folder responsibilities

```
src/
  app/            Composition root: App, providers, router, NotFoundPage.
  assets/         Bundled images/icons imported by the app (via Vite).
  components/
    ui/           Primitives: Button, Card, Badge, Input, Label.
    layout/       Structural pieces: SiteHeader/Footer, AppSidebar/AppTopbar.
    common/       Composites: Logo, Container, PageHeader, PageContainer,
                  Placeholder, ErrorBoundary.
  features/       Vertical slices (landing, auth, dashboard, equipment,
                  requests, transfers). Each owns its pages + feature logic.
                  workspace/ is the centralized store, business rules
                  (rules.ts), the permission model (permissions.ts) and the
                  usePermissions() hook.
  layouts/        Route layouts rendered by the router (Public/Auth/App).
  services/
    contracts/    Service interfaces (auth, hospitals, equipment, requests,
                  transfers, activity, settings) + the AppServices aggregate.
    mock/         Mock implementations backed by the centralized workspace store.
    http/         REST placeholders — document the future calls and currently
                  throw NOT_IMPLEMENTED (no requests, no fake responses).
    config/       Data-mode resolution (VITE_DATA_MODE) + the service factory.
    api/          The shared Axios client + error normalization (configured,
                  unused while in mock mode).
    errors.ts     The standardized ServiceError used by every data source.
    ServiceProvider.tsx  React seam exposing useServices(); the DataModeGate.
  hooks/          Reusable React hooks (e.g. useMediaQuery).
  lib/            Framework-free utilities (cn, env).
  types/          Shared domain + API TypeScript types.
  constants/      Route paths, brand + status metadata.
  styles/         globals.css (tokens, base styles, component classes).
  test/           Vitest setup.
```

### Why features vs. components vs. layouts?

- **components/** is presentation-only and feature-agnostic (reused everywhere).
- **features/** holds everything specific to one domain area, so a developer
  working on "requests" changes files under `features/requests/` and
  `services/`, not scattered shared files.
- **layouts/** are route-level shells (`<Outlet />` wrappers) that define the
  visual frame for a group of routes.

As a feature gains depth it can grow its own `components/`, `hooks/`, and
`api/` subfolders inside its feature directory.

## 4. Routing approach

The route tree lives in `src/app/router.tsx` and is grouped by auth boundary:

- **Public** (`PublicLayout`): `/` landing.
- **Authentication** (`AuthLayout`): `/login`, `/signup`.
- **Application** (`RequireAuth` → `AppLayout`): `/app`, `/app/equipment`,
  `/app/requests`, `/app/transfers`.
- **Fallback**: `*` renders `NotFoundPage`.

Paths are defined once in `constants/routes.ts` and referenced everywhere.

### Authentication guard

`RequireAuth` reads `isAuthenticated` from the auth context and redirects
unauthenticated users to `/login`, preserving their intended destination.
Login is backed by the `AuthService` **contract**, never by hardcoded
credentials in a component: the static `admin` / `1234` demo login lives only
in `src/services/mock/auth.ts`. This is frontend demonstration auth — route
protection is a convenience, **not** a security boundary against a determined
client. A real backend must issue genuine sessions behind the same contract.

### Authorization model (demo only)

Role-based capability gating is centralized in
`src/features/workspace/permissions.ts`, which defines a `Permission` capability
union and a role→capability matrix for four demo roles (Hospital Administrator,
Equipment Coordinator, Request Approver, Viewer). The active role is part of the
workspace state (`demoRole`, persisted to `localStorage`) and is read through
the `usePermissions()` hook, which exposes `can(permission)`, the role metadata,
and a `setRole()` used by the **role-preview switcher** in the top-bar profile
menu.

- Feature pages call `can(...)` to **hide or disable** unauthorized controls and
  to **guard event handlers**, so capability checks are not spread as ad-hoc
  conditionals.
- This is a UI/UX demonstration of least-privilege interfaces only. Because it
  lives entirely in the browser and there is no server, it enforces nothing
  real; authorization must ultimately be enforced by the future backend behind
  the service contracts.

## 5. Design system & tokens

- Colors and rhythm are defined as CSS custom properties in
  `styles/globals.css` (`:root`) and consumed by `tailwind.config.ts`. Changing
  a token once re-themes the app — components never hardcode hex values.
- Semantic status colors (success/warning/error/info) ship accessible base,
  soft-background and foreground pairings.
- Reusable primitives (`Button`, `Card`, `Badge`, `Input`, `Label`,
  `PageContainer`) enforce consistent spacing, radius, shadows and focus rings.
- Accessibility: semantic HTML, visible `:focus-visible` ring, skip links,
  responsive layouts, and accessible color contrast.
- Brand: `MedShareLogo` / `MedShareMark` are local SVG components that work on
  both white and blue surfaces (`variant="default" | "onBrand"`).

## 6. Service-layer architecture

The UI never talks to a data source directly. It calls a **service contract**
and the factory decides which implementation answers.

1. **Types** (`src/types/domain.ts`) are the single source of truth for the
   domain, shared by every layer. `PaginatedResponse<T>` and `ApiError` live in
   `src/types/api.ts`. There are no duplicate or `any` models.
2. **Contracts** (`src/services/contracts`) declare one interface per feature
   (`AuthService`, `HospitalService`, `EquipmentService`, `RequestService`,
   `TransferService`, `ActivityService`, `SettingsService`) with explicit,
   `Promise`-typed methods. They know nothing about mock or HTTP.
3. **Centralized state** (`src/features/workspace`) is the mock persistence
   engine: a `useReducer` store persisted to `localStorage` under
   `medshare.workspace.v1` (with a one-time, non-destructive migration from any
   older `sessionStorage` snapshot), holding one cross-referenced dataset
   (equipment, requests, transfers, activities, settings) so dashboard metrics
   and every page read the _same_ records. The store is responsible for
   mutations, persistence and session context (`currentInstitutionId`,
   `demoRole`); **presentation pages do not read `useWorkspace().state` for
   domain data** — they fetch reads through the service contracts via the
   `useServiceQuery()` hook (`src/hooks/useServiceQuery.ts`), which tracks
   loading/refreshing/error state, cancels stale results and re-fetches whenever
   the services rebuild after a mutation. Pure business rules live in
   `src/features/workspace/rules.ts`.
4. **Mock services** (`src/services/mock`) implement the contracts against that
   store through a small `WorkspaceAccess` seam. They enforce the rules and
   throw `ServiceError` (VALIDATION / NOT_FOUND / FORBIDDEN / CONFLICT) rather
   than silently succeeding — not every operation is allowed.
5. **HTTP services** (`src/services/http`) are placeholders that document the
   future `apiClient` call and currently throw `NOT_IMPLEMENTED`. They make no
   request and fabricate no server response.
6. **Selection** (`src/services/config`): `resolveDataMode()` reads
   `VITE_DATA_MODE` (default `mock`); an unsupported value throws a clear
   CONFIGURATION error. `createServices()` is a plain switch — no DI framework.
   `ServicesProvider` binds the chosen set to the store and exposes it via
   `useServices()`; `DataModeGate` renders the config error before boot.

**Workflow invariants** the services enforce: a request must be approved before
any dispatch; approval ≠ dispatch; dispatch ≠ receipt; receipt ≠ return;
inventory availability accounts for open reservations and active transfers, and
is released only when a transfer is Completed. Availability also distinguishes
manual lifecycle flags — `Unavailable`, `Under Maintenance` and `Retired` —
which the store never auto-clears and which block discovery and request
creation (see `isRequestableAvailability` / `requestAvailabilityBlocker`).
Passwords are never persisted.

**Resilience**: the whole provider tree is wrapped by a top-level
`ErrorBoundary` (`src/components/common/ErrorBoundary.tsx`) that renders a
controlled fallback view on unexpected render failures and logs the error to the
console only — no stack traces are shown to users and nothing leaves the browser.

## 7. Backend readiness

- A single Axios instance (`src/services/api/client.ts`) is configured from
  `VITE_API_BASE_URL` with JSON headers, a timeout, a bearer-token attachment
  seam (empty today) and a response interceptor that **normalizes every Axios
  failure into a `ServiceError`** (network, `ApiError`-envelope, or status). It
  is not called while `VITE_DATA_MODE=mock`.
- Proposed REST boundaries are documented in `docs/API_CONTRACT.md`.
- Adopting the backend is a **service-only** change: implement the bodies in
  `src/services/http` against `apiClient`, then run with `VITE_DATA_MODE=api`.
  No page, component or contract changes are required.
- **Demo-only today**: mock authentication (`admin` / `1234` — public demo
  credentials compiled into the bundle, not real auth), the `localStorage`-
  persisted workspace store (demo data only — never passwords or tokens),
  `resetWorkspace`, the role-preview switcher
  (client-side capability gating, not real security), and the read-only hospital
  directory. No database, Spring Boot project or live integration exists yet.

## 8. Deployment

MedShare builds to a fully static SPA (`npm run build` → `dist/`).
[`netlify.toml`](../netlify.toml) and [`public/_redirects`](../public/_redirects)
configure the SPA fallback so client-side routes (`/app/*`) resolve on direct
navigation and refresh. Required environment variables: none — the app defaults
to `VITE_DATA_MODE=mock`. See the README's "Deploying" section for the exact
Netlify settings and for the demo's security limitations.

## 9. Testing strategy

- **Vitest + React Testing Library** with jsdom; setup in `src/test/setup.ts`
  (jest-dom matchers, cleanup, `matchMedia` stub).
- Unit tests target pure utilities (`cn`) and design-system components (behavior
  - a11y attributes). This phase adds no new test cases.
- Route pages are kept simple so they can be smoke-tested as features land.

## 10. Conventions

- Strict TypeScript; avoid `any` (enforced by ESLint).
- Prefer `import type` (enforced by `verbatimModuleSyntax`).
- Small, typed, reusable components; no logic duplicated across pages.
- Keep presentation free of data fetching — go through services.
- New routes: add the path to `constants/routes.ts`, the page under the right
  feature, and wire it into `router.tsx`.
