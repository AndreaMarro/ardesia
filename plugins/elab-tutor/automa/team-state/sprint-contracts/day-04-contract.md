# Sprint Day 04 Contract — gio 23/04/2026

**Sprint**: sett-1-stabilize (day 4/7)
**Branch**: `feature/t1-003-render-warmup`
**Baseline pre-day**: 12164 test PASS, benchmark 4.07/10, E2E 12 spec
**Commit start**: e197d37

## Harness 2.0 — Sprint Contract (pre-implementation negotiation)

### Task P0-1 — ATOM-002 Dashboard a11y P0+P1 WCAG 2.1 AA

**Goal atomic**: fix WCAG P0 (Recharts `role="img"` + tabella `<caption>`/`<th scope>`) + P1 (aria-live tab, contrasto `#64748B`→`#475569`).

**Acceptance criteria** (verifiable):
1. `grep -c 'role="img"' src/components/teacher/TeacherDashboard.jsx` >= 2 (era 0)
2. `grep -c 'scope="col"' src/components/teacher/TeacherDashboard.jsx` >= 1
3. `grep -c 'aria-live' src/components/teacher/TeacherDashboard.jsx` >= 1
4. `#64748B` non presente in `src/styles/variables.css` (sostituito `#475569`)
5. `npx vitest run` >= 12164 (zero regressione)
6. `npm run build` PASS
7. 0 engine file touched

**Test strategy**:
- Vitest smoke post-change (`npx vitest run --reporter=dot`)
- Build post-change (`npm run build 2>&1 | tail -3`)
- Grep invariants (4 check above)

**Rollback plan**:
- Commit atomic (1 fix = 1 commit). Se regressione: `git revert HEAD`.
- Branch su feature/t1-003 (NO push diretto main).

**Success metrics 4 grading Harness 2.0**:
- Design quality: tabella semantica, contrasto corretto (target 8/10)
- Originality: uso `sr-only` pattern + `aria-live` polite (target 7/10)
- Craft: commit atomic con evidenza grep (target 9/10)
- Functionality: zero regression + build PASS (target 9/10)
- **Media target**: 8.25/10

**Owner**: team-dev (inline this session)
**Estimate**: 90 min

### Task P0-2 — Carry-over blockers reconcile

**Goal**: allineare `automa/team-state/blockers.md` con state. Formalizzare 8 blocker OPEN tracciati in state.

**Acceptance criteria**:
1. `automa/team-state/blockers.md` contiene 8+ entry OPEN con template schema
2. Velocity tracking Day 02+Day 03 entries aggiunte con dati onesti
3. Daily standup entries Day 02+Day 03+Day 04 formalizzate

**Owner**: inline TPM (this turn)
**Estimate**: 30 min

### Task P0-3 — JWT 401 Edge Function resolve

**Goal**: documentare root cause JWT 401 su curl CLI Edge Function. Verifica via MCP Supabase.

**Acceptance criteria**:
1. MCP `mcp__supabase__get_edge_function` call log
2. ADR o nota in `docs/architectures/` spiegare `Authorization: Bearer <ANON_KEY>` mandatory vs `apikey` header
3. Script `scripts/cli-autonomous/verify-edge-function.sh` con esempio curl corretto

**Owner**: inline (this turn)
**Estimate**: 20 min

## Stop conditions monitor

- SPRINT_DAY=4, sett gate Day 7 (dom 26/04) non raggiunto → loop continuare Day 05 automatico
- Quota 429: stop con handoff
- Blocker hard 5 retry fail: stop con blocker file update

## MCP calls target day 04

- claude-mem: 4+ (search inizio + save 3 observation)
- serena: 3+ (find_symbol TeacherDashboard)
- supabase: 2+ (get_edge_function + list_tables)
- context7: 2+ (WCAG 2.1 docs + React 19 aria)
- github: 1+ (gh run list verify)
- **Totale target**: 15+

## Fix budget minimo

- 3 blocker chiusi (velocity day 2+3, backlog gerarchico, JWT 401 ADR)
- 1 src fix (Dashboard a11y)

## Audit matrix delta target

- Vitest: 12164 (invariato, zero regression)
- Benchmark: 4.07 → 4.15+ (delta +0.08)
- E2E spec: 12 (invariato)
- Fix closed: 3+
- PZ v3 violations: 0 (mantenuto)
- MCP calls log: 15+
