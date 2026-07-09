# CLAUDE-ARDESIA-PRODUCT-GAP-AUDIT — 2026-07-08

- **Owner**: Claude Code (product/UX lane), non-Codex.
- **Worktree**: `/Users/andreamarro/ardesia-wt/tutor-ux`
- **Branch at audit time**: `docs/simulation-plugin-v2-contract-20260707` @ `ab91e476`
  (working tree carries in-progress Codex simulator changes — READ-ONLY for this lane).
- **Method**: firsthand read of the files cited below on this worktree. No code changed.
  Companion to `CLAUDE-ARDESIA-UIUX-RESEARCH-20260708.md` (research) and the brief
  `CLAUDE-ARDESIA-PRODUCT-UX-RECOVERY-BRIEF-20260708.md`.

## 0. Headline (read this first)

The brief describes ARDESIA as "the current tiny Post-it model" and proposes net-new
files under `apps/studio/src/useraios/` and `apps/studio/src/toolhost/pluginMarketplace.ts`.
**That framing is stale relative to the actual repo.** Firsthand reading shows a large,
mature product substrate already exists:

- a **signed plugin manifest contract** with every field the brief requests
  (`apps/studio/src/toolhost-protocol/manifest.ts`);
- a **local marketplace catalog** with pre-install signature/integrity preview
  (`apps/studio/src/toolhost/marketplace/localCatalog.ts`);
- a full **install/enable/disable/verify lifecycle** (`toolhost/installer.ts`,
  `toolhost/pluginManager.ts`, `toolhost/policy.ts`, `toolhost/audit.ts`,
  `toolhost/caps/*`);
- a **Pagina Personale projection ALREADY IMPLEMENTED IN CODE**
  (`apps/studio/src/lessonos/teacherDashboardProjection.ts` + test + a 605-line
  `design/TeacherDashboardView.tsx`);
- an **event-log source of truth** (`store/JournalRecorder.ts`, `store/WorkspaceStore.ts`,
  `core/contracts/eventBus.ts`);
- **four real plugins with manifests** (`apps/studio/plugins/{simulation,reference,outline,ripasso}/manifest.ts`);
- **student-pack artifact** code (`lessonos/studentPackArtifact.ts`).

**Consequence — the single most important call in this audit:** following the brief's
literal file paths (`useraios/personalPageProjection.ts`, `toolhost/pluginMarketplace.ts`)
would **fork a second projection/store** next to the ones that already exist. The
`TEACHER-DASHBOARD-SPEC.md` §0 explicitly forbids this ("MAI un secondo store"). So this
audit **re-maps the roadmap onto the real repo**: extend `lessonos/` and
`toolhost/marketplace/`, do not create parallel `useraios/`.

The genuine gaps are narrower and sharper than the brief implies: a **content-product +
provenance layer**, a **sub-post-it model**, a handful of **essential plugins as
board-representable objects**, **product naming** (Pagina Personale copy over the
internal TeacherDashboard types), and the **UX spec** + **research doc**.

## 1. What's implemented (verified firsthand — do NOT rebuild)

| Capability | Evidence (file) | Notes |
|---|---|---|
| Plugin manifest contract | `toolhost-protocol/manifest.ts:31` `ToolManifestSchema` | strict Zod. Has `id`, `name`, `version`(semver), `kind`(core/plugin/pack/workflow, l.28), `author`, `publisher`(ed25519, l.87), `surfaces`(board-embed/panel/fullscreen, l.23), `capabilities`, `privacy.dataOut`, `pricing`(free/one-time/subscription, l.81), `visibility`, `license`(SPDX), `integrity.bundleSha256`, `i18n`. |
| Post-it board object | `toolhost/postitObject.ts` (320 L) | `PluginPostitObject`: bounds, zIndex, selected/hovered/proximity, pluginState; create/update/resize/serialize/restore; `deriveFunctionSurfaceMode` (hidden/compact/normal/expanded by area). |
| Responsive plugin functions | `toolhost/pluginFunctions.ts` (72 L) | `derivePluginFunctionSurface` maps post-it size → visible functions by surface mode. |
| Marketplace catalog (local) | `toolhost/marketplace/localCatalog.ts` (191 L) | `LocalCatalogEntry` + `buildLocalCatalog` + `previewPluginPackage` (ed25519 sig + bundle-integrity check before install). Fail-visible `problems[]`. |
| Install lifecycle + permissions | `toolhost/installer.ts`, `pluginManager.ts`, `policy.ts`, `audit.ts`, `caps/{storage,graph,board,instance}.ts` | verify-on-install, lifecycle state (`PluginState`), capability gating, audit trail. |
| Pagina Personale projection | `lessonos/teacherDashboardProjection.ts` + `__tests__/TeacherDashboardProjection.test.ts` | The `TeacherDashboardProjection` from the spec — as CODE. |
| Pagina Personale view | `design/TeacherDashboardView.tsx` (605 L) + `__tests__/TeacherDashboardZ7View.test.tsx` | Renders zones incl. Z7 student-pack. |
| Event log (source of truth) | `store/JournalRecorder.ts`, `store/WorkspaceStore.ts`, `core/contracts/eventBus.ts` | `raw/events.jsonl` + `derived/`; `BusEventLogBinding.test.ts`. |
| Student pack | `lessonos/studentPackArtifact.ts` + `__tests__/StudentPackArtifact.test.tsx` | candidate/generated/exported artifact. |
| Existing plugins | `plugins/{simulation,reference,outline,ripasso}/manifest.ts` | `reference` ≈ manual-evidence-adjacent; `ripasso` ≈ review; `outline` ≈ lesson structure. |
| Journal→LessonOS bridge | `__tests__/JournalBridgeWriter.test.ts`, `core/contracts/{manual,boardCitation}.ts` | material.cited provenance path. |

## 2. What's fake / abstract / insufficient (exists but not yet product-true)

1. **Product naming drift.** Internal types + view are `TeacherDashboard*`. The product
   surface must read **Pagina Personale / Profilo / Materiali / Lezioni / Plugin /
   Marketplace / Contenuti**. The spec permits keeping internal type names; the gap is a
   **user-visible copy/label layer**, not a rename refactor. → C+4/C+6 copy pass.
2. **Marketplace = plugin-packages only.** `localCatalog.ts` models installable
   `.maestrotool` **plugin packages**. It does **not** model **sellable content products**
   (lesson pack, worksheet, exam-generator output, simulation pack, student pack) as
   marketplace items with buyer license, preview policy, price/free, creator identity, and
   an **official-vs-generated** flag. `ToolManifest.pricing` exists but there is no
   content-product type and no provenance field. → real C+1 gap.
3. **No provenance / "generated vs official" marking anywhere.** Neither `ToolManifest`
   nor `LocalCatalogEntry` carries a provenance/originality field. The brief and
   `UI-UX-DESIGN-DIRECTION.md` (ExamForge guardrails) require generated/sellable content to
   be distinguishable from official exam/school content. Missing.
4. **Post-it model has no children.** `PluginPostitObject` is flat: no sub-post-it,
   no parent/child link, no orphan policy. → C+3 net-new.
5. **Essential plugins incomplete as board objects.** `reference/outline/ripasso/simulation`
   exist as manifests, but the brief's product set — **Manual Evidence, Lesson Checklist,
   Concept Map, Student Pack Builder, Marketplace Preview** — is not present as a coherent,
   post-it-representable, tested plugin family. Partial.
6. **Projection ≠ full Pagina Personale zones.** Need to verify (next slice) which of Z1–Z12
   `teacherDashboardProjection.ts` actually derives vs. leaves `unavailable[]`. The graph-dependent
   zones (Z1 grafo, Z8 recurring errors) likely still `unavailable` pending the event-log→graph
   materializer. Honest, but incomplete.

## 3. What is genuinely missing (net-new work)

| # | Missing | Maps to | Real target path (reconciled) |
|---|---|---|---|
| M1 | Content-product + unified marketplace-item contract (plugin-package ∪ content-product) with license, price/free, preview, publisher/version, disabled/unavailable, **provenance + official/generated flag** | C+1 | `toolhost/marketplace/marketplaceItem.ts` (NOT `toolhost/pluginMarketplace.ts`) |
| M2 | Provenance/evidence-ref model for content products (reuse `EvidenceRef` from dashboard spec) | C+1/C+5 | `toolhost/marketplace/provenance.ts` or fold into M1 |
| M3 | Essential plugins as tested board objects (≥3: manual-evidence, lesson-checklist, concept-map; then student-pack-builder, marketplace-preview) | C+2 | `toolhost/essentialPlugins.ts` (+ reuse existing `reference` manifest where it fits) |
| M4 | Sub-post-it object (child of a plugin instance; provenance; explicit orphan policy) | C+3 | `toolhost/subPostitObject.ts` |
| M5 | Pagina Personale product projection **extensions** (plugin-usage summary, content-created, marketplace/content readiness, student-pack candidates) as additions to the EXISTING projection — not a new file | C+4/C+5 | extend `lessonos/teacherDashboardProjection.ts` (+ its test) |
| M6 | UI/UX research doc with **verified** licenses (resolves the `[VERIFY-WEB]` TODOs in `docs/product/OPEN-DESIGN-AND-BOARD-RESEARCH.md`) | C+0 | `docs/ops/CLAUDE-ARDESIA-UIUX-RESEARCH-20260708.md` |
| M7 | Plugin-on-paper UX spec (first screen, plugin states, sub-post-it states, Pagina Personale layout, marketplace/creation flow, iPad/LIM/desktop, a11y, Playwright checklist) | C+6 | `docs/product/ARDESIA-PLUGIN-ON-PAPER-UX-SPEC.md` |

## 4. Exact files Claude MAY touch (this lane)

Create (new):
- `docs/ops/CLAUDE-ARDESIA-UIUX-RESEARCH-20260708.md` (M6)
- `docs/product/ARDESIA-PLUGIN-ON-PAPER-UX-SPEC.md` (M7)
- `apps/studio/src/toolhost/marketplace/marketplaceItem.ts` (M1) + `__tests__/MarketplaceItem.test.ts`
- `apps/studio/src/toolhost/essentialPlugins.ts` (M3) + `__tests__/EssentialPlugins.test.ts`
- `apps/studio/src/toolhost/subPostitObject.ts` (M4) + `__tests__/SubPostitObject.test.ts`

Extend (existing, additive, tests updated):
- `apps/studio/src/lessonos/teacherDashboardProjection.ts` + `__tests__/TeacherDashboardProjection.test.ts` (M5 — additive fields, keep regenerable-from-zero invariant)
- `apps/studio/src/toolhost/marketplace/localCatalog.ts` (only if content-products must appear in the catalog; prefer composition over edit)
- `apps/studio/src/toolhost/postitObject.ts` (only if sub-post-it needs a parent hook; prefer keeping it flat and linking from `subPostitObject.ts`)

Read-only reference (compare against, cite, do not edit):
- `docs/product/UI-UX-DESIGN-DIRECTION.md`, `docs/product/TEACHER-DASHBOARD-SPEC.md`,
  `docs/product/OPEN-DESIGN-AND-BOARD-RESEARCH.md`, `apps/studio/src/toolhost/pluginFunctions.ts`,
  `apps/studio/src/toolhost-protocol/manifest.ts`, `apps/studio/src/toolhost-protocol/capabilities.ts`.

## 5. Exact files Claude MUST AVOID (Codex lane / stop rules)

Hard read-only (touching = STOP per brief §Non-Interference and §Stop Rules):
- `apps/studio/sim/**` (incl. `apps/studio/sim/solver/**`)
- `apps/studio/src/design/SimulationPluginWorkbench.tsx`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`

Also avoid: anything currently modified in the working tree by the Codex lane (see
`git status`: `sim/core/*`, `sim/elab/*`, `sim/providers/*`, `src/design/SimulationPluginWorkbench.tsx`,
`src/toolhost/ToolCanvasEmbeddable.tsx`, and their tests). Do not `git add -A`, do not stage or
commit Codex files, do not reset/clean. New product files must **not import simulator internals**
(the `elabSceneBridge.ts` / `simulationPluginRegistry.ts` boundary is the only sanctioned seam,
and only for reading a registered scene — a content-product referencing a simulation is a
provenance ref, not an import).

## 6. Proposed slice order (reconciled with the real repo)

Each code slice ≤5 files, obeys the brief's gates, no new dependency, no simulator import.

- **S0 (this)** — Research doc (M6) + this gap audit. Docs only. *In progress.*
- **S1 — Marketplace item + content-product contract (M1/M2).** New `marketplaceItem.ts`:
  discriminated union `{ kind: "plugin-package" }` (wraps/points at `ToolManifest`) ∪
  `{ kind: "content-product" }` (title, creator, license, price/free via `pricing`-shaped,
  preview policy, provenance `{ origin: "official" | "user-generated" | "ai-generated", evidenceRefs[] }`,
  lifecycle state, disabled/unavailable explicit). Tests: id/version/publisher/capability/surfaces
  present for plugin case; title/creator/license/price for content case; provenance flag required;
  disabled+unavailable explicit; **no payment integration; no simulator import.**
- **S2 — Essential plugins (M3).** ≥3 minimal plugins as `PluginPostitObject`-representable
  definitions using S1 + existing manifest metadata; fixtures marked as fixtures; each ≥1 test;
  no simulator internals hardcoded.
- **S3 — Sub-post-it model (M4).** Child links to parent plugin instanceId; serialize/restore with
  provenance; explicit orphan policy; no plugin-specific branches.
- **S4 — Pagina Personale projection extensions (M5).** Additive fields on the existing
  `teacherDashboardProjection.ts` (plugin-usage summary, content-created, marketplace/content
  readiness, student-pack candidates); every stat has evidence refs; graph zones stay
  `unavailable[]` with reason when the materializer is absent; regenerable-from-zero preserved.
- **S5 — UX spec (M7).** Turn research + this audit into `ARDESIA-PLUGIN-ON-PAPER-UX-SPEC.md`
  before any runtime UI edit.
- **S6 (gated, later)** — UI slices with Playwright evidence on desktop/iPad/LIM/narrow, per brief.

Ordering rationale: contracts before plugins before sub-post-it before projection before UI.
Naming (Pagina Personale copy) rides on S4/S5 rather than a risky rename.

## 7. Open questions / unknowns for Andrea

1. **Path reconciliation** — OK to place new work under `toolhost/marketplace/` and extend
   `lessonos/` (this audit's recommendation), instead of the brief's literal `useraios/` +
   `toolhost/pluginMarketplace.ts`? (Recommended: yes — honors "no second store".)
2. **Content-product ↔ simulation** — a "simulation pack" content-product references a scene
   owned by the Codex sim lane. Confirmed intended boundary: **provenance ref only, never import**.
   If a slice needs deeper integration → integration proposal + STOP (per brief).
3. **Which essential plugins first** — audit proposes manual-evidence, lesson-checklist,
   concept-map for S2 (all derivable from existing event-log/graph/manual contracts without the
   simulator). Student-pack-builder + marketplace-preview follow.

## 8. COV

- Firsthand reads on this worktree @ `ab91e476`: manifest.ts, postitObject.ts, pluginFunctions.ts,
  localCatalog.ts, TEACHER-DASHBOARD-SPEC.md, UI-UX-DESIGN-DIRECTION.md, OPEN-DESIGN-AND-BOARD-RESEARCH.md,
  the brief, plus `git status`, directory listings, and grep for projection/manifest/marketplace/event-log.
- No code changed. No files staged. No simulator file read beyond directory names.
- Claim discipline: every "implemented" row cites a file; every "missing" row is net-new; the
  research doc's verified licenses are produced separately (M6), not asserted here.
