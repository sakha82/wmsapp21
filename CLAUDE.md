# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

WMS (Workshop Management System) — a multi-tenant SaaS Angular application for vehicle workshops (customers, offers, invoices, work orders, digital services, bookings, employees/timesheets, products, suppliers). Backend is a separate ASP.NET API (`environment.BASE_URL`), not part of this repo.

Stack: Angular 21 (standalone components, no NgModules), PrimeNG 21, Tailwind CSS v4, RxJS 7.

## Commands

```bash
npm start          # ng serve — dev server at http://localhost:4200
npm run build       # ng build — production build to dist/wmsapp21
npm run watch        # ng build --watch --configuration development
npm test            # ng test — Vitest test runner
```

Run a single test file: `ng test -- src/app/path/to/file.spec.ts` (Vitest under the hood — most `.spec.ts` files are currently absent; schematics are configured with `skipTests: true` by default, see `angular.json`).

Generate code with Angular CLI schematics, e.g. `ng generate component components/<feature>/<name> --standalone`.

## Architecture

### Path aliases
`tsconfig.json` defines baseUrl `src` with aliases `app/*` and `environments/*`. Always import via these, e.g. `import { SharedService } from 'app/services/shared.service'`, not relative `../../services/...` (existing code is inconsistent about this — prefer the alias form for new code).

### Routing (`src/app/app.routes.ts`)
- Public routes at root: `/`, `/privacy-policy`, `/opt-out`, and `/webview/*` (customer-facing pages for offers/invoices/digital services/password reset accessed via emailed tokens, no auth).
- Authenticated app lives under `/sv/*` wrapped in `LayoutComponent`, gated by `ResourcesLoadedGuard` (waits for translations/enums to load before activating — see below). `authGuard` also exists (checks `sessionStorage.accessToken`) but is not currently wired into routes; check `app.routes.ts` before assuming it's active on a given route.
- Feature areas each have `*-list`, `*-detail`, `*-crud` component triads under `src/app/components/<feature>/`.

### Bootstrap & HTTP pipeline (`src/app/app.config.ts`)
Three HTTP interceptors run in this order via `HTTP_INTERCEPTORS` multi-provider: `TokenInterceptor` (attaches `Authorization: Bearer <accessToken>` from `sessionStorage`, and on 401/404 with a token present calls `AuthSessionService.forceLogout()`), `WmsIdInterceptor`, `LoggingInterceptor`. PrimeNG is configured with the Material preset, customized with a real `semantic.primary` palette generated via `palette('#0969DA')` from `@primeng/themes` (as of 2026-08-03 — previously `#4F39F6`, before that an unmodified `definePreset(Material, {})`), and Swedish (`sv`) locale from `primelocale`. This is a single, fixed, global brand color — there is no per-workshop/tenant color override (`ThemeService`/`Workshop.DefaultTheme` were removed 2026-08-03, see `DECISIONS.md`).

### Session/tenant state
No NgRx/state library — tenant and session context live directly in `sessionStorage` (`accessToken`, `wmsId`, `workshopName`, `country`, `lang`, `userName`) and are read via getters on `SharedService` (`wmsId`, `workshopName`, `country`, `lang`, `currentLocale`). Most API calls append `wmsId` as a query param manually via `URLSearchParams`.

### `SharedService` (`src/app/services/shared.service.ts`)
The central grab-bag service, injected almost everywhere. Key responsibilities:
- `loadResources()` — fetches `assets/resources/trans.json` (translations) and `assets/resources/enums.json` (dropdown/enum values) once at startup, memoized via a cached `Promise`; exposes `resourcesLoaded$` / `areResourcesLoaded()` used by `ResourcesLoadedGuard`.
- `T(key)` — translation lookup against the loaded `trans.json`, keyed by current `lang` (`'en' | 'sv'`). **All user-facing strings must go through `this.sharedService.T('key')`**. New code should not introduce hardcoded UI strings. (A `HARDCODED_STRINGS_REPORT.md` audit file was referenced here previously but no longer exists in the repo — treat any future audit as a fresh pass against current source, not a resurrection of that file.)
- `getEnums(key)` / `getEnumByValue(key, value)` / `getDefaultEnum(key)` — country/lang-scoped enum lookups.
- File upload/download, PDF generation, email sending, vehicle make/model lookups, and query-param helpers (`buildQueryParams`, `updateFiltersFromQueryParams`, `updateFiltersInNavigation`) for syncing filter `FormGroup`s with the URL — the list components follow this filter pattern consistently.

### Logging & error handling
- `LogService` wraps `console.*`, gated by `environment.logLevel` (`LOG_LEVEL.info/error/warn/debug/all`). Use this instead of raw `console.log` in app code.
- `ErrorHandlerService.handleError(error, methodName, userMessage?, context?)` differentiates dev vs prod: prod logs a clean message only, dev logs full error + context and mirrors to `console.error`. Prefer this over ad hoc try/catch + console logging in components/services.

### Component conventions
All components are standalone (`standalone: true`, explicit `imports: [...]`), import only the specific PrimeNG modules they use (e.g. `TableModule`, `ButtonModule`, `SelectModule`), and use `templateUrl`/external `.html` files rather than inline templates. `*-list` components typically build a `FormGroup` of filters, sync it to query params via `SharedService`, and unsubscribe via a `destroy$: Subject<void>` + `takeUntil` pattern on router events.

### Styling — strict separation
- **PrimeNG owns component styling** (buttons, cards, inputs, tables) via PrimeNG's own theming/semantic tokens. **Tailwind is layout-only** (flex/grid/spacing/sizing).
- Never apply Tailwind color utility classes to PrimeNG components (e.g. `<p-button class="bg-blue-500">` is forbidden). Theming must stay token-driven to support runtime theme switching and white-label/multi-tenant color overrides — no hardcoded colors in component styles.
- **`../docs/wms-app/Basic_Design.md` is the source of truth for actual values** (color palette, typography scale, spacing/density, shape/radius, button hierarchy, table/form/toast conventions) that this law applies to. Established 2026-07-15 as `DESIGN_GUIDELINES.md`, moved to the central `wms/docs` 2026-07-28, merged into `Basic_Design.md` 2026-08-03 (single design-system doc, per-tenant color theming removed). Consult it before making any visual decision — don't invent new spacing/radius/color values ad hoc.

### Internationalization
UI language is Swedish-first (`sv` is the default/primary locale; PrimeNG itself is configured with the `sv` locale in `app.config.ts`). Supported app languages are `'en' | 'sv'` per `SharedService.lang`. When adding user-facing text, add translation keys to the resource file(s) under `src/assets/resources/` rather than hardcoding strings in components.

## Working relationship

Claude acts as Senior Front-End Developer/Designer on this project. The user acts as Business Solution Architect: provides business requirements, owns/builds the ASP.NET API, and makes product/priority decisions. Claude owns front-end code quality, UI consistency (single color scheme, adherence to established design patterns), and day-to-day implementation.

### Working Style

- Work autonomously.
- Batch related changes together.
- Do not ask for confirmation before reading or editing project files.
- Only interrupt the user when:
  - a destructive operation is required
  - secrets or credentials are needed
  - there are multiple valid architectural choices
- Run tests after implementing changes (`npm test` — note most schematics are currently generated with `skipTests: true`, so this often means "no test to run yet," not "skip this step").
- Fix any compile errors before reporting completion (`ng build`/`npx tsc` — see Common commands).

Pushing itself is autonomous — no confirmation needed, batch it with the related commits. The git-workflow rule below is a mechanical destination constraint on top of that, not a confirmation gate: always push to `Test`, never `main`, regardless of how routine the change is.

- **Git workflow (confirmed 2026-07-29, applies project-wide across all repos)**: `main` always points at the last tested release. All new work happens on `Test` — commit and push there autonomously. `main` only moves via a pull request from `Test`, reviewed and merged by the user themselves. Never push to `main` directly — that's a destructive operation and stays an interrupt trigger.
- **Task handoff**: no persistent backlog file — the user describes tasks in chat at the start of each session.
- **Brand color / theming (confirmed 2026-08-03)**: `#0969DA` (GitHub blue) is the final, single brand color — see `docs/wms-app/Basic_Design.md`. Per-tenant color theming/white-labelling was deliberately removed, not deferred: there is no workshop-level color setting, no `ThemeService`, and none should be reintroduced. See `DECISIONS.md`.
- **Styling-law cleanup**: known violations of the PrimeNG-owns-color / Tailwind-is-layout-only rule (tracked in the root `PROJECT_STATUS.md`'s "wms-app Frontend Tech Debt" section) are fixed opportunistically — when a task takes you into one of the affected files anyway, clean it up as part of that work. No dedicated cleanup sprint unless the user asks for one.
- **Permission allowlist visibility**: this repo's `.claude/settings.json` allowlists several read-only commands (`dotnet build`, `npx tsc`/`./node_modules/.bin/tsc`, `npx playwright test --list`/`--version`, `wsl -l -v`, `xxd`, `export PGPASSWORD=password`) so they no longer prompt for approval (established 2026-07-28, see rationale below). When running one of these, prefix the terminal output/summary with `*** auto-approved (allowlisted): <command> ***` so it stays visible in the transcript even though no prompt occurred — don't let allowlisting make these actions silent.

All known issues / tech debt for this repo, plus the Customer/Workorder module implementation history and the E2E test suite notes, are tracked in the root `PROJECT_STATUS.md`'s **"wms-app Frontend Tech Debt"** section, not here (moved 2026-07-29 so the whole project's status lives in one file). Check that section before starting styling-law or dead-code cleanup work in this repo, or before touching the customer/workorder modules or `e2e/`. Design-token/architecture *reference* (what `--color-border`/`--color-danger`/`--color-success` etc. are and how they're generated, PrimeNG/Tailwind conventions) stays in the Bootstrap/Styling sections above — that's durable architecture, not status.
