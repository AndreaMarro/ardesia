# Mac Mini Factotum — Task D6: RAG Metadata Backfill iter 14

**Created**: 2026-04-28
**Owner**: Mac Mini autonomous loop (Strambino, M4 16GB)
**Trigger**: Andrea Telegram approve (`#approve D6`) AFTER ratifying audit + DRY-RUN
**Priority**: P0 — iter 14 critical path
**Estimated runtime**: ~30 minutes total (pull → DRY → ratify wait → COMMIT → bench)

---

## Context

Iter 13 wave shipped RRF + Wiki BM25 + dedup. B2 recall@5 stayed at 0.390 (no lift).
Root cause: `rag_chunks` 100% NULL on `chapter`, `page`, `section_title` (1000-sample).
Audit: `docs/audits/2026-04-28-iter-14-P0-rag-metadata-backfill-audit.md`.
Recommendation: Path A (substring match → UPDATE), reversible, 1h dev + 10min run.

---

## Pre-flight — BLOCKERS

Mac Mini MUST verify ALL before starting:

1. **Andrea Telegram approve** received with token `#approve D6`
2. **ADR-020 ratified** in `docs/adr/ADR-020-rag-backfill-path-A.md` (status: ACCEPTED)
3. **DRY-RUN reviewed** — Andrea posted `#approve dry-D6` confirming sample matches look right
4. **Branch clean** — `git status` shows no local mods on Mac Mini worktree
5. **Env vars present** — `SUPABASE_SERVICE_ROLE_KEY` + `ANDREA_RATIFY=1` injected via `~/.elab-credentials/`

If ANY blocker missing → POST-WAIT to `automa/state/D6-WAIT.md` and HALT.

---

## Execution Pipeline

### Step 1: Pull origin

```bash
cd /Users/elab-mac-mini/elab-builder      # Mac Mini worktree path
git fetch origin
git checkout claude/iter-14-cycle-N       # branch where audit + script live
git pull --ff-only origin claude/iter-14-cycle-N
```

If conflict → HALT, post `automa/state/D6-CONFLICT.md`, ping Andrea.

### Step 2: DRY-RUN (idempotent — safe to repeat)

```bash
source ~/.elab-credentials/sprint-s-tokens.env  # SUPABASE_URL + read-only key
node scripts/backfill/rag-metadata-backfill-iter14.mjs --dry-run --verbose \
  | tee automa/state/D6-DRY-RUN-LOG.txt
```

Output:
- `scripts/backfill/output/dry-run-iter14-{ts}.sql` (UPDATE statements)
- `scripts/backfill/output/dry-run-iter14-{ts}.report.json` (10 sample matches + skipped)

Mac Mini posts to Telegram:
> D6 DRY-RUN complete. Matches: {N}, Skipped: {M}. Sample report: {url}.
> Ratify with `#approve dry-D6` to proceed to COMMIT.

**WAIT** for Andrea reply. Up to 12h timeout → HALT.

### Step 3: COMMIT (post Andrea ratify)

```bash
source ~/.elab-credentials/service-role.env   # SERVICE_ROLE_KEY (write-capable)
ANDREA_RATIFY=1 \
  SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  node scripts/backfill/rag-metadata-backfill-iter14.mjs --commit --verbose \
  | tee automa/state/D6-COMMIT-LOG.txt
```

Output:
- `scripts/backfill/output/commit-result-iter14-{ts}.json` (success count + errors)

### Step 4: Verify post-update

```bash
# Quick sanity via Supabase REST count
curl -s "$SUPABASE_URL/rest/v1/rag_chunks?chapter=is.null&select=count" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Prefer: count=exact" \
  -I | grep -i 'content-range'
```

**Expected**: count drop from ~1881 to <800 (path A coverage ~50–60%).
**Red flag**: count still >1500 → backfill barely worked, HALT, ping Andrea, queue Path B.

### Step 5: Re-run B2 bench (recall@5 measurement)

```bash
node scripts/bench/run-hybrid-rag-eval.mjs --gold-set v3 --top-k 5 \
  | tee automa/state/D6-BENCH-LOG.txt
```

Extract recall@5 number from output → write to `automa/state/RAG-BACKFILL-RESULT.md`.

---

## Pass Criteria (decides iter 14 P0 ship)

| Metric | Baseline | Target iter 14 | HALT if |
|---|---|---|---|
| `rag_chunks WHERE chapter IS NULL` | 1881 | <800 | >1500 |
| Backfill success rate | n/a | >70% | <40% |
| B2 recall@5 | 0.390 | ≥0.50 | <0.42 |
| Backfill errors | n/a | <50 | >200 |

**Ship**: all green → post `D6-PASS.md`, queue iter 15 P0 (Path B if needed).
**Halt + rollback**: any red → post `D6-FAIL.md`, run rollback script:

```sql
-- Rollback (if needed):
UPDATE rag_chunks SET chapter=NULL, page=NULL, section_title=NULL
  WHERE id IN (SELECT id FROM rag_chunks_iter14_backfill_audit);
-- (Audit table to be created in iter 14 ratify gate)
```

---

## Output Files Mac Mini Writes

```
automa/state/
  D6-DRY-RUN-LOG.txt         (verbose console)
  D6-COMMIT-LOG.txt          (verbose console)
  D6-BENCH-LOG.txt           (B2 eval output)
  RAG-BACKFILL-RESULT.md     (final summary, machine-readable header)
  D6-PASS.md   OR  D6-FAIL.md   (terminal state)
```

`RAG-BACKFILL-RESULT.md` schema:
```yaml
---
date: 2026-04-28
task: D6
status: PASS | FAIL | HALT
backfill_success: 1450
backfill_errors: 12
chunks_null_before: 1881
chunks_null_after: 431
b2_recall_at_5_before: 0.390
b2_recall_at_5_after: 0.514
delta: +0.124
ship_decision: PASS
---
```

---

## Communication Protocol

- Telegram channel: `@elab-factotum-strambino`
- Format: `[D6] {step} — {status} — {next-action}`
- Severity emoji: PASS / WAIT / HALT / FAIL (text labels, no emoji per CLAUDE.md)
- Andrea ratify tokens: `#approve D6`, `#approve dry-D6`, `#halt D6`

---

## Rollback Plan

If COMMIT mode produces ANY of:
- HTTP 500 errors >5 in commit-result.json
- B2 recall@5 DECREASES (<0.39)
- Andrea sends `#halt D6` mid-execution

→ Run rollback (queue iter 14b post-mortem):

```bash
node scripts/backfill/rag-metadata-rollback-iter14.mjs --commit  # TODO write
# Resets all rows touched in this run back to chapter=NULL, page=NULL, section_title=NULL
# Uses commit-result-iter14-{ts}.json as audit trail of touched IDs
```

---

## Iter 15 Carry (if Path A insufficient)

- D7: Path B re-ingest with PDF page tracking
- D8: Wiki source chapter/page mapping (volume-references.js currently only covers vol1/2/3 lessons)
- D9: figure_id population (e.g. `fig.6.2`) — defer iter 16+

---

**End brief.** Mac Mini halts on first ambiguity. Andrea ratify required at every gate.
