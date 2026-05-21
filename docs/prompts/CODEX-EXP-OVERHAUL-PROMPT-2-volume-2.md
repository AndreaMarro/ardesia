# Codex Prompt 2 — ELAB Tutor: Volume 2 Experiment Overhaul

> **RUN ORDER.** Run this AFTER Prompt 0 has been merged. This prompt runs in PARALLEL with
> Prompt 1 (Volume 1) and Prompt 3 (Volume 3) — each on its own clone/branch. The three
> prompts touch strictly disjoint files, so the three branches merge cleanly.
>
> Paste everything below (from `<task>` to the end) into Codex.

---

<task>
You are working in the ELAB Tutor repository: an educational electronics tutor for children
aged 8–14 (React 19 + Vite 7, custom hash routing, Vitest). This prompt covers VOLUME 2 only.

Your job: bring every Volume 2 experiment into full alignment with the printed Volume 2
manual; fix every broken / partial / incorrect Volume 2 experiment; give every experiment a
flawless Passo Passo and a complete, morphic-ready Percorso written in correct PRINCIPIO ZERO
language; and enforce the continuous narrative arc across all of Volume 2.

Expected end state: all 27 Volume 2 experiments are present, internally consistent across
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
sequenza del libro stampato."

Andrea's additional requirement for this overhaul: every experiment must have a Passo Passo
(step-by-step) done PERFECTLY and written in the correct language; and a Percorso that exists
and can become "morphic" (adapt at runtime to the class/teacher/previous sessions).

"PRINCIPIO ZERO" — pedagogical language rule, mandatory for all teacher-facing text:
- Address the class in the plural: "Ragazzi, ...". Never the singular imperative.
- The text guides the TEACHER on what to do and say; it never commands the teacher.
- Cite the volume and page verbatim where the lesson-path does so (e.g. "Vol.2 pag.XX").

Each experiment exists in THREE data representations:
1. `src/data/experiments-vol2.js` — simulator circuit (components, pinAssignments, connections,
   layout, steps, buildSteps, unlimPrompt, simulationMode).
2. `src/data/lesson-paths/v2-*.json` — the pedagogical lesson path. Canonical structural
   template: `src/data/lesson-paths/v1-cap6-esp1.json` (marked "TEMPLATE PERFETTO") — 5 phases
   (PREPARA, MOSTRA, CHIEDI, OSSERVA, CONCLUDI), `next_experiment {id, title, preview}`,
   `vocabulary`, `prerequisites`, `difficulty`, `target_age`, `common_mistakes`, `analogies`,
   `session_save`, `modes_supported`. The MOSTRA phase carries the `build_circuit`
   step-by-step (= Passo Passo). Match this structure.
3. `src/data/lesson-groups.js` — the "Lezioni" grouping (VOLUME 2 section only).

These three MUST stay consistent: same experiment IDs, same chapter assignment, same ordering.

MORPHIC-READY lesson-paths: the morphic Percorso engine (implemented by Prompt 0 per ADR-046 /
ADR-019) adapts a lesson at runtime to the class, teacher and previous sessions, by reading
the lesson-path's structured fields and the printed-manual content. For a lesson-path to be
morphic-ready, your data must give it a solid, complete base to adapt: correct
`experiment_id`, chapter and Vol/pag metadata; a complete, high-quality static Percorso; and
every adaptation-relevant field populated (`vocabulary`, `difficulty`, `target_age`,
`common_mistakes`, `analogies`). You do NOT implement the morphic engine — you make the data
it consumes complete and correct.

Source of truth for content = the printed Volume 2 manual. In the repo:
- `docs/volumi-originali/VOLUME-2-TESTO.txt` (extracted printed text — primary reference).
- `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md` (prior alignment audit).
</context>

<scope_and_file_ownership>
YOU MAY EDIT (Volume 2 only):
- `src/data/experiments-vol2.js`
- `src/data/lesson-paths/v2-*.json` (all 27 Volume 2 lesson-path files; create any missing one)
- `src/data/lesson-groups.js` — ONLY the section between the `VOLUME 2` banner comment and the
  `VOLUME 3` banner comment.
- `src/data/volume-references.js` — ONLY Volume 2 entries.
- `src/data/narrative-map-94.json` — ONLY the Volume 2 portion.
- `tests/**` — you MAY add NEW test files specific to Volume 2. Do NOT edit a shared
  multi-volume test file (e.g. one carrying a total-experiment-count or cross-volume
  assertion); if one needs updating, report it instead. Volume 2's experiment count does not
  change (27), so this should not arise.

YOU MUST NOT EDIT:
- `experiments-vol1.js`, `experiments-vol3.js`, any `v1-*` / `v3-*` lesson-path.
- The Volume 1 / Volume 3 sections of `lesson-groups.js`, `volume-references.js`,
  `narrative-map-94.json`.
- `src/data/experiments-index.js` (pure aggregator — adapts automatically).
- `src/App.jsx`, `src/components/**`, `src/services/**` — shared code, already fixed by Prompt 0.
- `src/data/standard-experiment-schema.json` — leave as-is; match the existing 5-phase
  lesson-path structure.

If a fix appears to need a file outside Volume 2 ownership, STOP and report it.
</scope_and_file_ownership>

<canonical_reference>
The printed Volume 2 ("Approfondiamo") has 12 chapters. Chapters 1, 2 and 11 are theory.
Chapter 11 ("I diodi") is theory + a visual demo only — it has NO experiments by design; this
is NOT a gap. The 27 experiments, in printed-book narrative order:
- Cap.3  "Il Multimetro"                    — Esp.1–4   (4)
- Cap.4  "Approfondiamo le resistenze"      — Esp.1–3   (3)
- Cap.5  "Approfondiamo le Batterie"        — Esp.1, 2  (2)
- Cap.6  "Approfondiamo i Led"              — Esp.1–4   (4)
- Cap.7  "Cosa sono i condensatori?"        — Esp.1–4   (4)
- Cap.8  "Cosa sono i Transistor?"          — Esp.1–3   (3)
- Cap.9  "Cosa sono i fototransistor?"      — Esp.1, 2  (2)
- Cap.10 "Il motore a corrente continua"    — Esp.1–4   (4)
- Cap.12 "Robot segui luce"                 — capstone project   (1)
TOTAL = 27. Experiment IDs follow the pattern `v2-cap{N}-esp{M}`. A live count on 2026-05-21
confirmed `experiments-vol2.js` currently has 27 experiments.

EDITORIAL TYPO IN THE PRINTED BOOK: Volume 2 Cap.8 prints "ESPERIMENTO 2" twice. The software
must have a clean, unambiguous sequence: `v2-cap8-esp1`, `v2-cap8-esp2`, `v2-cap8-esp3`. Do not
replicate the typo.
</canonical_reference>

<known_defects>
This block was compiled from repo audits dated late April–mid May 2026. Treat it as a starting
hypothesis — required-work item 1 (AUDIT) re-confirms against the live `experiments-vol2.js`;
if the live file differs, it wins.

The defect audit found ZERO confirmed per-experiment functional defects in Volume 2 —
components matched the book in the sampled experiments. Do NOT take this as "nothing to do".
The audit only checked structural alignment. The real Volume 2 work is:

A. simulationMode correctness. The audit grouped much of Volume 2 with the Arduino experiments.
   Volume 2 covers analog electronics (multimeter, resistors, batteries, LEDs, capacitors,
   transistors, fototransistors, DC motor) — most of it is NOT Arduino. For EACH Volume 2
   experiment, verify `simulationMode` is correct for what the printed experiment actually
   does: `"circuit"` for analog/manual experiments, `"avr"` only if it genuinely uses Arduino.
   Correct any mis-flagged experiment.
B. Cap.8 transistor (MOSFET) experiments are historically the most error-prone in the
   curriculum. Audit `v2-cap8-esp1/2/3` with extra care: MOSFET pinout, gate resistor, and
   switching circuit must match the printed book.
C. Passo Passo, Percorso, language and narrative quality (see required_work).
</known_defects>

<required_work>
1. AUDIT. For each of the 27 Volume 2 experiments, compare `experiments-vol2.js` against
   `docs/volumi-originali/VOLUME-2-TESTO.txt`: components, quantities, values, wiring, printed
   step description, and `simulationMode`. Produce a defect list before changing anything.
   Verify: the list covers all 27.

2. FIX CIRCUIT DATA. In `experiments-vol2.js`, correct any component, `pinAssignments`,
   `connections`, `layout`, `steps`, `buildSteps`, or `simulationMode` error found. Pay
   special attention to Cap.8 (MOSFET) and Cap.10 (DC motor).
   Verify: component counts internally consistent; each circuit electrically valid.

3. PERFECT PASSO PASSO. Every one of the 27 experiments must have a flawless step-by-step:
   correct, ordered `buildSteps` and the MOSTRA-phase `build_circuit` intent, each step
   written in PRINCIPIO ZERO language (plural "Ragazzi", no singular imperative).
   Verify: stepping through any experiment's Passo Passo builds the correct circuit.

4. COMPLETE PERCORSO + MORPHIC-READY. Every one of the 27 experiments must have a `v2-*.json`
   lesson-path matching the canonical template, with ALL fields populated (`vocabulary`,
   `difficulty`, `target_age`, `common_mistakes`, `analogies`, correct `experiment_id` and
   Vol/pag metadata) so the morphic Percorso engine can adapt it. Create any missing
   lesson-path; complete any partial one. Fix language to PRINCIPIO ZERO: plural "Ragazzi,"
   openers, no singular imperative, verbatim Vol/pag citations.
   Verify: all 27 lesson-paths exist and validate against the template structure.

5. NARRATIVE ARC. Make Volume 2 one continuous chain in printed-book order: in every
   lesson-path, `next_experiment.id` points to the next experiment in book order, with
   accurate cliffhanger title/preview; the Cap.12 "Robot segui luce" capstone is the last
   node (`next_experiment` null). In `lesson-groups.js` (Volume 2 section), every lesson's
   `experiments` array lists IDs in book order and the union covers all 27.
   Verify: following `next_experiment` from `v2-cap3-esp1` reaches all 27 with no gap, loop,
   or dead end before the capstone.

6. CONSISTENCY. `experiments-vol2.js`, the `v2-*.json` lesson-paths, and the Volume 2 section
   of `lesson-groups.js` must agree on IDs, chapter numbers, and ordering.
   Verify: no ID appears in one representation and not the others.
</required_work>

<grounding_rules>
Ground every content change in `docs/volumi-originali/VOLUME-2-TESTO.txt` or the alignment
ground-truth doc. Do not present inferences as facts. Resolve the known Cap.8 "ESPERIMENTO 2"
printed typo into a clean software sequence; do not replicate book typos. If the printed text
is genuinely ambiguous, implement the most faithful reasonable reading and flag it in your
final report rather than guessing silently.
</grounding_rules>

<completeness_contract>
Resolve all 27 Volume 2 experiments. Confirming "no defect" for an experiment is valid only
after you have actually compared it to the printed manual. Every experiment must end correct
in all three representations, with a complete Passo Passo and Percorso, and correctly chained.
</completeness_contract>

<verification_loop>
ELAB anti-regression rules (strict, non-negotiable):
- Run `npx vitest run` BEFORE changes to record the baseline and AFTER. The passing count
  must not drop below `automa/baseline-tests.txt`. A drop = revise, do not ship the regression.
- Run `npx vitest run` 3 times before declaring the suite green.
- `npm run build` must pass.
- NEVER use `--no-verify`. NEVER push to `main`. Work on a feature branch.
Before finalizing, re-read your full diff and confirm every changed line traces to a Volume 2
experiment fix.
</verification_loop>

<action_safety>
Edit only the Volume 2 files in your ownership. No unrelated refactors or cleanup. This prompt
runs in parallel with the Volume 1 and Volume 3 prompts — do not touch their files or the
Volume 1 / Volume 3 sections of the shared sectioned files. Keep each change minimal and
surgical: the simplest correct fix, no speculative additions.
</action_safety>

<missing_context_gating>
Do not guess. If an experiment's correct circuit, `simulationMode`, or wording is unclear,
read the printed text and existing data carefully before editing. If it remains genuinely
ambiguous, implement the most faithful reading and list it explicitly in your final report.
</missing_context_gating>

<output_contract>
Return, in this order and nothing else:
1. The audit defect list (all 27 experiments — OK, or the defect found).
2. Files changed (path + one-line reason each).
3. simulationMode corrections made (which experiments, from → to).
4. Cap.8 MOSFET: what was verified/corrected.
5. Passo Passo + Percorso: confirmation all 27 have a complete, language-correct version;
   how many lesson-paths existed, created, quality-fixed.
6. Narrative-arc verification: the chain from `v2-cap3-esp1` to the capstone — confirmed unbroken.
7. Vitest passing count before/after; build pass/fail.
8. Any experiment left ambiguous against the printed manual, and why.
</output_contract>
