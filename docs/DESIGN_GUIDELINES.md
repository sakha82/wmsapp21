# Design Guidelines

Standard front-end design system for the WMS application. This is the single source of truth for color, type, spacing, shape, and component usage across the app. `docs/COPILOT-GUIDELINES.md` states the *law* (PrimeNG owns color, Tailwind is layout-only); this document defines the actual *values* that law applies to.

Established 2026-07-15 via interview with the Business Solution Architect. Supersedes ad hoc choices made per-component to date. Known violations of these guidelines are tracked in `CLAUDE.md` → "Known issues / tech debt" and fixed opportunistically, not in a dedicated sprint.

---

## 1. Principles

- **One source of truth per token.** A color, radius, or spacing value is defined once and referenced everywhere — never re-declared per component.
- **PrimeNG owns component color; Tailwind owns layout.** No Tailwind color utility (`bg-*`, `text-*`, `border-*` color classes) on a PrimeNG component, ever. See §9 for the current violation list.
- **Compact by default.** This is a back-office tool used all day by the same operators — density and scan-ability beat whitespace.
- **Light mode ships first; dark mode is designed, not deferred.** Token pairs are defined for both now so dark mode is a flip, not a redesign, when it's prioritized.

---

## 2. Color

### 2.1 Brand primary
`#4F39F6` (purple) — confirmed. This is the single seed color for PrimeNG's primary palette.

**Implementation note (next phase):** PrimeNG's `definePreset` expects a full 50–950 shade ramp for `semantic.primary`, not just the seed hex. Currently `app.config.ts` has `definePreset(Material, {})` — an *empty* override, meaning the app is running Material's default blue-ish primary, not actually `#4F39F6` as a PrimeNG token. Generating the shade ramp from the seed and wiring it into the preset is implementation work for the violation-fixing phase, not this document.

### 2.2 Semantic/status colors
Use PrimeNG's standard semantic palette — no brand-tuned custom hues:
- **Success** → PrimeNG green
- **Warn** → PrimeNG orange/amber
- **Error / Danger** → PrimeNG red
- **Info** → PrimeNG blue

These map directly to `severity="success" | "warn" | "danger" | "info"` on `p-button`, `p-tag`, `p-message`, `p-toast`, `p-confirmdialog` etc. Never hardcode a hex for these states in component CSS.

### 2.3 Dark mode tokens
Defined alongside light tokens now; **not wired up or enabled yet** (`darkModeSelector` stays `'none'` in `app.config.ts`, `ThemeService.setDarkMode()` stays unused until dark mode is prioritized).

| Token | Light | Dark |
|---|---|---|
| `--color-bg-light` (app background) | `#F7F9FB` | `#121212` |
| Surface / card background | `#FFFFFF` | `#1E1E1E` |
| `--color-gray-header` (headings) | `#222222` | `#F2F2F2` |
| `--color-gray-dark` (body text) | `#555555` | `#B8B8B8` |
| Primary | `#4F39F6` | Same hue, lightened ~1 shade step for AA contrast on dark surfaces (exact shade picked during token generation, §2.1) |
| Borders/dividers | `#E5E7EB` | `#2E2E2E` |

### 2.4 Forbidden
- Tailwind color utility classes on any PrimeNG component (`<p-button class="bg-blue-500">`, etc.)
- Hardcoded hex values in component-level `.css`/inline styles for anything PrimeNG already tokenizes (buttons, tags, table headers, form field borders/states)
- New ad hoc `--color-*` custom properties outside `styles.css`'s `@theme` block

---

## 3. Typography

- **Typeface:** Inter, everywhere — app UI and marketing/public pages alike. Already self-hosted via `src/assets/fonts`; no external font CDN calls.
- **Base size:** `14px` (compact density — smaller than the web-default `16px` to fit more data per screen).
- **Scale:**

| Role | Size | Weight |
|---|---|---|
| H1 (page title) | 1.5rem (24px) | 700 |
| H2 (section header) | 1.25rem (20px) | 600 |
| H3 (card/panel title) | 1.0625rem (17px) | 600 |
| Body | 0.875rem (14px) | 400 |
| Small / helper text | 0.75rem (12px) | 400 |
| Table header | 0.75rem (12px) | 600, uppercase optional |

- Headings use `--color-gray-header`; body text uses `--color-gray-dark` (or their dark-mode pairs, §2.3).

---

## 4. Spacing & density

Compact density. Base unit: `4px` (Tailwind's default scale — no custom spacing scale needed).

- Table cell padding: `0.5rem 0.75rem` (8px/12px) — not PrimeNG's default comfortable padding.
- Form field vertical rhythm: `0.75rem` (12px) gap between stacked fields.
- Action-bar / filter-bar gaps: `0.75rem`–`1rem`, matching the existing `.list-page-actionbar` rules already in `styles.css`.
- Page content margin: keep existing `.container-main` (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`) for marketing pages; app pages under `/sv/*` use full-width layout minus sidebar (existing `LayoutComponent` behavior, unchanged).

---

## 5. Shape language

**Sharp / minimal rounding — 2–4px** across all interactive components: buttons, inputs, tags, cards, dialogs, table containers.

This is a deliberate change from the softer `rounded-xl`/`rounded-2xl` (8–12px) currently used on the public marketing page (`.hero-title-box`, `.card`, `.price-card`, etc. in `styles.css`). Those marketing classes are **out of scope for this correction pass** — they're pre-login, low-frequency-use pages, not the dense operator UI this guideline targets. Revisit marketing-page shape language separately if brand consistency across public + app surfaces becomes a priority.

---

## 6. Elevation / shadows

Minimal. Compact enterprise tools read as cluttered with heavy shadows everywhere.

- **Flat, no shadow:** table containers, cards, panels, inline content.
- **Subtle shadow only:** floating/overlay surfaces that need to visually separate from the page — `p-dialog`, `p-popover`, `p-autocomplete` dropdown panels, `p-toast`. Use PrimeNG's own default overlay shadow token; don't add custom box-shadow CSS on top.

---

## 7. Iconography

- **Primary set:** primeicons (`pi pi-*`), already dominant across the app — see `docs/icons-list.md` for the in-use inventory.
- **Supplemental set:** Material Symbols, for anything primeicons doesn't cover. Self-host the font/SVGs (matches how Inter is already self-hosted) rather than loading from a Google Fonts CDN.
- **Never mix icon sets within the same component or the same logical icon group** (e.g. don't use a primeicon for "edit" and a Material Symbol for "delete" in the same row-actions cluster — pick one set per context).
- **Sizing:** `1rem` (16px) inline with text/table rows, `1.25rem` (20px) standalone action buttons.
- Icon-only buttons (no visible label) **must** carry a `pTooltip` — this is already the dominant pattern (33 uses of `pTooltip` per `docs/primeng-components.md`); make it a hard rule going forward.

---

## 8. Buttons — 3-tier hierarchy

| Tier | Style | Usage |
|---|---|---|
| **Primary** | Filled, brand primary color | The one main action per view (e.g. "Save", "Create Invoice"). At most one visible primary button per screen/dialog. |
| **Secondary** | Outlined or text | Everything else — cancel, back, filters, secondary actions, row-level actions. |
| **Danger** | Filled or outlined red (`severity="danger"`) | Destructive actions only (delete, block, void) — and always paired with a `p-confirmdialog`, never a bare click-to-destroy. |

`p-splitbutton` is acceptable for a primary action with related secondary options (already used in `employee-crud`, `offer-list`) — the visible/default action still follows the primary-tier rule above.

---

## 9. Tables

- **Row style:** plain background, no zebra striping. On hover, row background shifts to the primary-100 tint. This re-enables and standardizes the rule that already exists but is currently commented out in `styles.css`:
  ```css
  .p-datatable .p-datatable-tbody > tr:hover, .p-selectable-row:hover {
    background-color: var(--p-primary-100) !important;
  }
  ```
- **Pagination:** `p-paginator`, lazy-loaded server-side (existing pattern, unchanged — confirmed good practice per `docs/primeng-components.md`).
- **Sorting:** `p-sortIcon` on sortable columns (existing pattern, unchanged).
- **Empty state (§11) and cell padding (§4) apply inside every table.**

---

## 10. Forms & validation

- **Toast-only.** No inline per-field error text/red borders. On failed validation or a failed save, show a single `p-toast` with a translated summary + detail (existing dominant pattern — see `HARDCODED_STRINGS_REPORT.md` for the translation-key side of this).
- Toast content must go through `this.sharedService.T('key')` — no hardcoded English/Swedish strings (existing rule, restated here because it directly touches this workflow).
- Required fields: mark with PrimeNG's standard required-asterisk convention on the label; no custom styling.

---

## 11. Empty states

Simple centered text inside the table/list body: **"No records found"** (translated via `SharedService.T`), no icon, no illustration, no action button. Matches the compact/dense, low-ornamentation direction of the rest of this system.

---

## 12. Loading states

Standard: the existing `generic-loader` component, already rolled out to every create/edit/update flow across Customer, Invoice, Product, Employee, Setting, Booking, Offer, Digital Service, Attendance Register, Dashboard, and WorkOrder (see `docs/LOADER_IMPLEMENTING.md`). No new loading pattern needed — this guideline just formalizes the existing rollout as the standard going forward for any new screen.

---

## 13. Notifications / Toasts

- **Position:** top-right, app-wide (`p-toast` positioned globally, not per-component).
- **Auto-dismiss:** success/info toasts auto-dismiss after a few seconds; error/danger toasts stay longer or require manual dismissal so the user has time to read validation detail (pairs with §10's toast-only validation pattern).

---

## 14. PrimeNG preset & token architecture

- **Base preset:** Material — kept, but must be *actually* customized rather than left as `definePreset(Material, {})`. Implementation work (next phase) defines real `semantic` tokens (primary palette from §2.1, radius from §5) on top of Material instead of accepting its defaults unmodified.
- **Bridge the two color-token systems.** `styles.css` currently defines its own independent `--color-primary` Tailwind variable, disconnected from PrimeNG's `--p-primary-*` tokens (flagged in `CLAUDE.md` → Known issues). When implementing this guideline, the Tailwind `--color-primary` should read from the same seed as the PrimeNG primary palette, not be maintained as a second, separate value.

---

## 15. Open items / explicitly deferred

- Full dark-mode wiring (tokens are defined in §2.3, activation is not scheduled).
- Marketing/public-page shape language (still soft-rounded, §5) — left as-is pending a decision on whether public + app surfaces need to visually match.
- Exact PrimeNG 50–950 shade ramp for the `#4F39F6` primary palette — generated during implementation, not hand-specified here.
