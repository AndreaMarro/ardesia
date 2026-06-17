# Orchestrator iter 36 START — Pattern S r3 PHASE-PHASE

**Timestamp**: 2026-04-30T12:18Z
**Branch**: `e2e-bypass-preview`
**HEAD**: `91cbdf6`
**Baseline tag**: `iter-36-phase-0-1411`
**Vitest baseline**: 13212 (running BG verify count current; CLAUDE.md afferma 13233 iter 32)
**Mac Mini Cron iter 36 LIVE**: 4 crontab entries installed (L1 5min + L2 30min + L3 2h + aggregator 15min)
**Mac Mini smoke L1**: 5/5 PASS (homepage + 3 Edge OPTIONS + sw.js)

## §1 Phase 1 task assignments (6 agents parallel)

| Agent | Atomi | File ownership | Time budget |
|-------|-------|----------------|-------------|
| **Maker-1 backend-architect** | A1 (INTENT parser server-side) + A2 deploy (defer ratify Andrea) | `supabase/functions/_shared/intent-parser.ts` NEW + `supabase/functions/unlim-chat/index.ts` MODIFY | 4-6h |
| **Maker-2 code-architect** | A3 (ADR-028 Onnipotenza dispatcher) | `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` NEW (~400 LOC) | 2h |
| **WebDesigner-1 frontend-developer** | A4 (Modalità Percorso fix) + A13 partial (Homepage hero+typeset+colorize) | `src/components/lavagna/ModalitaSwitch.jsx` + `src/components/lavagna/LavagnaShell.jsx` + `src/components/HomePage.jsx` REWRITE | 4-5h |
| **WebDesigner-2 code-architect UX** | A5 (FloatingWindow LessonReader) + A6 (UNLIM tabs sovrap fix) | `src/components/common/FloatingWindow.jsx` NEW + `src/components/lavagna/GalileoAdapter.jsx` MODIFY | 4-5h |
| **Tester-1 team-debugger** | A7 (Fumetto E2E) + A8 (Lavagna persistence E2E) | `tests/e2e/03-fumetto-flow.spec.js` NEW + `tests/e2e/04-lavagna-persistence.spec.js` NEW | 2h |
| **Tester-2 debugger** | A9 (Wake word) + parallel-debug A4+A6 hypotheses | `tests/unit/services/wakeWord.test.js` MODIFY + `tests/unit/intent-parser.test.js` NEW | 2h |

## §2 Inter-agent completion barrier

Every agent MUST emit completion message at:
`automa/team-state/messages/{agent}-iter36-phase1-{STATUS}.md`

STATUS=in_progress|completed|blocked

Phase 2 Documenter spawn ONLY after 6/6 `*-completed.md` filesystem barrier verified.

## §3 PRINCIPIO ZERO + MORFISMO compliance gate

Every atom MUST PASS 8/8 gate (PDR §0):
1. Linguaggio plurale Ragazzi + Vol/pag verbatim ≤60 parole
2. Kit fisico mention every response/tooltip/empty state
3. Palette compliance (no hard-coded colors, design tokens Navy/Lime/Orange/Red)
4. Iconografia ElabIcons (no material-design generic)
5. Morphic runtime (no static config)
6. Onniscenza cross-pollination L1+L4+L7 minimum
7. Triplet coherence kit Omaric SVG
8. Multimodale Voxtral voice clone Andrea + Vision Gemini Flash EU + STT CF Whisper EU

## §4 Anti-inflation G45 cap 8.5

Atoms passed / 12 base + Atom A13 = 13 max. Score formula PDR §4.

NO claim PASS without file-system verified deliverables.

## §5 Anti-regressione FERREA

- vitest 13233 PASS (or 13212 baseline file) NEVER scendere
- build PASS NEVER skip Phase 3 verify
- pre-push hook NEVER bypass `--no-verify`
- guard-critical-files.sh blocca CircuitSolver/AVRBridge/PlacementEngine senza marker

## §6 Andrea env required for prod deploy (DEFER iter 37 if missing)

- A2 Vision deploy → SUPABASE_ACCESS_TOKEN required
- Edge Function unlim-chat redeploy con Atom A1 INTENT dispatcher → ratify Andrea
- Latency p95 measure → require ELAB_API_KEY + SUPABASE_ANON_KEY local env

## §7 Mac Mini Cron LIVE iter 36 verify

```bash
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'crontab -l | grep iter36-cron.log | wc -l'
# Expected: 4 (L1 + L2 + L3 + aggregator)
```

L1 smoke verify: `cat ~/Library/Logs/elab/user-sim-l1-*.log | tail -3` should show `pass=5/5 fail=0`.

---

ORCHESTRATOR START. Phase 1 agents spawning now.
