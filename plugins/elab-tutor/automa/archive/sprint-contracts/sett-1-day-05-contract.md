# Sprint Day 05 Contract — ven 24/04/2026

**Sprint**: sett-1-stabilize (day 5/7)
**Branch**: `feature/t1-003-render-warmup`
**Baseline pre-day**: 12164 test PASS, benchmark 3.8/10 (git_hygiene dip post Day 04), E2E 12 spec + 5 Vision
**Commit start**: c378af0 (Day 04 end-day handoff)

## Harness 2.0 — Sprint Contract

### Task P0-1 — Close BLOCKER-001 JWT 401 definitively

**Goal atomic**: marcare BLOCKER-001 CLOSED in `automa/team-state/blockers.md` con reference ADR-003 + verify script.

**Acceptance criteria**:
1. BLOCKER-001 Status: OPEN → CLOSED
2. Reference ADR-003 + verify-edge-function.sh path in resolution field
3. Append resolution timestamp + commit SHA cf6f71a/f25da24

**Owner**: inline
**Estimate**: 5 min

### Task P0-2 — T1-005 Dashboard scaffold skeleton

**Goal atomic**: create `src/components/dashboard/` directory + minimal placeholder component to unblock CLAUDE.md bug #9 ("dashboard docente NON esiste"). SKELETON only — no full feature.

**Acceptance criteria**:
1. Directory `src/components/dashboard/` exists with `index.jsx`
2. `index.jsx` exports functional placeholder component returning accessible empty state
3. Component imports without breaking build
4. README or inline comment states scope + PDR ref
5. Zero engine touched
6. vitest baseline 12164 preserved
7. build PASS

**Owner**: inline
**Estimate**: 20 min

### Task P1-1 — Vision E2E live run attempt

**Goal**: esegue `npx playwright test e2e/22-vision-flow.spec.js --reporter=list` e documenta esito (may fail live if infra issue — document).

**Acceptance criteria**:
1. Command executed with output captured
2. Result documented in `docs/audit/day-05-vision-e2e-live.md`
3. If FAIL → debt item Day 06

**Owner**: inline
**Estimate**: 10 min (timeout-bounded)

### Task P1-2 — Day 01 retroactive standup + velocity Day 03 entry

**Goal**: close P3 debt — scrivi standup formale Day 01 (retroattivo) + velocity Day 03 entry se manca.

**Acceptance criteria**:
1. File `docs/standup/2026-04-20-day-01-standup.md` exists con foundations recap
2. `automa/state/velocity-tracking.json` contiene Day 03 entry (se missing)

**Owner**: inline
**Estimate**: 10 min

## Stop conditions monitor

- SPRINT_DAY=5, sett gate Day 7 domenica 26/04 → continuare Day 06 automatico se PASS
- Quota/context: stop + handoff
- Blocker hard 5 retry fail: stop

## MCP calls target Day 05

- claude-mem: 2+ (search + save)
- supabase: 1+ (opzionale se ANON key disponibile)
- Playwright (via cli npx): E2E live run
- github: 1+ (gh run list post-push)
- **Totale target**: 8+

## Success metrics 4 grading Harness 2.0

- Design quality: scaffold minimal semantic + ADR closure clean (target 7/10)
- Originality: dashboard skeleton pattern anticipatorio (target 6/10)
- Craft: atomic commits + evidence-based (target 8/10)
- Functionality: zero regression + build PASS (target 9/10)
- **Media target**: 7.5/10 (continua trend Day 02 7.2 → Day 03 7.0 → Day 04 7.5 → Day 05 target 7.5+)
