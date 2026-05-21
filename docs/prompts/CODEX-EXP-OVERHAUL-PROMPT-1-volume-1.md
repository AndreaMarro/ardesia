# Codex Prompt 1 — ELAB Tutor: Volume 1 Experiment Overhaul

> **RUN ORDER.** Run this AFTER Prompt 0 has been merged. This prompt runs in PARALLEL with
> Prompt 2 (Volume 2) and Prompt 3 (Volume 3) — each on its own clone/branch. The three
> prompts touch strictly disjoint files, so the three branches merge cleanly.
>
> Paste everything below (from `<task>` to the end) into Codex.

---

<task>
You are working in the ELAB Tutor repository: an educational electronics tutor for children
aged 8–14 (React 19 + Vite 7, custom hash routing, Vitest). This prompt covers VOLUME 1 only.

Your job: bring every Volume 1 experiment into full alignment with the printed Volume 1
manual; fix every broken / partial / incorrect Volume 1 experiment; give every experiment a
flawless Passo Passo and a complete, morphic-ready Percorso written in correct PRINCIPIO ZERO
language; and enforce the continuous narrative arc across all of Volume 1.

Expected end state: all 38 Volume 1 experiments are present, internally consistent across
their three data representations, correct against the printed manual, each with a perfect
Passo Passo and Percorso, and chained as one continuous narrative arc; the Vitest suite passes
at or above baseline; `npm run build` passes.
</task>

<context>
ELAB ships as a unified product: a physical kit + three printed manuals + this software. The
"MORFISMO" rule requires the software to mirror the printed book exactly: same experiments,
same chapter order, same page numbers, same wording.

Andrea (product owner), guiding principle, verbatim:
"Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate.
Ogni esperimento del software deve agganciarsi al precedente e al successivo nella stessa
sequenza del libro stampato." — experiments form ONE continuous narrative arc; each links to
the previous and next in printed-book order.

Andrea's additional requirement for this overhaul: every experiment must have a Passo Passo
(step-by-step) done PERFECTLY and written in the correct language; and a Percorso that exists
and can become "morphic" (adapt at runtime to the class/teacher/previous sessions).

"PRINCIPIO ZERO" — pedagogical language rule, mandatory for all teacher-facing text:
- Address the class in the plural: "Ragazzi, ...". Never the singular imperative
  ("Premi" → "Premete" / "Premiamo"; "collega" → "collegate"; "fai" → "fate").
- The text guides the TEACHER on what to do and say; it never commands the teacher.
- Cite the volume and page verbatim where the lesson-path does so (e.g. "Vol.1 pag.27").

Each experiment exists in THREE data representations:
1. `src/data/experiments-vol1.js` — the simulator circuit (components, pinAssignments,
   connections, layout, steps, buildSteps, unlimPrompt, simulationMode).
2. `src/data/lesson-paths/v1-*.json` — the pedagogical lesson path. Structural template:
   `src/data/lesson-paths/v1-cap6-esp1.json` is explicitly marked the "TEMPLATE PERFETTO" —
   match its structure exactly: 5 phases (PREPARA, MOSTRA, CHIEDI, OSSERVA, CONCLUDI),
   `next_experiment {id, title, preview}`, `vocabulary {allowed, forbidden}`, `prerequisites`,
   `difficulty`, `target_age`, `common_mistakes`, `analogies`, `session_save`,
   `modes_supported`. The MOSTRA phase carries the `build_circuit` step-by-step (= Passo Passo).
3. `src/data/lesson-groups.js` — the "Lezioni" grouping (VOLUME 1 section only).

These three MUST stay consistent: same experiment IDs, same chapter assignment, same ordering.

MORPHIC-READY lesson-paths: the morphic Percorso engine (implemented by Prompt 0 per ADR-046 /
ADR-019) adapts a lesson at runtime to the class, teacher and previous sessions, by reading
the lesson-path's structured fields and the printed-manual content. For a lesson-path to be
morphic-ready, your data must give it a solid, complete base to adapt: correct
`experiment_id`, chapter and Vol/pag metadata; a complete, high-quality static Percorso; and
every adaptation-relevant field populated (`vocabulary`, `difficulty`, `target_age`,
`common_mistakes`, `analogies`). You do NOT implement the morphic engine — you make the data
it consumes complete and correct.

Source of truth for content = the printed Volume 1 manual. In the repo:
- `docs/volumi-originali/VOLUME-1-TESTO.txt` (extracted printed text — primary reference).
- `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md` (prior alignment audit).
</context>

<scope_and_file_ownership>
YOU MAY EDIT (Volume 1 only):
- `src/data/experiments-vol1.js`
- `src/data/lesson-paths/v1-*.json` (all 38 Volume 1 lesson-path files; create any missing one)
- `src/data/lesson-groups.js` — ONLY the section between the `VOLUME 1` banner comment and the
  `VOLUME 2` banner comment.
- `src/data/volume-references.js` — ONLY Volume 1 entries.
- `src/data/narrative-map-94.json` — ONLY the Volume 1 portion.
- `tests/**` — you MAY add NEW test files specific to Volume 1. Do NOT edit a shared
  multi-volume test file (e.g. one carrying a total-experiment-count or cross-volume
  assertion); if one needs updating, report it instead. Volume 1's experiment count does not
  change (38), so this should not arise.

YOU MUST NOT EDIT:
- `experiments-vol2.js`, `experiments-vol3.js`, any `v2-*` / `v3-*` lesson-path.
- The Volume 2 / Volume 3 sections of `lesson-groups.js`, `volume-references.js`,
  `narrative-map-94.json`.
- `src/data/experiments-index.js` (pure aggregator — adapts automatically).
- `src/App.jsx`, `src/components/**`, `src/services/**` — shared code, already fixed by Prompt 0.
- `src/data/standard-experiment-schema.json` — leave as-is; match the existing 5-phase
  lesson-path structure, do NOT migrate to this schema.

If a fix appears to need a file outside Volume 1 ownership, STOP and report it.
</scope_and_file_ownership>

<canonical_reference>
The printed Volume 1 ("Le Basi") has 14 chapters. Chapters 1–5 are theory (no experiments).
The 38 experiments, in printed-book narrative order:
- Cap.6  "Cos'è il diodo LED?"               — Esp.1, 2, 3            (3)
- Cap.7  "Cos'è il LED RGB?"                 — Esp.1–6                (6)
- Cap.8  "Cos'è un pulsante?"                — Esp.1–5                (5)
- Cap.9  "Cos'è un potenziometro?"           — Esp.1–9                (9)
- Cap.10 "Cos'è un fotoresistore?"           — Esp.1–6                (6)
- Cap.11 "Cos'è un cicalino?"                — Esp.1, 2               (2)
- Cap.12 "L'interruttore magnetico"          — Esp.1–4                (4)
- Cap.13 "Cos'è l'elettropongo?"             — Esp.1, 2               (2)
- Cap.14 "Costruiamo il nostro primo robot"  — capstone project      (1)
TOTAL = 38. Experiment IDs follow the pattern `v1-cap{N}-esp{M}`. A live count on 2026-05-21
confirmed `experiments-vol1.js` currently has 38 experiments.

All Volume 1 experiments use `simulationMode: "circuit"` (battery 9V, NO Arduino).
</canonical_reference>

<known_defects>
This block was compiled from repo audits dated late April–mid May 2026. Treat the specific
defects as a starting hypothesis — required-work item 1 (AUDIT) re-confirms each against the
live `experiments-vol1.js`; some may already be fixed; if the live file differs, it wins.

Reported genuine data defects (all in `experiments-vol1.js`):
1. `v1-cap10-esp1` "La fotoresistenza sente la luce" — component-count inconsistency
   (5 declared vs 4 at runtime). IMPORTANT: the printed manual (Vol.1 ~p.82) states the
   fotoresistore experiment needs NO series resistor, yet the data includes `r1` (220Ω).
   Resolve to match the BOOK — make the component set internally consistent with what the
   printed experiment actually requires. Do not blindly "add the missing resistor".
2. `v1-cap10-esp2` — same class of inconsistency; resolve against the book.
3. `v1-cap10-esp3` "3 LDR controllano RGB" — component-count inconsistency (9 declared vs 6);
   resolve against the book.
4. `v1-cap9-esp4` "Dimmer RGB azzurrino" — one component short (6 vs 5).
5. `v1-cap9-esp5` "Pot miscelatore blu rosso" — one component short (6 vs 5).
6. `v1-cap9-esp9` "Sfida: aggiungi pulsante all'esp 8" — wrong component set (missing `led`,
   2 extra components). Correct the component set against the book.
7. `v1-cap6-esp1` — the resistor is declared without explicit `from`/`to` pin endpoints, so it
   can be snapped wrong. Add explicit pin endpoints. (Prompt 0 also hardens the engine.)

Audit every Volume 1 experiment yourself against the printed manual — the list above is the
reported minimum, not necessarily exhaustive and not necessarily all still present.
</known_defects>

<required_work>
1. AUDIT. For each of the 38 Volume 1 experiments, compare `experiments-vol1.js` against
   `docs/volumi-originali/VOLUME-1-TESTO.txt`: components, quantities, values, wiring, printed
   step description. Produce a defect list before changing anything.
   Verify: the list covers all 38 and re-checks the 7 reported defects.

2. FIX CIRCUIT DATA. In `experiments-vol1.js`, correct components, `pinAssignments`,
   `connections`, `layout`, `steps`, and `buildSteps` so each experiment is electrically
   correct and matches the printed manual. Resolve every confirmed defect.
   Verify: component counts internally consistent; each circuit is a valid closed circuit.

3. ELETTROPONGO (Cap.13). `v1-cap13-esp1` and `v1-cap13-esp2` (conductive modelling dough —
   squishy circuits) already exist. The product owner specifically wants this to be a
   genuinely good experience. Make both fully correct, complete and engaging, faithful to the
   printed Cap.13 (recipe + LED-in-dough). Priority item.
   Verify: both elettropongo experiments load, build, and behave correctly.

4. PERFECT PASSO PASSO. Every one of the 38 experiments must have a flawless step-by-step:
   correct, ordered `buildSteps` and the MOSTRA-phase `build_circuit` intent, each step
   written in PRINCIPIO ZERO language (plural "Ragazzi", no singular imperative).
   Verify: stepping through any experiment's Passo Passo builds the correct circuit.

5. COMPLETE PERCORSO + MORPHIC-READY. Every one of the 38 experiments must have a `v1-*.json`
   lesson-path matching the `v1-cap6-esp1.json` template, with ALL fields populated
   (`vocabulary`, `difficulty`, `target_age`, `common_mistakes`, `analogies`, correct
   `experiment_id` and Vol/pag metadata) so the morphic Percorso engine can adapt it. Create
   any missing lesson-path; complete any partial one. Fix language to PRINCIPIO ZERO: plural
   "Ragazzi," openers, no singular imperative, verbatim Vol/pag citations.
   Verify: all 38 lesson-paths exist and validate against the template structure.

6. NARRATIVE ARC. Make Volume 1 one continuous chain in printed-book order: in every
   lesson-path, `next_experiment.id` points to the next experiment in book order, with
   accurate cliffhanger title/preview; the Cap.14 robot capstone is the last node
   (`next_experiment` null). In `lesson-groups.js` (Volume 1 section), every lesson's
   `experiments` array lists IDs in book order and the union covers all 38.
   Verify: following `next_experiment` from `v1-cap6-esp1` reaches all 38 with no gap, loop,
   or dead end before the capstone.

7. CONSISTENCY. `experiments-vol1.js`, the `v1-*.json` lesson-paths, and the Volume 1 section
   of `lesson-groups.js` must agree on IDs, chapter numbers, and ordering.
   Verify: no ID appears in one representation and not the others.
</required_work>

<grounding_rules>
Ground every content change in `docs/volumi-originali/VOLUME-1-TESTO.txt` or the alignment
ground-truth doc. Do not present inferences as facts. If you encounter an editorial typo in
the printed Volume 1, resolve it sensibly (consistent software) and note it; do NOT replicate
a book typo. If the printed text is genuinely ambiguous, implement the most faithful
reasonable reading and flag it in your final report rather than guessing silently.
</grounding_rules>

<completeness_contract>
Resolve all 38 Volume 1 experiments — do not stop after the reported defects. Every experiment
must end correct in all three representations, with a complete Passo Passo and Percorso, and
correctly chained. If you fix an experiment's components, check that its `buildSteps`,
`connections`, `layout`, and lesson-path `build_circuit` intent still agree.
</completeness_contract>

<verification_loop>
ELAB anti-regression rules (strict, non-negotiable):
- Run `npx vitest run` BEFORE changes to record the baseline and AFTER. The passing count
  must not drop below `automa/baseline-tests.txt`. A drop = revise, do not ship the regression.
- Run `npx vitest run` 3 times before declaring the suite green.
- `npm run build` must pass.
- NEVER use `--no-verify`. NEVER push to `main`. Work on a feature branch.
Before finalizing, re-read your full diff and confirm every changed line traces to a Volume 1
experiment fix.
</verification_loop>

<action_safety>
Edit only the Volume 1 files in your ownership. No unrelated refactors or cleanup. This prompt
runs in parallel with the Volume 2 and Volume 3 prompts — do not touch their files or the
Volume 2 / Volume 3 sections of the shared sectioned files. Keep each change minimal and
surgical: the simplest correct fix, no speculative additions.
</action_safety>

<missing_context_gating>
Do not guess. If an experiment's correct circuit or wording is unclear, read the printed text
and existing data carefully before editing. If it remains genuinely ambiguous, implement the
most faithful reading and list it explicitly in your final report.
</missing_context_gating>

<output_contract>
Return, in this order and nothing else:
1. The audit defect list (all 38 experiments — OK, or the defect found).
2. Files changed (path + one-line reason each).
3. The reported defects: how each was resolved, or "already fixed in live file".
4. Elettropongo (Cap.13): what was done.
5. Passo Passo + Percorso: confirmation all 38 have a complete, language-correct version;
   how many lesson-paths existed, created, quality-fixed.
6. Narrative-arc verification: the chain from `v1-cap6-esp1` to the capstone — confirmed unbroken.
7. Vitest passing count before/after; build pass/fail.
8. Any experiment left ambiguous against the printed manual, and why.
</output_contract>
