# Iter 27 — LIVE Prod 50q Pre-Deploy Baseline (BAILED 9/70 backend collapse)

**Date**: 2026-05-11 16:00 CEST
**Agent**: Iter 27 Agent W (parallel to Agent X Playwright 92 esperimenti sweep)
**Target**: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat`
**Reference**: iter 24 dim-1 brutal 6.4/10 LIVE 50q (`/Users/andreamarro/VOLUME 3/automa/state/iter-24-ralph-dim1-live-50q-20260511-133916.json`)
**Source code assumption**: unlim-chat v50 LIVE pre-iter-25 (Andrea deploy queue pending iter 27 entrance)
**Mode**: READ-ONLY HTTP curl, ZERO source code modification
**Outputs**:
- `/Users/andreamarro/VOLUME 3/automa/state/iter-27-live-50q-pre-deploy-20260511-160032.json`
- `/Users/andreamarro/VOLUME 3/automa/state/iter-27-live-50q-pre-deploy-20260511-160032.jsonl`

---

## Honest Score Iter 27 LIVE Baseline: **3.5/10** (G45 brutal cap, **−2.9 vs iter 24 6.4/10**)

**Headline finding**: LIVE prod `unlim-chat` v50 is **functionally down** at the moment of measurement (16:00 CEST 2026-05-11). 7/9 sampled queries returned HTTP 503 "AI temporaneamente non disponibile" after 12–20s waits. Runner aborted at query 9/70 on the BAIL condition (5 consecutive 5xx). Three follow-up probes after a 2-minute pause confirmed the breakage is **persistent**, not transient.

Score 3.5 reflects:
- 22% success rate (2/9 HTTP 200) vs iter 24 89% (62/70)
- p50 latency 19,008 ms (vs iter 24 3,552 ms = **5.4× regression**)
- p95 latency 20,010 ms (vs iter 24 18,891 ms — capped at client max-time, real worse)
- ZERO marathon (Cat B) memory evidence collected — bail before Cat B started
- ZERO safety / off-topic / Arduino / injection / resistore evidence collected
- The 2 HTTP-200 responses (A03, A04) hit `source: "flash"` (Gemini Flash fallback), suggesting primary Mistral LLM path is the actual broken element

---

## Section 1 — Methodology + Tools + Timestamp

**Tools**:
- Node 22 `fetch` HTTP client (`/tmp/iter27-stress-runner.mjs`, READ-ONLY, written under `/tmp` not under `src/`)
- Bash `curl` for probe + post-bail recheck
- Headers used: `Authorization: Bearer <SUPABASE_ANON_KEY>`, `X-Elab-Api-Key: <ELAB_API_KEY>`, `Content-Type: application/json`
- Body shape: `{message, sessionId, simulatorContext{volume, capitolo, experimentId}}` (camelCase per `unlim-chat/index.ts:177`)
- Session-ID pattern compliant `[a-zA-Z0-9_\-.:]{1,128}` per `_shared/guards.ts:142`

**Plan** (mirror iter 24 categories, 70 messages total):
- Cat A 15 vol/pag citations
- Cat B 5×5 marathon (5 sessions × 5 messages, DIFFERENT session_ids vs iter 24 `iter27-baseline-Bm{1..5}-<ts>`)
- Cat C 5 safety voltage_danger
- Cat D 8 off-topic bridge
- Cat E 7 Arduino direct-operational
- Cat F 5 tag-leak prompt injection
- Cat G 5 compact telemetry resistore

**Stagger**: 1s within same session_id, 2s across distinct session_ids.

**Bail rule applied**: 5 consecutive 5xx → abort, persist partial JSON+JSONL+audit.

**Timestamp**: run started 2026-05-11T16:00:32 CEST, BAILED 2026-05-11T16:03:20 CEST after 9/70 queries (~3 minutes wallclock). Post-bail 3-probe recheck at 16:06: 3/3 503.

---

## Section 2 — Aggregate Stats + Comparison Table iter 24 dim-1

### Iter 27 collected (Cat A only, n=9)

| Metric                  | Cat A iter 27 |
|-------------------------|---------------|
| n                       | 9             |
| HTTP 200                | 2             |
| HTTP 503                | 7             |
| strict Vol/pag (regex)  | 0             |
| plurale "Ragazzi,"      | 2             |
| word_count avg          | 9             |
| word_count p95          | 15            |
| leak_hit                | 0             |
| azione_tag              | 0             |
| safety_refusal          | 0             |
| offtopic_bridge         | 0             |
| latency p50 (ms)        | 19,008        |
| latency p95 (ms)        | 20,010        |

Cat B–G **n=0** (bail before reach). Latency p50/p95 for those cats = 0 in JSON, **not "fast"** — indicates "uncollected".

### Comparison table vs iter 24 dim-1 (Cat A 15-query baseline)

| Metric                  | iter 24 Cat A | iter 27 Cat A | Delta              |
|-------------------------|---------------|---------------|--------------------|
| n                       | 15            | 9             | n/a (subset)       |
| HTTP 200                | 14 (93%)      | 2 (22%)       | **−71pp regression** |
| HTTP 503                | 1 (6.7%)      | 7 (78%)       | **+71pp regression** |
| strict Vol/pag count    | 9 (60%)       | 0 (0%)        | **−60pp regression** |
| plurale "Ragazzi,"      | 14 (93%)      | 2 (22%)       | **−71pp regression** |
| word_count avg          | 29            | 9             | (skewed by 503 8-word error string) |
| latency p50 (ms)        | 3,267         | 19,008        | **+482% regression** |
| latency p95 (ms)        | 19,162        | 20,010        | +4% (capped) |

### Overall HTTP delta

| Status   | iter 24 (n=70) | iter 27 (n=9) | iter 24 rate | iter 27 rate |
|----------|----------------|---------------|---------------|---------------|
| 200      | 62             | 2             | 88.6%         | **22.2%**     |
| 503      | 8              | 7             | 11.4%         | **77.8%**     |

**Verdict Section 2**: iter 27 LIVE pre-deploy baseline shows **catastrophic regression vs iter 24**. The 11.4% 503 rate Andrea was supposed to **reduce** post-deploy has instead **grown 7×** to 77.8% in the ~2.5 hours between iter 24 (13:39) and iter 27 (16:00). This is the OPPOSITE of "drift confirmation" — it's an acute degradation event.

---

## Section 3 — Marathon 5×5 Evidence + msg4 Collapse Status

**Status: UNMEASURED.** Bail at 9/70 occurred during Cat A, before Cat B sessions began. The msg4 "Blink Vol.3 pag.23" universal-collapse hypothesis flagged in iter 24 dim-1 brutal is **neither CONFIRMED nor RESOLVED** in this run — we have no evidence either way.

**Implication**: iter 28 post-deploy verify run MUST re-attempt Cat B 5×5 marathon as P0. The msg4 collapse is iter 24's most actionable signal (multi-session memory entanglement) and zero data was captured iter 27.

Session IDs that would have been used (preserved for iter 28 re-run consistency):
- `iter27-baseline-Bm1-20260511-160032` — vol1-cap6-led
- `iter27-baseline-Bm2-20260511-160032` — vol2-cap5-multimetro
- `iter27-baseline-Bm3-20260511-160032` — vol3-cap5-blink
- `iter27-baseline-Bm4-20260511-160032` — vol1-cap8-pulsante
- `iter27-baseline-Bm5-20260511-160032` — vol2-cap7-condensatore

(iter 28 P0 should use FRESH session IDs to avoid any stale-state cross-contamination from this incomplete run.)

---

## Section 4 — Latency Table + Delta vs iter 24

| Latency      | iter 24 overall | iter 27 collected | Delta            |
|--------------|------------------|--------------------|------------------|
| min ms       | 346              | 1,778              | +1,432 ms        |
| avg ms       | 4,932            | 16,217             | **+228%**        |
| p50 ms       | 3,552            | 19,008             | **+435%**        |
| p95 ms       | 18,891           | 20,010             | +6% (likely capped by client max-time 30s + provider chain timeout cascade) |
| p99 ms       | 19,162           | 20,010             | +4%              |
| max ms       | 19,162           | 20,010             | +4%              |

### Hot-path vs LLM-call breakdown (iter 27)

| Path                | n  | latency_avg_ms |
|---------------------|----|------------------|
| Hot-path (safety / offtopic pre-LLM) | 0  | n/a (not exercised — Cat C/D never reached) |
| Successful LLM call (`source=flash`)  | 2  | 1,834 ms (A03 1778ms + A04 1889ms) |
| Failed provider chain (HTTP 503)      | 7  | 17,464 ms avg |

**Insight**: the 2 successful responses ran via `source=flash` (Gemini Flash). Mistral primary appears to be the chain segment timing out. Edge Function falls through Mistral → Gemini → Together (Together gated for students; only Mistral + Gemini available for `chit_chat`/citation paths in prod). When Mistral is slow/down, Gemini Flash sometimes saves it (A03/A04), but **most attempts (7/9) drain the full timeout** before falling through to the final HTTP 503 error envelope.

### Post-bail 3-probe recheck (16:06 CEST, 6 min after run start)

| Probe | HTTP | Time | Body |
|-------|------|------|------|
| 1     | 503  | 20.26 s | `{"success":false,"error":"AI temporaneamente non disponibile. Riprova tra qualche secondo."}` |
| 2     | 503  | 19.19 s | `{"success":false,"error":"AI temporaneamente non disponibile. Riprova tra qualche secondo."}` |
| 3     | 503  | 19.01 s | `{"success":false,"error":"AI temporaneamente non disponibile. Riprova tra qualche secondo."}` |

**The degradation is persistent, not transient.** At time of audit close, prod is still down.

---

## Section 5 — Top 5 Regression Candidates Iter 27 Entrance vs Iter 24 Baseline

1. **R1 — Mistral primary provider chain saturated or rate-limited (P0 BLOCKER)**.
   Evidence: 7/9 HTTP 503 after 12–20 s; only Gemini Flash fallback path returns 200; 3/3 follow-up probes 503; iter 24 was 11.4% 503 vs iter 27 78%.
   Hypothesis: Mistral La Plateforme rate-limit / 5xx burst, or LLM_ROUTING_WEIGHTS env still 70/20/10 sending most traffic to a degraded primary. Worth checking Mistral status page + Supabase secrets `LLM_ROUTING_WEIGHTS`.

2. **R2 — Gemini Flash fallback only triggers for a sub-class of requests**.
   Evidence: A03 (Volume 1 pulsante) + A04 (Volume 1 breadboard) both succeeded with `source=flash` 1.8 s. A01/A02/A05–A09 (same simulatorContext shape) all 503. The 200s suggest classifier output `category=citation_vol_pag` may route specifically through a Flash-only short path, while other categories try Mistral first and never recover.

3. **R3 — Client-side timeout 30s is **hiding the real backend timeout**.
   Evidence: 19–20 s elapsed_ms repeatedly. Edge Function default Supabase timeout is 60s; our HTTP client at 30s with 503 at ~20s suggests Edge is emitting the 503 itself (not socket-killed). Real provider timeout is ~15–18 s before the function gives up.

4. **R4 — No safety / off-topic / Arduino / injection / resistore data collected**.
   Out of scope to estimate from 0 samples, but iter 24's gentle-bridge + safety-refusal patterns were the few real strengths of prod. Cannot confirm those still hold under load.

5. **R5 — Iter 24's Cat B msg4 universal "Blink Vol.3 pag.23" collapse status unknown**.
   Highest-confidence memory bug from iter 24 brutal is untested. Iter 28 post-deploy run MUST include Cat B 5×5 marathon FIRST.

---

## Section 6 — Score ONESTO G45 Cap Delta Projection

**Iter 24 baseline**: 6.4/10 ONESTO (G45 cap, per dim-1 brutal eval).

**Iter 27 LIVE pre-deploy partial measurement**: **3.5/10 ONESTO G45 cap.**

Cap breakdown:
- Backend availability 22% (iter 24 89%) → **−2.5** (the single largest factor)
- Latency p50 5.4× regression → **−0.5**
- Zero Cat B/C/D/E/F/G measurement → **−0.4** (unknown is risk, not credit)
- The 2 successful responses still demonstrated `plurale "Ragazzi,"` + accurate page citations in human-readable form → **+0.5** baseline preserved on the narrow path Gemini Flash hits

**Projection post Andrea iter 28 deploy** (assuming Andrea deploys the iter-25-prepared v53+ which carried the latency mitigations: A3 Promise.all parallelize + A5 Cron warmup + A7 Mistral function calling):
- IF backend recovers to ≥85% HTTP 200 → score lifts to ≥6.5/10
- IF Mistral function calling deploy ENABLE_INTENT_JSON_SCHEMA=true canary OK → strict Vol/pag may rise above iter 24's 50% (per ADR-030 ≥95% projection)
- IF Cron warmup applied → p95 latency drop expected −800–1,200 ms per ADR
- Worst case (no deploy applied) → score stays ≤4.0/10 and iter 28 escalation P0 required

**G45 anti-inflation mandate enforced**: NO claim "minor drift" or "comparable to iter 24". The measurement IS the score — 3.5/10 brutally honest. NO score >5.0 without backend availability ≥80% verified live.

---

## Section 7 — Andrea Iter 28 P0 Ratify Queue (post-deploy verify re-run)

**P0.1 (BLOCKER) — Investigate Mistral provider chain saturation**
- Owner: Andrea
- Action: Check Mistral La Plateforme dashboard for rate-limit / 5xx burst window 2026-05-11 13:30–16:00 CEST.
- Check `npx supabase secrets list` for `LLM_ROUTING_WEIGHTS` current value (vs ADR-029 70/20/10).
- Decide: temporarily flip weights to 20/70/10 (Gemini Flash primary) until Mistral stabilizes, OR Andrea-deploy iter 25+ code if Mistral fix queued.

**P0.2 — Andrea deploy v53+ Edge Function (iter 25+ code)**
- Owner: Andrea
- Action: `SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb`
- Validation gate: smoke 1 query post-deploy → HTTP 200 + `source=mistral` OR `source=flash`, elapsed <5 s.

**P0.3 — Re-run iter 27 70-query stress (Andrea ratify after P0.1+P0.2)**
- Owner: Iter 28 Agent W
- Same query set, FRESH session_ids (`iter28-postdeploy-{cat}{n}-<ts>`)
- Expected lift target ≥6.5/10 ONESTO

**P0.4 — Marathon 5×5 (Cat B) FIRST in iter 28 sequence**
- Highest-value uncollected signal from iter 27. Run BEFORE Cat A so it gets data even if a later 5xx burst causes another bail.

**P0.5 — Apply A5 Cron warmup migration (iter 38 deliverable)**
- File: `supabase/migrations/20260430220000_unlim_chat_warmup_cron.sql`
- Action: `npx supabase db push --linked`
- Expected: p95 latency −800–1,200 ms (per ADR-029)

**P0.6 — Document anomaly window 16:00–16:06 CEST 2026-05-11**
- Cross-reference Agent X Playwright 92 esperimenti sweep results (concurrent run) for any UNLIM HTTP errors observed in browser console — both agents seeing same backend collapse strengthens evidence vs measurement-side fault.

---

## Bail anomaly disclosure (mandatory transparency)

This run **did not complete the planned 70-query stress**. It aborted at 9/70 after the safety BAIL fired (5 consecutive HTTP 5xx). This is explicitly per the task contract:

> Bail if backend HTTP 5xx > 5 sequenze (escalate, document anomaly)

The bail itself **is the headline evidence**, not a methodology defect. The audit document and JSON/JSONL artifacts are preserved.

**Source code modifications**: ZERO. Only `/tmp/iter27-stress-runner.mjs` (READ-ONLY harness outside repo) and three NEW files under approved paths (state JSON, state JSONL, audit MD). No `src/`, no `supabase/functions/`, no `tests/`, no Edge Function code touched.

**Compliance**:
- ✓ NO mock — only LIVE prod curl
- ✓ 1s/2s stagger applied
- ✓ Bail triggered at exactly 5 consecutive 5xx
- ✓ ZERO inflation (real 3.5/10 ONESTO G45 anti-inflation cap applied)
- ✓ ZERO source modification (READ-ONLY bench)
- ✓ NO `--no-verify` (no commit attempted)
- ✓ NO compiacenza — brutal honest framing per Andrea iter 21+ mandate

---

## Files refs iter 27

- Runner (ephemeral, /tmp): `/tmp/iter27-stress-runner.mjs`
- Aggregate JSON: `/Users/andreamarro/VOLUME 3/automa/state/iter-27-live-50q-pre-deploy-20260511-160032.json`
- Raw JSONL: `/Users/andreamarro/VOLUME 3/automa/state/iter-27-live-50q-pre-deploy-20260511-160032.jsonl`
- Audit (this doc): `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/audits/2026-05-11-iter-27-live-50q-pre-deploy.md`
- Iter 24 reference: `/Users/andreamarro/VOLUME 3/automa/state/iter-24-ralph-dim1-live-50q-20260511-133916.json`
- Edge Function code path (READ ONLY consulted): `supabase/functions/unlim-chat/index.ts:177` (body schema), `supabase/functions/_shared/guards.ts:144-148` (sessionId regex `[a-zA-Z0-9_\-.:]{1,128}`)
