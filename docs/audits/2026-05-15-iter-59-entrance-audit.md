# iter 59 entrance audit — Blockly cross-compile pivot

> iter 59 entrance. Branch `feat/iter-41-sprint-u-cycle-2-real-user-fix`. iter-58 close `b5d21c5b` pushed origin.
> Andrea pivot (verbatim): "postilla non usare mblock → fa sì che elab tutor possa fare cross compilation su nanoR4 tramite c++ e blockly, rendi blockly più facile da usare e autoesplicativo".
> 5 skills + Codex Pattern C-V validated. Score ONESTO G45 = **8.5/10**.

## Andrea iter 59 pivot decision

iter 58 mBlock Workstream C recon delivered Path C Hybrid recommendation (3-5 FTE-weeks). **REJECTED by Andrea iter 59**. New direction codified:

1. **NO mBlock**. iter 58 recon outcome supersedes Path C Hybrid recommendation.
2. **Keep Blockly**. Existing 9 Blockly source files + 23 custom blocks + 48 codegen entries preserved.
3. **Add Nano R4 cross-compile via C++ + Renesas RA4M1 core**. Board selector UI + extend `ALLOWED_COMPILE_BOARDS` + verify n8n core install.
4. **Render Blockly self-explanatory** for kids 8-14 (Andrea iter-21+ mandate "fruibile e semplice").

## Deliverables iter 59 entrance (10 files)

| # | File | Type | Lines | Verifier |
|---|---|---|---|---|
| 1 | [`docs/research/2026-05-15-iter-59-blockly-automation-recommendations.md`](../research/2026-05-15-iter-59-blockly-automation-recommendations.md) | automation reco P0/P1/P2 | ~250 | `/claude-automation-recommender` skill output, 27 actionable recos |
| 2 | [`docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md`](../specs/2026-05-15-iter-59-blockly-cross-compile-ux.md) | PRD 3-phase | ~270 | `/write-spec` skill output, full PRD structure + Andrea ratify gates × 3 + 7 open questions |
| 3 | [`docs/api/n8n-compile-openapi.yaml`](../api/n8n-compile-openapi.yaml) | OpenAPI 3.1 | ~250 | `/openapi-spec-generation` skill output, structured spec compile-proxy + compile + healthz |
| 4 | [`docs/api/n8n-compile-api.md`](../api/n8n-compile-api.md) | API docs human-readable | ~180 | `/generate-api-docs` skill output, 14 sections + 3 curl examples |
| 5 | [`docs/dev/CODEX-WORKFLOW.md`](../dev/CODEX-WORKFLOW.md) | Edit: iter 59 addendum + failure mode | +60 LOC | Andrea mandate "affina il workflow con codex" — Pattern C-V record + new stdin failure mode + 4 templates scaffold ref |
| 6 | [`scripts/dev/codex-prompts/README.md`](../../scripts/dev/codex-prompts/README.md) | NEW library scaffold | ~30 | Reusable Codex prompts library doc |
| 7 | [`scripts/dev/codex-prompts/verify-anti-regression.txt`](../../scripts/dev/codex-prompts/verify-anti-regression.txt) | NEW parametric template | ~25 | post-commit pre-push 4-gate verify |
| 8 | [`scripts/dev/codex-prompts/verify-morfismo-compliance.txt`](../../scripts/dev/codex-prompts/verify-morfismo-compliance.txt) | NEW parametric template | ~30 | palette + ToolSpec + naming audit |
| 9 | [`scripts/dev/codex-prompts/verify-codegen-output.txt`](../../scripts/dev/codex-prompts/verify-codegen-output.txt) | NEW parametric template | ~25 | scratchGenerator board-agnostic verify |
| 10 | [`scripts/dev/codex-prompts/verify-lesson-path-edit.txt`](../../scripts/dev/codex-prompts/verify-lesson-path-edit.txt) | NEW parametric template | ~25 | post-edit chain integrity verify |

Plus: [`docs/audits/2026-05-15-iter-59-entrance-audit.md`](./2026-05-15-iter-59-entrance-audit.md) (this file) + [`docs/handoff/2026-05-15-iter-59-to-iter-60-handoff.md`](../handoff/2026-05-15-iter-59-to-iter-60-handoff.md) (next).

**Zero `src/` modifications iter 59 entrance** — solo docs + scripts/dev/codex-prompts/. Anti-regression preserved by construction.

## CoV iter 59 entrance

- `npx vitest run` = **13118 PASS / 0 failed** (iter 58 close baseline preserved — no src changes iter 59 entrance) ✔
- `node scripts/epic1/validate-lesson-paths.mjs` = **94 pass · 0 fail · 0 unresolved · 0 cyclic** ✔ (no lesson-paths or capitoli changes iter 59 entrance)
- `npm run build` NOT re-run iter 59 entrance (~14min heavy, defer iter 60 Phase 1 entrance pre-commit gate)
- Codex Pattern C-V × 3 runs:
  - Run #1 cross-compile recon: **CONFIRM** scratchGenerator targets generic Arduino C++ + `compileCode` already has board param (api.js:1293)
  - Run #2 feasibility live-terminal: **SKIP** verdict (codex-bg.sh sufficient auditable reproducible)
  - Run #3 UX blockers BG: **FAILED stdin** — Codex CLI 0.128.0 prompt-arg parsing bug with `\|` regex alternation. Mitigation documented CODEX-WORKFLOW.md iter 59 addendum + 4-template library ERE syntax recommended

## Andrea ratify queue iter 60 entrance — 10 voci

### Phase 1 entry (R1-R6 PRD, ~6-8h):

1. **Q1 PRD §Open Questions**: default board iter 59 — `Nano R4` (new direction) OR `Nano classic AVR` (backward compat existing 13 Vol3)? **Andrea decide**.
2. **Q2 PRD §Open**: PREREQ n8n server `arduino-cli core install arduino:renesas_uno` — already installed OR Andrea installs? **Andrea verify** via SSH.
3. **Q3 PRD §Open**: UNO R4 variant — WiFi (`arduino:renesas_uno:unor4wifi`) OR Minima (`arduino:renesas_uno:minima`) as default kit board? **Andrea + Riccardo Omaric decide**.

### Phase 2 entry (R7-R13 PRD, ~10-16h):

4. **Q4 PRD §Open**: block label canon source — Vol3 OCR txt OR a3-corrections.json `bookFaithfulTitle` field OR Davide direct review? **Andrea decide**.
5. **Q5 PRD §Open**: block icons — emoji OR SVG ElabIcons? **Andrea ratify** post-design proposal.
6. **Q6 PRD §Open**: per-experiment block filter — strict (5 blocks v3-cap6-esp1) OR full (23 blocks with relevant highlighted)? **Andrea decide UX preference**.

### Phase 3 entry (R14-R19 PRD, ~6-10h):

7. **Q7 PRD §Open**: walkthrough first-time language — Italian only OR Italian + visual icons fallback? **Andrea ratify** post-design.

### Carryover iter 58 Andrea ratify queue (8 voci A4.1e Phase 2):

8. **Carryover iter 58 §3 voce 1**: `v3-cap9.json` orphan — DELETE vs PRESERVE vs MOVE-to-Bonus. Andrea raccomandato MOVE-to-Bonus.
9. **Carryover iter 58 §3 voce 2-6**: capitoli morse+semaforo pages + titles align + Vol1/Vol2 33 coupled-title cascade + Vol2 Cap.11 + transition prose.
10. **Carryover iter 58 §3 voce 7**: `narrative-map.json` schema design + wire-up (DEAD file currently, requires UI consumer).

## /ultrareview gate (USER-TRIGGERED ONLY)

Per session inventory: `/ultrareview` is **user-triggered + billed**. **Claude cannot launch it via Bash or otherwise.**

Andrea must run independently:
- `/ultrareview` (no arg) — bundles current branch local diff for multi-agent cloud review
- `/ultrareview <PR#>` — review a GitHub PR

Recommended trigger points:
- **iter 59 entrance close** (now): `/ultrareview` of branch post 10 deliverable iter 59 commits (this audit + handoff iter 60 + commit shortly).
- **iter 60 Phase 1 close**: `/ultrareview` post Phase 1 6-8h commits (board selector + ALLOWED_COMPILE_BOARDS extend + n8n core verify + OpenAPI update).
- **iter 61 Phase 2 mid**: `/ultrareview` post UX overhaul 5-7h.
- **iter 62 Phase 3 close**: `/ultrareview` cumulative + Andrea final ratify pre-merge main.

## /ultrathink:ultrathink — deferred iter 60 (intentional)

iter 59 entrance has 7 open questions blocking Phase 1 implementation. Spawning `/ultrathink:ultrathink` Coordinator + 4-agent (Architect + Research + Coder + Tester) would burn coordination tokens without producing executable Coder work — Architect needs ratified design decisions, Tester needs implementation to validate.

**Decision**: defer `/ultrathink:ultrathink` to iter 60 entrance, AFTER Andrea ratifies Q1-Q7 (Phase 1+2+3 unblockers). Then:
- `/ultrathink "Implement iter 60 Phase 1 R1-R6 of docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md per Andrea-ratified answers Q1=<X>, Q2=<Y>, Q3=<Z>"`
- Architect: codegen architecture + UI placement
- Research: arduino-cli renesas core compat verify + Blockly v12 Theme docs via context7 MCP
- Coder: R1 board selector + R2 ALLOWED_COMPILE_BOARDS extend + R4 OpenAPI yaml refine
- Tester: Phase 1 acceptance tests 13/13 Vol3 esperimenti compile success

## Score iter 59 entrance ONESTO G45

**8.5/10** (raw 9.0 capped — G45 anti-inflation rules):
- +1.0 PRD complete 3-phase + acceptance criteria + Andrea ratify gates × 3 + 7 open questions tracked
- +1.0 OpenAPI 3.1 spec valid + API docs human-readable + curl examples × 3
- +0.7 Codex workflow refinement + 4 prompt templates scaffold + iter 59 failure mode documented
- +0.8 automation recommendations 27 P0/P1/P2 specific Blockly workstream
- −0.5 ZERO src/ code shipped iter 59 entrance (Andrea ratify Q1-Q7 blocks Phase 1)
- −0.5 /ultrathink coordinator NOT spawned (Andrea ratify pending — intentional defer)
- −0.5 Codex UX BG run #3 FAILED stdin (failure mode documented, mitigated iter 60 ERE syntax)

## NON COMPIACERE — iter 59 entrance honest

- NO claim "Blockly cross-compile shipped" — only PRD + OpenAPI + API docs + automation reco. Code execution iter 60.
- NO claim "UX overhaul progressed" — PRD R7-R13 documented, NO Italian labels/icons/tooltips edits yet.
- NO claim "Codex 100% Pattern C-V" — Run #3 stuck stdin failure mode. 2/3 PASS iter 59.
- NO claim "Andrea ratify queue closed" — 10 voci OPEN (7 NEW iter 59 + 3 carryover iter 58).
- NO claim "build PASS verified" — NOT re-run iter 59 entrance (no src changes). iter 60 entrance gate.
- NO claim "/ultrathink executed" — INTENTIONAL DEFER (open questions block Coder phase).
- NO claim "iter 59 score 9.0/10" — G45 anti-inflation cap 8.5/10 ONESTO (Phase 1+ execution work pending).

Andrea decision critica iter 60 entrance: **ratify queue 10 voci (~30-45 min) PRIMA Phase 1 execute** + Andrea trigger `/ultrareview` autonomously.

## Cross-link

- iter 58 close audit: [`docs/audits/2026-05-15-iter-58-PHASE1-close-audit.md`](./2026-05-15-iter-58-PHASE1-close-audit.md)
- iter 58 handoff: [`docs/handoff/2026-05-15-iter-58-to-iter-59-handoff.md`](../handoff/2026-05-15-iter-58-to-iter-59-handoff.md)
- iter 59 handoff iter 60: [`docs/handoff/2026-05-15-iter-59-to-iter-60-handoff.md`](../handoff/2026-05-15-iter-59-to-iter-60-handoff.md) (next)
- mBlock recon REJECTED: [`docs/research/2026-05-15-iter-58-workstream-C-mblock-recon.md`](../research/2026-05-15-iter-58-workstream-C-mblock-recon.md) (preserved for historical record)
