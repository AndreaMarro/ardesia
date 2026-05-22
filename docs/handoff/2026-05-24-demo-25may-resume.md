# Handoff — Demo 25/05/2026 — Resume Morning 24/05

**Sessione precedente:** 23/05/2026 ore 23:00 → 24/05/2026 ore 01:00.
**Stato:** Brainstorming + writing-plans COMPLETI. Pausa sonno.
**Continuazione:** 24/05/2026 mattina — Phase P0 task 1 (worktree creation).

---

## QUICK START al risveglio

1. Apri Claude Code in `/Users/andreamarro/VOLUME 3/`.
2. Leggi auto-memory: `MEMORY.md` → entry "🔥 ACTIVE: Demo 25/05/2026 sera".
3. Leggi spec + plan (path sotto).
4. Esegui Phase P0 Task 1 → Task 7 (oggi ~4h).
5. Brief Codex Desktop per S1 overnight (Task 7).

---

## File deliverables

```
Spec  → docs/superpowers/specs/2026-05-23-demo-25may-master-design.md   (v1.3, 1245+ righe)
Plan  → docs/superpowers/plans/2026-05-23-demo-25may-P0-P1-plan.md      (15 task TDD, ~1100 righe)
Memory → ~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/demo-25may-plan-active.md
```

---

## Stato repo a chiusura sessione 23/05

- **Branch attuale (current worktree):** `feat/sprint-b-codekit-a4-fullscreen-editor`
  con WIP non-committato (Lavagna + simulator files modificati).
- **Spec + Plan + Handoff scritti SU questo branch ma NON committati** per evitare
  mix con Lavagna WIP. File esistono su disco e sono ready per worktree dedicato.
- **PR aperti Sprint B (#154-#158)**: 5 stilistici Code Kit, da decidere oggi.
- **Last commit:** `style(lavagna): add z-index token scale` (a727c504).

---

## Phase P0 Tasks (oggi sera, ~4h)

| # | Task | Output |
|---|---|---|
| 1 | Worktree `elab-builder-demo25` da main, branch `feat/demo-25may` | Worktree clean, npm install OK, baseline test snapshot |
| 2 | Copy spec + plan a worktree + initial commit | 2 file committed con Co-Authored-By |
| 3 | Plugin `elab-demo-guardrails` MVP (2 hook: pre-bash, stop build-gate) | Plugin attivo su demo branch |
| 4 | Skill `elab-demo-check` MVP (20-item checklist) | Skill invocabile |
| 5 | Verify Q1 (compile R4 endpoint) + Q3 (Gemini key) + Q9 (Mac Mini) + Q12 (hardware Nano R4) | Doc `P0-verifications-23may.md` |
| 6 | Decidi 5 PR aperti Sprint B (#154-158) MERGE o close | Doc `sprint-b-pr-decision.md` + rebase |
| 7 | Brief Codex Desktop overnight per S1 7 esp geometry | Doc `codex-brief-s1.md` + Andrea dispatch |

## Phase P1 Tasks (24/05 daytime, 8 task TDD)

| # | Task | Test count |
|---|---|---|
| 8 | Battery9V renderMode "clip_simplified" prop | +3 |
| 9 | Wire.jsx path prop manual SVG polyline | +3 |
| 10 | v1-cap6-esp1 build_circuit hero schema | +1 (cumulative) |
| 11 | v2-cap7-esp2 build_circuit hero (cond fade) | +0 (existing test passes) |
| 12 | v3-cap6-esp5 build_circuit hero (semaforo) | +0 |
| 13 | VolumeReader.jsx PNG-based | +3 |
| 14 | PassoPassoVolumeBridge.jsx split-screen | +3 |
| 15 | Integrate in NewElabSimulator.jsx mode switching | smoke test 7 esp |

---

## Decisioni canoniche (NON cambiare senza Andrea ratify)

- Demo: **25/05/2026 sera (~20:00)**, NON 26.
- 7 esp: 3 vol1 (cap6 esp1+2+3) + 2 vol2 (cap7 esp1+2 condensatore) + 2 vol3 (cap6
  esp4+5 due LED + semaforo).
- Vol3 SOS scrapped (non consecutivi). Sostituito esp4 "Due LED alternano".
- Worktree dedicato `../elab-builder-demo25` da `main`.
- Branch `feat/demo-25may`.
- Nano R4 target (NOT S4 = typo).

## Re-scope critica (NO compiacenza)

Repo MOLTO più maturo del previsto. PR 22/05 MERGED:
- #148 iter-103 WebUSB DFU instrumented (UAT pending Riccardo/Tea)
- #145 cross-compile librerie Arduino
- #149 Code Kit compile UX P0
- #144 fumetto generazione completa iter 83
- #151, #152, #153 fumetto fixes
- #135 awareness-flags Slice 1A

**80% effort demo = S1 (geometric fidelity) + S2 (VolumeReader passo-passo) = VERI gap.**

**S4 Blockly BACK IN SCOPE (Andrea ratify 24/05 01:15 "deve funzionare").**

MVP S4 demo (~6-10h Codex+Andrea parallel):
1. Audit `scratchToolboxProgressive.js` block IDs vs `scratchBlocks.js` registry → rename `arduino_*` canonical (Codex overnight, 1-2h)
2. Arduino code generator custom `src/services/arduino-code-generator.js` (Codex overnight, 2-3h)
3. Passo-passo code panel `BlocklyArduinoStepGuide.jsx` per 1 esp v3-cap6-esp4 (Andrea P2 AM, 2-3h)
4. Restyle EduKit minimo CSS (P2 PM if tempo, 1h)

Codex brief `docs/demo-25may/codex-brief-s1.md` deve essere ESTESO con S4 step 1+2.

Effort v1.4: 35% S1 + 35% S2 + 15% S4 + 10% UAT/polish + 5% plugin/orch.

---

## Open Questions ancora da risolvere

| Q | Item | Quando |
|---|---|---|
| Q11 | Browser matrix (Chrome stable + Edge backup, Safari degraded) | P0 oggi |
| Q12 | Verifica Nano R4 hardware fisico in dotazione Andrea | P0 oggi |
| Q13 | Privacy minorenni GDPR policy | Post-demo |
| Q14 | SBOM/OSS licenze inventory | Post-demo |
| Q15 | Promptfoo + BackstopJS install | Post-demo |

---

## Plan 2/3/4 outline (scritti DOPO P1 complete)

**Plan 2 (P2 AM 25/05 08:00-12:00):**
- Task 16-17: S3 UAT compile endpoint + WebUSB DFU live test Nano R4
- Task 18-20: S5 sessionActionLog + enhanced collectFullContext + 3 scenari rehearsed
- Task 21: Integration test FULL manual smoke

**Plan 3 (P2 PM 25/05 12:00-19:30):**
- Task 22: S6 pre-generated fumetto asset rehearsed
- Task 23: S7 QuizPanel + DiaryPage UI wire-up
- Task 24: 4 esp residui geometry polish (Codex output review)
- Task 25-27: Dry-run 1 → adjust → Dry-run 2
- Task 28: Pre-demo checklist FINAL (skill elab-demo-check)

**Plan 4 (DEMO 25/05 sera + post-demo):**
- DEMO LIVE 20:00
- Post-demo deferred: S4 Blockly audit, Promptfoo, BackstopJS, GDPR, SBOM, 72 esp full

---

## Anti-regression FERREA

- Baseline tests `automa/baseline-tests.txt` NON deve scendere
- `npm run build` deve passare prima di ogni commit
- Plugin `elab-demo-guardrails` Stop hook smoke build-gate
- NO `--no-verify`, NO `git push --force`, NO destructive ops su demo branch
- Mac Mini sentinella se attivo (Q9 verify)

---

## Workstream parallelization (v1.6 ChatGPT Pro adopt selettivo)

- **Mac principale (Andrea)** = lead / merge / demo rehearsal / decisioni
- **Codex Desktop (Mac Andrea)** = PRIMARY S1 7 esp geometry overnight + PR reviewer indipendente
- **Mac mini (Strambino)** = parallel test runner + nightly report + Playwright baseline + screenshot farm
- **Andrea main thread** = S2 + S5 + S4 passo-passo code
- **Background agent (general-purpose)** = S6 polish + S7 UI wire-up (parallel)
- **Subagent `book-parity-auditor`** (read-only) = verify S1 esp post-Codex output

## ChatGPT Pro suggestion (24/05 01:35) — adopt selettivo

ADOPT: 1 subagent + 1 skill in più (book-parity), UNLIM eval harness JSON, Stop hook
report template, PR sections obbligatorie, Mac mini = test runner ruolo formalizzato,
principio "1 task=1 branch=1 PR=1 artifact=1 review".

REJECT (over-engineering 36h): custom MCP server, 6 subagent, 7 skill, Chromatic,
Storybook, multiple MCP custom. Secondo Claude account = verifica licenza Andrea.

Spec v1.6 changelog ha dettaglio + critica esplicita.

---

## Execution mode da scegliere oggi

| Option | Pros | Cons |
|---|---|---|
| **Subagent-driven** (recommended) | Max throughput, parallel Codex+Andrea | Coordination overhead |
| Inline batch | Full visibility, controllo | Più lento |
| Mixed: P0 inline + P1 subagent | Pragmatico | Switch costo |

---

## Anti-pattern da evitare

- ❌ NO rifare S3 compile/upload (è MOSTLY MERGED, solo UAT)
- ❌ NO rifare S6 fumetto da zero (è MERGED iter 83)
- ❌ NO toccare scratchToolboxProgressive.js (è NON cabled, audit defer)
- ❌ NO `git add -A` su demo branch (controlla diff prima)
- ❌ NO claim "X funziona" senza test live con utente reale
- ❌ NO inflate score self-rate (CoV mandate)
- ❌ NO modify CircuitSolver.js / AVRBridge.js / PlacementEngine.js core (solo add)

---

## Co-Authored-By per commit format

Tutti i commit demo branch:

```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Conventional commit format `feat(demo):`, `fix(demo):`, `test(demo):`, `docs(demo):`,
`chore(demo):`.
