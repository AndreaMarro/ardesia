# Codex Prompt 3 — ELAB Tutor: Volume 3 Experiment Overhaul

> **RUN ORDER.** Run this AFTER Prompt 0 has been merged. This prompt runs in PARALLEL with
> Prompt 1 (Volume 1) and Prompt 2 (Volume 2) — each on its own clone/branch. The three
> prompts touch strictly disjoint files, so the three branches merge cleanly.
>
> This is the largest of the three volume prompts: Volume 3 is incomplete (14 of 23
> experiments) and must be grown to full alignment with the printed manual.
>
> Paste everything below (from `<task>` to the end) into Codex.

---

<task>
You are working in the ELAB Tutor repository: an educational electronics-and-Arduino tutor
for children aged 8–14 (React 19 + Vite 7, custom hash routing, Vitest). This prompt covers
VOLUME 3 only — the Arduino programming volume.

Your job: bring Volume 3 to full alignment with the printed Volume 3 manual (23 experiments),
by fixing the 14 experiments that exist and CREATING the ~9 that are missing; and make every
Volume 3 experiment have a flawless Passo Passo, a complete Percorso, correct PRINCIPIO ZERO
language, morphic-ready lesson-path data, and correct placement in the continuous narrative
arc.

Expected end state: Volume 3 contains exactly the 23 canonical printed experiments, each
present and consistent across its three data representations, correct against the printed
manual, fully chained; the Vitest suite passes at or above baseline; `npm run build` passes.
</task>

<context>
ELAB ships as a unified product: a physical kit + three printed manuals + this software. The
"MORFISMO" rule requires the software to mirror the printed book exactly: same experiments,
same chapter order, same numbering, same wording. The software must NOT contain experiments
that are not in the printed book.

Andrea (product owner), guiding principle, verbatim:
"Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate.
Ogni esperimento del software deve agganciarsi al precedente e al successivo nella stessa
sequenza del libro stampato."

Andrea's additional requirement: every experiment must have a Passo Passo (step-by-step) done
perfectly and written in the correct language; and a Percorso that exists and can become
"morphic" (adapt at runtime to the class/teacher/previous sessions).

"PRINCIPIO ZERO" — pedagogical language rule, mandatory for all teacher-facing text:
- Address the class in the plural: "Ragazzi, ...". Never the singular imperative.
- The text guides the TEACHER on what to do and say; it never commands the teacher.
- Cite the volume and page verbatim where the lesson-path does so.

Each experiment exists in THREE data representations:
1. `src/data/experiments-vol3.js` — simulator circuit + Arduino data (components, connections,
   layout, buildSteps, embedded Blockly/Scratch XML, code/HEX, `simulationMode: "avr"`).
2. `src/data/lesson-paths/v3-*.json` — the pedagogical lesson path. Canonical structural
   template: `src/data/lesson-paths/v1-cap6-esp1.json` (marked "TEMPLATE PERFETTO") — 5 phases
   (PREPARA, MOSTRA, CHIEDI, OSSERVA, CONCLUDI), `next_experiment {id, title, preview}`,
   `vocabulary {allowed, forbidden}`, `prerequisites`, `difficulty`, `target_age`,
   `common_mistakes`, `analogies`, `session_save`, `modes_supported`. The MOSTRA phase carries
   the `build_circuit` step-by-step (= Passo Passo). Match this structure (the circuit differs
   — Volume 3 is Arduino — but the phase structure is identical).
3. `src/data/lesson-groups.js` — the "Lezioni" grouping (VOLUME 3 section only).

MORPHIC-READY lesson-paths: the morphic Percorso engine (Prompt 0 implements it per ADR-046 /
ADR-019) adapts a lesson at runtime by reading the lesson-path's structured fields and the
printed-manual content. For a lesson-path to be morphic-ready your data must give it a solid,
complete base to adapt: correct `experiment_id`, chapter and Vol/pag metadata; a complete
high-quality static Percorso; and every adaptation-relevant field populated (`vocabulary`,
`difficulty`, `target_age`, `common_mistakes`, `analogies`). You do NOT implement the morphic
engine — you make the data it consumes complete and correct.

Source of truth for content = the printed Volume 3 manual. In the repo:
- `docs/volumi-originali/VOLUME-3-TESTO.txt` (extracted printed text — primary reference).
- `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md` (prior alignment audit).
- `src/data/vol3-blink-canonical-sketch.txt` (canonical Blink sketch reference).
</context>

<scope_and_file_ownership>
YOU MAY EDIT (Volume 3 only):
- `src/data/experiments-vol3.js`
- `src/data/lesson-paths/v3-*.json` (create the missing ones)
- `src/data/lesson-groups.js` — ONLY the section after the `VOLUME 3` banner comment.
- `src/data/volume-references.js` — ONLY Volume 3 entries.
- `src/data/narrative-map-94.json` — ONLY the Volume 3 portion.
- `src/data/cliffhanger-table.json` — currently holds Volume 3 cliffhangers; you own it.
- `tests/**` — add or update tests for Volume 3. Volume 3's experiment count changes (14→23),
  so you WILL update tests that hardcode a Volume 3 count or a cross-volume total. You are the
  only volume prompt that touches shared multi-volume count tests.

YOU MUST NOT EDIT:
- `experiments-vol1.js`, `experiments-vol2.js`, any `v1-*` / `v2-*` lesson-path.
- The Volume 1 / Volume 2 sections of `lesson-groups.js`, `volume-references.js`,
  `narrative-map-94.json`.
- `src/data/experiments-index.js` (pure aggregator — adapts automatically).
- `src/App.jsx`, `src/components/**`, `src/services/**` — shared code, fixed by Prompt 0.
- `src/data/standard-experiment-schema.json` — leave as-is; match the existing 5-phase
  lesson-path structure.

If a fix appears to need a file outside Volume 3 ownership, STOP and report it.
</scope_and_file_ownership>

<canonical_reference>
The printed Volume 3 ("Programmazione Arduino") has 9 chapters. Chapters 1–4 are theory; the
closing Chapter 9 has no experiments. Volume 3 labels its experiments "ESERCIZIO".

The 23 canonical experiments, in printed-book narrative order:
- Cap.5 "Il nostro primo programma (Blink)"      — ESERCIZIO 5-1, 5-2       (2)
- Cap.6 "Il mondo discreto: i pin digitali"      — ESERCIZIO 6-1 … 6-7      (8)
- Cap.7 "Il mondo continuo: i pin analogici"     — ESERCIZIO 7-1 … 7-7      (7)
- Cap.8 "Visualizzare dati: il Monitor Seriale"  — ESERCIZIO 8-1 … 8-6      (6)
TOTAL = 23. ID scheme: `v3-cap{N}-esp{M}`, M in printed ESERCIZIO order. All Volume 3
experiments use `simulationMode: "avr"`.

EDITORIAL BUGS IN THE PRINTED BOOK — resolve into a clean software sequence, do NOT replicate:
- Cap.6: ESERCIZIO "6.4" is printed twice (two distinct exercises). Cap.6 therefore has 8
  distinct exercises → assign clean sequential IDs `v3-cap6-esp1 … v3-cap6-esp8`.
- Cap.7: the printed text references a "Sketch_Capitolo_7.8" but no ESERCIZIO 7.8 marker
  exists. Cap.7 has 7 distinct exercises → `v3-cap7-esp1 … v3-cap7-esp7`.
- A buggy old PDF (V0.8.1) showed phantom chapters 10–12 — those do NOT exist. Ignore them.
</canonical_reference>

<current_state>
Verified by direct inspection of the live repo on 2026-05-21. Required-work item 1 re-confirms
this against the live files; if anything differs, the live files win.

- `experiments-vol3.js` contains EXACTLY 14 experiments, with these IDs:
  `v3-cap5-esp1`, `v3-cap5-esp2`, `v3-cap6-esp1`, `v3-cap6-esp2`, `v3-cap6-esp4`,
  `v3-cap6-morse`, `v3-cap6-semaforo`, `v3-cap7-esp1`, `v3-cap7-esp2`, `v3-cap7-esp3`,
  `v3-cap7-esp6`, `v3-cap8-esp1`, `v3-cap8-esp2`, `v3-cap8-esp3`.
  (The file's HEADER COMMENT says "26 esperimenti … Extra 3" — that comment is STALE and
  wrong. Ignore it. The live array has 14.)
- `lesson-paths/v3-*.json` contains exactly the same 14 IDs — `experiments-vol3.js` and the
  lesson-paths are consistent at 14.
- There are NO non-canonical "extra" experiments in the live code (`v3-extra-*`, `cap7-mini`,
  `cap8-serial` — all already removed, zero references in `src/`). Nothing to remove.
- `narrative-map-94.json` and `cliffhanger-table.json` still reference roughly 27 Volume 3
  IDs — i.e. they reference experiments that do NOT exist in the registry. These are dangling
  references that must be reconciled to exactly the 23 canonical experiments.

NET: Volume 3 has 14 experiments and the printed manual has 23 → this is a GROW task. You
must CREATE the ~9 missing canonical experiments; you do not remove anything. Per-chapter:
Cap.5 has 2/2; Cap.6 has 5 entries for 8 canonical slots (plus alias IDs `morse`/`semaforo`
and a numbering gap — esp3 absent); Cap.7 has 4 for 7 (gap — esp4/esp5 absent, esp6 present);
Cap.8 has 3 for 6 (missing esp4, esp5, and esp6 "Barra progressiva LED").

NOTE: prior project documentation once described the 14 as an intentional subset. The product
owner has now decided, for this task, to align Volume 3 fully to the printed manual = 23.
Restore the missing experiments accordingly.
</current_state>

<required_work>
1. AUDIT. From `docs/volumi-originali/VOLUME-3-TESTO.txt`, list the 23 canonical experiments
   (chapter, ESERCIZIO number, title, page). Cross-check against the live `experiments-vol3.js`,
   `v3-*.json` lesson-paths, and the `lesson-groups.js` Volume 3 section. Produce a table:
   each canonical experiment → present / partial / missing in each representation.
   Verify: the table has exactly 23 rows; it identifies the ~9 to create and the alias/gap
   mapping for Cap.6 and Cap.7.

2. FIX THE 14 EXISTING EXPERIMENTS. In `experiments-vol3.js`: correct components, connections,
   layout, `buildSteps`, Arduino code / Blockly XML / HEX (use `vol3-blink-canonical-sketch.txt`
   for Blink). Resolve known mismatches: any wrong `chapter` field; any title-vs-content
   mismatch (e.g. a Cap.6 experiment whose prompt describes "semaforo" while its title says
   "effetto polizia" — make title, prompt and content agree with the printed exercise);
   confirm `simulationMode: "avr"`.
   Verify: each of the 14 loads via `api.mountExperiment` with its full component set.

3. RENUMBER TO CLEAN CANONICAL IDs. Map the alias IDs (`v3-cap6-morse`, `v3-cap6-semaforo`) to
   their canonical `v3-cap6-esp{M}` positions in printed ESERCIZIO order, and close the
   numbering gaps so Cap.6 is `esp1…esp8`, Cap.7 is `esp1…esp7`, Cap.8 is `esp1…esp6`. Decide
   each alias's canonical number from `VOLUME-3-TESTO.txt`, not from the current name. Update
   every reference to a renamed ID across all Volume 3 files you own.
   Verify: all 23 IDs match `v3-cap{N}-esp{M}` and are sequential per chapter.

4. CREATE THE ~9 MISSING CANONICAL EXPERIMENTS. For each missing ESERCIZIO add a complete
   entry to `experiments-vol3.js` and a complete `v3-*.json` lesson-path, faithful to the
   printed exercise — including ESERCIZIO 8-6 "Barra progressiva LED". Each new experiment
   must be a real, working Arduino circuit with correct code.
   Verify: `experiments-vol3.js` has exactly 23 experiments; each new one loads and runs.

5. PERFECT PASSO PASSO. Every one of the 23 experiments must have a flawless step-by-step:
   correct, ordered `buildSteps` and the MOSTRA-phase `build_circuit` intent, each step
   written in PRINCIPIO ZERO language (plural "Ragazzi", no singular imperative).
   Verify: stepping through any experiment's Passo Passo builds the correct circuit.

6. COMPLETE PERCORSO + MORPHIC-READY. Every one of the 23 has a `v3-*.json` lesson-path
   matching the canonical 5-phase template, with ALL fields populated: `vocabulary`,
   `difficulty`, `target_age`, `common_mistakes`, `analogies`, correct `experiment_id` and
   Vol/pag metadata — so the morphic Percorso engine can adapt it. Fix language to PRINCIPIO
   ZERO throughout: plural "Ragazzi", no singular imperative, verbatim Vol/pag citations.
   Verify: 23 `v3-*.json` files exist, all validating against the template structure.

7. NARRATIVE ARC. Make Volume 3 one continuous chain in printed-book order: every lesson-path
   `next_experiment.id` points to the next experiment (`v3-cap5-esp1` → … → `v3-cap8-esp6`),
   with accurate cliffhanger titles/previews; the final experiment has `next_experiment` null.
   Reconcile `cliffhanger-table.json` and the Volume 3 part of `narrative-map-94.json` to
   exactly the 23 canonical IDs — remove every dangling reference. In `lesson-groups.js`
   (Volume 3 section), every lesson's `experiments` array lists IDs in book order and the
   union covers all 23.
   Verify: following `next_experiment` from `v3-cap5-esp1` reaches all 23 with no gap, loop,
   or dead end; no dangling IDs remain in any Volume 3 file.

8. CONSISTENCY. `experiments-vol3.js`, the `v3-*.json` lesson-paths, the `lesson-groups.js`
   Volume 3 section, `cliffhanger-table.json`, `narrative-map-94.json` (Volume 3 part) and
   `volume-references.js` (Volume 3 part) must all agree on the same 23 IDs, chapters, order.
   Verify: a single ID set of size 23 appears identically in every representation.
</required_work>

<grounding_rules>
Ground every content and structural decision in `docs/volumi-originali/VOLUME-3-TESTO.txt` or
the alignment ground-truth doc. Resolve the known printed editorial bugs (duplicate ESERCIZIO
6.4, missing 7.8 marker) into a clean sequence as specified in <canonical_reference>; do not
replicate them. When deciding an alias's canonical number, the printed text is the only
authority — not the current filename. Do not present inferences as facts; do not invent
Arduino exercises that are not in the printed manual.
</grounding_rules>

<completeness_contract>
Resolve all 23 canonical Volume 3 experiments: fix the 14, create the ~9, renumber, complete
every Passo Passo and Percorso, chain the narrative arc. Do not stop after creating the
experiments — each must also have a complete lesson-path and be wired into the arc. After any
ID rename or creation, re-check that lesson-paths, lesson-groups, cliffhangers, narrative-map,
volume-references and tests all still agree.
</completeness_contract>

<verification_loop>
ELAB anti-regression rules (strict, non-negotiable):
- Run `npx vitest run` BEFORE changes to record the baseline and AFTER. Growing Volume 3 from
  14 to 23 WILL change tests that hardcode Volume 3 counts or the cross-volume total — update
  those tests to the correct canonical numbers (Volume 3 = 23; total across volumes = 88) and
  ensure the suite still passes at or above baseline. A net drop in passing tests that is not
  a deliberate, explained count correction is a regression — revise it.
- Run `npx vitest run` 3 times before declaring the suite green.
- `npm run build` must pass.
- NEVER use `--no-verify`. NEVER push to `main`. Work on a feature branch.
Before finalizing, re-read your diff and confirm every changed line traces to a Volume 3
reconciliation, fix, or new experiment.
</verification_loop>

<action_safety>
Edit only the Volume 3 files listed in your ownership. No unrelated refactors. This prompt
runs in parallel with the Volume 1 and Volume 2 prompts — do not touch their files or the
Volume 1 / Volume 2 sections of the shared sectioned files. New experiments must be genuine
and book-faithful, not filler — a wrong or invented experiment is worse than a flagged gap.
</action_safety>

<missing_context_gating>
Do not guess. If you cannot determine from `VOLUME-3-TESTO.txt` what a missing ESERCIZIO's
circuit or code should be, or how an alias maps to a printed exercise, do not invent it.
State precisely what is unknown, implement the most faithful reading you can support, and flag
it in your final report. It is better to report an unresolved experiment than to ship an
invented one.
</missing_context_gating>

<output_contract>
Return, in this order and nothing else:
1. The audit table: 23 canonical experiments × 3 representations (present/partial/missing).
2. Files changed (path + one-line reason each); new lesson-path files created.
3. The 14 existing experiments: fixes applied (mismatches, circuit, code).
4. Renumbering: how each alias and numbering gap was mapped to a canonical ID.
5. The ~9 created experiments: id, title, printed ESERCIZIO source for each.
6. Passo Passo + Percorso: confirmation all 23 have a complete, language-correct version.
7. Narrative-arc verification: the chain `v3-cap5-esp1` → `v3-cap8-esp6`; dangling refs removed.
8. Vitest passing count before/after, with the count correction explained; build pass/fail.
9. Any experiment left unresolved against the printed manual, and why.
</output_contract>
