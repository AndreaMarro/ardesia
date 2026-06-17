# PDR Agent Orchestration — ELAB Tutor multi-agent strategy

**Sprint Q learning**: schema 5+3 agent × 4+2 iter × 4 sprint = 24 iter NON eseguibile single session.
**Sprint 6+ realismo**: scope per-sprint pragmatico + parallelizzazione mirata.

---

## Roster agenti

### Core team (5 ruoli, definiti CLAUDE.md)

| Agent | Model | Ownership | Read-only |
|-------|-------|-----------|-----------|
| planner-opus | opus | `automa/tasks/pending/` | yes |
| architect-opus | opus | `docs/architectures/`, `docs/adrs/` | yes (su src/) |
| generator-app-sonnet | sonnet | `src/`, `supabase/functions/` | no |
| generator-test-sonnet | sonnet | `tests/`, `scripts/openclaw/*.test.ts` | no (mai src) |
| evaluator-haiku | haiku | `automa/evals/*.json` | no (verdict only) |
| scribe-sonnet | sonnet | `docs/sunti/`, `docs/audits/`, `docs/unlim-wiki/` | no |

### Roadmap aggiunte (Sprint 6+)
- security-auditor opus → `docs/audits/security-*.md`, OWASP+GDPR
- performance-engineer sonnet → `docs/audits/performance-*.md`, `scripts/bench/**`

---

## Pattern orchestrazione

### Pattern A: Single sprint focus (light)
Per task piccoli (< 4 ore):
- 1 agent generator-app TDD strict
- 1 agent generator-test parallel (file ownership rigido)
- 1 agent evaluator verdict pre-commit
- CoV 3x al gate
- 1 audit doc breve

### Pattern B: Sprint major (heavy)
Per Sprint 6 Day 39+:
- **Iter 1** 3 agent paralleli Explore/Audit (architect + scribe + evaluator)
- **Iter 2** 5 agent paralleli con file ownership:
  - generator-app-sonnet → `src/services/...`
  - generator-app-sonnet (2nd) → `supabase/functions/...`
  - generator-test-sonnet → `tests/unit/...`
  - generator-test-sonnet (2nd) → `scripts/openclaw/*.test.ts`
  - scribe-sonnet → `docs/audits/...`
- **Iter 3** 3 agent refine: 1 generator-app (fix), 1 generator-test (cover gaps), 1 evaluator
- **CoV 3x** dopo iter 2 + iter 3
- **Audit doc** consolidato fine sprint

### Pattern C: Loop H24 autonomous (Mac Mini)
- planner-opus genera task ogni 4h da `automa/state/benchmark.json` lowest metric
- generator-app + generator-test in TDD loop su task pending
- evaluator-haiku verdict ogni commit
- scribe-sonnet update `automa/sunti/2026-MM-DD-loop.md` daily
- Auto-PR creation con label `auto-loop`
- Andrea review + merge manuale

---

## File ownership rigido

```
src/
├── components/   ← generator-app
├── data/         ← generator-app
├── services/     ← generator-app
├── utils/        ← generator-app

tests/
├── unit/         ← generator-test
├── integration/  ← generator-test
├── e2e/          ← generator-test

supabase/
├── functions/    ← generator-app
├── migrations/   ← generator-app

scripts/
├── openclaw/*.ts        ← generator-app
├── openclaw/*.test.ts   ← generator-test (mai src)
├── bench/               ← performance-engineer
├── *.mjs                ← generator-app

docs/
├── audits/              ← scribe (e architect read)
├── adrs/                ← architect
├── sunti/               ← scribe
├── unlim-wiki/concepts/ ← scribe (LLM-authored L2)
├── pdr/                 ← architect
├── handoff/             ← scribe
```

**Conflict resolution**: PR con file outside ownership → reject + reassign agent corretto.

---

## Coordinamento via team-charter

`automa/team-charter.md` (TODO Sprint 6 Day 41):
- Roles + ownership matrix
- Communication protocol (commit messages format)
- Conflict resolution
- Escalation Andrea

`automa/hand-off-protocol.md` (TODO Sprint 6 Day 42):
- Inter-session context preservation
- Active branch + WIP files
- Pending decisions

---

## CoV gate strategy

### Per task atomico (1 commit)
1. Pre: vitest run only test file → RED PASS
2. Implementation
3. vitest run only test file → GREEN PASS
4. Pre-commit hook: full vitest baseline check
5. Commit

### Per sprint gate
1. Full suite vitest 3x consecutive (consistency)
2. `npm run build` verify
3. Browser preview (UI changes only)
4. Audit doc consolidate
5. Push branch
6. PR draft

### Per major release
1. Full suite vitest 5x
2. `npm run test:e2e` Playwright
3. Vercel preview deploy
4. Smoke test 20 fixtures benchmark
5. Production deploy (Andrea explicit OK)

---

## Honesty contracts

Ogni agent OUTPUT deve:
- Numbers verificati (no inflation)
- File:line citations precise
- Confidence level esplicito (HIGH/MED/LOW)
- Limitations dichiarate
- Failures + retries documentati

`evaluator-haiku` ENFORCEMENT:
- PASS: claim verificato + CoV ✓
- WARN: claim parziale, gap esplicito
- FAIL: claim non verificato, REVERT

---

## Cost tracking

| Agent | Avg tokens/iter | Cost (sonnet 4.6: $3/$15 in/out) |
|-------|----------------|----------------------------------|
| planner-opus | 5K in / 2K out | $0.045 |
| architect-opus | 10K in / 3K out | $0.075 |
| generator-app-sonnet | 15K in / 5K out | $0.120 |
| generator-test-sonnet | 12K in / 4K out | $0.096 |
| evaluator-haiku | 8K in / 1K out | $0.024 |
| scribe-sonnet | 10K in / 3K out | $0.075 |
| **Single sprint heavy (5+3 agent x 6 iter)** | ~150K total | **~$2-3** |

Per Sprint 6 Day 39: budget ~$15-20 in agent costs (5-6 sprint days × heavy iter).

---

## Sprint Q lessons learned

### Cosa ha funzionato
- TDD strict Red-Green ogni commit
- File ownership boundaries rigorosi
- CoV 3x pre commit/push
- Audit doc per sprint
- Pre-commit hook automated baseline check

### Cosa migliorare
- Schema 5+3×4+2 iter overscope per single session — usato pattern A (single agent + TDD) per Q4-Q6 invece
- Agent Explore parallel **molto efficace** (Q3 iter 1: 5 agent reali) — replicare per Sprint 6 Day 39
- Browser preview verification deferred per scope budget — needs proper integration in workflow

### Strategia Sprint 6+
- Pattern B per Day 39 (dispatcher core)
- Pattern A per Day 40-41 (handler implementation)
- Pattern A per Day 42 (state-aggregator integration)
- Pattern C (loop H24) attivabile post Day 42 con team charter delivered

---

**Verdetto**: roster + pattern + ownership chiari. Pronto Sprint 6+ orchestration.
