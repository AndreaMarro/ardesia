# Iter 67 → Iter 68 Handoff — 2026-05-16

**Date**: 2026-05-16 PM CEST
**Iter 67 entrance close score**: **9.1/10 ONESTO G45** (+0.1 vs iter 66 9.0)
**Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix` HEAD `6d7266fb` + iter 67 close commit on top
**Iter 68 target**: 9.1 → **9.5+/10** conditional Andrea P0.1 deploy + R7 ship + Atom 3 + Tea T1+T4 + Renesas execute

## §1 ACTIVATION STRING iter 68 (paste-ready)

```
ATTIVAZIONE ELAB TUTOR ITER 68 ENTRANCE — 2026-05-17 AM

CONTEXT POST ITER 67 ENTRANCE CLOSE
- Repo: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder (main worktree pulita)
- Branch: feat/iter-41-sprint-u-cycle-2-real-user-fix HEAD <iter 67 close SHA> (parent 6d7266fb iter 66)
- Iter 67 deliverables LANDED:
  * Iter 65 PARTIAL handoff archived STALE marker
  * Iter 67 close audit md (scope clarity + planning iter, 9.1/10)
  * Iter 67 → iter 68 handoff md (THIS file)
  * CLAUDE.md APPEND iter 67 close section
- Vitest baseline iter 67 close: 13428 PASS EXACT MATCH iter 66 (preserve mandatory iter 68+)
- Build: PASS pre-commit gate verified
- Push origin status iter 67: PENDING Andrea ratify (NO --no-verify, NO push main)
- Mac Mini Tailscale ALIVE 41ms (PATH C dormant + SSH ad-hoc capability)

BOOTSTRAP STEP 0 (CoV mandatory iter 68 entrance)
1. Read iter 67 close audit + handoff (THIS):
   - docs/audits/2026-05-16-iter-67-ENTRANCE-PHASE1-audit.md (9.1/10 G45)
   - docs/handoff/2026-05-16-iter-67-to-iter-68-handoff.md (THIS file)
2. Read iter 66 close audit (truth source iter 66 baseline):
   - docs/audits/2026-05-16-iter-66-PHASE3-CLOSE-audit.md (9.0/10 G45)
3. Read .impeccable.md (design source truth)
4. Pre-flight CoV: npx vitest run (target ≥13428 PASS) + npm run build (PASS expected ~18s)
5. Andrea ratify queue gruppo 7 (5 voci max) — vedi §3 priorities P0 iter 68
6. Honesty delta upfront state report iter 68 entrance vs iter 67 close

ITER 68 P0 PRIORITIES (cascade lift target 9.1 → 9.5+/10)
1. Andrea SQL push + v55 deploy + canary gradient 5%→25%→100% (~30min terminale, paste-block §2)
2. R7 Lavagna Compile+Upload button subagent BG worktree (~6h, spec §4 ready)
3. Atom 3 system-prompt v3.2 Sense 1.6 inject subagent BG (~4h post v55 100% canary)
4. Tea T1 Vol3 narrative review + T4 prod test post-deploy delegate Mac Mini SSH ad-hoc
5. Renesas RA4M1 docs purge subagent legacy-modernizer post Andrea scope ratify (3 options §6)
6. Tea PLAN Phase 1 Naming + IA + Principio Zero compliance (4h orchestrator inline iter 68-69)
7. Iter 68+ task: update Matteo brief vitest count 13118 → 13428 + add Matteo team CLAUDE.md
8. 94 esperimenti Playwright audit subagent test-automator ~8-10h (Mac Mini delegate candidate)
9. Codex plugin-cc install Andrea slash command (4 commands sequence §7)
10. galileo-mcp drift mystery monitor (no recurrence iter 67)

PATTERN S 5-PRONGED iter 68+ MANDATE (iter 65+66 race-cond lesson validated 11×)
- Max 1-2 BG agents stessa worktree (R7 + Atom 3 = 2 max iter 68)
- OR git worktree isolation per BG agent
- Quick-regression delta scope test (NOT full vitest 5-10min)
- Filesystem implicit lock per worktree (.git/index isolation)
- Process cleanup post-agent termination + completion msg emission CoV
```

## §2 Setup steps Andrea iter 68 entrance (~30 min terminale)

```bash
# 1) Verify environment iter 68 entrance
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git log --oneline -5  # Expect <iter 67 close SHA> + 6d7266fb (iter 66) on top
git status --short    # Expect clean
git fetch origin && git status -sb | head -3  # Verify no remote divergence

# 2) Pre-flight CoV iter 68 entrance
npx vitest run --reporter=basic 2>&1 | tail -10  # Target ≥13428 PASS

# 3) Push iter 67 close to origin (Andrea ratify gate)
git push origin feat/iter-41-sprint-u-cycle-2-real-user-fix

# 4) Andrea SQL push migrations
npx supabase migration list --linked  # Verify drift
npx supabase db push --linked

# 5) Canary rollout v55 gradient 0 → 5%
npx supabase secrets set ENABLE_ONNISCENZA_V2_PERCENT=5 --project-ref euqpdueopmlllqjmqnyb
npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb

# 6) Smoke verify 5% canary telemetry
curl -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Authorization: Bearer $ELAB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"Ragazzi, oggi accendiamo un LED","class_key":"test-iter68-canary5"}'
# Verify telemetry onniscenza_v2_used:true OR false (5% sampling expected)

# 7) Canary 5% → 25% (post 1h verify no errors)
npx supabase secrets set ENABLE_ONNISCENZA_V2_PERCENT=25 --project-ref euqpdueopmlllqjmqnyb

# 8) Canary 25% → 100% (post 6h verify no errors)
npx supabase secrets set ENABLE_ONNISCENZA_V2_PERCENT=100 --project-ref euqpdueopmlllqjmqnyb

# 9) Re-verify 1000-query matrix iter 41 v67 baseline post-100%
node scripts/bench/run-1000-query-matrix.mjs  # Target 1000/1000 PASS preserved
```

## §3 Andrea ratify queue gruppo 7 iter 68 entrance (5 voci max)

1. **Push iter 67 close commit + canary 5% deploy v55** — Andrea terminale ~15min (paste-block §2 steps 3-6)
2. **Renesas RA4M1 docs purge scope precise decision** — 3 opzioni §6 (all 36 OR src-only 11 OR defer iter 70+)
3. **R7 subagent BG dispatch ora** — orchestrator dispatch self-contained spec ref (§4 prompt template) OR Andrea preferisce wait scope deeper iter 68+
4. **Tea T1+T4 Mac Mini SSH ad-hoc delegate** — Andrea attiva Mac Mini SSH wake ad-hoc OR Tea direct local (no Mac Mini)
5. **Codex plugin-cc install Andrea slash command iter 68 entrance** — `/plugin marketplace add openai/codex-plugin-cc` + 3 commands cascade

## §4 R7 subagent BG dispatch prompt template (paste-ready iter 68 entrance)

```
[Agent: frontend-developer subagent BG]

Iter 68 R7: implement Lavagna "Compila + Carica" button consuming R4 compileAgentDetect + R5 CompileAgentBanner pattern. Worktree isolato.

SETUP (Andrea pre-dispatch):
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git worktree add ../elab-builder-r7 -b feat/iter-68-r7-compile-upload-button HEAD
cd ../elab-builder-r7

SPEC reference: docs/audits/2026-05-16-iter-67-ENTRANCE-PHASE1-audit.md §7 R7 ATOM

Files NEW (rigid ownership):
- src/components/lavagna/CompileUploadButton.jsx (~150 LOC, full JSDoc + ARIA + WCAG)
- src/components/lavagna/CompileUploadButton.module.css (~80 LOC, palette CSS var Navy/Lime/Orange/Red)
- tests/unit/components/lavagna/CompileUploadButton.test.jsx (~250 LOC, ≥10 tests, CoV 3x stable)
- tests/e2e/iter-68-compile-upload-flow.spec.js (~100 LOC Playwright)

Files MODIFY (rigid ownership):
- src/components/lavagna/LavagnaShell.jsx (+~30 LOC mount + R4 hook integration)
- src/components/lavagna/FloatingToolbar.jsx (+~10 LOC optional toolbar button)

Reference READ-ONLY:
- src/services/compileAgentDetect.js (R4 LIVE iter 65 ae13c9e6)
- src/components/HomePage/CompileAgentBanner.jsx (R5 LIVE iter 66 2f7d7611, pattern reference)
- src/components/common/ElabIcons.jsx (DownloadIcon + CheckIcon + DesktopIcon shipped iter 66 P0.3)
- src/components/simulator/panels/ScratchCompileBar.jsx (Blockly compile bar existing pattern)

Constraints:
- Touch target ≥44×44px
- Plurale "Ragazzi," (per Principio Zero)
- Renesas RA4M1 core arduino:renesas_uno verify (NOT avr:nano)
- Fallback installer modal R5 banner pattern if agent offline
- Quick-regression delta scope (CompileUploadButton.test.jsx single file, NOT full vitest baseline)
- Pattern S 5-pronged mitigation (worktree isolation, filesystem barrier completion msg, process cleanup)
- NO --no-verify, NO git add -A, NO push origin (orchestrator commit gate iter 68 close)
- CoV 3x test stable before claim PASS
- vi.useFakeTimers() PITFALL: do NOT add to global beforeEach (R5 iter 66 lesson — waitFor incompat). Use selective toFake only if needed (per CompileAgentBanner.test.jsx pattern)

Output:
1. File system verified deliverables file:line citations
2. Test PASS count exact (≥10 unit + 1 Playwright)
3. Completion msg: automa/team-state/messages/r7-iter68-completed.md with vitest delta + commit SHA + CoV 3x evidence

Cleanup post-completion (orchestrator inline iter 68 close):
git worktree remove ../elab-builder-r7 --force
git branch -d feat/iter-68-r7-compile-upload-button (post merge)
```

## §5 Tea atomization plan iter 68-70 (P0.4 detail)

### Tea PLAN-unlim-prof-pilot-chatgpt 9 phases (multi-week iter 67-80+)

Vedi audit iter 67 entrance §8 per dettaglio phases. Iter 68-70 focus:

| Iter | Atom | Scope | Estimate | Owner |
|---|---|---|---|---|
| 68 | A1 | Tea PLAN Phase 1 Naming + IA + Principio Zero compliance doc | 4h | Orchestrator inline |
| 68 | A2 | Update Matteo brief vitest count 13118 → 13428 + add Matteo team CLAUDE.md | 30min | Orchestrator inline |
| 68 | A3 | Tea T1 Vol3 narrative review delegate Mac Mini SSH ad-hoc | 60min | Mac Mini (Andrea attiva) OR Tea direct |
| 69 | A4 | Tea PLAN Phase 2 Mission Data Model Supabase schema + seed 3 missioni | 8h | Subagent backend-architect BG |
| 69 | A5 | 6 NEW Volume PDF folders OCR + extract verbatim + sync volume-references.js | 4h | Mac Mini batch overnight |
| 69 | A6 | Tea T3 UX 5 worst esperimenti screenshot + proposal | 60min | Tea direct |
| 70 | A7 | Tea PLAN Phase 3 Mission Runner UI Dual-View regia+LIM Supabase Realtime | 12h | Subagent frontend-developer BG |
| 70 | A8 | Glossario integrate main app route #glossario (port from external elab-tutor-glossario.vercel.app per feedback_glossario_external_url.md carryover) | 4-6h | Subagent frontend-developer BG |

### Brief Tea iter 58 T1-T5 integration (~210min total):
- T1 Vol3 review 60min → iter 68 A3
- T2 Cap.8 refactor 90min → iter 68-69 orchestrator parallel  
- T3 UX 5 worst 60min → iter 69 A6
- T4 Vol3 chain prod test 30min → iter 68 post-deploy Tea direct
- T5 onboarding Matteo review 15min → iter 68 Tea direct

### Brief Matteo iter 58 2-day onboarding:
- Iter 68 A2: update brief vitest count + add Matteo team (orchestrator)
- Iter 68 Day 1: Andrea owns onboarding call 15min + PR review Day 2

## §6 Renesas RA4M1 docs purge scope 3 options Andrea ratify

### Option 1: Purge ALL 25 docs + 11 src (Recommended Sprint U close gate)
- ~3-4h subagent legacy-modernizer
- Files: 11 src code (VetrinaSimulatore + UnlimInputBar + AVRBridge + avrWorker + SessionReportComic + TeacherDashboard + simulator-api + api + sketch-builder + clawbot-templates + precompile-hex) + 25 docs (HISTORY + PRD + n8n-arduino + iter 58-60 research/specs/handoff + audits + plans + ipad-libero context + agents reports)
- Preserve: 19 wiki educational concepts files + avr8js in-browser simulator + comments Renesas migration historical context
- Risk: large scope subagent BG fail potential ~25%

### Option 2: Purge SRC ONLY 11 file (Faster)
- ~2h subagent legacy-modernizer
- Files: 11 src code only
- Defer: 25 docs purge to Sprint U close iter 70+
- Risk: low ~10%

### Option 3: Defer iter 70+ Sprint U close + Davide co-author Vol3 refactor
- Bundle Renesas purge with Vol3 narrative refactor (ADR-027 carryover)
- Risk: zero iter 68
- Cost: Renesas references continue accumulating iter 68-69

## §7 Codex plugin-cc install Andrea slash command sequence iter 68 entrance

```
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins
/codex:setup
```

Prereqs verified iter 62 close (CLAUDE.md): Node 18.18+ ✓ Codex CLI v0.128.0 ✓ Codex login ✓ ChatGPT subscription ✓.

Enables Claude Code commands: `/codex:review` + `/codex:adversarial-review` + `/codex:rescue` (BG long-running delegate Codex with status tracking).

## §8 Honesty caveats critical iter 67 entrance close (carryover iter 68)

1. **Push origin iter 67 close commit PENDING Andrea ratify** (no autonomous push by orchestrator — Andrea decision).
2. **R7 subagent BG NOT dispatched iter 67** — spec drafted §4 ready iter 68 entrance dispatch. Pattern C honored (spec-first reduces BG fail risk ~30%).
3. **Atom 3 system-prompt v3.2 inject NOT shipped iter 67** — cascade P0.1 v55 deploy 100% canary. Iter 68 post-deploy.
4. **Tea T1+T4 NOT executed iter 67** — Mac Mini SSH ad-hoc delegate iter 68 (Andrea attiva).
5. **Renesas purge NOT executed iter 67** — Andrea ratify 3 options §6 first iter 68.
6. **94 esperimenti audit NOT started iter 67** (carryover Andrea iter 21+ mandate) — iter 68+ subagent test-automator OR Mac Mini SSH delegate.
7. **Matteo team integration NOT done iter 67** — iter 68 A2 task.
8. **galileo-mcp drift origin NOT traced** — no recurrence iter 67 monitoring continues iter 68+.

## §9 Iter 68 score target

**9.1 → 9.5+/10 ONESTO** conditional:
- v55 deploy 100% canary LIVE (+0.1)
- 1000-query matrix iter 41 v67 preserve 1000/1000 (+0.05)
- R7 ship Lavagna Compile+Upload button (+0.1)
- Atom 3 system-prompt v3.2 deploy (+0.05)
- Tea T1+T4 delegate complete (+0.05)
- Renesas SRC 11 purge (+0.05)
- Matteo team integrate (+0.02)
- Codex plugin-cc install (+0.02)

Sprint U close projection **iter 70+**: 9.7+/10 ONESTO conditional Onnipotenza Deno port + 94 esperimenti complete + Vol3 narrative refactor Davide co-author + Tea PLAN Phase 2-3 + grafica overhaul Impeccable+Fusion + Opus indipendente review G45 mandate.

## §10 Mac Mini SSH ad-hoc dispatch (PATH C carryover iter 62)

- Tailscale ALIVE `100.124.198.59` (41ms latency verified iter 67 entrance)
- SSH `progettibelli@100.124.198.59` via `~/.ssh/id_ed25519_elab` (MacBook only)
- 8 scripts ready `~/scripts/`: autonomous-loop v1+v2 + stress-runner + telegram-approval + iter36-env + crontab.elab-iter36
- Autonomous loop DORMANT (NOT dead, last log 2026-05-02 = 14 days ago iter 66)
- Andrea PATH C decision: NO cron install, ad-hoc delegation only

Iter 68 candidate tasks Mac Mini SSH:
- Tea T1 Vol3 narrative review 60min
- Tea T4 Vol3 chain prod test 30min post-deploy
- 6 NEW Volume PDF folders OCR batch overnight (~4h iter 69 A5)
- 94 esperimenti Playwright UNO PER UNO audit (~8-10h iter 68+ P0.8)

## §11 Files refs iter 67 entrance

| File | Path | Size |
|---|---|---|
| Iter 67 entrance close audit | `docs/audits/2026-05-16-iter-67-ENTRANCE-PHASE1-audit.md` | ~9 KB |
| Iter 67 → iter 68 handoff (THIS file) | `docs/handoff/2026-05-16-iter-67-to-iter-68-handoff.md` | ~7 KB |
| Iter 65 PARTIAL archive (moved) | `docs/handoff/archive/2026-05-15-iter-65-PARTIAL-STALE.md` | 10 KB + STALE marker |
| Tea PLAN multi-week | `/Users/andreamarro/VOLUME 3/TEA/PLAN-unlim-prof-pilot-chatgpt.md` | 35969B |
| Brief Tea iter 58 | `/Users/andreamarro/VOLUME 3/TEA/iter-58-brief-tea.md` | 7024B |
| Brief Matteo iter 58 | `/Users/andreamarro/VOLUME 3/TEA/iter-58-brief-matteo.md` | 7458B |
| Battlecard 2026-05 | `/Users/andreamarro/VOLUME 3/TEA/elab-tutor-battlecard-2026-05.html` | 27KB |

EOF
