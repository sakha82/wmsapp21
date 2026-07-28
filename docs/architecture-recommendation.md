# Architecture Recommendation — AI-Powered Workshop Management Assistant

## Grounded in the actual codebase

Per `CLAUDE.md`: Angular 21 standalone + PrimeNG 21 + Tailwind v4, multi-tenant SaaS already (wmsId-scoped), separate ASP.NET API, no NgRx (sessionStorage-based tenant state), and an active design-system cleanup already underway (`docs/DESIGN_GUIDELINES.md`, token-driven theming for white-label). That's a real asset — don't discard it lightly.

## 1. Frontend framework: keep Angular + PrimeNG

Don't rewrite. Angular 21 standalone is modern, PrimeNG 21 gives you a huge prebuilt enterprise component set (tables, dialogs, forms) that a rewrite would take months to rebuild, and you already have working multi-tenant theming infrastructure. React/Next.js wouldn't meaningfully improve AI integration — AI features are backend/API concerns, not framework concerns. A rewrite is the single biggest risk to this whole vision; it burns the runway you need for the AI work. Reserve framework-migration energy for **finishing the design-system cleanup** you've already started (16 files still have styling-law violations per the Known Issues section) rather than a full stack swap.

## 2. UI/UX: stay on PrimeNG + your token system

You're already on the right path: PrimeNG owns component styling, Tailwind is layout-only, tokens in `styles.css`. Two additions worth prioritizing before adding AI UI:

- A **conversational/chat surface** component (chat panel + voice-input button + confirmation cards) as a new shared component family, built with PrimeNG primitives (Dialog/Drawer, Chip, Card) — not a separate design language.
- **Confirmation-first UX pattern**: every AI-extracted action (create customer, book appointment) renders as a pre-filled, editable form/card the user taps once to confirm — never silent auto-execution. This is the core UX principle for the whole vision: AI drafts, human confirms with one tap.

## 3. Mobile strategy: PWA, not native

Given the users (mechanics, busy, workshop floor) and a small team's budget: build a **PWA** on top of the existing Angular app — installable, offline-capable for viewing bookings/work orders, push notifications via Web Push, and `MediaDevices`/`getUserMedia` gives mic access for voice without app-store friction. Native (Flutter/RN) buys nothing here that PWA doesn't, at 2-3x the maintenance cost of a second codebase. Revisit native only if offline-first invoicing with conflict resolution at scale, or deep camera/barcode work, becomes a requirement.

## 4. AI architecture — the core decision

Never let the frontend call the AI provider directly. Build a dedicated **AI Orchestration Layer** as a new service alongside the ASP.NET API (or a module within it):

```
User (voice/chat/WhatsApp)
   → Channel Adapters (Angular chat UI, WhatsApp Business API webhook)
   → AI Orchestration Service (new)
        - Speech-to-text (provider STT, e.g. Whisper-class)
        - LLM agent with tool-calling (Claude/GPT)
        - Tool definitions = thin wrappers around existing ASP.NET endpoints
        - Session/context memory per tenant+user
   → Existing ASP.NET Business API (unchanged, source of truth)
   → Database
```

Why an orchestration layer and not direct frontend→LLM calls:

- **Security/permissions**: tool calls must run with the requesting user's actual role/tenant scope (`wmsId`), never a bearer token embedded in a client. The orchestrator authenticates as the user and enforces the same auth the API already does.
- **Auditability**: every AI-initiated create/update should log "created by AI agent on behalf of user X" — required for a workshop tool where money/invoices are involved.
- **Tool calling = existing endpoints**: define tools like `createCustomer`, `createBooking`, `createInvoiceDraft` as schemas that map straight onto the current REST API. The LLM never touches the DB directly.
- **WhatsApp** is just another channel adapter into the same orchestrator — a customer message and a mechanic's voice command resolve to the same tool-calling core, just different auth (customer-scoped vs employee-scoped tool permissions).
- Invoice/offer creation ("replace brake pads, 2h labour") is a multi-turn tool-calling flow: `searchCustomer` → `searchVehicle` → `searchProducts` → `createInvoiceDraft`, ending in a confirmation card in the UI, never auto-send.

## 5. SaaS / future-proofing

Multi-tenancy already exists (`wmsId`). Extend it: the orchestration layer needs to be tenant-aware from day one (per-tenant tool permissions, per-tenant WhatsApp number/session, per-tenant AI usage limits for billing). Keep AI orchestration as a **separate deployable service**, not bolted into the existing ASP.NET API — it scales differently (LLM calls are slow/bursty) and needs to version/iterate fast without redeploying the core business API.

## 6. Final recommendation

- **Stack stays**: Angular 21 + PrimeNG 21 + Tailwind (frontend), ASP.NET API (backend, unchanged), + new AI Orchestration Service (Node or .NET — tool-calling against the existing API either way).
- **Angular + PrimeNG**: keep. Do not replace.
- **Frontend architecture**: finish the design-system cleanup in progress, then add a chat/voice surface as a new shared component family following the same token rules.
- **Backend architecture**: no changes to the existing API; add orchestration as a new adjacent service that calls it.
- **AI architecture**: orchestration layer with tool-calling wrapping existing endpoints; confirmation-first UX; per-tenant, per-role permission scoping on every tool.
- **Migration strategy**: incremental — ship the AI orchestrator against 1-2 high-value flows first (booking creation, invoice drafting) rather than boiling the ocean; reuse existing forms as the "confirm" step so it's not new CRUD UI, just a new entry point into it.
- **Biggest risks**:
  1. Scope creep into a full rewrite — resist it.
  2. AI over-trust — an agent silently creating a wrong invoice is a real business/legal risk, so confirmation-first isn't optional.
  3. WhatsApp/voice STT quality for accented/multilingual speech in a noisy workshop — pilot early with real audio before committing UX around it.
