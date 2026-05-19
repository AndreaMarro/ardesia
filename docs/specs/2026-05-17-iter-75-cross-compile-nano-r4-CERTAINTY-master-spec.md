# SPEC — Cross-compile Nano R4 CERTAINTY master spec iter 75+

**Owner**: Andrea Marro · **Date**: 2026-05-17 · **Status**: DRAFT pending iter 75 execution
**Andrea mandate verbatim**: "Concentra TUTTE le risorse su un funzionamento CERTO della cross compilazione nanoR4. NON COMPIACERMI."

---

## Problem Statement

Cross-compile chain SOFTWARE end-to-end shipped iter 72-75 ENTRANCE (HomePage `#compile-home` entry + Esperimento ScratchEditor wire + ELAB Agent localhost:8765 + arduino-cli + Renesas core + dfu-util + FQBN whitelist + B-1 cliffhanger CTA wire runtime). HARDWARE UAT bloccato Andrea no Nano R4 board locale. Cross-compile **NON è "certa" finché**:

1. Software path = empirical 100% verified (current state ✅)
2. Hardware path = end-to-end Nano R4 USB upload reale verified (current state ⏸ bloccato hardware)
3. Edge cases = handled (cavo dati vs power, DFU mode, permissions, errore stderr)
4. UX docente = chiunque scuola pubblica può usare senza training (PRINCIPIO ZERO mandate)
5. Distribuzione = installer signed Tauri OR docs install bash riproducibile
6. Security = agent loopback-only + auth token + strict Origin allowlist
7. Monitoring = Sentry/PostHog telemetry production observability
8. Regression guard = E2E tests Playwright cross-compile + Codex Pattern V continuous verify

## Users

| Persona | Role | Certezza expectation |
|---|---|---|
| **Primary** docente scuola pubblica 8-14 (LIM) | Tramite Principio Zero proietta UNLIM + Blockly su LIM | "Premo Compila → kit ragazzi funziona. Senza training. Senza paura." |
| **Secondary** studenti 8-14 (via LIM) | Vedono LIM proiettata + lavorano kit fisico | Blocchi Blockly comprensibili + LED Nano R4 lampeggia post-upload |
| **Tertiary** Andrea + Tea + Matteo | Co-dev + tester + onboarding | E2E flow reproducible + Codex verify catches HIGH bugs invisible self-review |
| **Quaternary** Riccardo Franzoso (Omaric) | Partner hardware Strambino | Install agent + USB Nano R4 detect + upload sketch end-to-end SUCCESS. Linguaggio semplice no gergo strategico (memoria feedback_omaric_comms.md) |

## Goals

### G1 — SOFTWARE CERTAINTY (current state ✅ + harden)

- Compile Nano R4 FQBN `arduino:renesas_uno:nanor4` → HEX 39048 bytes (14%) + 3940 RAM (12%) ✅
- POST /compile via agent jobId SUCCESS ✅
- ScratchCompileBar runtime wire next_experiment (iter 75-B1-FIX) ✅
- **HARDEN**: 
  - Agent auth token header `X-Elab-Agent-Token` mandatory (Codex iter 74 security finding)
  - Strict Origin allowlist via `ALLOWED_ORIGINS` (already iter 70 P0.5 MA verify localhost:5173 + production)
  - Keep `127.0.0.1` bind (NO `0.0.0.0` per Codex iter 74 #3)
  - Rate limiting (max 10 req/min per origin)
  - Request size limit (max sketch 100KB)
  - Sandbox compile via temp dir + auto-cleanup

### G2 — HARDWARE CERTAINTY (BLOCKED Andrea Nano R4 board)

- USB Nano R4 detect via `arduino-cli board list` → /dev/cu.usbmodemXXXX
- Upload sketch via `arduino-cli upload -p /dev/cu.usbmodem* --fqbn arduino:renesas_uno:nanor4`
- LED Nano R4 builtin lampeggia 1Hz post-upload (Blink test)
- DFU mode handling (doppio click reset)
- Cavo dati vs power detection (debug docente)

**Acceptance**: Andrea OR Tea OR Riccardo Omaric esegue `docs/hardware/iter-74-nano-r4-uat-prep.md` step 1-7 → tutti PASS empirical + screenshot LED lampeggia.

### G3 — EDGE CASES HANDLING

- Stderr arduino-cli parse + Italian K-12 friendly message (es. "Mancante: }" → "Ragazzi, manca una parentesi graffa")
- USB permissions macOS Sequoia+ (no root required, MA verify)
- DFU mode timeout handling
- Network offline (agent localhost = OK MA Edge Function calls fail gracefully)
- Disk space check pre-compile (~5MB tmp dir required)

### G4 — UX DOCENTE CERTAINTY (PRINCIPIO ZERO)

- HomePage card "Compila Arduino" rendering OK + click navigate (verified iter 73 CC-2 F1+F2+F3)
- Plurale "Ragazzi" copy (verified iter 73 CC-2 + iter 74 B-1)
- Kit fisico mention obbligatorio (verified iter 73 CC-2)
- ZERO emoji icone (Codex Regola 11 gap remains: ScratchCompileBar status ✅❌▶ pending iter 75 A.1)
- Touch 44px (verified iter 73 CC-2 + iter 74 A2 a11y outline)
- WCAG AA contrast (toast iter 74 75-B.2 fix + footer iter 74 A.2)

### G5 — DISTRIBUZIONE CERTAINTY

**Iter 75-76 path**:
- Docs install bash `docs/hardware/iter-74-nano-r4-uat-prep.md` (iter 74 A.4 shipped, sezioni 1-3)
- Andrea/Tea/Riccardo esegue manualmente terminale
- **NO Tauri signed installer iter 75** (defer iter 76+ Sprint V $300/yr Apple Dev ID + cross-platform pipeline 40-80h scope)

**Sprint V iter 80+ path**:
- Tauri signed installer Apple Dev ID + Microsoft cert
- Auto-update Tauri native
- Cross-platform Mac/Win/Linux build pipeline
- Code signing + notarization workflow

### G6 — SECURITY CERTAINTY (Codex iter 74 finding hardening)

- Agent loopback-only `127.0.0.1:8765` (DEFAULT)
- Auth token header `X-Elab-Agent-Token` (NEW iter 75)
- Strict Origin allowlist (verify iter 70 implementation + tighten)
- Rate limiting (NEW iter 75)
- Sandbox compile temp dir + auto-cleanup (verify iter 70 implementation)
- Request size limit (NEW iter 75)
- NO `0.0.0.0` bind suggestions (Codex iter 74 fix iter 75 docs)
- NO LAN exposure by default

### G7 — MONITORING CERTAINTY

**Iter 75 path**:
- Console.log structured JSON (verified iter 70+)
- Sentry MCP install + telemetry deploy (Andrea OAuth pending iter 75+ Andrea action)
- PostHog product analytics (Andrea OAuth pending)

**Sprint V iter 80+ path**:
- Distributed tracing OpenTelemetry
- SLI/SLO dashboards
- Alert rules production

### G8 — REGRESSION GUARD

- E2E Playwright cross-compile flow HomePage + Esperimento (iter 75 NEW)
- Unit tests cliffhanger-cta-transitions 16 PASS (iter 74 B-1 shipped)
- Codex Pattern V verify each major commit (iter 75 continuous)
- Pre-commit + pre-push hooks gate vitest 14374 baseline (iter 74 shipped)
- Hard gate `validate-lesson-paths.mjs` 94/94 pass (iter 57 shipped)

## Non-Goals (espliciti)

1. **Nano R4 in-browser simulation** (Cortex-M4 emulator iter 80+ defer)
2. **mBlock pivot** (iter 58 REJECTED Andrea — replacement Blockly direction iter 59 PRD)
3. **Vol4 narrative refactor** (Davide co-author Sprint V+ deferred)
4. **94 esperimenti Playwright UNO PER UNO audit** (Andrea iter 21+ carryover Sprint V+ deferred)
5. **HomeCompileEntry experiment picker** (iter 75 ENTRANCE deferred — stand-alone Blockly draft sandbox no current experiment context required for basic compile)
6. **AI code review auto-suggest** (iter 80+)

## Acceptance Criteria CERTAINTY

| Criterion | Verification method | Owner | Status iter 75 |
|---|---|---|---|
| AC-1 SOFTWARE chain end-to-end | `arduino-cli compile --fqbn arduino:renesas_uno:nanor4 blink.ino` SUCCESS + `curl POST /compile` jobId | Orchestrator | ✅ |
| AC-2 ScratchCompileBar runtime wire | NewElabSimulator passes next_experiment + onLoadNextExperiment | Orchestrator | ✅ 19b74c9e |
| AC-3 Agent auth token mandatory | Header `X-Elab-Agent-Token` validation + reject 401 | Orchestrator iter 75 CC-1 | ⏸ |
| AC-4 Status icons SVG NO emoji | `ScratchCompileBar.jsx` ZERO ✅❌▶ chars | Orchestrator iter 75 A.1 | ⏸ |
| AC-5 R5 banner real Chrome verify | `control_chrome` connector navigate + agent online status display | Orchestrator iter 75 A.2 | ⏸ |
| AC-6 USB Web Serial port detect | `navigator.serial.requestPort()` integration | Orchestrator iter 75 A.3 | ⏸ |
| AC-7 E2E Playwright cross-compile | spec `tests/e2e/cross-compile-flow.spec.js` PASS | Orchestrator iter 75 CC-5 | ⏸ |
| AC-8 Hardware UAT Nano R4 USB upload | Andrea/Tea/Riccardo execute UAT docs + screenshot LED blink | Andrea/Tea/Riccardo iter 76+ | ❌ BLOCKED |
| AC-9 Codex Pattern V verify-iter75 | Codex BG verdict CONFIRM all atoms | Orchestrator iter 75 CC-8 | ⏸ |
| AC-10 ZERO regression vitest baseline | 14374 PASS preserved (or higher) | Orchestrator continuous | ✅ baseline 14374 |

## CERTAINTY definitions

**SOFTWARE certain**: AC-1+2+3+4+5+6+7+9+10 all ✅ (achievable iter 75 via this spec)
**HARDWARE certain**: AC-8 ✅ (requires Andrea/Tea/Riccardo physical session)
**FULL certain**: SOFTWARE + HARDWARE both ✅ (iter 76+ Andrea ratify UAT scheduling)

## Honesty caveats

1. "FULL certainty" technically IMPOSSIBLE without physical hardware testing — orchestrator inline cannot generate hardware certainty by itself.
2. Even with all SOFTWARE acceptance ✅, REAL docente scuola pubblica field test required iter 80+ for true UX certainty (vs synthetic Playwright E2E).
3. Tauri signed installer Sprint V+ scope ($300/yr + cross-platform pipeline) — iter 75-76 distribution via bash docs only.
4. Sentry/PostHog monitoring Andrea OAuth pending — iter 75+ Andrea action interactive.
5. Iter 80+ in-browser Nano R4 simulation (Cortex-M4 emulator) = 12-20 FTE-weeks unrelated work, NO iter 75 scope.
6. Hardware UAT acceptance criteria depend on Andrea/Tea/Riccardo availability + Omaric kit physical board.
7. Codex Pattern V workflow validated 2 iter (73 + 74) MA continuous verify iter 75+ requires Codex BG dispatch each major commit (token cost).

## Cross-link

- iter 64 SPEC: `docs/specs/2026-05-15-elab-compile-agent-public-distribution-spec.md`
- iter 59 PRD: `docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md`
- iter 63 architecture: `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md`
- iter 74 hardware UAT prep: `docs/hardware/2026-05-17-iter-74-nano-r4-uat-prep.md`
- iter 73 CC-2 close: `docs/audits/2026-05-17-iter-73-CLOSE-audit.md`
- iter 74 close: `docs/audits/2026-05-17-iter-74-CLOSE-audit.md`
- Codex iter 73 output: `/tmp/codex-verify-iter73-cc2.txt`
- Codex iter 74 output: `/tmp/codex-verify-iter74-batch.txt`
- Nano R4 board profile: `src/boards/arduino-nano-r4.json`
- Riccardo Omaric comms: `memory/feedback_omaric_comms.md`
