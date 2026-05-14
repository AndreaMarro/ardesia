---
id: ADR-047
title: Narrative arc canon — Tea standard-schema adoption + additive 7-step migration
status: A1+A2+A3 ACCEPTED · D1 REVERSED by A3 · D5 SUPERSEDED · A4-A7 PROPOSED (gated on Andrea ratifying the A3 master verdict)
date: 2026-05-14
last-updated: 2026-05-14 (iter-54 A3 addendum)
deciders:
  - Claude Opus 4.7 (iter 54 — EPIC 1 atom A1, narrative arc refactor)
  - Andrea Marro (final approver — gates A3-A7 data mutation before execution)
context-tags:
  - iter-54
  - epic-1
  - morfismo-sense-2
  - narrative-arc
  - tea-canonical-schema
  - principio-zero-v3
  - no-regressioni
related:
  - ADR-008 (buildCapitoloPromptFragment Vol/pag verbatim)
  - ADR-009 (Principio Zero validator V3 — plurale Ragazzi + word limit)
  - ADR-019 (Sense 1.5 Morfismo runtime docente/classe)
  - ADR-046 (Percorso "Lezione personalizzata" — Onniscenza + Mistral)
  - Tea deliverable — TEA/Nuovo lavoro tea/standard_experiment_schema.json
  - Tea deliverable — TEA/Nuovo lavoro tea/narrative_map.json
  - Tea deliverable — TEA/Nuovo lavoro tea/narrative_metadata_94.json
input-files:
  - src/data/lesson-paths/*.json (94 files — 5-phase `phases` schema)
  - src/data/capitoli/*.json (chapter-level grouping + nested experiments)
  - src/data/chapter-map.js (CHAPTER_MAP — "Tea's proposal for volume realignment")
  - src/data/lesson-groups.js (LESSON_GROUPS — concept grouping)
  - src/data/volume-references.js (verbatim book citations)
  - src/services/principioZeroValidator.js (existing PZ validator)
  - TEA/Nuovo lavoro tea/standard_experiment_schema.json (7-step canonical schema)
  - TEA/Nuovo lavoro tea/narrative_map.json (94-node arc graph)
  - TEA/Nuovo lavoro tea/narrative_metadata_94.json (per-experiment metadata)
output-files:
  - docs/adrs/ADR-047-narrative-arc-canon-tea-schema-adoption.md (this file)
  - scripts/epic1/reconcile-narrative-canon.mjs (A2 — read-only audit codemod)
  - docs/audits/2026-05-14-epic1-narrative-canon-reconciliation.md (A2 — gap report output)

# ADR-047 — Narrative arc canon: Tea standard-schema adoption + additive 7-step migration

## Status

PROPOSED. This ADR covers EPIC 1 atoms A1 (this document) and A2 (the read-only
reconciliation audit). It defines the strategy for A3-A7 but **A3-A7 do not
execute until Andrea ratifies the A2 gap report.** No `src/data/` mutation is
authorised by this ADR.

## Context

### The gap (Morfismo Sense 2)

Andrea's recurring P0 mandate: the experiments must live on a *continuous
narrative arc* — same narrative, order, names, pages and inter-experiment
cliffhanger transitions as the physical ELAB volumes (Davide) and the Omaric
kit. This triplet coherence (volumi ↔ kit ↔ software) is Morfismo Sense 2 — the
non-copyable competitive moat. Prior audits (claude-mem #1097, #1108, #1119,
#1141) flagged the software side as fragmented relative to the books.

### Tea's canonical deliverables (iter 53, `TEA/Nuovo lavoro tea/`)

Teodora De Venere produced the canonical blueprint:

- **`standard_experiment_schema.json`** — a 7-step pedagogical schema
  (`setup → ipotesi → costruzione → misura → variazione → conclusione →
  trasferimento`). Structure is rigid (all 94 experiments have all 7 steps),
  content is morphic. Includes a `principio_zero_compliance` gate (12 rules)
  and a `fumetto_mapping` (7 steps → 6 comic panels).
- **`narrative_map.json`** — the 94-node arc graph: per experiment `id`,
  `title`, `page`, `components`, `next_id`, `cliffhanger`, `breadcrumb`,
  grouped by `story_arc` per chapter. The arc is a linked list via `next_id`,
  including deliberate cross-chapter / cross-volume edges
  (e.g. `v1-cap8-esp5 → v1-cap11-esp1`, `v1-cap9-esp1 → v2-cap9-esp2`).
- **`narrative_metadata_94.json`** — per experiment: verbatim `bookText`,
  `success_citation`, `cliffhanger`, `analogy_kind`/`analogy_text`, `bookPage`.

Tea also flagged a known upstream gap: `chapter_titles_canonical` is **empty** —
all chapter titles in `narrative_map.json` are `tea-inferred`, not yet verified
against `volume-references.js` / the printed volumes.

### Existing repo structure (not greenfield)

Iterations 41-53 already built partial narrative structure. As of the iter-54
baseline commit (`54d69b99`), the repo holds **five** narrative/chapter/
experiment data sources:

| Source | Shape | Role |
|---|---|---|
| `src/data/lesson-paths/*.json` (94) | 5-phase `phases` (PREPARA/MOSTRA/CHIEDI/OSSERVA/CONCLUDI) + `chapter`, `next_experiment`, `prerequisites` | per-experiment session data |
| `src/data/capitoli/*.json` | `titolo`, `pageStart/End`, `theory{}`, nested `esperimenti[]` | chapter-level grouping |
| `src/data/chapter-map.js` | `CHAPTER_MAP` internal-id → display chapter + title | volume realignment (comment: "Tea's proposal") |
| `src/data/lesson-groups.js` | `LESSON_GROUPS` concept-grouped experiment lists | narrative grouping by concept |
| `src/data/volume-references.js` | verbatim book citations | citation source of truth |

Plus `src/services/principioZeroValidator.js` already exists (ADR-009).
Eight components/services consume `lesson-paths/` (UnlimWrapper, UnlimReport,
LessonPathPanel, useExperimentLoader, GalileoAdapter, TeacherDashboard,
classProfile, lessonPrepService).

The real EPIC 1 problem is therefore **not** "build narrative structure from
scratch" — it is **reconcile five divergent repo sources against Tea's three
canonical files**, then adopt Tea's 7-step schema without regressing the eight
consumers.

## Decision

### D1 — Tea's three files are the single source of truth for narrative canon

`standard_experiment_schema.json`, `narrative_map.json` and
`narrative_metadata_94.json` are designated the canonical source for: experiment
IDs, ordering, `next_id` chains, cliffhangers, breadcrumbs, canonical pages,
verbatim `bookText`/citations, analogies, and the 7-step structure. Where a repo
source diverges from Tea's canon, the repo source is reconciled to Tea — **not
the reverse** — unless the A2 audit surfaces a Tea error (in which case it is
escalated to Andrea, as Tea did self-corrections in fumetti v1→v2).

### D2 — Schema migration is ADDITIVE, not replace

The 94 lesson-paths gain a new `steps` block (Tea's 7-step schema) **alongside**
the existing `phases` block. `phases` is not removed in EPIC 1.

Rationale (mandate #1 — NO REGRESSIONI): a hard `phases → steps` replace would
touch 94 JSON files and 8 consumers atomically — high regression risk against a
14342-test baseline. Additive migration lets each consumer move to `steps` on
its own iteration, behind tests, with `phases` as the safety net. `phases` is
removed only in a later ADR, after all 8 consumers are migrated and ratified.
The additive path delivers the full benefit (canonical 7-step content,
narrative arc, PZ-V3 validation are all available) with zero day-one regression
surface.

### D3 — Reconciliation-first: A2 audit before any data mutation

A2 ships a **read-only** codemod (`scripts/epic1/reconcile-narrative-canon.mjs`)
that cross-diffs all five repo sources against Tea's three files and emits a gap
report. No `src/data/` file is mutated in iter 54. A3-A7 (the actual
narrative-arc adoption, 94-file `steps` enrichment, validator extension, Percorso
UI) execute only after Andrea ratifies the gap report.

### D4 — `principioZeroValidator.js` is extended, not rebuilt

`standard_experiment_schema.json`'s `principio_zero_compliance` defines 12 rules.
`src/services/principioZeroValidator.js` already exists (ADR-009). A5 reconciles
the two rule sets — the A2 audit includes a rule-level diff — and extends the
existing validator. It is not rebuilt.

### D5 — narrative-arc adoption target

A3 adopts `narrative_map.json` + `narrative_metadata_94.json` into
`src/data/narrative-arc.js` as the canonical arc graph (story_arcs, chapter
grouping, `next_id`, cliffhanger, breadcrumb). `chapter-map.js` and
`lesson-groups.js` are reconciled to it; whether they are kept as derived views
or retired is decided by the A2 audit findings.

## EPIC 1 atom plan (A3-A7 gated on A2 ratification)

| Atom | Owner (Pattern S r3) | Scope |
|---|---|---|
| A1 | (this ADR — done iter 54) | strategy + frontmatter |
| A2 | (codemod — done iter 54, read-only) | 5-source ↔ Tea cross-diff gap report |
| A3 | gen-app | `src/data/narrative-arc.js` from Tea canon |
| A4 | gen-app | additive `steps` block on 94 lesson-paths, enriched with Tea metadata |
| A5 | gen-test | extend `principioZeroValidator.js` to Tea 12-rule gate + 94-file conformance tests |
| A6 | webdesigner | Modalità Percorso narrative-arc UI |
| A7 | scribe | ADR close + CLAUDE.md |

## Consequences

**Positive**: triplet coherence (Morfismo Sense 2) becomes data-enforceable;
single source of truth removes 5-way drift; additive migration keeps the 14342
baseline green; reconciliation-first means Andrea ratifies a concrete gap report
rather than a speculative plan.

**Negative / cost**: temporary dual-maintenance of `phases` + `steps`; the
`chapter_titles_canonical` upstream gap (Tea titles are `tea-inferred`) is not
closed by EPIC 1 — it needs volume-PDF / Davide verification, tracked
separately; A4 content authoring for 92 experiments (the 2 Tea sample JSONs
cover only `v1-cap6-esp1` and `v3-cap7-mini`) is genuinely multi-iteration work.

## Open questions for Andrea (ratification gate)

1. Confirm Tea's `narrative_map.json` `next_id` chains override the repo's
   `next_experiment` fields, including the cross-volume edges.
2. `chapter_titles_canonical` is empty — accept `tea-inferred` titles as canon
   for now, or block on volume-PDF / Davide verification first?
3. After the A2 gap report: full A3-A7 in one iteration, or A3+A4 (data) first,
   then A5+A6 (validator + UI) separately?

---

## ADDENDUM — iter-54 ratified decisions + A3 findings (2026-05-14)

### Andrea's iter-54 ratified decisions (gate answers)

1. **Canonical definition per ID** — not "Tea overrides" nor "repo overrides": every
   experiment is verified against the physical volume text (A3). The book-faithful
   definition wins, per the A3 master verdict.
2. **chapter_titles** — verified against the volume text in A3, not accepted as
   `tea-inferred` and not blocked indefinitely.
3. **Sequencing** — incremental, checkpoint-first: A3 (verification) ships and is
   ratified before A4 (data mutation) starts.

### A3 findings — D1 is REVERSED, D5 is SUPERSEDED

A3 verified all 94 experiments against the printed volumes
(`CONTENUTI/volumi-pdf/vol{1,2,3-v0.8.1}.txt`). Master verdict:
`docs/audits/2026-05-14-epic1-a3-MASTER-verdict.md`. Per-volume detail:
`docs/audits/2026-05-14-epic1-a3-vol{1,2,3}-verdict.md`.

**The A3 result overturns this ADR's central premise.** D1 assumed Tea's three files
are "the single source of truth for narrative canon." Verified against the books:

- repo `lesson-paths/` titles are **book-faithful for 74 / 94** (all 38 Vol 1, all 27
  Vol 2, 9 of 29 Vol 3).
- Tea's `narrative_map` titles are sole-faithful for **0 / 94**.
- Tea's chapter titles are wrong for **16 / 22** chapters.
- Tea's `nextId` chains are unreliable (cross-volume jumps, skipped chapters); the repo
  chains match printed book order.
- Tea's `bookText` is genuinely verbatim for Vol 1 + Vol 2 but **fabricated for all 29 of
  Vol 3**.
- The A2 `teaBookTextVerified 50/94` signal is partly a tooling artifact (`norm()` does
  not fold curly quotes/apostrophes).

**D1 — REVERSED.** Tea's `narrative_map` is NOT the single source of truth. The physical
volume text is. The repo `lesson-paths/` are the better starting point for Vol 1 + Vol 2.
Tea's deliverables remain useful for: the **7-step schema structure**
(`standard_experiment_schema.json`), and the **`bookText` / `success_citation` / `analogy`
metadata for Vol 1 + Vol 2 only** (verbatim-verified) — NOT for Vol 3 (fabricated).

**D5 — SUPERSEDED.** A3 does not adopt `narrative_map.json` into `src/data/narrative-arc.js`
as-is — `narrative_map` needs regeneration from the volumes first (16 wrong chapter titles,
wrong experiment titles, wrong `nextId` chains).

### Revised A4-A7 scope (still gated on Andrea ratifying the A3 master verdict + its 6 decisions)

- **A4** — for the 65 Vol 1 + Vol 2 experiments: adopt the **repo** `lesson-paths`
  title/page/order as canonical; add the additive `steps` block (D2 still holds) using Tea's
  verbatim `bookText`/`citation`/`analogy` metadata. For Vol 3: adopt repo-or-corrected
  titles, author `steps` from the volume text directly (Tea Vol 3 metadata is fabricated).
  ~15 Vol 3 experiments with no printed counterpart are **blocked** on Andrea decision #1.
- **A4-prereq** — regenerate Tea's `narrative_map` (chapter titles, experiment titles,
  `nextId` chains) from the volumes before it is used anywhere.
- **A5** — D4 still holds (extend `principioZeroValidator.js`).
- **A6** — D2 still holds (additive). Modalità Percorso UI.
- **D2 (additive `steps`) and D3 (reconciliation-first) are NOT affected** — they were
  correct and are confirmed by A3.

### 6 open decisions for Andrea (A3 ratification gate)

See `docs/audits/2026-05-14-epic1-a3-MASTER-verdict.md` § "Open decisions for Andrea":
Vol 3 no-counterpart experiments, Vol 3 duplicate-id consolidation, Vol 3 Ch7/Ch8 collapse,
Vol 2 Cap.12 page (103 confirmed), Vol 2 Cap.12 title wording, Vol 2 Cap.11 coverage gap.
