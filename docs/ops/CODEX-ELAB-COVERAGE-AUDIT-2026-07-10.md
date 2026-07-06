# CODEX ELAB Coverage Audit - PKT-CODEX-1

Date: 2026-07-10 task packet, executed on 2026-07-06 local session.
Repo: `/Users/andreamarro/VOLUME 3/ardesia`
Branch: `codex/ardesia-ops-headroom-20260701`
Remote baseline checked: `origin/main` at `b3cc021c` (`Merge pull request #117 from AndreaMarro/feat/plugin-ripasso-graph-query-20260709`)

## 1. Executive summary

Current ARDESIA checkout contains a coherent ELAB canonical corpus of **88** experiments: **38 Vol.1**, **27 Vol.2**, **23 Vol.3**. The expected prompt path `packs/elab-tutor/data/lesson-paths/` is absent in this checkout; the firsthand source is `plugins/elab-tutor/src/data/lesson-paths/`.

For the 88 experiments, the static corpus is strong:

- 88/88 lesson-path JSON files exist.
- 88/88 experiment records exist in `experiments-vol{1,2,3}.js`.
- 88/88 volume citations exist in `volume-references.js`.
- 88/88 lesson-paths expose `common_mistakes`, `build_circuit`, and the four modes `percorso|passo-passo|gia-montato|libero`.
- 88/88 experiment records have component lists and layout data.
- 79/88 have `pinAssignments`.
- 75/88 have wire/connection data.
- 65/88 are `simulationMode: "circuit"`.
- 23/88 are `simulationMode: "avr"` and all 23 have Arduino code plus Scratch XML.

The product-quality gap is not "lesson coverage"; it is **book-aligned circuit-scene coverage**. There is no merged `circuit-scene/2` fixture directory in this checkout, no full `apps/studio/sim/elab/`, no `apps/studio/sim/fixtures/`, and no per-experiment verified scene provenance. Studio currently has evidence for a small slice: `v1-cap6-esp1`, `v3-cap5-esp1`, and `v3-cap6-esp2` are mentioned by the Simulation Plugin WIP surface/tests/logs; only three real manual page images are present under `apps/studio/public/elab/manuals/`.

Best next scene starters after `v1-cap6-esp1`: `v1-cap8-esp1`, `v1-cap9-esp1`, `v2-cap7-esp2`, `v3-cap6-esp2`, `v3-cap7-esp1`. They cover button continuity, potentiometer analog behavior, RC transient, Arduino external LED, and Arduino analog threshold while staying close to existing data and validator seams.

## 2. Firsthand counts and commands

Initial coordination commands:

```bash
git fetch origin --prune
git log -1 origin/main --oneline --decorate --stat
git status --short --branch
gh pr list -R AndreaMarro/ardesia --state open --json number,title,headRefName,baseRefName,author,updatedAt --limit 50
```

Observed state:

- `origin/main` = `b3cc021c`.
- Open PRs listed: #1, #2, #4, #5, #6, all older draft/docs/orchestration branches.
- Worktree was already dirty before this audit. Existing modified/untracked files include `README.md`, `apps/studio/src/Room.tsx`, `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`, `apps/studio/public/elab/...`, many `docs/ops/*`, and others. This audit only adds this document.

Files requested but absent in this checkout:

- `docs/ops/PARALLEL-WORK-PACKETS-FABLE-CODEX-2026-07-08.md`
- `docs/product/ELABTUTOR-PLUGIN-SPEC.md`
- `plugins/elab-tutor/src/data/volume-citation.js`
- `apps/studio/src/design/ElabLab.tsx`
- `docs/ops/VISUALMATCH-GRADER-DOSSIER.md`
- `docs/superpowers/plans/`
- `packs/elab-tutor/data/lesson-paths/`
- `apps/studio/sim/fixtures/`
- `apps/studio/sim/elab/`

Core read commands used:

```bash
sed -n '1,240p' AGENTS.md
sed -n '1,260p' '/Users/andreamarro/VOLUME 3/PROMPT-NEXT-FABLE-2026-07-10-NOTTE8.md'
sed -n '1,260p' docs/ELAB-SCENE-FORGE-CANON.md
sed -n '1,280p' docs/product/ELABTUTOR-SIMULATION-PLUGIN-REBUILD-SPEC-2026-07-03.md
sed -n '1,520p' docs/product/ELECTROTECHNICS-SOLVER-PACK.md
sed -n '1,260p' docs/vault/ARDESIA-MAP.md
sed -n '1,260p' plugins/elab-tutor/src/data/volume-references.js
sed -n '1,220p' plugins/elab-tutor/src/services/bookCitation.js
sed -n '1,240p' plugins/elab-tutor/src/data/lesson-paths/v1-cap6-esp1.json
sed -n '1,220p' apps/studio/src/toolhost/simulationBreadboard.ts
sed -n '360,520p' docs/ops/SCHEDULED-ACTIVITY-LOG.md
sed -n '1,280p' plugins/elab-tutor/automa/state/VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md
```

Inventory commands used:

```bash
find plugins/elab-tutor/src/data -maxdepth 2 -type f | sort
find apps/studio/sim -maxdepth 3 -type f
find apps/studio/public/elab -maxdepth 4 -type f | sort
find plugins/elab-tutor/automa/state -maxdepth 2 -type f
find plugins/elab-tutor/docs/superpowers/plans -maxdepth 1 -type f
find . -path '*/fixtures/*' -type f | sort
rg --files apps/studio/src | rg '(__tests__/Elab.*\.test\.(ts|tsx)|__tests__/.*sim.*test\.(ts|tsx)|Simulation|simulation|Elab)'
rg -n "v1-cap6-esp1|v3-cap6-esp2|v3-cap5-esp1|bookLayout|manualSource|circuit-scene|provenance" apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx apps/studio/src/__tests__/ToolCanvasEmbeddable.test.tsx
```

Static counting was done with a read-only Node script that parsed:

- `plugins/elab-tutor/src/data/lesson-paths/*.json`
- `plugins/elab-tutor/src/data/experiments-vol1.js`
- `plugins/elab-tutor/src/data/experiments-vol2.js`
- `plugins/elab-tutor/src/data/experiments-vol3.js`
- `plugins/elab-tutor/src/data/volume-references.js`
- `apps/studio/src`, `apps/studio/sim`, `apps/studio/public/elab`, and fixture paths for references.

Static summary:

| Metric | Count |
|---|---:|
| lesson-path JSON files | 88 |
| experiment records | 88 |
| volume reference keys | 88 |
| Vol.1 rows | 38 |
| Vol.2 rows | 27 |
| Vol.3 rows | 23 |
| lesson-paths with `common_mistakes` | 88 |
| lesson-paths with `build_circuit` | 88 |
| experiment records with components | 88 |
| experiment records with pinAssignments | 79 |
| experiment records with wires/connections | 75 |
| `simulationMode: circuit` | 65 |
| `simulationMode: avr` | 23 |
| AVR experiments with code | 23 |
| AVR experiments with Scratch XML | 23 |
| experiments mentioned by current Studio sim surface/tests | 3 |

No full test run was needed or executed; this is a static audit. No code product file was edited.

## 3. Coverage by volume and chapter

| Volume | Chapter | Experiments | Lesson paths | Citations | Common mistakes | Build circuit | Sim useful | Circuit | AVR | Studio mentions |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 6 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 0 | 1 |
| 1 | 7 | 6 | 6 | 6 | 6 | 6 | 6 | 6 | 0 | 0 |
| 1 | 8 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 0 | 0 |
| 1 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 0 | 0 |
| 1 | 10 | 6 | 6 | 6 | 6 | 6 | 6 | 6 | 0 | 0 |
| 1 | 11 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 0 | 0 |
| 1 | 12 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 0 | 0 |
| 1 | 13 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 0 | 0 |
| 1 | 14 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 0 |
| 2 | 3 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 0 | 0 |
| 2 | 4 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 0 | 0 |
| 2 | 5 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 0 | 0 |
| 2 | 6 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 0 | 0 |
| 2 | 7 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 0 | 0 |
| 2 | 8 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 0 | 0 |
| 2 | 9 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 0 | 0 |
| 2 | 10 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 0 | 0 |
| 2 | 12 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 0 |
| 3 | 5 | 2 | 2 | 2 | 2 | 2 | 2 | 0 | 2 | 1 |
| 3 | 6 | 8 | 8 | 8 | 8 | 8 | 8 | 0 | 8 | 1 |
| 3 | 7 | 7 | 7 | 7 | 7 | 7 | 7 | 0 | 7 | 0 |
| 3 | 8 | 6 | 6 | 6 | 6 | 6 | 6 | 0 | 6 | 0 |

## 4. Per-experiment status table

Legend:

- `LP`, `Cit`, `CM`, `BC`: lesson-path, citation, common mistakes, build_circuit.
- `Sim`: `circuit` or `avr`.
- `C/P/W`: component count, pinAssignment count, wire/connection count from `experiments-vol*.js`.
- `Scene`: `draft-slice` means there is a current Studio WIP/manual evidence mention, not a verified `circuit-scene/2` fixture.
- `Tests/UI`: firsthand Studio mention in current source/tests/logs.

| Experiment | LP | Cit | CM | BC | Modes | Sim | C/P/W | Code | Scene | Tests/UI |
|---|---|---|---|---|---|---|---:|---|---|---|
| v1-cap6-esp1 | Y | Y | Y | Y | 4 | circuit | 4/4/6 | N | draft-slice | ToolCanvasEmbeddable |
| v1-cap6-esp2 | Y | Y | Y | Y | 4 | circuit | 3/2/6 | N | none | none |
| v1-cap6-esp3 | Y | Y | Y | Y | 4 | circuit | 4/4/6 | N | none | none |
| v1-cap7-esp1 | Y | Y | Y | Y | 4 | circuit | 4/6/6 | N | none | none |
| v1-cap7-esp2 | Y | Y | Y | Y | 4 | circuit | 4/6/6 | N | none | none |
| v1-cap7-esp3 | Y | Y | Y | Y | 4 | circuit | 4/6/6 | N | none | none |
| v1-cap7-esp4 | Y | Y | Y | Y | 4 | circuit | 5/8/8 | N | none | none |
| v1-cap7-esp5 | Y | Y | Y | Y | 4 | circuit | 6/10/10 | N | none | none |
| v1-cap7-esp6 | Y | Y | Y | Y | 4 | circuit | 6/10/10 | N | none | none |
| v1-cap8-esp1 | Y | Y | Y | Y | 4 | circuit | 5/6/8 | N | none | none |
| v1-cap8-esp2 | Y | Y | Y | Y | 4 | circuit | 5/6/8 | N | none | none |
| v1-cap8-esp3 | Y | Y | Y | Y | 4 | circuit | 6/10/10 | N | none | none |
| v1-cap8-esp4 | Y | Y | Y | Y | 4 | circuit | 9/16/9 | N | none | none |
| v1-cap8-esp5 | Y | Y | Y | Y | 4 | circuit | 9/16/9 | N | none | none |
| v1-cap9-esp1 | Y | Y | Y | Y | 4 | circuit | 5/7/6 | N | none | none |
| v1-cap9-esp2 | Y | Y | Y | Y | 4 | circuit | 5/7/6 | N | none | none |
| v1-cap9-esp3 | Y | Y | Y | Y | 4 | circuit | 5/7/6 | N | none | none |
| v1-cap9-esp4 | Y | Y | Y | Y | 4 | circuit | 5/9/7 | N | none | none |
| v1-cap9-esp5 | Y | Y | Y | Y | 4 | circuit | 5/9/6 | N | none | none |
| v1-cap9-esp6 | Y | Y | Y | Y | 4 | circuit | 9/19/16 | N | none | none |
| v1-cap9-esp7 | Y | Y | Y | Y | 4 | circuit | 6/11/9 | N | none | none |
| v1-cap9-esp8 | Y | Y | Y | Y | 4 | circuit | 7/14/11 | N | none | none |
| v1-cap9-esp9 | Y | Y | Y | Y | 4 | circuit | 8/16/12 | N | none | none |
| v1-cap10-esp1 | Y | Y | Y | Y | 4 | circuit | 4/4/5 | N | none | none |
| v1-cap10-esp2 | Y | Y | Y | Y | 4 | circuit | 4/4/5 | N | none | none |
| v1-cap10-esp3 | Y | Y | Y | Y | 4 | circuit | 6/10/9 | N | none | none |
| v1-cap10-esp4 | Y | Y | Y | Y | 4 | circuit | 6/8/10 | N | none | none |
| v1-cap10-esp5 | Y | Y | Y | Y | 4 | circuit | 7/11/12 | N | none | none |
| v1-cap10-esp6 | Y | Y | Y | Y | 4 | circuit | 7/10/9 | N | none | none |
| v1-cap11-esp1 | Y | Y | Y | Y | 4 | circuit | 3/2/6 | N | none | none |
| v1-cap11-esp2 | Y | Y | Y | Y | 4 | circuit | 4/2/7 | N | none | none |
| v1-cap12-esp1 | Y | Y | Y | Y | 4 | circuit | 5/6/5 | N | none | none |
| v1-cap12-esp2 | Y | Y | Y | Y | 4 | circuit | 5/6/5 | N | none | none |
| v1-cap12-esp3 | Y | Y | Y | Y | 4 | circuit | 5/8/6 | N | none | none |
| v1-cap12-esp4 | Y | Y | Y | Y | 4 | circuit | 6/11/8 | N | none | none |
| v1-cap13-esp1 | Y | Y | Y | Y | 4 | circuit | 2/2/2 | N | none | none |
| v1-cap13-esp2 | Y | Y | Y | Y | 4 | circuit | 4/6/6 | N | none | none |
| v1-cap14-esp1 | Y | Y | Y | Y | 4 | circuit | 13/27/21 | N | none | none |
| v2-cap3-esp1 | Y | Y | Y | Y | 4 | circuit | 2/0/0 | N | none | none |
| v2-cap3-esp2 | Y | Y | Y | Y | 4 | circuit | 2/0/0 | N | none | none |
| v2-cap3-esp3 | Y | Y | Y | Y | 4 | circuit | 2/0/0 | N | none | none |
| v2-cap3-esp4 | Y | Y | Y | Y | 4 | circuit | 4/2/0 | N | none | none |
| v2-cap4-esp1 | Y | Y | Y | Y | 4 | circuit | 4/4/0 | N | none | none |
| v2-cap4-esp2 | Y | Y | Y | Y | 4 | circuit | 5/6/0 | N | none | none |
| v2-cap4-esp3 | Y | Y | Y | Y | 4 | circuit | 6/6/0 | N | none | none |
| v2-cap5-esp1 | Y | Y | Y | Y | 4 | circuit | 5/0/0 | N | none | none |
| v2-cap5-esp2 | Y | Y | Y | Y | 4 | circuit | 3/0/0 | N | none | none |
| v2-cap6-esp1 | Y | Y | Y | Y | 4 | circuit | 5/6/6 | N | none | none |
| v2-cap6-esp2 | Y | Y | Y | Y | 4 | circuit | 5/6/6 | N | none | none |
| v2-cap6-esp3 | Y | Y | Y | Y | 4 | circuit | 6/8/6 | N | none | none |
| v2-cap6-esp4 | Y | Y | Y | Y | 4 | circuit | 5/4/8 | N | none | none |
| v2-cap7-esp1 | Y | Y | Y | Y | 4 | circuit | 6/6/9 | N | none | none |
| v2-cap7-esp2 | Y | Y | Y | Y | 4 | circuit | 7/8/10 | N | none | none |
| v2-cap7-esp3 | Y | Y | Y | Y | 4 | circuit | 8/12/11 | N | none | none |
| v2-cap7-esp4 | Y | Y | Y | Y | 4 | circuit | 7/8/10 | N | none | none |
| v2-cap8-esp1 | Y | Y | Y | Y | 4 | circuit | 5/7/7 | N | none | none |
| v2-cap8-esp2 | Y | Y | Y | Y | 4 | circuit | 5/7/5 | N | none | none |
| v2-cap8-esp3 | Y | Y | Y | Y | 4 | circuit | 7/10/10 | N | none | none |
| v2-cap9-esp1 | Y | Y | Y | Y | 4 | circuit | 5/4/7 | N | none | none |
| v2-cap9-esp2 | Y | Y | Y | Y | 4 | circuit | 7/17/8 | N | none | none |
| v2-cap10-esp1 | Y | Y | Y | Y | 4 | circuit | 3/2/4 | N | none | none |
| v2-cap10-esp2 | Y | Y | Y | Y | 4 | circuit | 3/2/4 | N | none | none |
| v2-cap10-esp3 | Y | Y | Y | Y | 4 | circuit | 4/2/5 | N | none | none |
| v2-cap10-esp4 | Y | Y | Y | Y | 4 | circuit | 6/6/7 | N | none | none |
| v2-cap12-esp1 | Y | Y | Y | Y | 4 | circuit | 12/18/20 | N | none | none |
| v3-cap5-esp1 | Y | Y | Y | Y | 4 | avr | 2/0/0 | Y | draft-slice | ToolCanvasEmbeddable |
| v3-cap5-esp2 | Y | Y | Y | Y | 4 | avr | 2/0/0 | Y | none | none |
| v3-cap6-esp1 | Y | Y | Y | Y | 4 | avr | 10/16/16 | Y | none | none |
| v3-cap6-esp2 | Y | Y | Y | Y | 4 | avr | 4/4/5 | Y | draft-slice | ToolCanvasEmbeddable |
| v3-cap6-esp3 | Y | Y | Y | Y | 4 | avr | 4/4/5 | Y | none | none |
| v3-cap6-esp4 | Y | Y | Y | Y | 4 | avr | 6/8/8 | Y | none | none |
| v3-cap6-esp5 | Y | Y | Y | Y | 4 | avr | 8/12/11 | Y | none | none |
| v3-cap6-esp6 | Y | Y | Y | Y | 4 | avr | 5/6/7 | Y | none | none |
| v3-cap6-esp7 | Y | Y | Y | Y | 4 | avr | 5/6/7 | Y | none | none |
| v3-cap6-esp8 | Y | Y | Y | Y | 4 | avr | 5/6/7 | Y | none | none |
| v3-cap7-esp1 | Y | Y | Y | Y | 4 | avr | 5/7/8 | Y | none | none |
| v3-cap7-esp2 | Y | Y | Y | Y | 4 | avr | 5/7/8 | Y | none | none |
| v3-cap7-esp3 | Y | Y | Y | Y | 4 | avr | 9/15/14 | Y | none | none |
| v3-cap7-esp4 | Y | Y | Y | Y | 4 | avr | 4/4/5 | Y | none | none |
| v3-cap7-esp5 | Y | Y | Y | Y | 4 | avr | 4/4/5 | Y | none | none |
| v3-cap7-esp6 | Y | Y | Y | Y | 4 | avr | 5/7/8 | Y | none | none |
| v3-cap7-esp7 | Y | Y | Y | Y | 4 | avr | 4/3/7 | Y | none | none |
| v3-cap8-esp1 | Y | Y | Y | Y | 4 | avr | 2/0/0 | Y | none | none |
| v3-cap8-esp2 | Y | Y | Y | Y | 4 | avr | 2/0/0 | Y | none | none |
| v3-cap8-esp3 | Y | Y | Y | Y | 4 | avr | 3/3/5 | Y | none | none |
| v3-cap8-esp4 | Y | Y | Y | Y | 4 | avr | 4/6/8 | Y | none | none |
| v3-cap8-esp5 | Y | Y | Y | Y | 4 | avr | 9/15/14 | Y | none | none |
| v3-cap8-esp6 | Y | Y | Y | Y | 4 | avr | 9/15/14 | Y | none | none |

## 5. Already consumed by ELAB Lab / Simulation Plugin / tests

There is no `apps/studio/src/design/ElabLab.tsx` in this checkout. `apps/studio/src/elab/` exists but is empty.

Studio surfaces/tests found:

- `apps/studio/src/toolhost/simulationBreadboard.ts`: renderer-agnostic ELAB breadboard topology/geometry with 30 columns and 420 addressable points.
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`: current untracked/WIP Simulation Plugin embed. It defines `io.ardesia.simulation-plugin`, `v1-cap6-esp1`, `v3-cap5-esp1`, `v3-cap6-esp2`, and a `bookLayout` guard for `v1-cap6-esp1`.
- `apps/studio/src/__tests__/ToolCanvasEmbeddable.test.tsx`: current untracked/WIP tests assert `v1-cap6-esp1` identity, draft provenance, manual assets, explicit hole layout, drift guards, and breadboard continuity.
- `apps/studio/src/__tests__/ToolReferenceSim*.test.ts`: tests the generic Reference Sim Blink LED ToolHost flow, not ELAB lesson-path coverage.
- `apps/studio/sim/entry.html` and `apps/studio/sim/manifest-source.json`: Reference Sim Blink demo bundle, not ELAB corpus integration.

Manual assets currently present:

- `apps/studio/public/elab/manuals/vol1/page-030-esercizio-6-1.png`
- `apps/studio/public/elab/manuals/vol1/page-031-esercizio-6-1.png`
- `apps/studio/public/elab/manuals/vol3/page-051-esercizio-6-2.png`

Historical fixture evidence:

- `plugins/elab-tutor/tests/fixtures/circuits/README.md` says the 20 `circuits/*.png` were deterministic placeholder stripe PNGs with metadata, not real screenshots.
- `plugins/elab-tutor/tests/fixtures/screenshots/INDEX.md` says 20 real prod screenshots were later captured for selected lesson-path IDs, but these are ELABTutor prod fixture screenshots, not ARDESIA `circuit-scene/2` fixtures.

## 6. Circuit-scene/2 fixture status

Current checkout status:

- `apps/studio/sim/fixtures/`: absent.
- `apps/studio/sim/elab/`: absent.
- `docs/ops/VISUALMATCH-GRADER-DOSSIER.md`: absent.
- `circuit-scene/2` schema is documented as canon but not present as a merged fixture set in this checkout.

Status by category:

| Category | Count | Evidence |
|---|---:|---|
| Real `circuit-scene/2` verified fixtures | 0 | No fixture directory found; Scene Forge canon says provenance baseline is 0/88. |
| Candidate/draft Studio slices | 3 mentioned, 1 default detailed | `ToolCanvasEmbeddable.tsx` mentions `v1-cap6-esp1`, `v3-cap5-esp1`, `v3-cap6-esp2`; `bookLayout.status` is draft. |
| Real manual page images in Studio | 3 files | Two Vol.1 pages for `v1-cap6-esp1`, one Vol.3 page for `v3-cap6-esp2`. |
| Synthetic/placeholder vision fixtures | 20 old placeholders | `plugins/elab-tutor/tests/fixtures/circuits/README.md`. |
| Real captured simulator screenshots | 20 old prod captures | `plugins/elab-tutor/tests/fixtures/screenshots/INDEX.md`; useful for vision smoke, not scene provenance. |

## 7. Known corpus bugs and tracking

Known/tracked issues:

1. **Wire path gap**: `ELAB-SCENE-FORGE-CANON.md` states that current data stores topological connections but not persisted wire paths. This blocks "same bent wires as the book" claims.
2. **0/88 scene provenance**: same canon states no experiment has verified scene provenance and only 3/88 book photos/manual images were available as baseline.
3. **Three geometric pin collision bugs**: same canon records two pins in `bb1:c21` for `v3-cap7-esp3`, `v3-cap8-esp5`, `v3-cap8-esp6`, reported-not-patched in `automa/graph/scene-geometry-report.json @9beb6db9`.
4. **Source drift for `v1-cap6-esp1`**: `docs/ops/SCHEDULED-ACTIVITY-LOG.md` records `experiments-vol1.js` as rail-heavy while `lesson-paths/v1-cap6-esp1.json` is explicit-hole and closer to the real manual figure.
5. **UNLIM prompt drift**: the same log notes a few-shot example mentioning Arduino/D13 for Vol.1 cap.6 esp.1, incompatible with Volume 1 battery-only experiments.
6. **Book-identical status remains draft**: logs state `bookLayout.status` cannot become verified until reviewed crop/coordinate packets exist.
7. **Mobile readability**: logs record the embeddable renders on mobile but needs zoom/detail mode for true readability.
8. **Historical Vol3 audit confusion**: `VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md` corrects an older audit that treated outdated Tea Glossario Vol3 as 12 chapters. Current checkout already has 23 Vol3 lesson-paths and includes `v3-cap8-esp6`.

## 8. Top 10 gaps

1. **No verified `circuit-scene/2` fixture set**. Lesson-paths are complete, but scene provenance is not.
2. **No persisted wire paths**. Connections exist; book-identical wire bends do not.
3. **Only three Studio manual page images** for 88 experiments.
4. **No `apps/studio/sim/elab` or `apps/studio/sim/fixtures` implementation** in current checkout.
5. **Simulation Plugin integration is a hand-authored WIP slice**, not an adapter over the full ELABTutor corpus.
6. **Tests cover the slice and Reference Sim, not the 88 experiment corpus**.
7. **13 experiments lack wires/connections** in `experiments-vol*.js`; some are measurement/setup experiments where this may be intentional, but it needs explicit scene policy.
8. **9 experiments lack pinAssignments**; again partly intentional for multimeter/battery/Blink-only cases, but not yet modeled as scene tiers.
9. **BookCitation runtime does not append citations automatically**. This may be deliberate, but exact page anchoring must happen elsewhere for lesson mode.
10. **Known geometric collision bugs remain documented but not fixed** in the source corpus.

## 9. Recommended next 5 hand-authored scene starters

1. `v1-cap8-esp1` - button plus LED. It is the smallest new topology after first LED and exercises open/closed contact validation.
2. `v1-cap9-esp1` - potentiometer dimmer. It introduces a three-pin analog component while staying in battery-only Vol.1.
3. `v2-cap7-esp2` - capacitor discharge visible on LED. It gives the first RC/transient scene and forces the validator to represent time, not just continuity.
4. `v3-cap6-esp2` - external LED on Arduino pin 13. It already has one real manual page image in Studio and bridges AVR code to physical wiring.
5. `v3-cap7-esp1` - trimmer threshold controls LED. It combines analog input, Arduino code, threshold logic, and a still manageable component count.

Rationale: this set spans the minimum didactic and technical axes needed for a durable Scene Forge loop: simple continuity, mechanical switch, variable resistance, transient storage, digital output, and analog input. It also avoids starting with capstones where every missing primitive becomes ambiguous.

## 10. Parallel Codex tasks safe from FABLE ToolHost security work

Do not touch ToolHost security/installer/router/policy/caps files while FABLE works there. Safe docs-only or corpus-read-only tasks:

| Task | File ownership | Suggested verification |
|---|---|---|
| Write per-experiment scene-readiness matrix | `docs/ops/*ELAB*COVERAGE*` only | `git diff --check`; no tests needed |
| Extract manual-image backlog | `docs/ops/*MANUAL-ASSET-BACKLOG*` only | `find apps/studio/public/elab -type f`; no source edits |
| Draft `circuit-scene/2` fixture acceptance checklist | `docs/ops/*SCENE-FIXTURE-CHECKLIST*` only | Compare against `ELAB-SCENE-FORGE-CANON.md` |
| Audit no-pin/no-wire experiments for intentionality | docs-only, read `plugins/elab-tutor/src/data/*` | Node read-only counts; no corpus edits |
| Draft starter-scene test plan | docs-only | reference current WIP tests without editing them |
| Audit book citation behavior | docs-only, read `bookCitation.js` and `volume-references.js` | static inspection |

Avoid:

- `apps/studio/src/toolhost/installer.ts`
- `apps/studio/src/toolhost/toolLab.ts`
- `apps/studio/src/toolhost/marketplace/localCatalog.ts`
- `apps/studio/src/toolhost-protocol/messages.ts`
- `apps/studio/src/toolhost/router.ts`
- `apps/studio/src/toolhost/policy.ts`
- `apps/studio/src/toolhost/host.ts`
- `apps/studio/src/toolhost/caps/*`
- ToolHost security/installer/localCatalog tests
- raw corpus rewrites

## 11. Corpus and book-in-hand risks

- The corpus is complete numerically, but complete JSON is not equal to book-identical physical scene.
- `build_circuit` appears in all lesson-paths, but its topology can drift from `experiments-vol*.js`, as already seen for `v1-cap6-esp1`.
- Citations exist in `volume-references.js`, but runtime citation policy is conservative and does not guarantee visible page anchors.
- Measurement experiments without wires/pins need an explicit tier (`measurement-only`, `manual-only`, `scene-simulable`) or they will look like incomplete data.
- Old audit documents can be stale. The V2 ground-truth doc corrected Vol3 assumptions, and current checkout has already moved to 88 canonical files.
- Manual crops cannot be inferred safely from full-page images; promotion to verified needs crop coordinates, human review, and validator output.

## 12. COV and limits

What this audit proves:

- The current checkout has 88 first-party ELAB lesson-paths, experiment records, and volume references.
- The static lesson-path coverage is broad and internally regular.
- Studio/Simulation Plugin coverage is narrow and slice-based.
- Verified `circuit-scene/2` fixture coverage is effectively zero in the current tree.

What this audit does not prove:

- It did not run full vitest/build.
- It did not validate electrical correctness of all 88 circuits.
- It did not compare manual PDFs visually against rendered scenes.
- It did not inspect secrets or `.env`.
- It did not modify raw corpus, ToolHost security code, or product source.

HANDOFF CODEX PKT-CODEX-1

Next concrete steps:

1. Freeze a docs-only scene-readiness rubric with tiers: `complete-static`, `scene-candidate`, `book-crop-present`, `verified`.
2. Hand-author `v1-cap8-esp1` and `v1-cap9-esp1` as the next two starter scene candidates after `v1-cap6-esp1`, using explicit hole coordinates and persisted wire paths.
3. Create a manual-asset backlog for the five starter scenes before any CV forge work, with page image, crop box, source hash, and human review owner.
