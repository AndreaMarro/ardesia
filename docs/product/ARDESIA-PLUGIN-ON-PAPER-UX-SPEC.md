# ARDESIA-PLUGIN-ON-PAPER-UX-SPEC — 2026-07-08

- **Owner**: Claude Code (product/UX lane), non-Codex.
- **Status**: implementable UI spec. Turns research + audit + the S1–S4 contracts into
  concrete UI rules **before** any runtime UI edit. No runtime code here.
- **Sources (firsthand, this lane)**:
  - Research → [`docs/ops/CLAUDE-ARDESIA-UIUX-RESEARCH-20260708.md`](../ops/CLAUDE-ARDESIA-UIUX-RESEARCH-20260708.md)
  - Gap audit → [`docs/ops/CLAUDE-ARDESIA-PRODUCT-GAP-AUDIT-20260708.md`](../ops/CLAUDE-ARDESIA-PRODUCT-GAP-AUDIT-20260708.md)
  - Direction → [`docs/product/UI-UX-DESIGN-DIRECTION.md`](./UI-UX-DESIGN-DIRECTION.md) · Pagina Personale zones → [`docs/product/TEACHER-DASHBOARD-SPEC.md`](./TEACHER-DASHBOARD-SPEC.md)
  - Contracts landed this lane: `apps/studio/src/toolhost/postitObject.ts`, `pluginFunctions.ts`,
    `essentialPlugins.ts` (S2), `subPostitObject.ts` (S3), `marketplace/marketplaceItem.ts` (S1),
    `apps/studio/src/lessonos/teacherDashboardProjection.ts` (S4).
- **Non-negotiables**: no marketing hero, no decorative filler, no mock data presented as real,
  Pagina Personale naming (never "pagina docente"/dashboard in user-facing copy).

This spec is normative for the later UI slices (C+7+), which are a **separate phase** gated by
Playwright evidence on desktop/iPad/LIM/narrow viewports (§8).

---

## 1. First screen — the board, not a dashboard

The first screen is the **work surface** (paper/board/sheet), never a dashboard or hub.

- On launch the user lands on a **board/sheet**: infinite canvas is the home; a bounded "page"
  is one presentation of a sheet, not a competing home (research §3 — both metaphors, board is home).
- Pen/annotation and plugin objects are the primary content. Lesson goal is visible but quiet.
- The **plugin launcher** is a WAI-ARIA dropdown (Menu Button when it *creates/inserts* an object;
  Listbox when it *sets an active tool*) — plugins are entries in it, not fixed chrome bars
  (matches the launcher work already in the LessonOS shell lane).
- **Pagina Personale is reachable from the board** (a named affordance), it is **not** the first
  screen (§4). Export/import and student-pack are natural lesson actions on the board.
- No hero, no feature tour, no onboarding wall. If a surface has no real data yet, it says so
  (see `unavailable[]`, §4), it never shows filler.

---

## 2. Plugin object states (the post-it)

A plugin lives on the board as a **post-it object** (`PluginPostitObject`, `postitObject.ts`).
Every plugin is a board record: movable, resizable, selectable, serializable — same lifecycle as
ink/shapes (research §4). State axes, all from the shipped contract:

### 2.1 Proximity — `PostitProximity` = `far | near | active`
Drives whether contextual controls appear. `far` (idle, not hovered/selected) → controls hidden;
`near`/`active` → controls surface. Controls appear **near the object**, not only in a far toolbar.

### 2.2 Function surface mode — `deriveFunctionSurfaceMode` = `hidden | compact | normal | expanded`
Derived from real post-it size (area/short-side) + interaction, and it selects which functions
render (`derivePluginFunctionSurface`, `pluginFunctions.ts`):

| Mode | Trigger (from contract) | UI |
|---|---|---|
| `hidden` | not selected, not hovered, proximity `far` | quiet: title/icon only, no function chrome |
| `compact` | shortSide < 220 or area < 96 000 | icon + 1–2 primary functions, big hit targets |
| `normal` | area < 420 000 | primary + contextual functions |
| `expanded` | area ≥ 420 000 | full function surface, in place on the board |

**Rule**: controls adapt to the object's real size; a small post-it never crams; expansion happens
**in place on the sheet, never in a modal** (preserve spatial memory — UI-UX-DESIGN-DIRECTION).

### 2.3 Selection / hover — `selected`, `hovered`
Single-tap selects (bounding box + resize/rotate handles). Two-finger board pan must still reach
the board **through** an unselected post-it (don't trap gestures).

### 2.4 Readiness — `ready | preview | planned` (`essentialPlugins.ts`, `PluginReadiness`)
A product state distinct from install lifecycle: `ready` = usable; `preview` = shown but not
definitive (visible marker); `planned` = declared, not yet functional (never faked as working).

### 2.5 Serialization
Every post-it round-trips to the board doc (`serializePluginPostitObject`/`restore…`) — survives
export (`.lesson`), diff, LessonOS replay, cross-device open. Restore is fail-closed.

---

## 3. Sub-post-it states (`subPostitObject.ts`, S3)

Sub-post-its make manual/diagnostics/steps/notes/exercises visible **around** a plugin without
clutter. A sub-post-it is a child record bound to a parent plugin instance.

- **Role** = `manual | diagnostics | steps | notes | exercise` — a **generic enum**, one code path,
  no plugin-specific branches. UI differentiates by role via label/icon, not by special-casing logic.
- **Binding** — `parentInstanceId` links the child to its parent instance. Moving the parent moves
  its children; children anchor/clip to the parent body; z-order is parent-relative.
- **Detached / promoted** — `parentInstanceId: null` = "**pop out to board**": the child becomes a
  standalone object (`detachSubPostit`). This is a first-class promotion, not an error state.
- **Orphan policy** — explicit, `resolveOrphans(children, liveParents, policy)`:
  - `detach` → orphan promoted to standalone (parent lost → keep the content on the board);
  - `remove` → orphan dropped;
  - `keep` → left as-is.
  The UI must pick a policy explicitly per context (e.g. deleting a plugin offers "keep its notes on
  the board" = `detach`). Never silently drop a child.
- **Provenance** — every sub-post-it carries `provenance.evidenceRefs[]` (manual page, board id,
  plugin ref), preserved across serialize/restore. A sub-post-it with a citation shows its source.
- **Targets** — nested controls still meet the 44 px floor (§7); if nesting forces smaller, provide
  an Equivalent full-size control elsewhere (WCAG 2.5.8 Equivalent exception).

---

## 4. Pagina Personale layout

Pagina Personale is the user's **personal workspace surface** — calm, structured, a **consultation
surface reachable from the board, not the first screen** (TEACHER-DASHBOARD-SPEC §3). It is a
**read-only projection** of the event log + graph + manifests (never a second store).

- **Naming (user-facing copy only)**: **Pagina Personale**, **Profilo**, **Materiali**, **Lezioni**,
  **Plugin**, **Marketplace**, **Contenuti**. Never "pagina docente", "cruscotto docente",
  "teacher dashboard". Internal type names (`TeacherDashboardProjection`) may stay.
- **Zones** (from `teacherDashboardProjection.ts`, each row shows **evidence refs**, clickable):
  - **Lezioni** — timeline of sessions (counts: elements/math/pdf pages/audio), evidence.
  - **Contenuti** — `contentCreated[]` (S4): student-packs created, `generated` vs `exported`
    readiness, evidence. Empty when none — shown as an honest empty state, not filler.
  - **Plugin** — `plugins[]` (S4): installed plugins with `readiness` (`ready/preview/planned`);
    populated only when a plugin registry is supplied, else the zone is `unavailable` with reason.
  - **Materiali / Marketplace** — materials used + marketplace/creation entry (§5).
  - **Student-pack (coda)** — `studentPackQueue[]` candidate→generated→exported.
  - **Errori ricorrenti / Statistiche** — deterministic counts + windows + evidence only.
    **No score / mastery / progress% fields** (enforced by the projection test).
  - **Profilo** — public profile card (local v0).
- **`unavailable[]` is first-class**: any zone without a real source renders "non disponibile" +
  the reason (e.g. graph zones until the materializer lands). Never a mock.
- **Layout by surface**: desktop = collapsible panes; iPad = drawer/dedicated screen; LIM = not
  prioritized (it is a private page, not for projection).

---

## 5. Marketplace & content-creation flow

Backed by `marketplaceItem.ts` (S1): a `MarketplaceItem` is a discriminated union
`plugin` (wraps the signed `ToolManifest`) ∪ `content-product`.

### 5.1 Marketplace-preview post-it
- Renders **live on the board but sandboxed: read-only, zero granted capabilities** until installed.
- **Capabilities shown before install**, on the card: the exact `capabilities` + `net.fetch` domains
  + `surfaces`, with the reasoning string verbatim for any broad scope (Figma-transparency pattern).
- **Provenance badge is a first-class visual** (not fine print): `official | publisher-partner |
  user-generated | ai-generated | ai-assisted` (`provenance.origin`), plus a verified-publisher check
  and the automated-scan scorecard.
- **AI disclosure**: `provenance.aiDisclosure` renders as a visible "AI" marker on the preview
  surface. The contract **requires** `aiDisclosure=true` for AI origins (EU AI Act Art.50) — the UI
  surfaces it; it cannot be omitted.
- **"official" is non-spoofable**: only content with `curriculum.vettedBy` (institutional endorsement)
  may show the official badge (contract-enforced).
- **Price/license clarity pre-purchase**: `price.model` (free/one-time/subscription/trial), license
  tier, trial days — visible; a persistent "Termini d'uso" affordance. **No checkout in this phase.**

### 5.2 Install lifecycle (from `availability` + `PluginState`)
`available → installing → installed → { enabled | disabled }`; `unavailable` **carries a reason**;
`disabled` = installed but inert (still visible on the board, Obsidian pattern).

- **Consent**: affirmative, specific action inside the board UI (no pre-checked box, no hover-implicit).
- **Just-in-time consent** for non-essential capabilities: the object works in a degraded/read mode
  and prompts in-context ("this pack wants to open manual §4.2 — allow?").
- **Update re-consent**: an update that **adds capabilities** must re-prompt; never silently widen scope.

### 5.3 Content creation
Teacher-created content products (lesson pack / worksheet / exam-gen / simulation pack / student pack)
carry LRMI fields + license tier + `ingredients`/provenance. **Cite-don't-copy**: a sold pack ships
pointers + generated derivations; manual bytes are referenced (`manual.read:{sha256}`), not
redistributed. Generated content is always distinguishable from official (§5.1).

---

## 6. iPad / LIM / desktop behavior

| Surface | Primary UI | Targets |
|---|---|---|
| iPad portrait | single sheet, transient drawers | 44 px min |
| iPad landscape | sheet + compact tool drawer | 44 px min |
| LIM | large sheet, oversized targets, low text density | **60–80 px** primary controls |
| desktop | sheet center, collapsible manual/plugin/graph panes | 44 px min |
| mobile | review/student-pack, not heavy authoring | 44 px min |

- **Targets**: hard **44×44 CSS px** floor everywhere; **60–80 px** for primary controls on LIM
  (finger-at-distance + glare). Handles ≥ 8 px apart so 24 px spacing circles never intersect.
- **Controls in the mid-band** on LIM — never pinned to top/bottom corners (out of reach / stooping).
- **Gestures**: two-finger pan / pinch-zoom must reach the board **through** an unselected post-it;
  dedicated undo; no gesture a resting forearm triggers (deliberate handle grabs for destructive ops).
- **Apple Pencil hover** (≈12 mm) may *reveal* handles/tooltips — **enhancement only**, never required
  (finger + older Pencils have no hover).
- **Keep controls out of the palm-rest zone** (lower area, lower-left for right-handers).
- **Projected text ≥ 24 pt** effective on LIM/projection; honor text-spacing overrides without clipping.
- **Multi-touch**: assume 20–40 touch points on LIM; don't assume single pointer.

---

## 7. Accessibility (WCAG 2.2 AA)

Target **WCAG 2.2 AA** (research §5). Binding criteria for a board of movable objects:

- **SC 2.5.7 Dragging Movements (AA)** — every move/resize by drag **also** achievable by a single
  pointer without dragging: (a) select-then-arrow-nudge, **and** (b) a tap/click alternative
  (move handle → directional buttons; resize → stepper/numeric). **Keyboard alone does not satisfy this.**
- **SC 2.5.8 (AA) 24 px / SC 2.5.5 (AAA) 44 px** — targets meet the 44 px floor (§6) or the 24 px
  spacing-circle rule.
- **SC 1.4.3 (AA)** text ≥ 4.5:1 (large ≥ 3:1); **SC 1.4.11 (AA)** post-it borders / selection
  outlines / handles / icons ≥ 3:1. Add headroom for classroom glare.
- **Focus** — visible (2.4.7), **≥ 2 px / ≥ 3:1** (2.4.13), **never fully obscured** by the launcher
  or floating panels (2.4.11), logical order (2.4.3).
- **SC 4.1.2 Name/Role/Value (A)** — every post-it, sub-post-it, and control exposes programmatic
  name/role/value and announces state changes to AT (the most common SPA-canvas failure).
- **Launcher** = ARIA **Menu Button** or **Listbox** — one tab stop, arrow traversal, Home/End,
  type-ahead, Escape returns focus to trigger, `aria-expanded`/`aria-haspopup`.
- **Board navigation** = one tab stop via **roving tabindex / `aria-activedescendant`**; arrow keys
  move virtual focus across post-its; Enter/Space activate; Escape cancels.
- **Color is never the sole state signal**; reduced-motion mode for animations.
- **Note**: EN 301 549 (the Italian public-sector legal hook, references WCAG 2.1 AA) warrants a
  dedicated check for the school market (research §11 unknown).

---

## 8. Playwright checklist (gate for later UI slices)

Every UI slice runs Playwright on **four viewports** and records route, viewport, screenshot path,
and console errors:

| Viewport | Size (guide) | Focus |
|---|---|---|
| desktop | 1280×800 | collapsible panes, pointer targets |
| iPad-like | 1024×768 (+ portrait 768×1024) | drawers, touch targets, Pencil-hover-optional |
| LIM-like | 1920×1080 large | 60–80 px controls, mid-band placement, low text density |
| narrow | 375×812 | reflow at 320 px (SC 1.4.10), review/student-pack surface |

For each: **assert no blank UI, no overlap, no text overflow, no unreachable controls.** Plus:

- [ ] First screen is the board/sheet (not a dashboard).
- [ ] Plugin post-it: move + resize each reachable **without drag** (2.5.7) and by keyboard.
- [ ] Function surface adapts across `compact/normal/expanded` at real sizes; no crammed controls.
- [ ] Sub-post-it: bound child follows parent; `detach`/`remove`/`keep` behave per policy; pop-out works.
- [ ] Marketplace-preview: capabilities + provenance badge + AI marker visible **before** install;
      preview is inert (no writes) until installed.
- [ ] Pagina Personale: every stat shows evidence refs; `unavailable` zones show reasons, not mocks;
      copy uses Pagina Personale terms (no "pagina docente").
- [ ] Contrast ≥ 4.5:1 / 3:1 (measure, don't eyeball); focus visible and never obscured by the launcher.
- [ ] Launcher operable by keyboard (Menu Button/Listbox semantics); board focus roves by arrow keys.
- [ ] Screenshot each viewport; attach to the slice PR.

---

## 9. COV

- Synthesized firsthand from the research + gap audit (same date) and the shipped S1–S4 contracts;
  every state/threshold traces to a contract file or a cited SC.
- No runtime code. No claim any current UI meets this baseline — it is the target the C+7+ UI slices
  must be measured against with Playwright.
- Naming, provenance, accessibility, and "no mock-as-real" rules are inherited as hard constraints,
  not suggestions.
