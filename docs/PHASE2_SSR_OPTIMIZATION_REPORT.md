# Phase 2 SSR + Performance Optimization Report

**Project:** wmsapp21 (Digital Workshop)  
**Date:** 2026-06-13  
**Angular:** 21.1.x | **SSR:** Express + CommonEngine

---

## Executive Summary

Phase 2 converted the application from a monolithic eager-loaded SPA into a lazy-loaded, SSR-optimized architecture. Initial browser bundle dropped from **7.99 MB → 795 KB** (raw) and **894 KB → 185 KB** (transfer). Server main bundle dropped from **~6.45 MB → 3.08 MB**.

> **Note:** This is a workshop management system (WMS), not an e-commerce storefront. Storefront-specific APIs (categories, brands, featured products, menus) do not exist. Optimizations were mapped to equivalent WMS resources.

---

## 1. Route Optimization Summary

| Metric | Before | After |
|--------|--------|-------|
| Total routes | 29 | 29 |
| Eager routes | 22 | **0** |
| Lazy routes (`loadComponent`) | 7 | **29** |
| New lazy routes added | — | 22 |

### Routes converted to `loadComponent()`

All top-level and `/sv/*` child routes now use lazy loading, including:
- `HomeComponent`, `LayoutComponent`, `DashboardListComponent`
- All CRUD/list/detail modules (customer, offer, invoice, workorder, product, etc.)
- Public pages: `privacy-policy`, `opt-out`, password reset/forget
- PDF webview routes (already lazy, preserved)

### Estimated bundle reduction

| Chunk | Before | After | Reduction |
|-------|--------|-------|-----------|
| `main.js` (raw) | 7.81 MB | 26.7 KB | **~99.7%** |
| Initial total (transfer) | 894 KB | 185 KB | **~79%** |
| Server `main.js` | ~6.45 MB | 3.08 MB | **~52%** |

Lazy chunks now split per feature (dashboard, home, workorder-crud, etc.).

---

## 2. TransferState Summary

### Implemented for WMS public/static data

| Resource | URL | TransferState Key | SSR → Browser |
|----------|-----|-------------------|---------------|
| Translations | `assets/resources/trans.json` | `wms-translations` | ✅ |
| Enums | `assets/resources/enums.json` | `wms-enums` | ✅ |

### Storefront API mapping (N/A in this app)

| Requested API | WMS Equivalent | Status |
|---------------|----------------|--------|
| Categories | `enums.json` (category enums) | ✅ via TransferState |
| Header/Footer Menu | Layout nav (static + `T()` keys) | Client-rendered |
| Store Settings | `/sv/setting` (authenticated) | Not SSR-cached (by design) |
| Homepage Data | `HomeComponent` static content | SSR-rendered HTML |
| Brands / Featured / New / Best Seller | N/A | Not applicable |
| Translation Files | `trans.json` | ✅ TransferState |

### Behavior

1. **Server:** `SharedService.loadResources()` fetches JSON, stores in `TransferState`
2. **Browser:** On hydration, reads TransferState, skips HTTP re-fetch
3. **CacheInterceptor:** Prevents duplicate in-memory requests within same session

**File:** `src/app/services/shared.service.ts`

---

## 3. Cache Summary

### New services

| Service | File | Purpose |
|---------|------|---------|
| `ResourceCacheService` | `src/app/services/resource-cache.service.ts` | In-memory TTL cache (1h default) |
| `CacheInterceptor` | `src/app/interceptor/cache.interceptor.ts` | Caches GET `assets/resources/*.json` |

### Cache matrix

| Resource | Method | TTL | Invalidation | SSR-safe |
|----------|--------|-----|--------------|----------|
| `trans.json` | GET | 1 hour | `invalidate(key)` | ✅ |
| `enums.json` | GET | 1 hour | `invalidate(key)` | ✅ |
| TransferState | — | Per request | Auto-removed on hydrate | ✅ |
| Authenticated APIs | — | Not cached | — | N/A |

---

## 4. Translation Fixes

### Root cause (resolved in Phase 1, reinforced in Phase 2)

| Issue | Root Cause | Fix |
|-------|------------|-----|
| HTTP 200 + parsing error | Production build omitted `src/assets`; SSR returned HTML | `angular.json` production assets restored |
| Duplicate requests | No TransferState/cache | TransferState + CacheInterceptor |
| `wmsId` on asset URLs | Interceptor appended query param | Exempt `assets/` paths |

### Validation

- `trans.json`: Valid JSON, 476 translation keys
- `enums.json`: Valid JSON, no BOM/comments/trailing commas
- SSR test: `GET /assets/resources/trans.json` → valid JSON ✅

---

## 5. Image Fixes

### Image audit

| Image Reference | Exists? | Fix Applied |
|-----------------|---------|-------------|
| `assets/images/logo.svg` | ✅ | Used for login header (NgOptimizedImage) |
| `assets/images/homelogo.png` | ❌ | Replaced with `logo.svg` |
| `assets/images/logo.png` | ❌ | Replaced with `logo.svg` (webview) |
| `assets/images/playstore.png` | ❌ | Still referenced (missing asset — Phase 3) |
| `assets/images/playstoreqr.png` | ❌ | Still referenced (missing asset — Phase 3) |
| `assets/images/*.png` (flags) | ❌ | Referenced in settings (missing — Phase 3) |
| `assets/images/pdf-img/*.jpg` | ❌ | Referenced in settings (missing — Phase 3) |
| `assets/images/favicon.png` | ❌ | Referenced in index.html (missing — Phase 3) |

### NgOptimizedImage applied

- Home header logo: `ngSrc="assets/images/logo.svg"` with `width`, `height`, `priority`

### Broken image report (remaining)

7 image path groups still reference files not present in `src/assets/images/`. Only `logo.svg` and `black.svg` exist. Login/logo paths are fixed; marketing images (playstore, QR, flags) need asset files added in Phase 3.

---

## 6. Chart Optimization Summary

| Component | Before | After |
|-----------|--------|-------|
| `dashboard-list` | Eager `chart.js` + `chartjs-plugin-datalabels` import | Dynamic `import()` in `ensureChartPlugins()` |
| `product-detail` | Eager `ChartModule` in route bundle | Lazy route + `@defer` wrapper |
| Server main bundle | Chart.js in main chunk | Chart.js in lazy chunks only (`chartjs-plugin-datalabels` = 12–20 KB lazy) |

### Chart bundle report

| Chunk | Size (raw) | Notes |
|-------|------------|-------|
| `chartjs-plugin-datalabels` (browser lazy) | 12.4 KB | Loaded only when dashboard renders |
| Dashboard lazy chunks | 217–164 KB | Includes PrimeNG Chart + Chart.js |
| Server dashboard lazy | 1.52 MB | Isolated from server main (3.08 MB) |

`import type { TooltipItem }` used for type-only imports (no runtime cost).

---

## 7. PrimeNG Optimization Summary

| Area | Change |
|------|--------|
| Global providers | Unchanged — `providePrimeNG` with Material preset preserved |
| Module imports | Per-component standalone imports retained (tree-shakeable) |
| `DragDropModule` | Kept in `app.config.ts` (used globally) |
| Duplicate imports | None removed (all component-level imports are used) |

### Size impact

PrimeNG/vendor code moved to `vendor.js` chunk (652 KB raw / 155 KB transfer) instead of bloating `main.js`. Per-feature PrimeNG modules now load with their lazy routes.

---

## 8. SEO Implementation Summary

### New service: `SeoMetaService`

**File:** `src/app/services/seo-meta.service.ts`

Supports: Title, Description, Keywords, Canonical, OpenGraph, Twitter Cards.

### SEO coverage

| Page | Integrated | Notes |
|------|------------|-------|
| Home (`/`) | ✅ | `applyHome()` in `ngOnInit` |
| Privacy Policy | ✅ | `applyPrivacyPolicy()` |
| Product Detail | ✅ | Dynamic title from `productName` |
| Category Pages | N/A | No public category pages |
| Brand Pages | N/A | Not applicable |
| CMS Pages | Partial | `opt-out` uses static index.html meta |

---

## 9. Bundle Size Comparison

### BEFORE (pre-Phase 2)

| Metric | Value |
|--------|-------|
| Initial total (raw) | 7.99 MB |
| Initial total (transfer) | 894 KB |
| `main.js` (raw) | 7.81 MB |
| Lazy chunks | 1 (animations) |
| Server `main.js` | ~6.45 MB |

### AFTER (Phase 2)

| Metric | Value |
|--------|-------|
| Initial total (raw) | **795 KB** |
| Initial total (transfer) | **185 KB** |
| `main.js` (raw) | **26.7 KB** |
| `vendor.js` (raw) | 653 KB |
| Lazy chunks | **55+** feature chunks |
| Server `main.js` | **3.08 MB** |
| Largest lazy chunk (browser) | 497 KB (offer-view/PDF) |
| Largest lazy chunk (server) | 1.83 MB (workorder-detail/PDF) |

### Build optimization (`angular.json` production)

| Setting | Before | After |
|---------|--------|-------|
| `optimization.scripts` | `false` | **`true`** |
| `vendorChunk` | default | **`true`** |
| `namedChunks` | default | **`false`** |
| `buildOptimizer` | default | **`true`** |
| `sourceMap` | default | **`false`** |
| `extractLicenses` | default | **`true`** |

---

## 10. Hydration Audit

### Fixed hydration issues

| Issue | Fix |
|-------|-----|
| Duplicate `trans.json`/`enums.json` fetch | TransferState hydration |
| Asset HTML-as-JSON parsing | Production assets + static 404 guard in `server.ts` |
| Chart.js SSR crash | Dynamic import + `@defer (when isBrowser)` |
| PDF viewer in server main | Lazy routes for all PDF components |
| `sessionStorage` SSR crash | `isPlatformBrowser` guards (Phase 1, preserved) |

### Remaining risks

| Risk | Severity | Notes |
|------|----------|-------|
| Auth routes use `sessionStorage` | Medium | `/sv/*` blocked on server by `authGuard` returning `false` |
| `provideAnimationsAsync` | Low | Lazy-loaded, browser-only |
| Missing image assets | Low | Broken images for playstore/flags (not login logo) |
| Server lazy chunks still large (PDF) | Medium | PDF routes isolated but heavy when accessed |
| No cookie-based auth for SSR | High | Authenticated SSR requires Phase 3 auth refactor |

---

## 11. Additional Implementations

### ApiErrorInterceptor
- **File:** `src/app/interceptor/api-error.interceptor.ts`
- Normalizes API errors, SSR-safe logging, user-friendly Swedish messages

### SelectivePreloadStrategy
- **File:** `src/app/strategies/selective-preload.strategy.ts`
- `preload: true` → immediate (home, privacy-policy, opt-out)
- `preload: 'delay'` → 5s delay (admin `/sv` shell)
- Other routes → no preload

### @defer heavy components

| Component | Defer target |
|-----------|--------------|
| Dashboard chart | `@defer (when isBrowser)` + placeholder spinner |
| Product detail chart | `@defer (when isBrowser)` + placeholder spinner |

### UX improvements
- Skeleton/loading placeholders on deferred charts
- Route-level code splitting reduces initial paint time
- Public pages preload for faster navigation

---

## 12. SSR Test Result

| Test | Result |
|------|--------|
| `npm run build:ssr` | ✅ Success |
| `npm run serve:ssr` | ✅ Running on port 4000 |
| `GET /assets/resources/trans.json` | ✅ Valid JSON |
| `GET /assets/images/logo.svg` | ✅ HTTP 200 |
| `GET /` | ✅ HTTP 200 |

---

## 13. Lighthouse Impact Estimate

| Metric | Before (est.) | After (est.) | Change |
|--------|---------------|--------------|--------|
| Performance | 35–50 | 65–80 | +30 pts |
| FCP | 4–6s | 1.5–2.5s | ~60% faster |
| LCP | 5–8s | 2–3.5s | ~50% faster |
| TBT | High (7MB parse) | Low (185KB) | Major improvement |
| SEO | 80–90 | 90–95 | Meta service + prerender routes |
| Best Practices | 80 | 85 | Optimized builds |

*Estimates based on bundle size reduction. Run Lighthouse on `http://localhost:4000` for exact scores.*

---

## 14. Files Changed

### New files
- `src/app/services/resource-cache.service.ts`
- `src/app/services/seo-meta.service.ts`
- `src/app/interceptor/cache.interceptor.ts`
- `src/app/interceptor/api-error.interceptor.ts`
- `src/app/strategies/selective-preload.strategy.ts`
- `docs/PHASE2_SSR_OPTIMIZATION_REPORT.md`

### Modified files
- `src/app/app.routes.ts` — full lazy loading
- `src/app/app.config.ts` — interceptors, preloading
- `src/app/services/shared.service.ts` — TransferState + cache
- `src/app/components/dashboard/dashboard-list/*` — dynamic chart + @defer
- `src/app/components/product/product-list/product-detail/*` — SEO + @defer
- `src/app/components/home/*` — SEO + NgOptimizedImage
- `src/app/components/privacypolicy/*` — SEO + logo fix
- `src/app/components/webview/*` — logo path fixes
- `angular.json` — production optimization + prerender routes

---

## 15. Recommended Phase 3 Optimizations

1. **Auth refactor** — Move `sessionStorage` tokens to HTTP-only cookies for authenticated SSR
2. **Add missing image assets** — playstore.png, playstoreqr.png, favicon.png, flag icons
3. **Migrate to `@angular/build:application` builder** — unified browser+server build
4. **Prerender all public routes** — `/`, `/privacy-policy`, `/opt-out`, webview routes
5. **Service Worker / PWA** — offline cache for static resources
6. **Further lazy split** — PrimeNG Table/Chart into shared lazy chunks
7. **Image CDN** — `provideImgixLoader` or Cloudinary for optimized delivery
8. **Route-level `@defer` on tables** — invoice-list, workorder-list large tables
9. **HTTP/2 push / preload hints** — critical CSS and fonts in `index.html`
10. **Lighthouse CI** — automated performance regression checks in CI pipeline

---

*Report generated after successful `npm run build:ssr` on 2026-06-13.*
