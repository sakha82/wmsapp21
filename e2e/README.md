# E2E Tests (Playwright)

Page Object Model, TypeScript, one folder per module. See `docs/automated-test-plan.md` for the original brief.

## Setup

1. `npm install` (installs `@playwright/test`), then `npx playwright install chromium` once.
2. Copy `e2e/.env.example` to `e2e/.env` and fill in:
   - `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` — a real, seeded test workshop account.
   - `API_BASE_URL` — must match `src/environments/environment.ts`'s `BASE_URL` (the ASP.NET API).
3. Make sure the API is running locally (Playwright does **not** start it — it's a separate repo/process). Playwright *does* auto-start the Angular dev server (`npm start`) for you.

## Running tests

```bash
npm run test:e2e              # everything, headless
npm run test:e2e:customer     # one module
npx playwright test e2e/tests/customer/customer-list.spec.ts   # one file
npm run test:e2e:ui           # interactive UI mode (best for debugging)
npm run test:e2e:headed       # headed browser
npm run test:e2e:report       # open the last HTML report
npm run test:e2e:codegen      # record a new test by clicking through the app
```

## How auth works

The app stores its session in `sessionStorage` (not cookies), so Playwright's usual `storageState` reuse doesn't apply. `fixtures/auth.fixture.ts` logs in once per test via a direct `POST /api/auth/login` call and seeds `sessionStorage` with `page.addInitScript` before the app's first navigation — same keys the real login dialog sets (see `home.component.ts`). Every spec imports `test`/`expect` from `../../fixtures` (not `@playwright/test` directly) to get this automatically, plus the UI-quality checks below.

## UI quality checks (automatic)

`fixtures/quality.fixture.ts` attaches console/network/DOM scanners to every test with no per-test setup:

- Console errors, uncaught page errors, and 5xx network responses **fail the test**.
- 4xx responses, missing-translation keys (`SharedService.T()`'s `*key` fallback), broken images, and empty/unlabeled buttons are **attached to the HTML report** but don't fail the test (some specs deliberately trigger 4xx — e.g. duplicate-customer handling).

## Adding a new module

Follow the Customer module as the template:

1. `pages/<module>/` — one `.page.ts` per screen (list/crud/detail), extending `BasePage`. Reuse `pages/components/prime-table.component.ts` and `prime-select.component.ts` for any `p-table`/`p-select` — don't re-derive PrimeNG's internal class names per module.
2. `tests/<module>/` — one spec file per lifecycle stage (list, create, edit, delete, detail — adapt to what the module actually supports).
3. If a screen's buttons/icon-only actions have no `formcontrolname` or other stable attribute to target, add a small `data-testid` to the template as part of writing the test (same pattern as the Customer module's `create-customer-button`/`customer-submit-button`/etc.) — not a big refactor, just enough to locate the element reliably.
4. Add a data builder in `utils/data-builders/` if the module needs unique test data per run.
5. (Optional) add a `test:e2e:<module>` npm script mirroring `test:e2e:customer`.

## Known limitations

- **No test-data cleanup**: the Customer module has no delete feature in the UI, so customers created by the create/edit/detail specs accumulate in whatever environment you point tests at. Don't run this against a shared/production-like database. `customer-delete.spec.ts` documents this gap — it's a placeholder (`test.skip`) until a delete flow ships.
- Accessibility scanning (`@axe-core/playwright`) is intentionally not wired in yet — add it as an opt-in check on list/detail landing pages if/when that becomes a priority.
