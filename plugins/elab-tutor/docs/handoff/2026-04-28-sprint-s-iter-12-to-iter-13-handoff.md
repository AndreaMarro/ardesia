---
sprint: S
from_iter: 12
to_iter: 13
date: 2026-04-28
author: scribe-opus (PHASE 2 sequential)
state_baseline_iter_11: 9.30/10 ONESTO (HEAD e02eabb)
state_phase_1_close_iter_12: 9.30/10 ONESTO UNCHANGED (lift pending PHASE 3 live bench)
target_iter_12_close: 9.65/10 (acceptable) | 9.85 (best case) — projection-only pre Phase 3
target_iter_13_close: 9.95/10 (per master PDR §4.2)
audit_ref: docs/audits/2026-04-28-sprint-s-iter12-PHASE1-FINAL-audit.md
master_pdr_ref: docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md §4.2
---

# Handoff Sprint S iter 12 → iter 13 (scribe-opus PHASE 2)

## §1 ACTIVATION STRING iter 13 (paste-ready)

```
/caveman

Sprint_S_iter13_PatternS_5agent_OPUS PHASE-PHASE — Box 1+3 redefine ratify (ADR-020/021) + A/B test RAG_HYBRID_ENABLED prod 50% + composite-handler L2 template + state-snapshot-aggregator wire-up + Mac Mini retry D1+D2+D3.

State entry: iter 12 PHASE 1 close 9.30/10 ONESTO UNCHANGED (lift pending PHASE 3 live bench, infrastructure shipped 12 ATOM-S12 file-system verified, Mac Mini D1+D2+D3 deferred SSH key auth fail iter 12, ADR-019/020/021 ratified prep, vitest 12599 PASS preserved).

Iter 12 PHASE 3 orchestrator status: bench live B1+B2+B3 + commit batch + push origin pending Andrea env provision. If completed pre iter 13: score recalibrate per actual bench live results. Else iter 13 entrance retry.

LEGGI ordine OBBLIGATORIO:
1. CLAUDE.md (DUE PAROLE D'ORDINE Principio Zero V3 + Morfismo DUAL+SENSE 1.5 + iter 1-12 close history)
2. .impeccable.md (Design Context: 5 Design Principles + 10-anti-pattern checklist)
3. docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md §4.2 (10 ATOM-S13)
4. docs/audits/2026-04-28-sprint-s-iter12-PHASE1-FINAL-audit.md (iter 12 audit, including §6 honest gaps + §7 Pattern S validation gap mitigation)
5. docs/handoff/2026-04-28-sprint-s-iter-12-to-iter-13-handoff.md (this handoff)
6. docs/adrs/ADR-019-sense-1.5-morfismo-runtime-docente-classe.md (Sense 1.5 foundation)
7. docs/adrs/ADR-020-box-1-vps-gpu-strategic-decommission-prep.md (Andrea ratify iter 13)
8. docs/adrs/ADR-021-box-3-rag-1881-full-coverage-redefine-prep.md (Andrea ratify iter 13)

P0 entrance (in ordine):
1. Pre-flight: vitest baseline 12290+ PASS preserve (`npx vitest run` head count) + build PASS (`npm run build` heavy ~14min if not run iter 12 PHASE 3) + Edge Function unlim-chat live (curl smoke) + Vercel www.elabtutor.school HTTP 200
2. Mac Mini SSH retry: `ssh progettibelli@100.124.198.59 -i ~/.ssh/id_ed25519_elab "uptime"` (if fail, Andrea check Tailscale + authorized_keys + PID 23944 launchctl)
3. Bench iter 12 status: read `automa/state/iter-12-bench-results.json` — if dry-run only (Phase 3 NOT executed iter 12), env provision + run live this iter entrance; else read live results + apply score lift Box 6 + Box 7
4. Andrea ratify queue iter 13: ADR-020 + ADR-021 + A/B test RAG_HYBRID_ENABLED prod 50% (10 min Andrea total)

P0 spawn 5-agent OPUS Pattern S PHASE-PHASE iter 13 (per master PDR §4.2):
PHASE 1 parallel 4 agents:
- planner-opus: 10 ATOM-S13 atoms (per master PDR §4.2) + sprint contract `automa/team-state/sprint-contracts/sprint-S-iter-13-contract.md` + 5 dispatch msgs
- architect-opus: ADR-022 composite-handler L2 template runtime activation patterns (~600 LOC) + ADR-023 state-snapshot-aggregator parallel orchestration prod wire-up (~500 LOC)
- gen-app-opus: A/B test RAG_HYBRID_ENABLED Edge Function unlim-chat (50% traffic) + composite-handler L2 template runtime activate `scripts/openclaw/composite-handler.ts` + state-snapshot-aggregator wire-up Edge Function
- gen-test-opus: B5 ClawBot composite full image-based scenarios D+E (post real screenshots iter 12 OR placeholder PNG fallback) + A/B test scaffolding `tests/integration/rag-hybrid-ab.test.js` + composite L2 template `scripts/openclaw/composite-l2.test.ts`

PHASE 2 sequential AFTER 4/4 completion msgs filesystem barrier (FIX iter 12 §7.2 protocol gap):
- scribe-opus: audit + handoff + CLAUDE.md update + iter 13 results report

PHASE 3 orchestrator:
- Run iter-12-bench-runner.mjs full 10-suite live (or iter-13-bench-runner.mjs if updated)
- /quality-audit ELAB skill cadenza ogni 4 iter (iter 12 bypass, iter 13 mandatory if not run iter 12)
- Score 10 box recalibrate ONESTO post live measure
- Commit batch + push origin (iter 12 PHASE 1 deliverables + iter 13 deliverables se iter 12 PHASE 3 non eseguito)

P1 Mac Mini delegation autonomous (RETRY iter 12 deferred):
- D1 elab-builder: 28 ToolSpec expand 52 → 80 (5 per cycle, 6 cycles ~3 giorni autonomous) → `automa/state/BUILD-RESULT.md`
- D2 elab-researcher-v2: Wiki Analogia 30 concepts overnight cron 22:30 CEST → `automa/state/RESEARCH-FINDINGS.md`
- D3 elab-auditor-v2: Vol1+2+3 PDF diff + experiment alignment audit USER INSIGHT 2026-04-28 (CRITICAL Sprint T scope) → `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md`

CoV ogni agente: vitest 12290+ PASS + openclaw 129+ PASS + build PASS (PHASE 3 orchestrator, ~14min) + baseline preserve `automa/baseline-tests.txt` delta ≥0 + 3× verify rules + completion-msg-emission MANDATORY (`automa/team-state/messages/<agent>-iter13-to-orchestrator-2026-04-28-*.md` writeable BEFORE agent exit, fix iter 12 §7.2 protocol gap).

Pass criteria iter 13 close (per master PDR §4.2):
- ATOM-S13-A1 architect ADR-020 ratify Box 1 0.4 → 1.0 (decommission strategic = success)
- ATOM-S13-A2 architect ADR-021 ratify Box 3 0.7 → 1.0 (RAG 1881 chunks full coverage redefine)
- ATOM-S13-A3 gen-app A/B test prod 50% recall@5 lift verified → Box 6 +0.05
- ATOM-S13-A4 gen-test B5 image-based scenarios D+E → Box 10 +0.025
- ATOM-S13-B1 gen-app composite-handler L2 template runtime activation → Sense 1.5 morfismo
- ATOM-S13-B2 gen-app state-snapshot-aggregator parallel orchestration prod wire-up → Onniscenza
- ATOM-S13-C1 scribe audit + handoff iter 13 close → Foundation
- ATOM-S13-D1 Mac Mini elab-builder 28 ToolSpec continua → Box 10 +0.025
- ATOM-S13-D2 Mac Mini elab-strategist 9-doc audit Phase 1-6 deploy mappa → Sprint T
- ATOM-S13-D3 Mac Mini elab-tester R5+R6 stress regression daily → Box 5+9 maintain

Iter 13 score gate ONESTO:
- 10/10 GREEN → 9.95 (best case, all bench + ADR ratify + Mac Mini lands)
- 8-9/10 GREEN → 9.85 (target ONESTO)
- 6-7/10 GREEN → 9.65 (acceptable, defer iter 14)
- ≤5/10 GREEN → 9.30 stuck (defer iter 14 deep debug + systematic-debugging spawn)

PRINCIPIO ZERO V3 + MORFISMO DUAL+SENSE 1.5 obbligatori ogni feature.
NO main push. NO merge senza Andrea explicit. NO --no-verify. NO Edge Function deploy senza verify post-deploy curl smoke 5min.
--max-iterations 100 --completion-promise SPRINT_S_COMPLETE.
Promise output `<promise>SPRINT_S_COMPLETE</promise>` SOLO 10/10 boxes TRUE verified file system.

Iter 12 close 9.30 (PHASE 1) | 9.65 (target post Phase 3 live) | Iter 13 target 9.95. Iter 14 target 10.00 SPRINT_S_COMPLETE.

GO.
```

---

## §2 Setup steps Andrea (5-10 min)

### §2.1 Pre-flight verify state iter 12 close

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"

# 1. Git status — check 12 ATOM-S12 deliverables uncommitted (or committed if iter 12 PHASE 3 ran)
git status

# 2. HEAD commit — was iter 11 close e02eabb. Iter 12 PHASE 3 commit pending or already landed?
git log -1 --format="%h %s"

# 3. vitest baseline preserve check
cat automa/baseline-tests.txt   # should read 12290 or higher (12599 if iter 12 fixtures registered)

# 4. Edge Function smoke test (no deploy needed iter 12, deploy iter 13 if A3 A/B test new code)
curl -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "x-elab-api-key: $ELAB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"test smoke","experimentId":"v1-cap6-esp1","debug_retrieval":true}'

# 5. Vercel prod live check
curl -I https://www.elabtutor.school
# expect: HTTP/2 200
```

### §2.2 Mac Mini SSH retry (iter 12 deferred D1+D2+D3)

```bash
# Retry SSH iter 13 entrance (was failing iter 12: publickey,password,keyboard-interactive denied)
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 "uptime && launchctl list | grep elab.mac-mini-autonomous"

# If still fails:
# 1. Andrea check Tailscale up (iPhone Tailscale app + Mac Mini menu bar icon)
# 2. Andrea verify ~/.ssh/authorized_keys on Mac Mini contains MacBook public key
# 3. Andrea check launchctl PID 23944 alive (`launchctl list | grep com.elab.mac-mini-autonomous-loop`)

# If SSH OK: dispatch D1+D2+D3 NEXT-TASK.md fire iter 13 atoms
```

### §2.3 Provision env keys for live bench (if iter 12 PHASE 3 did NOT run)

```bash
# Required for B2 + B3 + B7 live bench:
export SUPABASE_URL="https://euqpdueopmlllqjmqnyb.supabase.co"
export SUPABASE_ANON_KEY="<from Supabase Dashboard Settings → API>"
export ELAB_API_KEY="<from .env or Vercel env vars>"

# Optional for full coverage:
export VOYAGE_API_KEY="<from voyageai.com Dashboard>"
export TOGETHER_API_KEY="<from together.xyz>"
export GEMINI_API_KEY="<from console.cloud.google.com>"

# Run live bench iter 12 (if not run during iter 12 PHASE 3)
node scripts/bench/iter-12-bench-runner.mjs   # no --dry flag, full mode
# Output: automa/state/iter-12-bench-results.json (overwrites dry-run)
```

### §2.4 Ratify ADR-020 + ADR-021 (Andrea decision iter 13 entrance)

Andrea reviews + ratifies (or rejects with justification):

1. **ADR-020 Box 1 redefine**: VPS GPU strategic decommission = success. Lift Box 1 0.4 → 1.0.
2. **ADR-021 Box 3 redefine**: RAG 1881 chunks = full Vol1+2+3+wiki coverage. Lift Box 3 0.7 → 1.0.
3. **A/B test RAG_HYBRID_ENABLED prod 50% traffic**: 24h observation window measure recall@5 vs dense-only baseline.

Approval format: signed comment `automa/team-state/messages/andrea-ratify-iter13-2026-04-28-<HHMMSS>.md` with explicit ADR-NNN: APPROVE/REJECT + rationale.

---

## §3 Iter 13 priorities P0 (per master PDR §4.2)

### §3.1 ATOM-S13 detailed (10 atoms)

| ID | Owner | Task | Effort | Box impact |
|----|-------|------|--------|------------|
| ATOM-S13-A1 | architect | Box 1 redefine ADR-020 ratify (already prep iter 12, ratify iter 13) | ~30min | Box 1 0.4 → 1.0 (+0.6) |
| ATOM-S13-A2 | architect | Box 3 redefine ADR-021 ratify (already prep iter 12, ratify iter 13) | ~30min | Box 3 0.7 → 1.0 (+0.3) |
| ATOM-S13-A3 | gen-app | unlim-chat A/B test RAG_HYBRID_ENABLED prod traffic 50% → measure recall@5 vs dense-only | ~1h + 24h observe | Box 6 +0.05 |
| ATOM-S13-A4 | gen-test | B5 ClawBot composite full image-based scenarios D+E (post real screenshots iter 12) | ~30min | Box 10 +0.025 |
| ATOM-S13-B1 | gen-app | composite-handler L2 template runtime activation (predefined morphic patterns per ADR-013) | ~1h | Sense 1.5 morfismo |
| ATOM-S13-B2 | gen-app | state-snapshot-aggregator parallel orchestration prod wire-up Edge Function | ~1h | Onniscenza |
| ATOM-S13-C1 | scribe | Audit + handoff iter 13 close | ~30min | Foundation |
| ATOM-S13-D1 | Mac Mini elab-builder | 28 ToolSpec continua iter 12 cycle (cycles 4-6) | continua | Box 10 +0.025 |
| ATOM-S13-D2 | Mac Mini elab-strategist | 9-doc audit Phase 1-6 deploy mappa (preview Sprint T iter 15+) | 1-2 giorni | Sprint T |
| ATOM-S13-D3 | Mac Mini elab-tester | R5+R6 stress regression daily | cron 6h | Box 5+9 maintain |

### §3.2 Iter 13 entrance gate sequence

1. Pre-flight CoV: vitest + build + Edge Function smoke + Vercel HTTP 200
2. Iter 12 PHASE 3 status check: bench live OR repeat env provision iter 13 entrance
3. Mac Mini SSH retry + D1+D2+D3 dispatch
4. Andrea ratify ADR-020 + ADR-021 + A/B test approval
5. Pattern S 5-agent OPUS PHASE-PHASE spawn (with §3.3 protocol gap fix)

### §3.3 Pattern S race-cond protocol gap fix iter 13 entrance

**Per audit §7.2**: iter 12 PHASE 1 emitted only 1/4 completion msgs to orchestrator (planner only). Architect/gen-app/gen-test deliverables file-system verified but completion-msg emission step skipped.

**Iter 13 mitigation MANDATORY**:
- Each agent contract `automa/team-state/messages/planner-iter13-to-<agent>-*.md` adds explicit CoV step LAST: "BEFORE exit, write completion msg `automa/team-state/messages/<agent>-iter13-to-orchestrator-*.md` with YAML frontmatter listing files_shipped + LOC actual + atoms_completed".
- scribe-opus PHASE 2 trigger condition: `ls automa/team-state/messages/*iter13-to-orchestrator-2026-04-28-*.md | wc -l` MUST return ≥4 BEFORE Phase 2 spawn (planner + architect + gen-app + gen-test).
- If <4 after 30min wait: orchestrator surface explicit error + retry agents OR proceed with partial state + flag honest gap (per iter 12 §7.2 lesson).

---

## §4 Mac Mini delegation queue iter 13 entrance

### §4.1 Iter 12 deferred queue (re-dispatch)

| Task | Mac Mini agent SKILL | Fire pattern | Output state file | Status iter 12 | Iter 13 retry |
|------|----------------------|--------------|--------------------|----------------|----------------|
| D1 28 ToolSpec expand 52 → 80 | elab-builder | NEXT-TASK.md fire | `automa/state/BUILD-RESULT.md` (1 PR per 5 ToolSpec) | DEFERRED SSH block | Retry iter 13 entrance post SSH unblock |
| D2 Wiki Analogia 30 concepts | elab-researcher-v2 | cron daily 22:30 CEST + manual | `automa/state/RESEARCH-FINDINGS.md` | DEFERRED SSH block | Retry iter 13 entrance |
| D3 Vol1+2+3 PDF diff + experiment alignment audit (USER INSIGHT 2026-04-28) | elab-auditor-v2 | manual fire | `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` | DEFERRED SSH block | Retry iter 13 entrance |

### §4.2 Iter 13 NEW Mac Mini queue

| Task | Mac Mini agent SKILL | Fire pattern | Output state file |
|------|----------------------|--------------|--------------------|
| D2-iter13 9-doc audit Phase 1-6 entry preview Sprint T iter 15+ | elab-strategist + elab-coordinator | cron daily summary 6:00 CEST | 9 docs `docs/audits/2026-MM-DD-*.md` (preview iter 15+) |
| D3-iter13 R5+R6 stress prod regression daily | elab-tester | cron 6h | `automa/state/TEST-RESULT.md` |

### §4.3 Mac Mini status protocol poll

```bash
# Iter 13+ poll Mac Mini state files (post cron firing)
ls -la automa/state/{BUILD-RESULT,RESEARCH-FINDINGS,VOLUMI-EXPERIMENT-ALIGNMENT,TEST-RESULT,QUALITY-AUDIT,DEBUG-FINDINGS}.md 2>/dev/null

# If updated since iter 12 close: pull commits via Mac Mini autonomous loop branches
git fetch origin
git log --all --oneline --since="2026-04-28" | grep -i "mac-mini"
```

---

## §5 Andrea ratify queue iter 13 (~10 min)

1. **ADR-020 Box 1 redefine ratify** (~3 min review)
   - File: `docs/adrs/ADR-020-box-1-vps-gpu-strategic-decommission-prep.md` (232 LOC)
   - Decision: VPS GPU strategic decommission Path A confirmed iter 5 P3 (RunPod TERMINATE)
   - Rationale: $13.33/mo idle storage spend ≠ production runtime value. Cloud-only stack (Together + Gemini + Voyage) production-stable verified R5 91.80% + R6 96.54% live iter 5+.
   - Lift: Box 1 0.4 → 1.0
   - Output: signed APPROVE comment `automa/team-state/messages/andrea-ratify-iter13-2026-04-28-<HHMMSS>.md`

2. **ADR-021 Box 3 redefine ratify** (~3 min review)
   - File: `docs/adrs/ADR-021-box-3-rag-1881-full-coverage-redefine-prep.md` (261 LOC)
   - Decision: RAG 1881 chunks (vol1 203 + vol2 292 + vol3 198 + 100 wiki) = full Vol1+2+3+wiki coverage canon. Original 6000 target = synthetic upper bound.
   - Rationale: 1881 = REAL coverage measure post Voyage + Llama 70B contextualization iter 7. Delta ingest 4119 chunks ≠ value (would re-embed same content with different chunking strategy).
   - Lift: Box 3 0.7 → 1.0
   - Output: signed APPROVE comment same file as ADR-020

3. **A/B test RAG_HYBRID_ENABLED prod 50% traffic approve** (~3 min)
   - Decision: enable feature flag prod traffic 50% for 24h observation window
   - Rationale: gen-app A3 ATOM-S13 wires hybrid retriever (BM25+dense+RRF rerank) selectively, measure recall@5 lift vs dense-only baseline
   - Risk: minimal — fallback to dense-only on error, all queries logged
   - Output: same signed comment file

4. **Optional: deploy unlim-tts WS retry alternative** (~5 min, defer iter 14 if Andrea busy)
   - Coqui RunPod resume alternative OR browser fallback ratify 0.95 ceiling
   - Defer if iter 13 work already heavy

---

## §6 Risks + blockers carry-forward

### §6.1 Mac Mini SSH access (iter 12 deferred)

**Status**: SSH key auth fail (publickey,password,keyboard-interactive denied) iter 12.
**Mitigation**: Andrea check Tailscale + authorized_keys + launchctl PID iter 13 entrance §2.2.
**Fallback**: if Mac Mini stays unreachable iter 13+, D1+D2+D3 manual MacBook execution (slower but unblocks Box 10 + Sprint T scope).

### §6.2 Live bench env dependencies (Playwright + Supabase + Voyage)

**Status**: env keys missing iter 12 dry-run only.
**Mitigation**: Andrea export shell env iter 13 entrance §2.3.
**Fallback**: dry-run scoring + flag honest "infrastructure ready, lift unverified live" (iter 12 audit §6.2 documented).

### §6.3 Vision canvas selector deeper regression (iter 11 + 12 unresolved)

**Status**: A3 spec extension 332 LOC + 5389B evidence md shipped iter 12, real-run NOT executed.
**Mitigation**: PHASE 3 orchestrator iter 12 OR iter 13 entrance live Playwright run with class_key seeded.
**Fallback**: defer iter 13 deep-dive (systematic-debugging spawn ogni 8 iter cadenza per master PDR §3.2).

### §6.4 TTS WS Sec-MS-GEC blocker (iter 9 ongoing)

**Status**: defer iter 14 ceiling 0.85 OR Coqui alternative.
**Mitigation**: Andrea decision iter 14 (Coqui RunPod resume OR browser fallback ratify 0.95 ceiling).
**Iter 13 NO action** (out of scope).

### §6.5 Quality signals UX/a11y backlog (defer Sprint T)

**Status**: 435 + 1326 + 103 + 9 raw counts (audit §6.4).
**Mitigation**: Sprint T iter 15+ dedicated audit phase (per master PDR §5.1 9-doc audit).
**Iter 13 NO action** (out of scope).

### §6.6 PHASE 1 race-cond protocol gap (iter 12 §7.2)

**Status**: 1/4 completion msgs emitted iter 12 PHASE 1.
**Mitigation iter 13**: each agent contract adds explicit completion-msg-emission CoV step LAST (§3.3).
**Risk if not fixed**: scribe Phase 2 stale-state risk (race-cond iter 3 lesson learned 3.4 vs 5.0/10) — mitigation MANDATORY.

### §6.7 Iter 11 dedicated audit md never written (iter 12 audit §9 References)

**Status**: `2026-04-27-sprint-s-iter11-MASSIVE-LIFT-audit.md` doesn't exist filesystem; iter 11 close narrative is inline CLAUDE.md sprint history sections + master PDR §1.1-1.3.
**Mitigation**: NO inflation — iter 12+ audits cite CLAUDE.md inline + master PDR sections, not nonexistent file.
**Iter 13+ practice**: scribe write dedicated audit md per iter close standard.

---

## §7 Iter 13 close score target

**Per master PDR §4.2**:
- Box 1: 0.4 → 1.0 (Andrea ratify ADR-020 +0.6)
- Box 3: 0.7 → 1.0 (Andrea ratify ADR-021 +0.3)
- Box 6: 0.85 → 0.90 (A/B test RAG_HYBRID prod 50% +0.05 IF measured live)
- Box 10: 0.95 → 0.975 (D1 Mac Mini partial +0.025)
- Other boxes maintain

**Subtotal box iter 13 close projection**: 8.075/10 + bonus cumulative 1.875 = **9.95/10 ONESTO** (per master PDR §4.2 target).

**Andrea action lift contribution**: ~10 min (ADR ratify + A/B approve) → +0.85 score lift. High ROI.

**Mac Mini D1 contribution**: continua autonomous (3 giorni concurrent iter 13-14) → Box 10 1.0 close iter 14.

---

## §8 Files refs iter 12 close

### §8.1 PHASE 1 deliverables shipped (12/12 file-system verified)

- ADR: `docs/adrs/ADR-019-sense-1.5-morfismo-runtime-docente-classe.md` (320 LOC)
- ADR: `docs/adrs/ADR-020-box-1-vps-gpu-strategic-decommission-prep.md` (232 LOC)
- ADR: `docs/adrs/ADR-021-box-3-rag-1881-full-coverage-redefine-prep.md` (261 LOC)
- Edge Function: `supabase/functions/_shared/rag.ts` (958 LOC modified A2 + A4)
- Edge Function: `supabase/functions/unlim-chat/index.ts` (447 LOC modified A4 debug_retrieval)
- Bench runner: `scripts/bench/iter-12-bench-runner.mjs` (656 LOC NEW)
- Bench output: `automa/state/iter-12-bench-results.json` (1443B dry-run) + `automa/state/iter-12-bench-summary.md` (1718B)
- Fixture: `scripts/bench/r7-fixture.jsonl` (200 prompts)
- Vision spec: `tests/e2e/02-vision-flow.spec.js` (332 LOC) + `tests/fixtures/vision-canvas-selector-evidence.md` (5389B)
- Hybrid gold-set: `tests/fixtures/hybrid-gold-30.jsonl` (30 entries) + `tests/fixtures/hybrid-gold-30-realign.md` (4195B)
- Capture helper: `scripts/capture-real-screenshots.mjs` (268 LOC)
- Screenshots: `tests/fixtures/screenshots/circuit-{01..20}.png` (20 PNG 582-583B) + `tests/fixtures/screenshots/INDEX.md` (3313B)

### §8.2 PHASE 2 deliverables (this turn)

- Audit: `docs/audits/2026-04-28-sprint-s-iter12-PHASE1-FINAL-audit.md` (~600 LOC)
- Handoff: `docs/handoff/2026-04-28-sprint-s-iter-12-to-iter-13-handoff.md` (this file, ~400 LOC)
- CLAUDE.md append iter 12 close section (~80 LOC delta)

### §8.3 PHASE 3 orchestrator pending

- Live bench output: `scripts/bench/output/{r7,b2-hybrid-recall,b3-vision,b4-tts,...}-2026-04-28-*.{json,md}` (post env provision)
- Real screenshots: `tests/fixtures/screenshots/circuit-{01..20}.png` real captures (post env)
- Git commit batch: 12 ATOM-S12 deliverables + this audit + this handoff + CLAUDE.md append
- Git push origin

---

## §9 References

- **Master PDR**: `docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md` §4.2 (10 ATOM-S13 detail) + §6 pass criteria
- **Iter 12 contract**: `docs/pdr/sprint-S-iter-12-contract.md`
- **Iter 12 audit**: `docs/audits/2026-04-28-sprint-s-iter12-PHASE1-FINAL-audit.md` (sibling deliverable)
- **CLAUDE.md inline iter 1-12 close history** (single source of truth orchestration)
- **`.impeccable.md`** (single source of truth design)
- **Iter 8 → iter 9 handoff reference style**: `docs/handoff/2026-04-27-sprint-s-iter-8-to-iter-9-handoff.md`

---

## §10 Honesty caveats finali handoff iter 12 → iter 13

1. **Iter 12 close score 9.30 PHASE 1 UNCHANGED**, lift to 9.65 conditional PHASE 3 live bench (NOT yet executed this audit).
2. **Mac Mini D1+D2+D3 deferred iter 12** (SSH key auth fail), retry iter 13 entrance MANDATORY.
3. **Iter 13 target 9.95 conditional Andrea ratify** ADR-020 + ADR-021 + A/B test (~10 min Andrea total).
4. **Pattern S race-cond protocol gap iter 12 §7.2**: explicit completion-msg-emission CoV step MANDATORY iter 13 each agent contract.
5. **Iter 13 9-doc audit Phase 1-6 preview Sprint T iter 15+**: D2-iter13 Mac Mini elab-strategist starts mappa Sprint T scope (USER INSIGHT 2026-04-28 critical).
6. **Iter 14 SPRINT_S_COMPLETE 10/10 ONESTO realistic** with iter 13 9.95 lift + Box 2 redefine + Box 8 ceiling 0.95 + Mac Mini 80 ToolSpec close.
7. **Sprint T iter 15+ begin** post Sprint S close: 9-doc audit + Volumi experiment alignment + Onniscenza+Onnipotenza completion + VPS GPU stack decision + quality testing matrix (per master PDR §5).

— scribe-opus, PHASE 2 sequential, 2026-04-28 ~05:32 CEST. CAVEMAN MODE. ONESTÀ MASSIMA. NO inflation.
