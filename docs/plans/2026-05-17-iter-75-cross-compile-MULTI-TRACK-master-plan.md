# PLAN — Cross-compile Nano R4 MULTI-TRACK iter 75+ master plan

**Owner**: Andrea Marro · **Date**: 2026-05-17
**Spec**: `docs/specs/2026-05-17-iter-75-cross-compile-nano-r4-CERTAINTY-master-spec.md`
**Andrea mandate**: "Concentra TUTTE le risorse + NON COMPIACERMI"

---

## Multi-track parallel orchestration GSD-2

### Resources

- **Orchestrator inline** (me): primary atoms
- **BG subagent A** frontend-developer (worktree isolato): CC-2 emoji→SVG + CC-4 USB Web Serial
- **BG subagent B** backend-security-coder (worktree isolato): CC-1 harden agent auth+Origin+rate-limit
- **BG subagent C** test-automator (worktree isolato): CC-5 E2E Playwright cross-compile flow
- **Mac Mini SSH** bash-native: documentation + audit (no code edit Mac Mini)
- **Codex BG Pattern V** verify post each major commit

### Disk budget

- Current 6.1Gi. 3 BG worktrees ~4.5Gi total (node_modules symlink trick + restricted scope each).
- Strict monitor: abort 3rd BG dispatch if disk < 5Gi.

---

## TRACK CC-1 — Harden ELAB Agent (BG subagent backend-security-coder ~2h)

**File ownership**:
- `src/services/elab-agent/http-server.js` (add auth + rate-limit + size-limit middleware)
- `src/services/elab-agent/cli.js` (load AGENT_TOKEN env)
- `src/components/lavagna/CompileUploadButton.jsx` (send X-Elab-Agent-Token header)
- `src/components/home/HomeCompileEntry.jsx` (send X-Elab-Agent-Token header)
- `src/services/api.js` (compileCode pass X-Elab-Agent-Token header)
- `src/services/compileAgentDetect.js` (probe with token)
- `tests/unit/services/elab-agent/http-server-security.test.js` NEW
- `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md` (update §security)

**ABSOLUTELY DO NOT TOUCH**: HomePage.jsx + NewElabSimulator.jsx (other tracks) + simulator engine

**Scope GSD-2 atomized**:
- CC-1.a `AGENT_TOKEN` env load (default fallback unique per-install OR generated openssl rand boot-time)
- CC-1.b Auth middleware reject 401 if X-Elab-Agent-Token mismatch (except /health probe)
- CC-1.c Rate limit max 10 req/min per origin (in-memory Map)
- CC-1.d Request size limit max 100KB sketch
- CC-1.e Strict Origin allowlist verify localhost:5173 dev + elabtutor.school prod
- CC-1.f Sandbox compile temp dir auto-cleanup post 5min idle
- CC-1.g Tests + ZERO regression vitest

**Honest gap**: token persistence across agent restart — file `~/.elab-agent-token` 0600 permissions OR transient. Decide.

---

## TRACK CC-2 — A.1 ScratchCompileBar emoji → SVG (orchestrator inline ~1h)

**File ownership**:
- `src/components/simulator/panels/ScratchCompileBar.jsx` (status icons ✅❌▶ → ElabIcons SuccessIcon/ErrorIcon/PlayIcon)
- `tests/unit/components/simulator/ScratchCompileBar-svg-icons.test.jsx` NEW (verify regola 11 NO emoji)

**Scope**:
- CC-2.a Verify SuccessIcon + ErrorIcon + PlayIcon exist in ElabIcons.jsx (check exports)
- CC-2.b Replace 3 emoji glyphs with SVG component refs
- CC-2.c Preserve color semantics (green success + red error + lime play)
- CC-2.d Test ZERO emoji unicode regola 11 compliance
- CC-2.e Browser smoke verify icons render correctly

---

## TRACK CC-3 — A.2 R5 banner real Chrome verify (orchestrator inline ~30min)

**Connettore**: control_chrome MCP

**Scope**:
- CC-3.a Start ELAB Agent local PID + verify /health
- CC-3.b control_chrome navigate localhost:5173/#compile-home
- CC-3.c Verify R5 CompileAgentBanner displays "Agent rilevato" state (NOT "Installa Agent")
- CC-3.d If FAIL → diagnose CORS OR fetch behavior real Chrome vs Playwright sandbox
- CC-3.e Document finding `docs/audits/2026-05-17-iter-75-A2-r5-banner-real-chrome-verify.md`
- CC-3.f Decide ELAB Agent bind 127.0.0.1 OK (per Codex iter 74 security) vs alternative

---

## TRACK CC-4 — A.3 USB Web Serial port detection (BG subagent frontend-developer ~2h)

**File ownership**:
- `src/services/usbPortService.js` NEW (Web Serial API wrapper)
- `src/components/simulator/NewElabSimulator.jsx` (use service + state mgmt)
- `src/components/home/HomeCompileEntry.jsx` (use service for port discovery)
- `tests/unit/services/usbPortService.test.js` NEW

**Scope**:
- CC-4.a `navigator.serial.requestPort()` user gesture flow
- CC-4.b `navigator.serial.getPorts()` previously authorized list
- CC-4.c Filter by USB vendor/product IDs (Arduino Nano R4 = vendor 0x2341 product 0x0070? verify)
- CC-4.d Graceful degradation Safari (no Web Serial — fallback message)
- CC-4.e State management React (selectedPort + portList)
- CC-4.f Pass detected port to ScratchCompileBar → CompileUploadButton (replace port=null)

---

## TRACK CC-5 — E2E Playwright cross-compile flow (BG subagent test-automator ~2h)

**File ownership**:
- `tests/e2e/cross-compile-flow.spec.js` NEW (Playwright + Chrome MCP integration)
- `tests/e2e/helpers/elab-agent-setup.js` NEW (start agent fixture)
- `playwright.config.js` (add new spec)

**Scope**:
- CC-5.a Fixture: start ELAB Agent localhost:8765 in beforeAll
- CC-5.b Test 1: navigate #compile-home → R5 banner shows online
- CC-5.c Test 2: navigate #tutor → Esperimento → ScratchEditor → drag Blink blocks → Compila button → success status
- CC-5.d Test 3: POST /compile directly via fetch → HEX bytes returned
- CC-5.e Test 4: cliffhanger CTA appears post compile success + click navigates next
- CC-5.f Fixture: stop ELAB Agent in afterAll
- CC-5.g Tests E2E pass standalone + integrate into npx vitest OR npx playwright test

---

## TRACK CC-6 — Hardware UAT extended docs (orchestrator inline ~30min)

**File ownership**:
- `docs/hardware/2026-05-17-iter-74-nano-r4-uat-prep.md` (extend with iter 75 hardening + Codex security findings)

**Scope**:
- CC-6.a Add section "Auth token setup" (`X-Elab-Agent-Token` configuration docente)
- CC-6.b Remove `0.0.0.0` bind suggestion (Codex iter 74 #3 security)
- CC-6.c Add section "Test E2E via Playwright" (CC-5 instructions for Andrea/Tea)
- CC-6.d Add section "Riccardo Omaric quick install" (linguaggio semplice no gergo per memory feedback_omaric_comms)
- CC-6.e Add troubleshooting section (USB cavo dati vs power + DFU mode + permissions macOS Sequoia)
- CC-6.f Add Sprint V Tauri distribution roadmap reference

---

## TRACK CC-8 — Codex BG Pattern V verify-iter75-cross-compile (orchestrator after merges ~6min)

**Approach**: single sequential dispatch CLAUDE.md iter 70 PHASE 4 lesson.

**Scope**:
- CC-8.a Wait all tracks CC-1, CC-2, CC-3, CC-4, CC-5 complete + commit
- CC-8.b Dispatch `verify-iter75-cross-compile-batch` Pattern V GPT-5.5 high
- CC-8.c Consume verdict, apply HIGH findings immediate
- CC-8.d MED findings → defer iter 76+

---

## TRACK CC-9 — Multi-agent BG dispatch matrix

| Track | Mode | Agent | Effort | Files |
|---|---|---|---|---|
| CC-1 | BG | backend-security-coder | ~2h | http-server + cli + 3 callers + test + docs |
| CC-2 | INLINE | orchestrator | ~1h | ScratchCompileBar + test |
| CC-3 | INLINE | orchestrator + control_chrome | ~30min | audit doc |
| CC-4 | BG | frontend-developer | ~2h | usbPortService + NewElab + HomeCompile + test |
| CC-5 | BG | test-automator | ~2h | E2E spec + helpers + config |
| CC-6 | INLINE | orchestrator | ~30min | docs/hardware extend |
| CC-8 | BG | Codex Pattern V | ~6min | verify single sequential |

**Pattern S r3 file ownership rigid**:
- CC-1 owns http-server + cli + api.js + CompileUploadButton + HomeCompileEntry **partial** (header send only)
- CC-2 owns ScratchCompileBar
- CC-4 owns usbPortService NEW + NewElabSimulator **partial** (port state mgmt) + HomeCompileEntry **partial** (port use)
- CC-5 owns tests/e2e + playwright.config

**Collision**: CC-1 + CC-4 both touch HomeCompileEntry. ATOMIZE: CC-1 ADD ONLY header send (~3 LOC), CC-4 ADD port state + dispatch (~30 LOC). Merge sequential: CC-1 first → CC-4 rebases.

**Collision**: CC-1 + CC-4 both touch NewElabSimulator. Same atomization: CC-1 header (~3 LOC), CC-4 port (~30 LOC). Merge sequential.

---

## Execution sequence iter 75 cross-compile sprint

**Phase 1** (orchestrator parallel ~1.5h):
1. Write SPEC + PLAN (done this turn)
2. CC-2 INLINE emoji → SVG (~1h)
3. CC-6 INLINE docs extension (~30min)
4. Commit + push

**Phase 2** (BG dispatch ~2h parallel):
5. Dispatch CC-1 BG backend-security-coder
6. Dispatch CC-5 BG test-automator
7. Orchestrator: CC-3 R5 banner real Chrome verify (~30min)

**Phase 3** (merge + integration):
8. Merge CC-1 worktree (security hardening) → cherry-pick mainwt
9. Dispatch CC-4 BG frontend-developer (rebased post CC-1 merge to avoid collision)
10. Merge CC-5 worktree (E2E tests) → cherry-pick mainwt

**Phase 4** (Codex verify):
11. CC-8 Codex Pattern V verify-iter75-cross-compile-batch dispatch
12. Consume verdict apply HIGH findings

**Phase 5** (close):
13. Iter 75 cross-compile close audit + handoff + CLAUDE.md APPEND
14. Push origin batch
15. Iter 76+ Andrea/Tea/Riccardo hardware UAT scheduling

## Risk + mitigation

| Risk | Mitigation |
|---|---|
| Disk overflow 3 BG worktrees | Strict monitor < 5Gi abort 3rd dispatch |
| BG agent collision NewElabSimulator | Sequential merge CC-1 → CC-4 |
| Codex 4-parallel hang (CLAUDE.md iter 70 lesson) | Single sequential dispatch ONLY |
| Test regression post BG merge | Pre-commit + pre-push hooks gate vitest 14374 baseline |
| Hardware UAT blocker | Defer iter 76+ explicit Andrea/Tea/Riccardo scheduling |
| Tauri installer scope creep | Sprint V+ explicit defer (40-80h) |

## Acceptance Phase by Phase

Phase 1 complete: SPEC + PLAN landed + CC-2 emoji→SVG shipped + CC-6 docs extended
Phase 2 complete: CC-1 + CC-5 BG agents dispatched + CC-3 R5 verify done
Phase 3 complete: CC-1 merged + CC-4 dispatched + CC-5 merged
Phase 4 complete: Codex verdict consumed + HIGH applied
Phase 5 complete: iter 75 cross-compile close pushed

## Iter 76+ hardware UAT trigger conditions

- Andrea ratify scheduling Tea + Riccardo Omaric session
- Omaric kit Nano R4 + USB-C dati cable available
- Mac Sequoia+ con arduino-cli + Renesas core + dfu-util installed
- ELAB Agent local PID running + auth token configured

## Cross-link

- SPEC: `docs/specs/2026-05-17-iter-75-cross-compile-nano-r4-CERTAINTY-master-spec.md`
- Hardware UAT prep iter 74: `docs/hardware/2026-05-17-iter-74-nano-r4-uat-prep.md`
- Codex iter 74 verdict: `/tmp/codex-verify-iter74-batch.txt`
- Iter 74 close audit: `docs/audits/2026-05-17-iter-74-CLOSE-audit.md`
- Iter 75 ENTRANCE B-1 wire commit: `19b74c9e`
