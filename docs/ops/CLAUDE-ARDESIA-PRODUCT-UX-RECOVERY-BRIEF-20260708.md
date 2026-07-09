# Claude Code Brief - ARDESIA Product/UX Recovery Without Codex Interference

Date: 2026-07-08
Owner: Claude Code, not Codex
Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`

## Mission

Claude must build the missing ARDESIA product layer without interfering with the
Codex simulator lane.

Andrea's product request is broader than the current Post-it model. The current
work around `PluginPostitObject` is a useful start, but it is not ARDESIA yet.
ARDESIA must become a beautiful, understandable, functional paper-first product:

- plugins as objects on the board;
- sub-post-it objects around plugins;
- minimal but real plugins;
- LessonOS as the evidence/memory layer;
- marketplace-ready plugins and sellable educational content;
- a product surface called **Pagina Personale**, not "pagina docente";
- ELABTutor as a pack/consumer over the Simulation Plugin, never a second app;
- UI/UX researched, coherent, and tested on iPad/LIM/desktop constraints.

## Non-Interference With Codex

Codex owns the simulator/Tinkercad-parity lane. Claude must not touch Codex
simulator files unless Andrea explicitly authorizes a coordinated handoff.

Read-only for Claude:

- `apps/studio/sim/**`
- `apps/studio/src/design/SimulationPluginWorkbench.tsx`
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `docs/architecture/simulation-plugin-v2.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `docs/ops/LONG-RUN-CODEX-SIMULATOR-TINKERCAD-PARITY-20260708.md`
- `apps/studio/sim/solver/**`

Allowed Claude lane:

- product/UX docs under `docs/product/**` and `docs/ops/**`;
- pure host/product contracts not importing simulator internals;
- minimal plugin manifests/models/tests;
- LessonOS/UserAIOS projection contracts;
- marketplace/content-product contracts;
- UI/UX research and later UI slices with Playwright evidence.

If a product slice needs simulator integration, Claude must write an integration
proposal and stop.

## Product Language

Do not call the teacher-facing page "pagina docente" in user-facing product
language.

Use:

- **Pagina Personale**
- **Profilo**
- **Materiali**
- **Lezioni**
- **Plugin**
- **Marketplace**
- **Contenuti**

Allowed internal/technical terms only where unavoidable:

- `TeacherDashboardProjection`
- dashboard projection
- teacher id
- filename `TEACHER-DASHBOARD-SPEC.md`

Every future UI/product text must prefer "Pagina Personale" over "dashboard",
"cruscotto docente", or "pagina docente".

## Required Research

Before broad UI runtime work, Claude must research and write:

`docs/ops/CLAUDE-ARDESIA-UIUX-RESEARCH-20260708.md`

Research must use primary sources where possible and include links. Required
topics:

- GoodNotes-class note/board expectations;
- Excalidraw, tldraw, Penpot, Fritzing: licensing, product pattern, what to copy
  conceptually, what not to copy;
- WCAG/WAI accessibility constraints current enough for modern UI work;
- iPad, touch, pencil, LIM, classroom interaction patterns;
- educational marketplaces and creator-content workflows;
- plugin marketplace patterns: install, trust, permissions, versions, publisher,
  reviews, pricing, updates;
- sellable education content patterns: pack, lesson, worksheet, exam generator,
  simulation pack, teacher profile, public preview, license, provenance.

Research output must include:

- source links;
- direct implications for ARDESIA;
- unknowns;
- risks and licensing traps;
- UI rules for plugin post-it and sub-post-it interactions.

## Product Gap Audit

Claude must write before broad coding:

`docs/ops/CLAUDE-ARDESIA-PRODUCT-GAP-AUDIT-20260708.md`

It must compare current implementation against:

- Andrea's product direction in this brief;
- `docs/product/UI-UX-DESIGN-DIRECTION.md`;
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`;
- `docs/product/TEACHER-DASHBOARD-SPEC.md`, with product naming corrected to
  Pagina Personale;
- current Post-it runbook;
- current Codex simulator runbook.

It must list:

- what's implemented;
- what's fake/abstract/insufficient;
- what is missing;
- exact files Claude may touch;
- exact files Claude must avoid;
- proposed slice order.

## Missing Pieces Claude Must Build

### 1. Minimal Essential Plugins

Claude must create some minimal but real plugins, not only abstract contracts.
They can be small, but they must exercise the product system.

Suggested first essential plugins:

- **Manual Evidence Plugin**: a board object showing a cited manual/page excerpt
  or reference card with provenance.
- **Lesson Checklist Plugin**: a compact lesson flow/checklist object, tied to
  board state, exportable.
- **Concept Map Plugin**: a small graph/concept object derived from lesson
  concepts, read-only first.
- **Student Pack Builder Plugin**: minimal product object listing candidate
  exports with evidence refs.
- **Marketplace Preview Plugin**: shows how a pack/plugin/content item appears
  for sale/install, without real payments.

Rules:

- no fake data presented as real;
- use fixtures clearly marked as fixtures when needed;
- every plugin has manifest-like metadata: id, name, kind, version, publisher,
  surfaces, capabilities, privacy, pricing/readiness state;
- every plugin can be a board post-it object;
- every plugin must have at least one focused test.

### 2. Plugin Marketplace And Sellable Content

Claude must model ARDESIA as a creator/product ecosystem:

- teachers create sellable lesson packs;
- plugins can be installed, enabled, disabled, updated, and reviewed;
- content can be previewed before purchase/install;
- publisher identity and version are visible;
- permissions/capabilities are explicit;
- paid content does not bypass provenance or copyright;
- generated/sellable content must be distinguishable from official exam/school
  content.

Initial implementation should be contract-first:

- marketplace item type;
- content product type;
- plugin/package manifest extension;
- tests for installability, provenance, permissions, price/free status,
  publisher, version, and disabled/unavailable states.

No payment integration in the first slice.

### 3. LessonOS Improvement

Claude must improve LessonOS around product utility, not as an abstract AI
system.

Targets:

- event log remains source of truth;
- LessonOS graph/projection grows from real board/plugin events;
- Pagina Personale derives from event log, materialized graph, manifests, and
  WorkspaceStore derived data;
- every insight has evidence refs;
- unavailable zones are explicit;
- no second dashboard store;
- no LLM-generated claims in core product v0.

Initial implementation should be a pure projection contract and tests:

- plugin usage summary;
- recent lessons;
- content created;
- marketplace/content readiness;
- student-pack candidates;
- recurring concepts/errors when graph data exists;
- `unavailable[]` for graph-dependent zones when graph data is absent.

### 4. Pagina Personale

Claude must define and later build **Pagina Personale**.

Pagina Personale is not a generic admin dashboard. It is the user's personal
workspace surface:

- lessons;
- materials;
- plugins;
- created content;
- marketplace/public profile;
- student-pack queue;
- LessonOS memory/evidence projection;
- creator/seller readiness.

Do not use product-facing labels:

- pagina docente;
- cruscotto docente;
- teacher dashboard;
- admin dashboard.

Internal code can still use existing names only if renaming would be a separate
risky refactor. Any new user-visible copy must use Pagina Personale.

### 5. Beautiful, Functional, Understandable UI/UX

Claude must not build more raw panels with too much text. ARDESIA should feel
like a polished board product:

- first screen is the board/sheet, not a dashboard;
- plugin objects are direct, tactile, movable, resizable, understandable;
- controls appear near the object and adapt to size;
- sub-post-it objects make manual/diagnostics/steps visible without clutter;
- Pagina Personale is calm, structured, and useful;
- no marketing hero;
- no decorative filler;
- no mock data pretending to be real;
- Playwright screenshots required for UI changes.

## Concrete Roadmap For Claude

### C+0 - Research And Product Gap Audit

Files:

- `docs/ops/CLAUDE-ARDESIA-UIUX-RESEARCH-20260708.md`
- `docs/ops/CLAUDE-ARDESIA-PRODUCT-GAP-AUDIT-20260708.md`

No runtime code.

### C+1 - Minimal Plugin Manifest And Marketplace Item Contracts

Goal:

- Define minimal plugin/content marketplace contracts.

Likely files:

- `apps/studio/src/toolhost/pluginMarketplace.ts`
- `apps/studio/src/__tests__/PluginMarketplace.test.ts`

Tests:

- plugin item has id, version, publisher, capability list, surfaces;
- content product has title, creator, license/provenance, price/free state;
- unavailable/disabled item is explicit;
- no payment integration;
- no simulator imports.

### C+2 - Essential Minimal Plugins

Goal:

- Create at least three minimal plugin definitions using the contract.

Suggested plugins:

- manual evidence;
- lesson checklist;
- concept map;
- student-pack builder;
- marketplace preview.

Likely files:

- `apps/studio/src/toolhost/essentialPlugins.ts`
- `apps/studio/src/__tests__/EssentialPlugins.test.ts`

Tests:

- each plugin has manifest metadata;
- each declares surfaces/capabilities/privacy;
- each can be represented as a post-it object;
- no plugin hardcodes simulator internals.

### C+3 - Sub-post-it Model

Goal:

- Model child post-it objects for manual, diagnostics, steps, notes, exercises.

Likely files:

- `apps/studio/src/toolhost/subPostitObject.ts`
- `apps/studio/src/__tests__/SubPostitObject.test.ts`

Tests:

- child links to parent plugin instance;
- child serializes/restores with provenance;
- orphan policy is explicit;
- no plugin-specific branches.

### C+4 - Pagina Personale Projection

Goal:

- Define the read-only projection behind Pagina Personale.

Likely files:

- `apps/studio/src/useraios/personalPageProjection.ts`
- `apps/studio/src/useraios/personalPageProjection.test.ts`

Tests:

- derives lessons/materials/plugins/content from event-like fixtures;
- every stat has evidence refs;
- graph-dependent zones can be unavailable with reasons;
- no second store.

### C+5 - LessonOS Product Projection Improvements

Goal:

- Improve LessonOS usefulness for product workflows.

Likely files:

- pure projection/module under `apps/studio/src/useraios/` or docs-first if
  engine integration is not safe;
- focused tests.

Targets:

- plugin usage events;
- content creation events;
- student-pack candidate events;
- marketplace readiness events;
- evidence refs;
- no LLM claims.

### C+6 - Plugin-On-Paper UX Spec

Goal:

- Turn research into implementable UI spec before runtime UI edits.

File:

- `docs/product/ARDESIA-PLUGIN-ON-PAPER-UX-SPEC.md`

Must include:

- first screen;
- plugin object states;
- sub-post-it states;
- Pagina Personale layout;
- marketplace/content creation flow;
- iPad/LIM/desktop behavior;
- accessibility;
- Playwright checklist.

## Gates

For code-changing slices:

```bash
npm --prefix apps/studio run test -- <focused tests> --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm --prefix apps/studio run typecheck
cd apps/studio && npm exec eslint -- <touched files>
git diff --check
git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components
```

For UI/runtime slices:

- run Playwright screenshots on desktop, iPad-like, LIM-like, and narrow
  viewport;
- record route, viewport, screenshot/result path, and console errors;
- verify no blank UI, no overlap, no text overflow, no unreachable controls.

## Stop Rules

Stop if:

- a slice would touch Codex simulator files;
- a new dependency is required;
- more than five files are needed without split plan;
- focused tests fail outside the slice;
- typecheck fails;
- scoped lint fails;
- vendored solver drift appears;
- work requires push, deploy, merge, staging, reset, clean, or destructive
  operations.

## Message To Claude Code

Use this brief exactly.

Do not continue by only refining the current tiny Post-it model. Create the
missing ARDESIA product layer:

- research;
- gap audit;
- minimal essential plugins;
- plugin/content marketplace contracts;
- sellable educational content model;
- LessonOS product projections;
- Pagina Personale;
- sub-post-it model;
- beautiful, functional, comprehensible UI/UX spec and later UI with screenshots.

Do not interfere with Codex simulator work. If a product slice needs simulator
integration, write a proposal and stop.
