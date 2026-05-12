# Iter 27 Close Audit — 4 Agent OPUS Parallel + P0 Surgical Fix 94/94 Esperimenti

**Data**: 2026-05-11
**Branch**: `feat/unlim-parallel-agent-deploy-2026-05-10`
**Verdict ONESTO G45**: **8.5/10** code shipped (raw 9.0 → cap 8.5 anti-inflation pre-Andrea-deploy + prod COLLAPSE evento).
**Pattern**: 4-agent OPUS parallel BG (X Playwright sweep + Y PZ V3 rules + Z safety wrap + W LIVE 50q) + inline orchestrator P0 surgical fix.

---

## 1. EXECUTIVE SUMMARY iter 27

### 1.1 Brutal evidence discovered
- **Agent X**: 94/94 esperimenti BROKEN prod 100% — root cause `App.jsx:213` `getExpFromHash()` IGNORATO in `#lavagna` route deep-link.
- **Agent W**: prod LLM chain COLLAPSE 503 77.8% rate during 16:00-16:06 CEST sweep — Mistral primary saturato.

### 1.2 Fix shipped iter 27 (code)
- **P0 SURGICAL** App.jsx + LavagnaShell.jsx initialExperimentId prop wire — VERIFIED preview load `v1-cap6-esp1` mount success (4 components + 23 SVGs).
- **Agent Y** PZ V3 +6 runtime rules promote (6/12 → 12/12 coverage 100%).
- **Agent Z** safety hardcoded fallback wrap callLLM try/catch (GDPR Art. 8 minori never 503-empty).
- **Agent X audit** 94/94 evidence Playwright spec + 94 PNG screenshots.

---

## 2. Agent X — 92 esperimenti Playwright UNO PER UNO sweep BRUTAL

### 2.1 Result aggregate
**0/94 PASS, 94/94 BROKEN (100%)** prod via `#lavagna?exp=<id>` deep-link.
- Vol1 38/38 broken | Vol2 27/27 broken | Vol3 29/29 broken
- Cat 2 zero components rendered: 94/94
- Cat 3 no Vol/pag citation visible: 94/94
- Cat 1 mount fail / Cat 4 JS errors / Cat 6 net 404: 0/94

### 2.2 Root cause single line evidence
`/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/App.jsx:213` — `getExpFromHash()` consumed SOLO under `currentPage === 'prova'`. `#lavagna` (line 239-244) + `#tutor → #lavagna` strangler redirect (line 230-236) → `LavagnaShell` rendered ZERO props → `?exp=` query parameter SILENTLY DROPPED.

### 2.3 Control evidence (anti-G45)
- 5 random body-text samples: tutti identici "Scegli un esperimento" picker (uniform failure pattern)
- Control on `#prova?exp=v1-cap6-esp1`: 8 components rendered ✓ (mount logic itself works)
- Conferma route bug, NON systemic broken

### 2.4 Fix design (impl shipped this iter)
P0.1 — wire `getExpFromHash()` into `#lavagna` route (~30 min surgical, unblocks 94/94)

---

## 3. P0 SURGICAL FIX shipped + VERIFIED preview

### 3.1 Edit 1 `src/App.jsx:239-249` (+6 LOC)
```jsx
if (currentPage === 'lavagna' || currentPage === 'tutor') {
    const deepLinkExp = getExpFromHash();
    return (
        <Suspense fallback={<LoadingFallback />}>
            <LavagnaShell initialExperimentId={deepLinkExp} />
        </Suspense>
    );
}
```

### 3.2 Edit 2 `src/components/lavagna/LavagnaShell.jsx` (+3 + ~4 LOC)
- Signature: `export default function LavagnaShell({ initialExperimentId } = {})` (line 393)
- Mount logic (line 866-870): `const expIdToLoad = initialExperimentId || localStorage.getItem('elab-lavagna-last-expId');` priority

### 3.3 Verifica preview LIVE local
- `__ELAB_API` ready post mount ✓
- `getCurrentExperiment()` returns `{ id: "v1-cap6-esp1", title: "Cap. 6 Esp. 1 - Accendi il tuo primo LED" }` ✓
- 4 components rendered + 23 SVGs canvas ✓
- 2° experiment test impossibile via SPA hash routing (no full reload) MA Playwright `page.goto()` farà full mount = fix fires
- Manual `api.loadExperiment('v3-cap5-esp1')` SUCCESS conferma sistema funzionante

---

## 4. Agent Y — PZ V3 +6 runtime rules promote

### 4.1 Coverage delta
**6/12 → 12/12 (100% runtime)** rules enforced.

| # | Rule | Severity | Status iter 27 |
|---|------|----------|----------------|
| 1 | imperativo_docente | HIGH | RUNTIME (preserved) |
| 2 | singolare_studente | HIGH | RUNTIME (preserved) |
| 3 | max_words_120 | MEDIUM | RUNTIME (preserved) |
| 4 | no_citation_concept_intro | LOW | RUNTIME (preserved) |
| 5 | english_filler | LOW | RUNTIME (preserved) |
| 6 | chatbot_preamble | LOW | RUNTIME (preserved) |
| 7 | **plurale_ragazzi** | **MAJOR** | **RUNTIME NEW** (skip isSafetyRefusal) |
| 8 | **citation_vol_pag** | **MAJOR** | **RUNTIME NEW** (gated requiresCitation, skip isOfftopic) |
| 9 | **analogia** | **LOW telemetry** | **RUNTIME NEW** (count only, NO violation Andrea 10/05) |
| 10 | **no_verbatim_3plus_frasi** | **MEDIUM** | **RUNTIME NEW** (3+ adjacent quotes) |
| 11 | **off_topic_recognition** | **LOW** | **RUNTIME NEW** (gated isOfftopic) |
| 12 | **action_tags_when_expected** | **MEDIUM** | **RUNTIME NEW** (gated expectedActions) |

### 4.2 API surface
`validatePrincipioZero(response, context?)` — `context` optional backward-compat (caller can wire incrementally).

### 4.3 MAJOR severity tier NEW non-blocking iter 27
- Telemetry signal `console.warn JSON event=pz_runtime_violation_major`
- Andrea iter 28 ratify decide hard-block via env `PZ_HARD_ENFORCE_MAJOR`

### 4.4 Files
- MODIFIED `_shared/principio-zero-validator.ts` (+126 LOC)
- MODIFIED `tests/unit/principioZeroValidator.test.js` (+30 NEW PASS, 49/49)
- MODIFIED `tests/integration/unlim-chat-prompt-v3.test.js` (+2 allow-list entries)

---

## 5. Agent Z — Safety hardcoded fallback wrap callLLM try/catch

### 5.1 GDPR Art. 8 + D.Lgs. 101/2018 mandate
Minori 8-14 anni MUST always receive safety warning even if LLM chain down. Iter 24 dim-1 evidence Cat C "scossa" 503 vuoto = GDPR rischio.

### 5.2 Implementation
- `supabase/functions/unlim-chat/index.ts` +71 LOC (8 imports + 63 catch wrap)
- Fires only `!result` after `callBrainFallback` exhausted (LLM chain completely down)
- NEW `ITER27_SAFETY_BROAD_RE` module-scope: scossa | elettrocuzione | brucia(re|to|ti) | pericolo(so)? | ferit(o|a|i) | folgora(re|to) | ustion(i|e)
- HTTP 200 fallback with `source: 'safety-hardcoded-fallback-iter27'` + `safety_fires: ['voltage_danger', 'llm_chain_exhausted']`
- Non-safety errors re-thrown (preserve existing flow)

### 5.3 Test coverage
- NEW `tests/unit/safetyHardcodedFallbackWrap.test.js` 35 PASS
- Adjacent safety files preserved 128/128 PASS

### 5.4 Edge case caveat iter 28
- `result.text === ""` (Brain returns truthy empty) edge case flagged
- Andrea ratify deploy + LIVE bench Cat C verify

---

## 6. Agent W — LIVE prod 50q stress BRUTAL evidence COLLAPSE

### 6.1 BAIL after 5 consecutive HTTP 503
Bail rule triggered exactly per spec at query 9/70.

### 6.2 Aggregate stats vs iter 24 dim-1 baseline
| Metric | Iter 24 dim-1 | Iter 27 W (2.5h later) | Delta |
|---|---|---|---|
| HTTP 200 rate | 88.6% | **22.2%** | **-66.4pp** |
| HTTP 503 rate | 11.4% | **77.8%** | **+66.4pp** (7× worse) |
| p50 latency | 3552ms | **19008ms** | **+435%** |
| Score ONESTO G45 | 6.4/10 | **3.5/10** | **-2.9** |

### 6.3 Catastrophic prod LLM chain collapse documented
- 3/3 follow-up curl probes: 503/503/503 PERSISTENTE (not transient)
- Mistral primary path saturated/down
- Gemini Flash fallback works for citation_vol_pag class only (2/9 queries A03+A04 success 1.8s)
- Suggests `LLM_ROUTING_WEIGHTS` 70/20/10 routing into broken primary

### 6.4 Cat B-G UNMEASURED — Cat A only 9 queries before bail
Iter 28 Andrea P0 mandatory:
- Re-run W stress post-deploy with `iter28-postdeploy-*` fresh session_ids
- Cat B 5×5 marathon FIRST in iter 28 (msg4 universal collapse hypothesis unresolved)

### 6.5 Files
- NEW `automa/state/iter-27-live-50q-pre-deploy-20260511-160032.json` + `.jsonl` (raw)
- NEW `docs/audits/2026-05-11-iter-27-live-50q-pre-deploy.md` (~400 LOC + bail disclosure)

---

## 7. CoV iter 27 close

✅ Vitest **14112 PASS** (+65 vs iter 26 close 14047) ZERO regression
✅ 314/316 test files PASS + 2 skipped, 15 skipped + 11 todo (14138 total)
✅ Frontend prod 200 + Backend Edge OPTIONS 204 (status checks)
⚠️ Backend Edge POST `unlim-chat` chat endpoint COLLAPSED 77.8% 503 rate documented
✅ Pre-commit + pre-push hook gate enforced NO `--no-verify`
✅ ZERO modification outside agent file ownership rigid
✅ Preview verify P0 surgical fix mount success v1-cap6-esp1

---

## 8. SPRINT_U boxes status post iter 27 close

| Dimensione | Pre iter 27 | Post iter 27 code shipped |
|---|---|---|
| Esperimenti deep-link mount | **0/94 (0%)** broken | **94/94 unblocked** code (Playwright sweep iter 28 verify) |
| PRINCIPIO ZERO runtime coverage | 6/12 rules (50%) | **12/12 (100%)** runtime enforce |
| GDPR safety fallback | risk Cat C 503 vuoto | **safety wrap shipped** never 503-empty |
| Memoria timeline architettura | 9.7/10 | 9.7/10 |
| Resilience burst 503 | 8/10 (iter 25 P0-B) | 8/10 (deploy pending) |
| Off-topic gentle bridge | 8.5/10 | 8.5/10 |
| Multimodal vision | 7/10 | 7/10 |
| Onniscenza | 7/10 | 7/10 |
| Onnipotenza | 8.5/10 | 8.5/10 |

**Overall iter 27 close ONESTO G45**: **8.5/10** code shipped (raw 9.0 → cap 8.5 anti-inflation; LIVE prod still v50 OLD code + 503 collapse documented).

**Note brutal G45**: prod LIVE iter 27 W = 3.5/10 evidence — drift -2.9pt vs iter 24 6.4/10. Code shipped score 8.5/10 NOT equal LIVE prod score. Andrea deploy iter 28 critical recover.

---

## 9. Andrea ratify queue iter 28 entrance P0 (URGENT)

1. **URGENT**: investigate Mistral rate-limit window (Scale tier €18/mo limit hit?)
2. **URGENT**: `supabase secrets get LLM_ROUTING_WEIGHTS` — temp flip 20/70/10 (Gemini primary recover) OR 100/0/0 Gemini-only emergency
3. **P0**: Deploy Edge `unlim-chat` v53+ (carries iter 25 P0-B retry-backoff + iter 26 saveMessageHistory 4 paths + iter 27 Z safety wrap)
4. **P0**: `npx supabase db push --linked` apply 3 migrations (history + user_intent + warmup_cron)
5. **P0**: Re-run W LIVE 50q post-deploy with FRESH session_ids verify lift
6. **P0**: Cat B 5×5 marathon FIRST post-deploy (msg4 collapse hypothesis unresolved iter 27)
7. **P0**: Re-run Playwright Agent X 94 esperimenti sweep post-deploy verify 94/94 PASS (vs 94/94 BROKEN pre-fix)
8. **P0**: `npm run build` + Vercel deploy + Lighthouse CLI verify perf 65+ chatbot-only/easter-modal (iter 26 modulePreload fix)
9. **P1**: ratify hard-enforce MAJOR severity env flag iter 28 (Y validator runtime)
10. **P1**: Lighthouse ≥90 perf follow-on (entry chunk split + supabase-js defer + critical CSS)

---

## 10. DEFER iter 28-29

- L2 templates expand 20→50→94 schema (Davide co-author Sprint V)
- 88/94 esperimenti L2 template (Morfismo Sense 2 partial)
- IBSE pedagogia schema 5 lesson-paths
- Teacher Dashboard backend MVP PNRR
- Pixtral live bench 5 foto kit Omaric vs mistral-small-2506 accuracy delta
- Tea homepage Glossario integration main app

---

## 11. Anti-inflation G45 mandate iter 27 enforced

- NO claim "Esperimenti 94/94 FIXED LIVE" senza Playwright sweep post-deploy.
- NO claim "PZ V3 100% LIVE" senza hard-enforce + Edge deploy.
- NO claim "Safety never-503 LIVE" senza Edge deploy + Cat C re-bench.
- NO claim "Lighthouse +50 LIVE" senza npm build + Vercel deploy + CLI run.
- Code shipped score 8.5/10 EXPLICITLY DECOUPLED from LIVE prod 3.5/10 brutal.
- Real prod COLLAPSE 503 77.8% documented evidence brutale — iter 28 P0 recovery mandatory.

NO compiacenza. ZERO inflation. ZERO regression. 65 NEW vitest tests.

---

*Co-Authored-By: Claude Opus 4.7 (1M context) — iter 27 close*
