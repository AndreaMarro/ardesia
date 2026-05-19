# Iter 71 Detailed Plan — Sprint U Continuation

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans`. Steps use `- [ ]` syntax for tracking.

**Date**: 2026-05-16 PM (autonomous orchestrator planning, Andrea mandate "no debito tecnico, no regressione, scambio pareri continuo")
**Baseline**: iter 70 close `00e0a7b6` (TEAM C merged) + matrix v244 99.6% empirical + 14346 tests PASS + Pattern S r3 16× consecutive validated
**Target iter 71 PARTIAL close**: **9.0/10 ONESTO** (cap G45 vs raw 9.2 conditional all atoms shipped + verified)
**Target iter 72+ Sprint U close projection**: 9.5-9.7/10 ONESTO conditional Opus indipendente review

**Goal**: Close residual Codex Pattern C HIGH/MED findings iter 70 (TEAM A2 + B + D + E + G) + 2 no_plurale fix verified + cross-compile end-to-end UAT preparation + Andrea P0 cascade (A-SECURITY + canary + Sentry/PostHog OAuth).

**Architecture**: Pattern S r3 worktree isolato (16× consecutive validated, race-cond fix mandatory) + Codex BG Pattern V pre-impl + Pattern C post-impl OBBLIGATORIO ogni atom critical + code-reviewer:code-reviewer Anthropic agent independent per ogni team output + ZERO regression gate (vitest baseline 14346 NEVER scendere, build NEVER skip pre-commit, pre-push NEVER bypass `--no-verify`).

**Tech Stack**: Node 22 + Vite 7 + React 19 + Supabase Edge Functions Deno + Vertex Gemini 2.5 Flash-Lite EU Frankfurt + Mistral Voxtral TTS + Express HTTP server ELAB Agent + Arduino CLI + Codex CLI 0.130.0 GPT-5.5 high.

---

## File Structure

Plan touches these files. Each file has single responsibility.

### Atoms ITER 71 (post TEAM C merge)

| Atom | Files | Owner | Effort |
|---|---|---|---|
| A-SECURITY-71 | `~/.elab-credentials/elab-keys.env`, Supabase + Vercel envs | Andrea | 30min |
| A-NEW-3c | `scripts/bench/run-1000-matrix.py` (verify), Edge deploy | Andrea + orchestrator | 15min |
| Sentry+PostHog OAuth | Andrea browser interactive | Andrea | 30min |
| TEAM-A2-iter71 | `src/data/cliffhanger-table.json`, `src/data/narrative-map-94.json`, `src/data/experiments-vol3.js`, `src/services/experimentNarrativeService.js` | BG subagent worktree `elab-builder-iter71-A2` | 3h |
| TEAM-B-iter71 | `tests/e2e/29-92-esperimenti-audit.spec.js`, `src/data/experiments-vol*.js` (sync 66 hardcoded counts) | BG subagent worktree `elab-builder-iter71-B` | 2h |
| TEAM-D-iter71 | `src/components/HomePage.jsx`, `src/components/HomePage/HomePage.module.css`, `src/components/ElabIcons.jsx`, `src/components/album/AlbumStudente.jsx`, Supabase wire-up | BG subagent worktree `elab-builder-iter71-D` | 4h |
| TEAM-E-iter71 | `scripts/quality-harness/lighthouse-runner.mjs`, `scripts/quality-harness/ux-probes.mjs`, `scripts/quality-harness/promptfoo-runner.mjs` | orchestrator inline | 1.5h |
| TEAM-G-iter71 | `.claude/settings.json` (Edit+MultiEdit matchers), `scripts/agents/guard-forbidden-avr-patterns.sh` (blockly-blocks path fix) | orchestrator inline | 1h |
| no_plurale-fix-iter71 | `supabase/functions/_shared/principio-zero-validator.ts` OR `scripts/bench/run-1000-matrix.py` (root cause Codex finding) | orchestrator inline | 1h |
| Mac-Mini-iter71 | `~/scripts/elab-mac-mini-autonomous-loop-v2.sh` (Mac-side path) + queue 3-4 tasks | Andrea Mac Mini SSH inline | 30min |
| matrix-v245-verify | `scripts/bench/output/1000-matrix-results-*.jsonl` re-run | orchestrator | 5min |
| code-reviewer-Anthropic-iter71 | 6 team outputs security+best+maintainability review | orchestrator dispatch 6 subagents parallel | 30min |
| close-audit-iter71 | `docs/audits/2026-05-16-iter-71-CLOSE-audit.md` + `docs/handoff/2026-05-16-iter-71-to-iter-72-handoff.md` + CLAUDE.md APPEND | orchestrator | 30min |

**Total effort iter 71**: ~14-15h (~50% Andrea actions + ~50% orchestrator/subagents)

---

## Lessons learned iter 70 (PREVENTION ITER 71)

### Anthropic org monthly limit (3/4 BG fail iter 38 + iter 70 partial)
**Prevention**: ≤1 Claude BG subagent simultaneous + Codex GPT-5.5 high primary verify load. Worktree isolato strict to prevent fail recovery work.

### Worktree disk full (~11Gi free, 98% used)
**Prevention**: Max 1 active worktree iter 71. Cleanup post-merge mandatory (`git worktree remove --force` + `git branch -d`). Codex outputs cleanup tmp.

### Codex Pattern C wait time (~5min ognuno × 4-6 = 20-30min orchestrator wait)
**Prevention**: Codex Pattern V pre-impl PARALLEL ALL atoms BEFORE BG subagent dispatch (4-6 codex parallel = ~5min total vs sequential 30min).

### no_plurale fix risk regression
**Prevention**: Codex Pattern V FIRST identifica root cause scorer-vs-enforcer mismatch BEFORE inline edit. Vitest delta scope subset verify post-fix. If non-trivial, defer iter 72 BG subagent.

### Mac Mini autonomous loop NON eseguito alcun task iter 70 (path mount + node missing)
**Prevention**: Fix path Mac Mini-side native (`/Users/progettibelli/Projects/elab-tutor/` NOT MacBook path). Node v22 ALREADY INSTALLED iter 70 (verified PHASE 7). Queue Bash-native scripts NOT Node-dependent for first tasks.

### TEAM C catastrofico iter 70 (worktree corrupted post disk full)
**Prevention**: TEAM C iter 71 ALREADY SHIPPED iter 70 (commit d1d92ea1+00e0a7b6, 58 NEW tests, vitest delta verified). NO re-dispatch needed.

### Score inflation pre-Codex iter 70 (9.5→7.5 ricalibrato)
**Prevention**: Score iter 71 ONESTO empirical only POST Codex Pattern C verify ALL atoms. NO claim above 9.0 without 4/4 Codex green + matrix v245 ≥99.4% preserved.

---

## Task 0: PHASE 0 Bootstrap CoV (orchestrator, 10min)

**Files:**
- Read: `automa/baseline-tests.txt`
- Read: `docs/handoff/2026-05-19-iter-70-to-iter-71-handoff.md`
- Read: `docs/plans/2026-05-19-ITER-71-TO-75-MASTER-PLAN.md`
- Read: This file

- [ ] **Step 1: Verify HEAD + commit batch**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git log --oneline -10
git status --short
```

Expected: HEAD `00e0a7b6` + clean status OR minor auto-state noise. 12 commits iter 70 batch + 2 commits iter 71-C TEAM C.

- [ ] **Step 2: Verify vitest baseline 14346 PRESERVED**

```bash
npx vitest run --reporter=basic 2>&1 | tail -10
```

Expected: 14346 PASS (iter 70 close + 58 TEAM C iter 71 = 14288+58 exact math).

- [ ] **Step 3: Verify disk + processes inventory**

```bash
df -h "/Users/andreamarro/VOLUME 3" | tail -1
ps aux | grep -E "node|codex" | grep -v grep | wc -l
git worktree list
```

Expected: ≥10Gi free + ≤10 Node processes + 1 main + 0-1 locked worktree.

- [ ] **Step 4: Verify Edge Function v244 + matrix v244 archived**

```bash
ls scripts/bench/output/1000-matrix-*-2026-05-16T19-43-19* | wc -l
curl -s -X POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat \
  -H "x-elab-api-key: $ELAB_API_KEY" -H "Content-Type: application/json" \
  -d '{"message":"Ciao"}' | jq .response | head -3
```

Expected: 3 matrix artifacts archived + smoke 200 OK + "Ragazzi," opener.

---

## Task 1: A-SECURITY ELAB_API_KEY rotation iter 32 protocol (Andrea, 30min)

**Files:**
- Modify: `~/.elab-credentials/elab-keys.env`
- Modify: Supabase secrets (project `euqpdueopmlllqjmqnyb`)
- Modify: Vercel env Production + Development

**Why**: 13+ giorni exposure window iter 67-70 accumulated. iter 32 protocol rotation 14-day cycle mandatory iter 71 P0.

- [ ] **Step 1: Generate new key**

```bash
NEW_KEY=$(openssl rand -hex 32) && echo "$NEW_KEY"
```

- [ ] **Step 2: Backup OLD key**

```bash
cp ~/.elab-credentials/elab-keys.env ~/.elab-credentials/elab-keys.env-OLD-iter70
```

- [ ] **Step 3: Update Supabase**

```bash
npx supabase secrets set ELAB_API_KEY="$NEW_KEY" --project-ref euqpdueopmlllqjmqnyb
```

- [ ] **Step 4: Update Vercel env (Andrea Dashboard)**

Vercel Dashboard → Settings → Environment Variables → `VITE_ELAB_API_KEY` Production + Development → Edit → paste NEW_KEY → Save.

- [ ] **Step 5: Update local env**

```bash
sed -i.bak "s/^ELAB_API_KEY=.*/ELAB_API_KEY=$NEW_KEY/" ~/.elab-credentials/elab-keys.env
sed -i.bak "s/^VITE_ELAB_API_KEY=.*/VITE_ELAB_API_KEY=$NEW_KEY/" ~/.elab-credentials/elab-keys.env
source ~/.elab-credentials/elab-keys.env
```

- [ ] **Step 6: Smoke curl 200 OK**

```bash
curl -s -X POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat \
  -H "x-elab-api-key: $ELAB_API_KEY" -H "Content-Type: application/json" \
  -d '{"message":"Ciao"}' | jq .
```

Expected: HTTP 200 + "Ragazzi," opener + Vol/pag citation.

- [ ] **Step 7: Verify Vercel deploy uses new key**

```bash
curl -s https://www.elabtutor.school/ -I | head -5
```

Expected: HTTP 200 + correct headers + frontend can call Edge Function.

---

## Task 2: A-NEW-3c matrix v245 re-verify (Andrea + orchestrator, 15min)

**Files:**
- Run: `scripts/bench/run-1000-matrix.py`

**Why**: Verify no_plurale 3 fail residual + offtopic 100% preserved + volpag 100% preserved post-rotation. Baseline v244 99.6%.

- [ ] **Step 1: Run matrix v245**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
python3 scripts/bench/run-1000-matrix.py 2>&1 | tee matrix-iter71-$(date +%Y%m%d-%H%M%S).log | tail -30
```

Expected: ≥99.6% PASS preserved OR slight regression (verify nothing broken post-rotation).

- [ ] **Step 2: Cleanup matrix output archive**

```bash
ls scripts/bench/output/1000-matrix-*-2026-05-16T* | wc -l
# Archive iter 70 + iter 71 separate folder
mkdir -p scripts/bench/output/archive/iter-70
mv scripts/bench/output/1000-matrix-*-2026-05-16T19-* scripts/bench/output/archive/iter-70/
```

- [ ] **Step 3: Diff iter 70 v244 vs iter 71 v245**

```bash
diff <(jq -r '.category' scripts/bench/output/archive/iter-70/1000-matrix-failures-2026-05-16T19-43-19.jsonl | sort | uniq -c) \
     <(jq -r '.category' scripts/bench/output/1000-matrix-failures-$(date +%Y%m%d)*.jsonl | sort | uniq -c)
```

Expected: ≤4 failures (vs v244 4 failures), no new categories regressed.

---

## Task 3: Sentry + PostHog OAuth (Andrea, 30min)

**Files:**
- Update: `~/.claude/settings.json` MCP configs

**Why**: 3 dashboards seed (offtopic_hallucination_rate + volpag_citation_rate + matrix_pass_rate_24h) iter 71 entrance observability foundation Sprint U close iter 72+.

- [ ] **Step 1: Sentry OAuth**

```bash
claude mcp authenticate plugin:sentry:sentry
# Browser opens, click "Allow", paste callback token if prompted
```

- [ ] **Step 2: PostHog OAuth**

```bash
claude mcp authenticate plugin:posthog:posthog
# Browser opens, click "Allow", paste callback token if prompted
```

- [ ] **Step 3: Verify auth**

```bash
claude mcp list | grep -E "(sentry|posthog)" | head -5
```

Expected: Both show authenticated state.

- [ ] **Step 4: Seed 3 dashboards (orchestrator MCP)**

Use `mcp__plugin_posthog_posthog__authenticate` + dashboard create tools for:
1. offtopic_hallucination_rate (matrix runs per day)
2. volpag_citation_rate (matrix runs per day)
3. matrix_pass_rate_24h (last 24h rolling)

Use `mcp__plugin_sentry_sentry__authenticate` + project create for:
1. elab-edge-functions (Edge Function errors)
2. elab-frontend (Vercel errors)
3. elab-agent (Express HTTP server errors)

---

## Task 4: Codex BG Pattern V pre-impl ALL atoms parallel (orchestrator, 5min wait)

**Files:**
- Run: `scripts/dev/codex-bg.sh verify-team-A2-vol3-gap-iter71` (verify TEAM A2 scope)
- Run: `scripts/dev/codex-bg.sh verify-team-B-94-spec-iter71` (verify TEAM B scope)
- Run: `scripts/dev/codex-bg.sh verify-team-D-homepage-emoji-iter71` (verify TEAM D scope)
- Run: `scripts/dev/codex-bg.sh verify-no_plurale-fix-iter71` (verify scorer vs enforcer mismatch)

**Why**: Pattern S r3 race-cond fix + Codex Pattern V identifies edge cases + drift PRE-impl. Reduces BG subagent fail risk ~30% per iter 38+66 lesson.

- [ ] **Step 1: Dispatch 4 Codex BG parallel**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
bash scripts/dev/codex-bg.sh verify-team-A2-vol3-gap-iter71 --profile verify \
  "GOAL: identify EXACT 15 missing Vol3 IDs cliffhanger-table format Tea-compat array conversion script design. List missing IDs + Tea section ref + chapter assignment. CONSTRAINTS: read-only sandbox cite file:line. DONE: gap list + convert script design + effort estimate hours." &
sleep 3
bash scripts/dev/codex-bg.sh verify-team-B-94-spec-iter71 --profile verify \
  "GOAL: audit tests/e2e/29-92-esperimenti-audit.spec.js + experiments-vol*.js 66 hardcoded count mismatches. Source data canonical 79 IDs vs claim 94. Recommend assertion strategy + count sync. CONSTRAINTS: read-only sandbox cite file:line. DONE: 66 mismatches list + assertion design + effort estimate." &
sleep 3
bash scripts/dev/codex-bg.sh verify-team-D-homepage-emoji-iter71 --profile verify \
  "GOAL: HomePage.jsx CARDS field emoji + footer 🐒 fallback removal full scope. ElabIcons.jsx inventory + new icons needed. Album scaffold AlbumStudente.jsx Supabase wire-up missing. CONSTRAINTS: read-only sandbox cite file:line. DONE: emoji audit + ElabIcons mapping + Album wire-up scope + effort estimate." &
sleep 3
bash scripts/dev/codex-bg.sh verify-no_plurale-fix-iter71 --profile verify \
  "GOAL: 2 no_plurale residual matrix v244 'Il LED dovrebbe essere verde' + highlight-X. Scorer regex run-1000-matrix.py:127 vs enforcer enforceItalianK12Opener:692-714 mismatch. Identify root cause + minimal fix preventing regression. CONSTRAINTS: read-only sandbox cite file:line. DONE: root cause + fix recommendation + regression risk estimate." &
wait
ls -la /tmp/codex-verify-*-iter71*.txt
```

- [ ] **Step 2: Wait 5min for Codex completion**

Use Monitor tool: `Monitor tool output until file size > 1KB ognuno`.

- [ ] **Step 3: Read Codex findings**

```bash
for f in /tmp/codex-verify-*-iter71*.txt; do echo "=== $f ==="; head -50 "$f"; echo; done
```

Apply HIGH findings IMMEDIATELY inline orchestrator (per atom).

---

## Task 5: no_plurale fix (orchestrator inline, 1h)

**Files:**
- Modify (conditional): `supabase/functions/_shared/principio-zero-validator.ts` (line 698-714 enforcer)
- OR Modify: `scripts/bench/run-1000-matrix.py` (line 127 scorer regex)

**Why**: 2 no_plurale residual v244 ("Il LED dovrebbe essere verde" + highlight-X NUOVO regression). Codex Pattern V #4 finding root cause.

- [ ] **Step 1: Apply Codex finding (depend on Pattern V output)**

If root cause = scorer mismatch:
- Update `run-1000-matrix.py` regex to match enforcer's actual output pattern
If root cause = enforcer skip path:
- Update `enforceItalianK12Opener` to handle edge case (<5 word OR tag-start exception)

- [ ] **Step 2: Vitest delta scope verify**

```bash
npx vitest run tests/unit/principio-zero-validator*.test.* --reporter=basic 2>&1 | tail -10
```

Expected: All PASS + no new failures.

- [ ] **Step 3: Deploy + matrix v245 verify**

```bash
npx supabase functions deploy unlim-chat --no-verify-jwt --project-ref euqpdueopmlllqjmqnyb
sleep 30
python3 scripts/bench/run-1000-matrix.py 2>&1 | tail -10
```

Expected: ≤2 no_plurale failures OR 0 (target).

- [ ] **Step 4: Commit + Codex Pattern C verify-post**

```bash
git add supabase/functions/_shared/principio-zero-validator.ts scripts/bench/run-1000-matrix.py
git commit -m "$(cat <<'EOF'
fix(iter-71-no_plurale): 2 residual matrix v244 root cause [scorer|enforcer] mismatch fix

Codex Pattern V root cause: [insert finding]
Fix: [insert minimal change]
Matrix v245 result: [insert ≤2 OR 0 failures]
Vitest delta scope: [insert PASS count]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: TEAM A2 Vol3 dataset rework (BG subagent worktree, 3h)

**Files (worktree `elab-builder-iter71-A2`):**
- Modify: `src/data/cliffhanger-table.json` (convert `{experiments: [...]}` wrapper → Tea-compat 94-item array)
- Modify: `src/data/experiments-vol3.js` (add 15 missing IDs: v3-cap6-esp3 + v3-cap7-mini + v3-cap8-esp4 + capstones)
- Modify: `src/data/narrative-map-94.json` (94 entries parsed = 94 ACTUAL not 77)
- Modify: `src/services/experimentNarrativeService.js` (wire import schema, was claim-only)
- Modify: `src/data/experiments-vol3.js` header comment "14" → "29" actual count

**Why**: Codex Pattern C iter 70 TEAM A HIGH finding — Vol3 14 IDs vs Tea narrative 29 IDs (52% coverage gap). cliffhanger-table wrapper NOT Tea-compat array format.

- [ ] **Step 1: Create worktree**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git worktree add "../elab-builder-iter71-A2" -b "feat/iter-71-team-A2-vol3-rework"
cd "../elab-builder-iter71-A2"
```

- [ ] **Step 2: Dispatch BG subagent**

Use `Agent` tool with `subagent_type: backend-development:test-automator` OR `general-purpose`:

Prompt:
```
You are TEAM A2 iter 71 BG subagent in worktree `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-iter71-A2`.

SCOPE (file ownership rigid):
- src/data/cliffhanger-table.json (convert wrapper → 94-item array Tea-compat)
- src/data/experiments-vol3.js (add 15 missing IDs from Tea narrative_map.json)
- src/data/narrative-map-94.json (verify 94 unique IDs actual)
- src/services/experimentNarrativeService.js (wire schema import, was claim-only)

CODEX PATTERN V OUTPUT (apply HIGH findings):
[paste Codex finding from /tmp/codex-verify-team-A2-vol3-gap-iter71.txt]

CONSTRAINTS:
- Pattern S r3 worktree isolato (file ownership disjoint, no write conflict)
- Vitest delta scope test ognuno modifica
- Commit + own completion msg automa/team-state/messages/team-A2-iter71-completed.md
- NO push origin (orchestrator gate)
- ZERO regression baseline vitest 14346 PRESERVE
- 5+ honesty caveats final report
```

- [ ] **Step 3: Wait BG completion (~3h)**

Monitor via:
```bash
ls -la "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-iter71-A2/automa/team-state/messages/" 2>&1 | tail -5
```

Expected: `team-A2-iter71-completed.md` appears.

- [ ] **Step 4: Verify worktree delta vitest**

```bash
cd "../elab-builder-iter71-A2"
npx vitest run tests/unit/experiments-vol*.test.* --reporter=basic 2>&1 | tail -10
```

Expected: All PASS + new tests added.

- [ ] **Step 5: Codex Pattern C post-impl verify**

```bash
bash scripts/dev/codex-bg.sh verify-team-A2-post-iter71 --profile verify \
  "GOAL: verify iter 71 TEAM A2 worktree elab-builder-iter71-A2. Confirm 15 missing Vol3 IDs added + cliffhanger Tea-compat array + experimentNarrativeService wires schema. ANY HIGH issue identified? CONSTRAINTS: read-only sandbox cite file:line. DONE: verdict + HIGH/MED/LOW + recommendations."
```

- [ ] **Step 6: Merge mainwt**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git merge --no-ff feat/iter-71-team-A2-vol3-rework -m "merge(iter-71-A2): TEAM A2 Vol3 dataset rework 15 missing IDs + Tea-compat array"
npx vitest run --reporter=basic 2>&1 | tail -5
git worktree remove --force "../elab-builder-iter71-A2"
git branch -d "feat/iter-71-team-A2-vol3-rework"
```

Expected: vitest ≥14346 PASS + worktree cleanup.

---

## Task 7: TEAM B 94 esperimenti spec rework (BG subagent OR orchestrator inline, 2h)

**Files (mainwt OR worktree):**
- Modify: `tests/e2e/29-92-esperimenti-audit.spec.js` (add P0 assertion throw on broken esperimenti, severity P1→P2 tighten)
- Modify: `src/data/experiments-vol*.js` (sync 66 hardcoded count mismatches with actual source data)
- Modify: `extractWireCount` helper usage (remove unused import OR wire-up)

**Why**: Codex Pattern C iter 70 TEAM B HIGH finding — 79 IDs naming misleading "94", Playwright exit 0 con broken esperimenti, 66 stale count mismatches.

- [ ] **Step 1: Codex Pattern V output review**

```bash
cat /tmp/codex-verify-team-B-94-spec-iter71.txt
```

- [ ] **Step 2: Apply mismatch sync (if Codex finds <10 high-priority mismatches, inline; else BG subagent)**

```bash
# Example inline fix for 66 hardcoded count mismatches
node scripts/sync-experiment-registry.mjs --update-counts
```

- [ ] **Step 3: Add P0 assertion in Playwright spec**

```javascript
// In tests/e2e/29-92-esperimenti-audit.spec.js
test('P0: ALL 79 esperimenti must be non-broken', async ({ page }) => {
  const broken = await auditAllExperiments(page);
  if (broken.length > 0) {
    throw new Error(`P0_BROKEN: ${broken.length} esperimenti broken: ${broken.join(', ')}`);
  }
});
```

- [ ] **Step 4: Vitest delta + commit**

```bash
npx vitest run tests/unit/experiments-vol*.test.* --reporter=basic 2>&1 | tail -5
git add -A
git commit -m "fix(iter-71-B): 94 esperimenti spec rework 66 count sync + P0 assertion throw + extractWireCount cleanup"
```

---

## Task 8: TEAM D HomePage emoji removal + Album wire-up (BG subagent, 4h)

**Files (worktree `elab-builder-iter71-D`):**
- Modify: `src/components/HomePage.jsx` (CARDS field emoji → ElabIcons SVG)
- Modify: `src/components/HomePage/HomePage.module.css` (footer 🐒 fallback removal)
- Modify: `src/components/ElabIcons.jsx` (add NEW icons: BookIcon + LightBulbIcon + MonkeyIcon SVG)
- Modify: `src/components/album/AlbumStudente.jsx` (wire Supabase `student_album` table)
- Create: `supabase/migrations/20260516210000_student_album_table.sql` (NEW table if not exists)

**Why**: Codex Pattern C iter 70 TEAM D MED finding — HomePage emoji STILL present (CARDS + footer 🐒) violates rule #11 + Album SCAFFOLD only, no Supabase integration.

- [ ] **Step 1: Codex Pattern V output review**

```bash
cat /tmp/codex-verify-team-D-homepage-emoji-iter71.txt
```

- [ ] **Step 2: Create worktree + dispatch BG subagent**

```bash
git worktree add "../elab-builder-iter71-D" -b "feat/iter-71-team-D-homepage-album"
```

Dispatch subagent prompt (same pattern Task 6 Step 2).

- [ ] **Step 3: Wait + verify + merge** (same pattern Task 6 Steps 3-6)

---

## Task 9: TEAM E Quality Harness hard gate (orchestrator inline, 1.5h)

**Files:**
- Modify: `scripts/quality-harness/lighthouse-runner.mjs` (fail on ANY route fail, NOT success on ANY)
- Modify: `scripts/quality-harness/ux-probes.mjs` (strict assertions, NOT soft warnings)
- Modify: `scripts/quality-harness/promptfoo-runner.mjs` (add `SUPABASE_ANON_KEY` validation alongside `ELAB_API_KEY`)
- Modify: `tests/integration/ux-probes-main-landmark.test.js` (replace tautological `mainCount >= 0` with `mainCount === 1`)

**Why**: Codex Pattern C iter 70 TEAM E MED finding — Lighthouse runner permissive + UX soft warnings + Promptfoo missing SUPABASE_ANON_KEY check + main landmark check tautological.

- [ ] **Step 1: Lighthouse runner strict gate**

```javascript
// lighthouse-runner.mjs
const results = await Promise.all(routes.map(route => lighthouse(route)));
const failed = results.filter(r => r.performance < 90);
if (failed.length > 0) {
  throw new Error(`P0_LIGHTHOUSE: ${failed.length} routes failed perf <90: ${failed.map(r => r.url).join(', ')}`);
}
```

- [ ] **Step 2: UX probes strict assertions**

Replace `console.warn('UX issue:', ...)` with `throw new Error('P0_UX: ...')` for critical issues (touch <44px, contrast <4.5:1).

- [ ] **Step 3: Promptfoo SUPABASE_ANON_KEY validation**

```javascript
// promptfoo-runner.mjs
const requiredEnvs = ['ELAB_API_KEY', 'SUPABASE_ANON_KEY'];
for (const env of requiredEnvs) {
  if (!process.env[env]) {
    throw new Error(`P0_ENV: missing ${env}`);
  }
}
```

- [ ] **Step 4: Main landmark check tightening**

```javascript
// tests/integration/ux-probes-main-landmark.test.js
const mainCount = await page.locator('main').count();
expect(mainCount).toBe(1); // NOT >= 0 (tautological)
```

- [ ] **Step 5: Commit + run quality harness**

```bash
git add scripts/quality-harness/ tests/integration/ux-probes-main-landmark.test.js
git commit -m "fix(iter-71-E): Quality Harness hard gate Lighthouse + UX strict + Promptfoo SUPABASE + main landmark tighten"
node scripts/quality-harness/run-all.mjs 2>&1 | tail -20
```

Expected: Either PASS or honest fail (not silent pass).

---

## Task 10: TEAM G PreToolUse hook fix (orchestrator inline, 1h)

**Files:**
- Modify: `.claude/settings.json` (add Edit + MultiEdit matchers to guard-forbidden-avr-patterns hook)
- Modify: `scripts/agents/guard-forbidden-avr-patterns.sh` (fix blockly-blocks/*.js path to scratchGenerator.js exact path)
- Modify: `src/services/api.js` + `src/services/simulator-api.js` (Renesas migrate from AVR defaults if any references remain)

**Why**: Codex Pattern C iter 70 TEAM G MED-FAIL finding — hook bypassable via Edit/MultiEdit + blockly-blocks/*.js path doesn't exist + Renesas RA4M1 partial purge.

- [ ] **Step 1: Add Edit + MultiEdit matchers**

```json
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{"type": "command", "command": "bash scripts/agents/guard-deploy-unlim-chat.sh", "timeout": 5}]
      },
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [{"type": "command", "command": "bash scripts/agents/guard-forbidden-avr-patterns.sh", "timeout": 5}]
      }
    ]
  }
}
```

- [ ] **Step 2: Fix blockly-blocks path in guard script**

```bash
# guard-forbidden-avr-patterns.sh
# OLD (broken path):
# src/data/blockly-blocks/*.js
# NEW (actual path):
ARDUINO_GEN_PATH="src/components/simulator/panels/scratchGenerator.js"
```

- [ ] **Step 3: Verify hook blocks AVR pattern Edit attempt**

```bash
# Test: try Edit-ing a file with `PORTB` literal → hook should block
echo "PORTB = 0xFF;" > /tmp/test-avr.js
# Simulate hook input
echo '{"tool_input":{"file_path":"src/test.js","new_string":"PORTB = 0xFF"}}' | bash scripts/agents/guard-forbidden-avr-patterns.sh
```

Expected: Hook returns `permissionDecision: "deny"`.

- [ ] **Step 4: Commit**

```bash
git add .claude/settings.json scripts/agents/guard-forbidden-avr-patterns.sh
git commit -m "fix(iter-71-G): PreToolUse hook Edit+MultiEdit matcher + blockly-blocks path fix scratchGenerator.js"
```

---

## Task 11: Mac Mini re-seed (Andrea SSH, 30min)

**Files (Mac Mini-side):**
- Modify: `~/.elab-task-queue.jsonl` (append 3-4 tasks Bash-native)

**Why**: Mac Mini autonomous loop iter 70 TUTTI FAILED (path mount + node missing). Node v22 INSTALLED iter 70 PHASE 7. iter 71 re-seed Bash-native scripts native Mac path `/Users/progettibelli/Projects/elab-tutor/`.

- [ ] **Step 1: SSH Mac Mini**

```bash
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59
```

- [ ] **Step 2: Verify Node + git pull**

```bash
which node && node --version  # Expected: v22.10.0
cd ~/Projects/elab-tutor && git pull origin feat/iter-41-sprint-u-cycle-2-real-user-fix
```

- [ ] **Step 3: Append valid tasks queue**

```bash
cat >> ~/.elab-task-queue.jsonl << 'EOF'
{"id":"d1-wiki-batch-30","priority":"P1","script":"bash ~/scripts/elab-wiki-batch-gen-v2.sh","args":"30 concepts","timeout":7200}
{"id":"d2-vol3-chain-prod","priority":"P1","script":"node ~/scripts/elab-vol3-chain-test.mjs","args":"5 esperimenti","timeout":1800}
{"id":"d3-ocr-volume-pdf","priority":"P2","script":"bash ~/scripts/elab-tesseract-italian-batch.sh","args":"6 Volume PDFs","timeout":14400}
EOF
ls -la ~/.elab-task-queue.jsonl
```

- [ ] **Step 4: Verify autonomous loop picks up**

```bash
tail -5 ~/.elab-task-progress.jsonl
```

Expected: First task in_progress within 30min.

---

## Task 12: TEAM C UAT preparation (Andrea + Tea Strambino, defer iter 72-73)

**Files:**
- READ-ONLY: Test plan document (Andrea + Tea fisico Nano R4 hardware)

**Why**: TEAM C iter 71-C ALREADY SHIPPED iter 70 (commit d1d92ea1+00e0a7b6, 58 NEW tests). Real hardware UAT Andrea/Tea Strambino kit Omaric verify (orchestrator can't test fisico USB).

- [ ] **Step 1: Create UAT test plan doc**

```bash
cat > docs/uat/iter-71-C-vol3-blink-nano-r4-UAT.md << 'EOF'
# UAT Plan iter 71-C Vol3 Blink Nano R4

## Pre-requisites Andrea/Tea
- Mac/Windows/Linux con USB-C dati cavo
- Arduino Nano R4 fisico (kit Omaric)
- arduino-cli installed: `brew install arduino-cli` OR `apt install arduino-cli`
- ELAB Local Agent built + running: `cd src/services/elab-agent && npm install && npm run start`

## Test cases

### TC1: Compile Vol3 Blink v3-cap5-esp1
1. `cd /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`
2. `node src/services/elab-agent/cli.js start` (port 8765)
3. Open https://www.elabtutor.school/#lavagna
4. Click "Vol3 cap5 esp1 — Blink"
5. Click "Compila"
6. Expected: HTTP 200 + .hex file generated + 9 error categories absent

### TC2: Upload Nano R4 USB
1. Plug Nano R4 USB-C cavo dati
2. Click "Carica"
3. Expected: LED blink on Nano R4 + console log "Upload completed" + Italiano error translator if fail

### TC3: Error translator 7 categories Italian docente-friendly
1. Disconnect Nano R4
2. Click "Carica"
3. Expected: "Ragazzi, la Nano R4 non è connessa. Verificate il cavo USB-C." (port_missing translation)

## Pass criteria
- All 3 TC PASS
- Zero errors stack trace English (Italian docente-friendly only)
- Real LED blink hardware Nano R4 verified Andrea/Tea fisico

EOF
```

- [ ] **Step 2: Andrea + Tea Strambino execute** (defer iter 72-73 hardware UAT scope)

---

## Task 13: code-reviewer:code-reviewer Anthropic 6 team review (orchestrator dispatch parallel, 30min)

**Files:**
- READ: 6 team outputs iter 71

**Why**: Independent security + best practices + maintainability review per ogni team output before push origin.

- [ ] **Step 1: Dispatch 6 code-reviewer subagents parallel**

```javascript
// Use Agent tool with subagent_type: "code-reviewer:code-reviewer"
// 6 parallel reviews:
// 1. TEAM A2 worktree elab-builder-iter71-A2
// 2. TEAM B mainwt scripts/bench + tests/e2e
// 3. TEAM D worktree elab-builder-iter71-D
// 4. TEAM E mainwt scripts/quality-harness
// 5. TEAM G mainwt .claude/settings.json + scripts/agents
// 6. no_plurale fix mainwt supabase/functions
```

- [ ] **Step 2: Collect findings**

```bash
ls -la /tmp/code-reviewer-iter71-*.txt 2>&1
```

- [ ] **Step 3: Apply HIGH findings inline + commit**

For each HIGH finding: inline fix + commit + verify delta scope vitest.

---

## Task 14: matrix v246 final re-verify (orchestrator, 5min)

**Files:**
- Run: `scripts/bench/run-1000-matrix.py`

**Why**: Final verification iter 71 close all atoms ZERO regression matrix baseline preserved ≥99.4%.

- [ ] **Step 1: Final matrix run**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
python3 scripts/bench/run-1000-matrix.py 2>&1 | tee matrix-iter71-final-$(date +%Y%m%d-%H%M%S).log | tail -30
```

Expected: ≥99.4% PASS (vs v244 99.6% baseline).

- [ ] **Step 2: Diff iter 70 v244 vs iter 71 final**

```bash
diff <(jq -r '.category' scripts/bench/output/archive/iter-70/1000-matrix-failures-2026-05-16T19-43-19.jsonl | sort | uniq -c) \
     <(jq -r '.category' scripts/bench/output/1000-matrix-failures-$(date +%Y%m%d)*final*.jsonl | sort | uniq -c)
```

Expected: No new categories regressed.

- [ ] **Step 3: Archive iter 71 outputs**

```bash
mkdir -p scripts/bench/output/archive/iter-71
mv scripts/bench/output/1000-matrix-*-*final* scripts/bench/output/archive/iter-71/
```

---

## Task 15: close audit + handoff + CLAUDE.md APPEND (orchestrator, 30min)

**Files:**
- Create: `docs/audits/2026-05-16-iter-71-CLOSE-audit.md` (~400 LOC)
- Create: `docs/handoff/2026-05-16-iter-71-to-iter-72-handoff.md` (~250 LOC)
- Modify: `CLAUDE.md` (APPEND iter 71 close section)

**Why**: Mandatory iter close documentation per master plan iter 71-75 §3 "Massive documentation" pattern.

- [ ] **Step 1: Generate close audit**

Template structure (see existing iter 70 close audit + handoff for pattern):
- Score iter 71 ONESTO G45 (target 9.0/10 raw + cap if needed)
- 14 atoms delivery summary file-system verified
- SPRINT_U_COMPLETE 17 boxes status delta
- 5+ honesty caveats critical
- Codex Pattern V/C cross-check 4 outputs apply HIGH findings status
- code-reviewer:code-reviewer Anthropic 6 outputs review status
- Anti-inflation G45 mandate enforced
- Cross-link docs iter 71

- [ ] **Step 2: Generate handoff iter 72**

Template structure:
- §1 ACTIVATION STRING iter 72 paste-ready
- §2 setup steps Andrea (~2-3h totale parallel)
- §3 Iter 72 priorities P0 cascade target 9.5+/10
- §4 Honesty caveats iter 72 entrance (carryover iter 71)
- §5 Anti-inflation G45 mandate iter 72 entrance
- §6 Sprint U close projection iter 72-75

- [ ] **Step 3: APPEND CLAUDE.md iter 71 close section**

```markdown
## Sprint U iter 71 CLOSE (2026-05-16) — [TBD title summary]

**Score iter 71 ONESTO G45**: **X.X/10** (+X.X vs iter 70 close 8.8)

[insert audit summary verbatim]

[insert cross-link]
```

- [ ] **Step 4: Final commit + push origin Andrea ratify**

```bash
git add docs/audits/2026-05-16-iter-71-CLOSE-audit.md docs/handoff/2026-05-16-iter-71-to-iter-72-handoff.md CLAUDE.md
git commit -m "close(iter-71): X.X/10 ONESTO + matrix v246 verified + 6 team Codex Pattern C green + iter 72 entrance handoff"
# Andrea ratify push origin
# git push origin feat/iter-41-sprint-u-cycle-2-real-user-fix
```

---

## Self-Review Checklist

After completing all 15 tasks:

- [ ] **Spec coverage**: All atoms iter 71 § shipped OR explicitly deferred iter 72 with reason
- [ ] **Placeholder scan**: No "TBD" / "TODO" / "implement later" leftover (this plan: TBD on UAT defer iter 72-73 ratificato)
- [ ] **Type consistency**: All file paths exact match repository structure verified
- [ ] **Spec requirement coverage**: 14 atoms from master plan iter 71-75 + 4 NEW iter 71 atoms (A-SECURITY + A-NEW-3c + Sentry/PostHog + Mac Mini re-seed) totale ATOMS shipped == 18 verified
- [ ] **Anti-regression gate**: Vitest baseline 14346 NEVER scendere + matrix v246 ≥99.4% preserved + build NEVER skip pre-commit + pre-push NEVER bypass `--no-verify`

## Execution Handoff

**Plan complete saved at**: `docs/plans/2026-05-16-iter-71-DETAILED-PLAN.md`

**Recommended execution**: **Subagent-Driven (recommended)** via `superpowers:subagent-driven-development` — orchestrator dispatches fresh subagent per task, reviews between tasks, fast iteration.

**Andrea actions parallel (~2-3h)**:
1. A-SECURITY rotation (30min) — Task 1
2. Sentry+PostHog OAuth (30min) — Task 3
3. Push origin iter 70 batch (10min before iter 71 close) — Bootstrap Step 0
4. Mac Mini SSH re-seed (30min) — Task 11
5. TEAM C UAT hardware Nano R4 Strambino kit Omaric (defer iter 72-73) — Task 12

**Orchestrator actions inline (~8-10h)**:
1. PHASE 0 Bootstrap CoV (10min) — Task 0
2. Codex Pattern V dispatch 4 BG parallel (5min wait) — Task 4
3. no_plurale fix (1h) — Task 5
4. TEAM A2 worktree dispatch + monitor + merge (3h) — Task 6
5. TEAM B inline fix (2h) — Task 7
6. TEAM D worktree dispatch + monitor + merge (4h) — Task 8
7. TEAM E inline fix (1.5h) — Task 9
8. TEAM G inline fix (1h) — Task 10
9. code-reviewer:code-reviewer 6 parallel review (30min) — Task 13
10. matrix v246 final verify (5min) — Task 14
11. close audit + handoff + CLAUDE.md APPEND (30min) — Task 15

**Total iter 71 effort**: ~14-15h Andrea + orchestrator parallel.

---

## Anti-inflation G45 mandate iter 71 enforced

- Cap **9.0/10** raw conditional ALL 18 atoms shipped + Codex Pattern C 4/4 GREEN + code-reviewer 6/6 GREEN + matrix v246 ≥99.4% PRESERVED + vitest 14346+ PRESERVE.
- NO claim "Sprint U close" (iter 72+ projection).
- NO claim above 9.0 if ANY HIGH Codex finding unresolved.
- NO claim "Tea 100% integrated" (iter 72+ multi-iter Album runtime + bibbia_stilistica deep apply scope).
- NO claim "94 esperimenti hardware UAT complete" (Andrea/Tea Strambino fisico defer iter 72-73).
- Score iter 71 ONESTO empirical only POST Codex Pattern C verify ALL atoms.

---

**END OF PLAN**

Total tasks: 15 (Bootstrap + 14 atoms + UAT prep)
Total estimated effort: ~14-15h Andrea + orchestrator parallel
Anti-regression mandate: ABSOLUTE (vitest + matrix + build + pre-push hook gates ALL active)
Pattern S r3: 16× consecutive validated, mandatory enforcement
Codex Pattern V/C: 4 verifies pre-impl + 4 post-impl + 6 code-reviewer parallel
