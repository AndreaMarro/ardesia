# iter 60 /ultrathink:ultrathink orchestrator brief — Blockly Nano R4 cross-compile

> Generated 2026-05-15 via `/ultrathink:ultrathink` Coordinator + 4-subagent (Architect + Research + Coder + Tester) parallel dispatch + synthesis.
> Status: DRAFT — pending Andrea ratify Q1-Q3 + Q8 + 3 carryover iter 58. Codex Pattern C-V verify final pending.

## Executive summary (5 bullets)

1. **Direction CONFIRMED**: Blockly preserved + cross-compile via `board` param + NO mBlock = doppia conferma robusta (Codex iter 58 + Lino iter 59 + Architect ADR-048 + Research). Andrea inclined Blockly + Lino "strada più facile" + Riccardo "termina prima resto" tutti convergenti.
2. **Recommended Option A backward-compat** (Architect ADR-048): default `arduino:avr:nano:cpu=atmega328old` PRESERVED + ALLOWED_COMPILE_BOARDS extend + BoardSelector radio toggle in compile region. Scope ~6h, zero regression risk, aligned con Riccardo+Lino mandate.
3. **Research surprise findings** (3 critici):
   - **3rd Renesas FQBN exists**: `arduino:renesas_uno:nanor4` (oltre `unor4wifi` + `minima`) — Q3 expanded a 3 opzioni vs 2.
   - **WiFi=bossac vs Minima/Nano R4=dfu-util** — Phase 4 future dual-path. Research correctly invalidato example dfu-util cmd `0x40010000` (citato in mio Research prompt) — actual Arduino official recipe: `dfu-util --device 0x2341:0x0369 -a 0 -D <bin> -Q` (NO `-s 0x40010000:leave`). **PRD doc stesso NON contiene quel cmd errato** (PRD lines 241/280/291 dicono solo "dfu-util" generale = corretto). Catch = anti-inflation Pattern C-V via Research subagent.
   - **WebSerial→RA4M1 DFU = 40-80h research project** zero OSS prior art. Strongly recommend Phase 4 DEFER iter 70+ OR descope completely. `arduino-create-agent` AGPL-3.0 alternative (invoke external NO fork).
4. **Coder scaffold delivered** (NO merge): BoardSelector.jsx 148 LOC stub disabled=true default + api-js-annotations.md diff preview NOT applied. ZERO src/services/api.js edits. ZERO src/components/simulator/panels/ScratchEditor.jsx edits. ZERO commit/push.
5. **Test plan complete**: 10 unit BoardSelector + 5 integration ALLOWED_COMPILE_BOARDS + 26 E2E parametric (13 Vol3 × 2 boards) + anti-regression gate (vitest 13118 PRESERVED) + Codex Pattern C-V per commit. Estimated vitest delta +15 arithmetic-proven post Phase 1.

## Subagent contributions (file references)

| Subagent | Deliverable | LOC | Key finding |
|---|---|---|---|
| **Architect** | [ADR-048 cross-compile board-param design](../adrs/ADR-048-blockly-nano-r4-cross-compile-board-param.md) | 288 | Option A recommended (~6h zero regression). **Slug collision flagged**: requested ADR-032 → renamed 048 (ADR-032 = existing Vertex EU Frankfurt iter 41-43 production-active per CLAUDE.md). |
| **Research** | [research findings Arduino-cli + Blockly v12 + Cloud Agent](../research/2026-05-15-iter-60-blockly-research-findings.md) | 344 | Assumption 1 CONFIRMED (arduino-cli renesas_uno v1.5.3 viable headless). Assumption 2 CONFIRMED Blockly Theme + PARTIAL touch targets (no `theme.touchTargets`, use `renderer:'zelos'` + CSS). Assumption 3 PARTIAL — `arduino-create-agent` viable, WebSerial direct = 40-80h research project. |
| **Coder** | [BoardSelector.jsx scaffold 148 LOC](../../src/components/simulator/panels/BoardSelector.jsx) + [api-js-annotations diff preview](../specs/2026-05-15-iter-60-api-js-annotations.md) | 148+51 | Stub disabled-by-default, 3-radio IT labels, localStorage `elab-compile-board`, ARIA radiogroup + arrow nav, touch ≥44px, palette CSS vars Navy/Lime, NO emoji, JSDoc explaining ratify-pending. Compliant CLAUDE.md rules 9+11+16+17. |
| **Tester** | [test plan Phase 1 R1-R6](../tests/2026-05-15-iter-60-blockly-phase1-acceptance-test-plan.md) | 191 | 10 unit + 5 integration + 26 E2E parametric + 1 anti-regression gate + Codex C-V per commit. E2E full sweep CI defer iter 61 (manual smoke 3 esperimenti iter 60). |

Total /ultrathink deliverables: **1022 LOC** across 5 files (4 docs + 1 src stub).

## Codex Pattern C-V verify status

Codex verify pendente per:
1. ADR-048 design decisions cross-check vs current src/ file:line citations
2. BoardSelector.jsx scaffold ARIA + touch ≥44px + CLAUDE.md rules compliance
3. Research findings URL bibliography validation (sample)
4. Test plan acceptance criteria coverage R1-R6

Run post-orchestrator brief commit per Pattern C-V mandate. Use `scripts/dev/codex-prompts/verify-anti-regression.txt` parametric.

## Andrea blockers (ratify queue ricalibrato 12 voci)

### Phase 1 entry (Q1-Q3 + Q3.5 NEW Research finding):

| Q | Question | Architect Option A reco | Research delta |
|---|---|---|---|
| Q1 | Default board iter 60 | AVR Nano backward compat | Confirmed safe (zero regression Vol3 existing 13) |
| Q2 | n8n SSH `arduino-cli core install arduino:renesas_uno` | BLOCKING PREREQ | v1.5.3 Feb 2026, headless install supported |
| Q3 | UNO R4 variant — WiFi / Minima | Architect: WiFi single entry | **Research: 3rd option `nanor4` FQBN exists** (consider) |
| Q3.5 NEW | Include `arduino:renesas_uno:nanor4` in allowlist? | Architect Option A scoped 2 entries — research suggests 3 | Andrea + Riccardo Omaric kit hardware decide |

### Phase 2-3 entry (Q4-Q7):
Carryover iter 59 audit — block label canon / icons emoji vs ElabIcons / per-experiment filter / walkthrough language.

### Phase 2+3 BLOCKING pilot gate (Q8):
NEW iter 62 entrance — Tea T4 first responder pilot 1 scuola con metric >30% lezioni uso Blockly editor.

### Carryover iter 58 A4.1e (3 voci):
v3-cap9 orphan + capitoli pages + capitoli titles align.

### RESEARCH FACTUAL CORRECTION (anti-inflation Pattern C-V catch):
Research subagent correttamente invalidato dfu-util example cmd `0x40010000` (citato in MIO research prompt — NOT nel PRD doc). Actual Arduino official recipe: `dfu-util --device 0x2341:0x0369 -a 0 -D <firmware.bin> -Q` (NO `-s start-address`). PRD addendum doc stesso NON contiene cmd errato — grep CONFIRM zero hits `0x40010000` in docs/specs/. **NO Andrea ratify needed** — error transient nel prompt, persistent docs OK. **Anti-confabulation win**.

## NEW NON-GOALS iter 60+ (Research-driven additions)

7. **WebSerial direct upload to RA4M1 via DFU** — 40-80h research project zero OSS prior art. **DEFER iter 70+ OR descope**. Strongly recommend `arduino-create-agent` external invocation (AGPL-3.0) instead of WebSerial custom implementation se Phase 4 si materializza.
8. **iPad / Safari / Firefox classroom support** — WebSerial NOT supported on these browsers (~27% users). Limit Phase 4 ambition to Chrome/Edge desktop only OR fully external Arduino IDE.
9. **Touch target via Blockly built-in theme** — NO `theme.touchTargets` API. Use `renderer: 'zelos'` (more touch-friendly built-in) + CSS overrides for ≥44px compliance.

## Updated phasing iter 60+ (post /ultrathink synthesis)

| Phase | Iter | Effort | Andrea gate | Note |
|---|---|---|---|---|
| **Phase 1** R1-R6 cross-compile | 60 | 6-8h | Q1+Q2+Q3+Q3.5 ratify | Option A backward-compat. Phase 4 upload web NOT in scope — docente uses Arduino IDE locale + USB cable. |
| **Workstream B PRIMARIO** carryover iter-21+ | 60-65 | 30-60h multi-iter | Riccardo "termina prima resto" | linguaggio codemod + 92 esperimenti UNO-PER-UNO + UX/UI overhaul + Passo Passo + HomePage + Glossario Tea + Vol3 narrative |
| **Pilot gate Q8** | 62 | Tea T4 + Andrea + 1 scuola pilot | Tea T4 first responder | >30% lezioni Blockly used per 1 settimana/mese |
| **Phase 2** UX overhaul R7-R13 | 66+ | 10-16h | Q4-Q6 + Q8 PASS | Blockly Theme `Blockly.Theme.defineTheme()` + Morfismo palette + `renderer:'zelos'` + Italian labels verbatim from a3-corrections + per-experiment filter |
| **Phase 3** Verification R14-R19 | 67+ | 6-10h | Q7 ratify | Playwright E2E + visual regression + Matteo UX test |
| **Phase 4 DEFER/DESCOPE** browser-agent + flash | 70+ OR never | 40-80h Research-flagged | Andrea ratify post Phase 1-3 + pilot result | `arduino-create-agent` external OR WebSerial 40-80h project — Research strongly recommends DEFER or DESCOPE in favor of docente Arduino IDE locale upload |

## Score iter 60 entrance pre-Phase-1 commit

Pre-execute (this brief + 5 deliverables + 4 subagent reports):
- /ultrathink:ultrathink Coordinator+4-agent DONE (Architect + Research + Coder + Tester).
- ADR-048 + research + test plan + BoardSelector scaffold = 1022 LOC produced.
- Codex Pattern C-V verify pendente final pre-commit.
- 12 voci ratify queue Andrea (Q1-Q3 + Q3.5 NEW + Q4-Q8 + 3 carryover + 1 PRD correction).

Score brief synthesis ONESTO G45: **8.8/10** (raw 9.2 capped) — +0.3 vs iter 59 entrance 8.5:
- +0.5 /ultrathink 4-agent synthesis delivered
- +0.3 Architect ADR-048 slug collision catch (anti-confabulation)
- +0.5 Research surprise findings (nanor4 3rd FQBN + dfu-util cmd correction + WebSerial 40-80h flag)
- +0.2 Coder scaffold clean (constraints respected)
- +0.3 Tester comprehensive plan
- −0.3 ZERO src code shipped Phase 1 (Andrea ratify Q1-Q3+Q3.5 pending)
- −0.4 Codex Pattern C-V final verify pendente
- −0.3 PRD addendum dfu-util cmd correction PENDING (iter 60 entrance fix)

## Next actions (orchestrator → user)

### Immediate (this turn):
1. Codex Pattern C-V BG verify ADR-048 + BoardSelector + brief consistency.
2. PRD addendum correction dfu-util command (Andrea ratify needed?).
3. Stage + commit /ultrathink deliverables (5 file) + this brief + push origin.

### Andrea iter 60 entrance actions:
4. Ratify 12 voci queue (~30-45 min):
   - Q1+Q2+Q3+Q3.5 Phase 1 entry
   - Q4-Q8 Phase 2-3 entry
   - 3 carryover iter 58 A4.1e
5. SSH verify n8n server `arduino-cli core install arduino:renesas_uno` (Q2 PREREQ).
6. Trigger `/ultrareview` autonomously — **USER-TRIGGERED ONLY**, Claude CANNOT launch.
7. Decide PRD addendum dfu-util correction apply NOW OR defer iter 70+ Phase 4 lookup time.

### Post Andrea ratify (iter 60 execute):
8. Coder Phase 1 R1-R6 execute (~6-8h):
   - Apply api-js-annotations.md diff to api.js:61 ALLOWED_COMPILE_BOARDS extend
   - Wire BoardSelector.jsx → ScratchEditor.jsx compile region (disabled=false)
   - OpenAPI yaml refine post Q3+Q3.5 final FQBN choice
   - API docs md update §7
   - vitest 13118 PRESERVED + new BoardSelector unit tests +10 → 13128 arithmetic-proven
   - Codex Pattern C-V `verify-anti-regression.txt` per commit
9. iter 60 close audit + score 8.7/10 ONESTO target.

### Workstream B P0 PRIMARIO parallel (iter 60-65):
10. Linguaggio codemod 200 violations singolare→plurale (Sprint U Cycle 1 audit ready).
11. 92 esperimenti Playwright UNO-PER-UNO entry (`elab-harness-real-runner` skill).

## NON COMPIACERE

- Phase 1 NO src code shipped yet (scaffold only, Andrea ratify Q1-Q3+Q3.5 pending).
- Phase 4 WebSerial→RA4M1 DFU = 40-80h project Research-flagged → STRONGLY recommend DEFER iter 70+ or descope completely.
- ~~PRD addendum dfu-util cmd `0x40010000` ERRATO~~ → CORRECTED: error nel mio Research prompt (transient), PRD doc OK (grep CONFIRM zero `0x40010000` hits in docs/specs/). Pattern C-V via Research subagent catched MY confabulation. Anti-inflation WIN.
- ADR-048 slug renumber 032→048 due collision Vertex EU ADR-032 existing.
- Codex Pattern C-V final verify pendente pre-commit.
- /ultrareview = USER-TRIGGERED only (Claude CANNOT launch).
- 12 voci Andrea ratify queue (Q3.5 NEW added — `nanor4` 3rd FQBN option Research-driven).

Score brief ONESTO G45 8.8/10 (raw 9.2 capped per penalties documented above).
