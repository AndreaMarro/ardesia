# Sprint 3 Day 05 Contract — sett-3-stabilize-v3 Day 05 (Day 19 cumulative)

**Sprint**: 3/8 PDR 8-week
**Date**: 2026-04-22 (mar) — Day 05 local / Day 19 cumulative
**Branch**: `feature/sett-3-stabilize-v3`
**Format**: Harness 2.0 Sprint Contract
**Commit start**: a2bb54b (Day 04 end-day handoff state persist)
**Baseline**: 12201 test PASS (CoV Day 17 deterministic), benchmark 4.12/10

## Sprint Goal (inherited sett-3 Option B locked)

Debt-safe benchmark lift + integrity remediation + dashboard Phase 1.
NPM denied-by-default — zero new deps this day.

## Day 05 scope — calendar roadmap Day 04 + Day 06 merge

Roadmap Day 04 (worker probe + UNLIM latency) + Day 06 (E2E spec 15) consolidated today because Day 04 local already executed Dashboard hook integration (roadmap Day 05).

### Task P0-1 — Worker uptime probe script

**Goal atomic**: create `scripts/worker-probe.sh` curl cron-capable Nanobot + Edge TTS + Supabase Edge Function smoke.

**Acceptance criteria**:
1. Script path `scripts/worker-probe.sh` exists, `chmod +x`
2. Probes 3 workers: Nanobot `elab-galileo.onrender.com/wake`, Edge TTS `72.60.129.50:8880/health` or similar, Supabase unlim-chat Edge Function
3. Output JSON-per-worker `{worker, status_code, latency_ms, timestamp, ok}`
4. Exit code 0 if all 200, 1 if any fail
5. Writes `automa/state/worker-probe-latest.json`
6. Zero new npm deps (pure bash + curl)

**Owner**: inline
**Estimate**: 25 min

### Task P0-2 — UNLIM latency log utility (lightweight, localStorage)

**Goal atomic**: aggiungi hook `useUnlimLatencyLogger` o util function che registra start/end UNLIM chat call in `localStorage.unlim_latency_log` (capped ring buffer 50 entries). No Supabase dep (Option B constraint).

**Acceptance criteria**:
1. File `src/services/unlimLatencyLog.js` exports `logLatency(metadata)` + `getRecentLatencies()` + `clearLog()`
2. Ring buffer max 50 entries, FIFO
3. Schema: `{timestamp, query_hash, latency_ms, ok, cold_start}`
4. Unit test `tests/unit/unlimLatencyLog.test.js` ≥ 8 cases (write/read/ring overflow/clear/schema)
5. No Supabase call (future wire sprint-4)
6. No breaking change to existing UNLIM chat flow (read-only logger)

**Owner**: inline
**Estimate**: 30 min

### Task P1-1 — E2E spec 15 Dashboard live smoke (advance Day 06 roadmap)

**Goal atomic**: `tests/e2e/15-dashboard-live.spec.js` verifica `useDashboardData` hook rendering 4 state (loading/error/empty/success) via DashboardShell, mock fetch response.

**Acceptance criteria**:
1. File `tests/e2e/15-dashboard-live.spec.js` exists
2. 4+ test cases: loading state, error state, empty state, success state
3. Mock fetch via `page.route('**/dashboard-data', ...)`
4. Uses existing `/#dashboard-v2` hash route
5. Assertion on `data-testid` or semantic selector
6. Playwright config not modified (uses existing)
7. Spec runs via `npx playwright test tests/e2e/15-dashboard-live.spec.js --list` without parse error

**Owner**: inline
**Estimate**: 35 min

### Task P1-2 — Day 18 carry-over state cleanup

**Goal atomic**: update `automa/state/claude-progress.txt` advance Day 18→19, close stale `day-05-contract.md` (sett-1 legacy), add this sett-3 contract reference.

**Acceptance criteria**:
1. claude-progress.txt updated day counter
2. Stale sett-1 day-05-contract.md moved to `automa/archive/` OR deleted (Andrea directive: keep archive)
3. heartbeat timestamp refreshed

**Owner**: inline
**Estimate**: 5 min

## MCP calls target Day 05

- claude-mem search + save: 2+
- serena find_symbol (useDashboardData ref): 1+
- github gh run list: 1+
- Total: 6+ (realistic without Supabase interactive)

## Success metrics 4 grading Harness 2.0

- Design: script + util composable, testable → target 7.5/10
- Originality: ring buffer in-browser pattern (no backend) → target 6.5/10
- Craft: atomic commits + vitest coverage + E2E spec → target 8.0/10
- Functionality: zero regression 12201 baseline + build PASS + spec parses → target 8.0/10
- Media target: 7.5/10

## Stop conditions

- Quota 429 persistent → STOP + handoff
- Context auto-compact 3x → STOP + handoff
- Blocker hard 5-retry fail → STOP
- Sett-3 gate is Day 07 (lun 28/04 calendar) — not this day

## Definition of Done Day 05

- [ ] Task P0-1 worker-probe.sh exists + chmod + probes 3 workers + JSON output
- [ ] Task P0-2 unlimLatencyLog.js + 8+ vitest PASS
- [ ] Task P1-1 spec 15 parses + 4+ cases
- [ ] Task P1-2 state advanced + archive cleaned
- [ ] CoV 2x+ vitest (bandwidth-adjusted from 5x target)
- [ ] Build PASS
- [ ] 1 atomic commit per task min (4 commits)
- [ ] Push branch
- [ ] Handoff written
- [ ] claude-mem observation saved

## Gap auto-critica (>=5)

1. CoV 5x target reduced to 2x — bandwidth scarcity, doc residual debt Day 06
2. Playwright full E2E run not executed this day (spec parse-only) — debt Day 06
3. Supabase Edge Function live curl not tested (ANON key gap carry-over P3) — debt
4. Sentry MCP not queried this day — gap MCP target
5. Vercel MCP not leveraged — gap MCP target
6. Lighthouse perf matrix not re-run this day — debt Day 06
