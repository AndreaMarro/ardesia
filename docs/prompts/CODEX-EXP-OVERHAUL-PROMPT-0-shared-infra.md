# Codex Prompt 0 — ELAB Tutor: Shared Infrastructure + Morphic Percorso Pre-Step

> **RUN ORDER.** Run this prompt ALONE, FIRST, on its own clone/branch. Review and merge
> its result before starting Prompt 1, Prompt 2, Prompt 3. Those three run in parallel
> on top of this prompt's merged result.
>
> Paste everything below (from `<task>` to the end) into Codex.

---

<task>
You are working in the ELAB Tutor repository: an educational electronics-and-Arduino
tutor for children aged 8–14 (React 19 + Vite 7, custom hash-based routing, NO react-router;
test runner Vitest). Repo root contains `package.json`, `src/`, `tests/`, `automa/`, `docs/`.

Your job covers SHARED CODE ONLY: (a) fix the infrastructure defects that block interactive
experiments across all three volumes, (b) fix the Passo Passo regression, (c) make the
Percorso mode morphic-capable, and (d) verify the narrative-arc rendering. Three sibling
prompts (one per volume) run in parallel AFTER this one and own all per-volume experiment
data — you must not touch their files.

Expected end state: the three INFRA defects are fixed and verified; the Passo Passo
right-side window works for every experiment; the morphic "Lezione personalizzata" Percorso
flow (ADR-046) is implemented and verified; the narrative-arc rendering correctly consumes
the per-volume `next_experiment` data; the full Vitest suite passes at or above baseline;
`npm run build` passes.
</task>

<context>
ELAB ships as a unified product: a physical kit (Omaric) + three printed paper manuals
(Volume 1, 2, 3) + this web software. The "MORFISMO" rule requires the software to mirror the
printed books exactly — same experiments, same chapter order, same page references.

Andrea (product owner) states the guiding principle verbatim:
"Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat
scollegate. Ogni esperimento del software deve agganciarsi al precedente e al successivo
nella stessa sequenza del libro stampato." — experiments form ONE continuous narrative arc;
each links to the previous and next, in printed-book order. This drives the three lesson
modes: Percorso, Passo Passo, and Libero.

MORPHIC PERCORSO (Morfismo Sense 1.5). The Percorso mode must be able to adapt at runtime to
the class, the teacher, and previous sessions — not be a static page identical for everyone.
Two architecture documents in the repo define this; READ THEM, they are your spec:
- `docs/adrs/ADR-019-sense-1.5-morfismo-runtime-docente-classe.md` — the 4-level morphic
  runtime design (Context Collection, Morphic Functions, Morphic Windows, Persistence).
- `docs/adrs/ADR-046-percorso-lezione-personalizzata-onniscenza-mistral.md` — the concrete
  MVP: a "Lezione personalizzata" button in `PercorsoCapitoloView` that calls the existing
  `unlim-chat` Edge Function through the LIVE `onniscenza-bridge` pipeline so UNLIM generates
  a lesson proposal adapted to the class + previous sessions. ADR-046 is currently PROPOSED.

Each experiment exists in THREE data representations under `src/data/` — all owned by the
per-volume prompts, NOT by you:
- `experiments-vol{1,2,3}.js` — simulator circuit data.
- `lesson-paths/v{1,2,3}-*.json` — pedagogical lesson paths (5 phases, `next_experiment`).
- `lesson-groups.js` — the "Lezioni" grouping.

Your responsibility is the CODE that renders and runs this data, plus the morphic Percorso
engine — not the data itself.

Audits already exist; trust them as starting evidence:
- `docs/audits/2026-05-11-iter-27-92-esperimenti-broken-sweep.md` (its "0/94 working" verdict
  is itself caused by INFRA-2 below — a routing bug, not 94 broken experiments).
- `docs/audits/iter-29-wires-root-cause.md` (the "no wires" reports were a measurement
  artifact: harness read `state.wires`, the API returns `state.connections`).
</context>

<scope_and_file_ownership>
YOU MAY EDIT (shared code only):
- `src/App.jsx` — hash routing.
- `src/components/simulator/**` — engine, canvas, panels, components, overlays, hooks, layout.
- `src/services/percorsoService.js`, `percorsoGenerator.js`, `experimentNarrativeService.js`,
  `lessonPrepService.js`, `api.js`.
- The lesson-mode rendering components — locate them by reading the code, do not assume exact
  filenames: the Percorso view (`PercorsoCapitoloView`), the Passo Passo build-guide / right
  side window, `ModalitaSwitch`, and any end-of-experiment cliffhanger CTA component.
- `tests/**` — add or update tests covering your fixes.

YOU MUST NOT EDIT (owned by the three parallel per-volume prompts):
- `src/data/experiments-vol1.js`, `experiments-vol2.js`, `experiments-vol3.js`
- `src/data/lesson-paths/**`
- `src/data/lesson-groups.js`, `volume-references.js`, `narrative-map-94.json`,
  `cliffhanger-table.json`
- `src/data/standard-experiment-schema.json` (leave as-is)

If a fix appears to require editing a forbidden file, STOP and report it.

`src/components/simulator/engine/CircuitSolver.js` and `AVRBridge.js` are protected by
`scripts/guard-critical-files.sh`. Avoid editing them; if unavoidable, follow the repo's
authorized-engine-change procedure and report it.
</scope_and_file_ownership>

<known_defects>
This block was compiled from repo audits and a live inspection on 2026-05-21. Treat it as a
verified-as-of-date starting point — required-work item 0 re-confirms each against the live
code, and if the live state differs, the live code wins.

INFRA-1 — Arduino compile UI not auto-mounted. ~56 experiments have `simulationMode: "avr"`.
After `api.mountExperiment` loads an Arduino experiment, the compile/upload UI shell is not
shown by default — the compile button only appears after a manual click. This is the root
cause of the "Arduino experiments are bad" perception. Fix: whenever the mounted experiment
has `simulationMode === "avr"`, the simulator presents the Arduino compile UI automatically.

INFRA-2 — Deep-link experiment parameter dropped. `getExpFromHash()` is not wired into the
`#lavagna` route in `src/App.jsx`. Navigating to `#lavagna?exp=<id>` opens the lavagna but
does not mount the experiment. Fix: wire it so the `?exp=` parameter mounts the experiment on
route entry.

INFRA-3 — PlacementEngine mis-snaps pin-less components. `PlacementEngine.js` mis-snaps
components declared without explicit `from`/`to` pin endpoints. Make the engine deterministic
and correct for pin-less components. (The per-volume prompts also add explicit pins in their
data — complementary; do the engine fix regardless.)

PASSO-PASSO REGRESSION — Andrea reported (video feedback, 2026-05-06, recorded in ADR-046
§1.1): "non c'è più il passo passo normale … la cosa da mantenere era la finestra passo passo
a destra." The right-side step-by-step ("Passo Passo") window regressed. Verify it renders
and works correctly for experiments across all three volumes; if it is regressed, restore it.

MORPHIC PERCORSO NOT WIRED — `PercorsoCapitoloView` renders the chapter schema statically and
does not adapt. `percorsoGenerator.js` has `generatePercorso()` but its `defaultLLMCall` is a
stub that never calls an LLM — it was never wired in production. The `onniscenza-bridge`
pipeline it would use IS live. ADR-046 specifies the MVP wire-up.
</known_defects>

<required_work>
Do these in order. Each item has its own verification — do not move on until it passes.

0. CONFIRM. Re-check each defect above against the live code before changing anything. Note
   any that are already fixed.

1. INFRA-2 (do first — smallest, unblocks reliable verification). Wire `getExpFromHash()`
   into the `#lavagna` route. Verify: `#lavagna?exp=v1-cap6-esp1` mounts that experiment.

2. INFRA-1. Auto-present the Arduino compile UI for `simulationMode === "avr"`. Verify:
   mounting any avr experiment shows the compile button with no manual click.

3. INFRA-3. Fix `PlacementEngine.js` pin-less snapping. Verify with `v1-cap6-esp1` (a resistor
   with a 7-column span) — placement stable and correct across reloads.

4. PASSO PASSO. Restore/repair the right-side Passo Passo step-by-step window so it appears
   and steps correctly through the assembly for an experiment in each volume. Verify with one
   circuit experiment and one Arduino experiment.

5. MORPHIC PERCORSO. Implement the morphic-Percorso MVP per `ADR-046`. Read that ADR — it
   specifies the exact files, the "Lezione personalizzata" button in `PercorsoCapitoloView`,
   and the pipeline (button → `sendChat` with chapter context → existing `unlim-chat` Edge
   Function → `onniscenza-bridge` → Mistral → adapted lesson proposal). SCOPE = ADR-046
   "Atom A" MVP only: frontend wire-up to the EXISTING `unlim-chat` Edge Function. Do NOT
   create a new Edge Function, do NOT add a Supabase migration, do NOT deploy backend. If
   ADR-046 Atom A is already implemented in `PercorsoCapitoloView`, verify it works and say so.
   Verify: the button exists, calls the pipeline, and renders a proposal; the four PRINCIPIO
   ZERO invariants (plural "Ragazzi", verbatim Vol/pag citation, no imperative to the teacher,
   narrator register) are preserved.

6. NARRATIVE-ARC RENDERING. The per-volume prompts populate `next_experiment` and the
   cliffhanger data. Verify the rendering side consumes it: Percorso mode shows experiments as
   a continuous sequence with the cliffhanger/preview BETWEEN cards (never a flat grid); the
   end-of-experiment transition renders a cliffhanger CTA to the next experiment. Fix any
   rendering component that ignores this data. Do NOT invent data — only fix rendering.

7. Confirm you have not edited any forbidden file (`git diff --stat`).
</required_work>

<completeness_contract>
Resolve all six work items fully — do not stop at the first plausible fix. For each, check
for follow-on effects (a routing fix may need cleanup on route exit; a compile-UI fix must
not double-mount on re-render). Finish item 6 even if no rendering change turns out to be
needed.
</completeness_contract>

<verification_loop>
ELAB anti-regression rules are strict and non-negotiable:
- Run `npx vitest run` BEFORE any change to record the baseline, and AFTER. The passing count
  must not drop below the value in `automa/baseline-tests.txt`.
- Run `npx vitest run` 3 times before claiming the suite is green.
- `npm run build` must pass.
- NEVER use `--no-verify`. NEVER push to `main`. Work on a feature branch.
Before finalizing, re-read your diff and confirm every changed line traces to a work item.
</verification_loop>

<action_safety>
Keep changes tightly scoped to the shared-code files you own. No unrelated refactors. Three
per-volume prompts run in parallel after you — anything you leave broken blocks all of them.
For any UI you touch, preserve WCAG 2.2 AA: visible focus states, interactive targets
≥ 44×44px, text contrast ≥ 4.5:1, full keyboard operability, `prefers-reduced-motion` respect.
Do not remove existing focus styles. For the morphic Percorso (item 5) call out, before doing
it, anything that would require a backend deploy — that is out of scope and needs human sign-off.
</action_safety>

<missing_context_gating>
Do not guess. If the location of a rendering component, the routing helper, the compile-UI
shell, or the Passo Passo window is unclear, find it with repository search before editing. If
ADR-046 Atom A turns out partially implemented, state precisely what exists and what you added.
If a defect cannot be reproduced, say so rather than inventing a change.
</missing_context_gating>

<output_contract>
Return, in this order and nothing else:
1. Item 0: which defects were confirmed still present, which already fixed.
2. Files changed (path + one-line reason each).
3. INFRA-1 / INFRA-2 / INFRA-3: fix applied + verification evidence for each.
4. Passo Passo: regression state found, fix applied, verification.
5. Morphic Percorso (ADR-046 Atom A): what existed, what you implemented, verification.
6. Narrative-arc rendering: findings + any fix (or "no change needed" + why).
7. Vitest passing count before/after; build pass/fail.
8. Residual risks or anything needing human follow-up (especially anything backend).
</output_contract>
