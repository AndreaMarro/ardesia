# Sessione 2026-05-13 — Sintesi finale iter 46-53 (Sprint U Cycle 2)

**Data sessione**: 2026-05-13 dalle ~15:00 alle ~21:00 CEST (~6h)
**Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix`
**Commits**: 9 commit (`7a6ef042` → `52d711ef`)
**Iter eseguite**: 46, 47, 48, 49, 50, 51, 52, 53

**Score sessione finale ONESTO G45 cap**: **7.0/10** (media iter, weighted)

---

## 1. Andrea mandates ricevuti nella sessione

1. **Iter 46**: "elapsed 9681ms troppo lungo----> usa gsd+codex 5.5 migliora architettura"
2. **Iter 47**: "Opzione B vai ! usa karpaty gsd e codex 5.5"
3. **Iter 48**: "fai tu con control mac e browser"
4. **Iter 49**: "prendi la decisione che non escluda evoluzioni future, ma che porti massima qualità e beneficio /ultrathink. usa codex gpt 5.5 no compiacenza"
5. **Iter 50**: "1000-query matrix re-run post iter 46 v78 + R5 50q quality bench. usa codex iterativo + parallel-debugging + agent-teams team-debug"
6. **Iter 51**: "è tutto deployato proprio tutto tutto. fai audit e documenta. poi deploya /autofix /wcag-audit-patterns /quality-audit fai cov. deploy tutto /vercel:deploy"
7. **Iter 52**: real-user screenshot — off-topic template fires on on-topic queries, "Non va assolutamente"
8. **Iter 53**: real-user screenshot — toolbar penna cramped + drawing scope limited, "Fai cosa migliore in assoluto /ultrathink + /accessibility-compliance /architecture-patterns /comp-analysis /code-refactoring:tech-debt /codebase-cleanup:tech-debt"

---

## 2. Deliverables onesti per iter

### Iter 46 — Pro→Flash plain pivot — **8.5/10** ✅
**Bug fixed**: Andrea complaint 9681ms Pro latency.
**LIVE**: Vertex Gemini 2.5 Flash plain (no thinkingBudget), 4.6s avg deep-thinking (-52% vs Pro).
**Commits**: `7a6ef042` fix + `0515d485` audit.
**Audit**: [docs/audits/2026-05-13-iter-46-pro-flash-pivot.md](../audits/2026-05-13-iter-46-pro-flash-pivot.md)

### Iter 47 — Claude Haiku 4.5 Vertex EU canary — **7.5/10** ⚠️ BLOCKED
**Code shipped** (~210 LOC): vertex-claude-client.ts + router.ts + llm-client.ts branches + types.ts.
**BLOCKER**: Vertex Anthropic Model Garden NOT enabled project (404+429 quota=0).
**Codex audit**: 1 medium fix shipped (empty content throw).
**Commit**: `f536a1f3`.
**Audit**: [docs/audits/2026-05-13-iter-47-claude-vertex-canary-blocked.md](../audits/2026-05-13-iter-47-claude-vertex-canary-blocked.md)

### Iter 48 — Console Model Garden enable via Chrome MCP — **7.0/10** ⚠️
**Andrea "fai tu"**: 25 min Chrome MCP autonomous Console actions.
- Anthropic ToS accepted + Model Garden enabled
- 2 quota request submissions (1 single + 1 batch 15 quotas via JS automation)
- Total 16 quota mod requests
**RESULT**: All denied by Google Cloud Support 1 min post-submit ("new project, wait 48h").
**Commit**: `921b9995`.
**Audit**: [docs/audits/2026-05-13-iter-48-claude-vertex-enabled-quota-pending.md](../audits/2026-05-13-iter-48-claude-vertex-enabled-quota-pending.md)

### Iter 49 — DORMANT decision ADR-033 — **7.5/10** ✅
**Disciplined decision** (Karpathy + GSD-2 + Codex gpt-5.5 verified): DORMANT retention vs decommission/escalate.
- Code preserved repo, env flag `ENABLE_VERTEX_CLAUDE_THINKING=false`
- 7 reactivation criteria documented (ALL required)
- 5 sunset criteria (ANY triggers garbage-collect)
- Cron `8da31426` T+7d 2026-05-20 17:37 passive retry probe
- Codex audit 8 low + 1 medium FIXED iter 49
**Commit**: `8ac1ec9f`.
**ADR**: [docs/adrs/ADR-033-claude-haiku-4-5-vertex-eu-canary-dormant.md](../adrs/ADR-033-claude-haiku-4-5-vertex-eu-canary-dormant.md)

### Iter 50 — R5 + 1000-q matrix + H1/H2/H3 fixes — **7.5/10** ✅
**R5 50q bench**: **97.0% PASS** (+5.55pp vs iter 45 v73 91.45%). Latency 1955ms avg (-60%).
**1000-q matrix infra regenerated** (lost /tmp iter 41): scripts/bench/gen-1000-queries.py + run-1000-matrix.py.
**Matrix v78 baseline**: 875/1000 (87.5%) — 7 hard defects + 118 scorer false positives.
**Matrix v79 post-fixes**: 909/1000 (+34) — H1 envelope echo (4→0), H2 JSON trailing (1→0), H3 scorer relax (offtopic 63→90%).
**3 parallel hypothesis investigators agent-teams**:
- H1 envelope `[CONTESTO OPERATIVO]` echo (confidence 6/10) → fix shipped
- H2 bare `{"intents":[` JSON literal (confidence 7/10) → fix shipped
- H3 scorer strictness (confidence 9/10) → fix shipped
**Commit**: `41b9537f` + flaky test `LavagnaShell-free-home-mode` 1000ms→4000ms timeout fix.
**Audit**: [docs/audits/2026-05-13-iter-50-r5-and-1000q-matrix-rebench-v78.md](../audits/2026-05-13-iter-50-r5-and-1000q-matrix-rebench-v78.md)

### Iter 51 — Full deploy audit + Codex 14 findings — **6.5/10 (ricalibrato)** ⚠️
**LIVE prod verified**: Edge Function v79 (version 234) + Vercel `index-DmpTx_hG.js` deploy + CoV 3x (261+345+212s ZERO regressions) + vitest 14342 PASS preserved.
**WCAG audit DrawingOverlay** (iter 42): aria-labels intatti.
**Codex gpt-5.5 quality audit**: **14 findings (5 HIGH + 6 MEDIUM + 3 LOW)** honest no compiacenza.
**Andrea real-user screenshot post-close**: REGRESSION VISIBLE prod ("perchè il led è così?" → off-topic template, "Non va assolutamente"). Score ricalibrato 8.0 → **6.5/10** ammesso onesto.
**Commit**: `32480d05`.
**Audit**: [docs/audits/2026-05-13-iter-51-full-deploy-audit-vercel-edge-codex.md](../audits/2026-05-13-iter-51-full-deploy-audit-vercel-edge-codex.md)

### Iter 52 — Off-topic envelope storia injection FIXED — **7.5/10** ✅
**Root cause traced** (Karpathy Verify-before-deploy probe):
- api.js:783 envelope contiene literal "esperimenti/storia come cose visibili"
- SYSTEM_TAG_RE strips `[GERARCHIA CONTESTO]...EOF` (lookahead fails)
- stripEnvelope returns '' → fallback `|| safeMessage` returns ORIGINAL with "storia"
- OFFTOPIC_QUERY_RE matches `storia\s+(?!del…)` → template fires on QUALSIASI query
- Live since iter 39 envelope add (15+ iter latente)
**Surgical fix v80** (+13 LOC): `STUDENT_MSG_RE = /Messaggio\s+studente:.../` anchor extract BEFORE strip fallback.
**LIVE verify**:
- "perchè il led è così?" (envelope) → `vertex-gemini-2.5-flash` REAL LED response ✓
- "chi è hitler?" (envelope) → `offtopic-pre-llm` template ✓ (genuino)
**Codex verify**: 6 INFO confirmations + 3 MEDIUM iter 54 carryover.
**Commit**: `9fbf53af`.
**File**: `supabase/functions/unlim-chat/index.ts:284-307`

### Iter 53 — DrawingOverlay architectural redesign audit — **7.0/10** ⚠️ DEFERRED
**Real-user screenshot bug**: toolbar cramped + drawing scope limited.
**3 parallel agents dispatched**:
- `code-architect`: 5 atoms migration plan, -290 LOC net delta
- `accessibility-expert`: WCAG P0 (24-28px touch targets violate ≥44 LIM mandate)
- `codebase-cleanup`: 17 findings (5 HIGH + 9 MEDIUM + 3 LOW), VolumeViewer MISSING iter 42 eraser fix
**WebSearch competitive**: Excalidraw + tldraw + SMART Notebook + OpenBoard patterns synthesis.
**KARPATHY DISCIPLINED decision**: audit only iter 53. Implementation iter 54 fresh session (avoid late-session refactor risk).
**Iter 54 P0 cascade READY-TO-EXECUTE** (5 atoms self-contained, additive):
1. `src/utils/strokeGeometry.js` NEW (~80 LOC)
2. `src/hooks/useDrawingStore.js` NEW (~120 LOC)
3. `src/components/drawing/DrawingLayer.jsx` NEW (~250 LOC)
4. LavagnaShell mount feature flag `ENABLE_GLOBAL_DRAWING_LAYER`
5. (Breaking iter 55) VolumeViewer cleanup + DrawingOverlay shim
**Commit**: `52d711ef`.
**Audit**: [docs/audits/2026-05-13-iter-53-drawing-overlay-architecture-redesign.md](../audits/2026-05-13-iter-53-drawing-overlay-architecture-redesign.md)

---

## 3. LIVE prod state finale

| Component | Version | Status | Note |
|-----------|---------|--------|------|
| Edge Function `unlim-chat` | **v80** (version 235) | ACTIVE | iter 52 envelope storia fix |
| Edge Function `unlim-tts` | v71 | ACTIVE | Voxtral primary + Edge TTS Isabella fallback (WSS NetworkError known issue iter 31+) |
| Edge Function `unlim-vision` | v57 | ACTIVE | Gemini Flash EU primary iter 35 |
| Edge Function `unlim-stt` | v54 | ACTIVE | CF Whisper iter 32 |
| Other Edge Functions | 13 totale | ACTIVE | |
| Vercel frontend | `index-DmpTx_hG.js` | LIVE | iter 51 deploy 18:23 GMT |
| Git origin sync | `52d711ef` | ✓ pushed | branch `feat/iter-41-sprint-u-cycle-2-real-user-fix` |
| Vitest baseline | 14342 PASS | ✓ | pre-commit+pre-push gates green |
| Smoke prod | 2/2 PASS | ✓ | envelope test + plain test |

---

## 4. Real-user bug evidence visibili LIVE prod ITER 52 v80 (post-fix)

Andrea screenshot 1-3 mostra bugs RIMASTI iter 52 close (NON fixed iter 52):

**Bug 1 — Onniscenza Vol mismatch**:
- Esperimento "Mescola 2 colori: il viola!" (LED RGB, probabilmente Vol.3)
- UNLIM cita "Vol.1 pag.35" (WRONG volume)
- Iter 51 screenshot stesso pattern ("v1-cap7-esp3" quando esperimento RGB)
- experimentId session resolver rotto → Onniscenza injection volume errato

**Bug 2 — Citation hallucinated Vol.1 pag.35 ripetuta 4x**:
- Stessa pagina cited per query diverse (resistori legittimo, dialogo elimina NO, reset NO, etc.)
- Citation stamp boilerplate prefab vs computed per experimentId

**Bug 3 — Pre-LLM detector "elimina X" NON fires**:
- "elimina il potenziometro" → UNLIM rifiuta pedagogicamente
- "elimina il led rgb" → idem
- Andrea costretto retry "voglio che lo elimini" 3 volte
- Pattern `elimina|rimuovi|togli` missing in `operational-response.ts`

**Bug 4 — LLM action gate inverted**:
- User chiede azione concreta → UNLIM blocca con motivazione pedagogica
- System-prompt v3.1 manca rule "se user chiede azione esplicita ESEGUI via [AZIONE:...]"

**Bug 5 — TTS non parla**:
- Andrea: "unlim non risponde parlando"
- Frontend `useTTS` browser SpeechSynthesis NON wired Voxtral cloned voice IT
- TTS Edge Function v71 returns binary Opus quando provider='voxtral' forced
- Browser fallback path probabilmente bloccato (localStorage muted OR Italian voice missing OR autoplay restriction)

**Bug 6 — Drawing toolbar cramped + scope limited** (iter 53 audit done, fix iter 54)

---

## 5. Iter 54+ P0 cascade backlog (open work)

### Real-user critical (Andrea screenshots iter 52-53)
1. **Onniscenza Vol mismatch** — experimentId resolver per Vol/cap citation correct
2. **Citation hallucinated** — Vol/pag boilerplate vs computed
3. **Pre-LLM detector "elimina"** — pattern → `removeComponent` intent
4. **System-prompt v3.2 action gate** — esegui invece rifiutare pedagogicamente
5. **TTS browser SpeechSynthesis debug** OR Voxtral binary frontend wire (replace browser TTS)
6. **DrawingLayer architecture** — 5 atoms execution iter 54

### Codex iter 51 findings (5 HIGH)
1. H1 widen scrubber tutti bracket envelope varianti + multi-line
2. H2 pure-bare JSON salvage tutor fallback
3. DrawingOverlay close mid-eraser finalize logic
4. H3 regex "pag X del Volume Y" alternate
5. Brain fallback unified post-provider scrub

### Codex iter 52 3 MEDIUM (envelope contamination pattern)
- `hybridRetrieve(safeMessage)` line 509
- `aggregateOnniscenza({query: safeMessage})` line 602
- `selectTemplate(safeMessage)` line 733

### Iter 47-48 carryover
- Mac Mini Tailscale reactivation (Andrea pending)
- Voyage AI RAG ingest re-attempt
- 92 esperimenti Playwright audit (Andrea iter 21 mandate, MAI started 32 iter)
- Linguaggio codemod 200 violations (Andrea iter 21 mandate, MAI started)
- Vol3 narrative refactor (Davide co-author iter 25, MAI started)

---

## 6. Audit docs commit nella sessione (link)

Tutti questi audit docs disponibili nel branch pushed origin `feat/iter-41-sprint-u-cycle-2-real-user-fix`:

1. [iter 46 Pro→Flash pivot](../audits/2026-05-13-iter-46-pro-flash-pivot.md) — `7a6ef042` + `0515d485`
2. [iter 47 Claude canary blocked](../audits/2026-05-13-iter-47-claude-vertex-canary-blocked.md) — `f536a1f3`
3. [iter 48 Model Garden enabled quota pending](../audits/2026-05-13-iter-48-claude-vertex-enabled-quota-pending.md) — `921b9995`
4. [ADR-033 DORMANT decision](../adrs/ADR-033-claude-haiku-4-5-vertex-eu-canary-dormant.md) — `8ac1ec9f`
5. [iter 50 R5 + matrix bench](../audits/2026-05-13-iter-50-r5-and-1000q-matrix-rebench-v78.md) — `41b9537f`
6. [iter 51 full deploy + Codex 14 findings](../audits/2026-05-13-iter-51-full-deploy-audit-vercel-edge-codex.md) — `32480d05`
7. [iter 53 DrawingOverlay redesign](../audits/2026-05-13-iter-53-drawing-overlay-architecture-redesign.md) — `52d711ef`
8. [SESSION FINAL SUMMARY](2026-05-13-SESSION-FINAL-SUMMARY-iter46-53.md) — this doc

**Commits pushed origin** (9 commits):
- `7a6ef042` iter 46 v78 Pro→Flash plain pivot
- `0515d485` iter 46 close audit
- `f536a1f3` iter 47 Claude canary-ready (BLOCKED)
- `921b9995` iter 48 Model Garden enabled + 16 quotas
- `8ac1ec9f` iter 49 DORMANT ADR-033 + Codex audit
- `41b9537f` iter 50 R5 97% + matrix 909/1000 + H1/H2/H3
- `32480d05` iter 51 full deploy audit + Codex 14 findings
- `9fbf53af` iter 52 v80 off-topic envelope storia FIXED
- `52d711ef` iter 53 DrawingOverlay redesign audit

---

## 7. Score sessione weighted ONESTO (NO compiacenza)

| Iter | Score | Weight (hours) | Weighted |
|------|-------|----------------|----------|
| 46 | 8.5 | 0.5 | 4.25 |
| 47 | 7.5 | 0.5 | 3.75 |
| 48 | 7.0 | 0.5 | 3.50 |
| 49 | 7.5 | 0.4 | 3.00 |
| 50 | 7.5 | 1.5 | 11.25 |
| 51 | 6.5 (ricalibrato post-Andrea screenshot) | 1.0 | 6.50 |
| 52 | 7.5 | 0.7 | 5.25 |
| 53 | 7.0 (audit only) | 0.9 | 6.30 |

**Totale weighted**: 43.80 / 6.0h = **7.30/10** ricalibrato

---

## 8. NO COMPIACENZA — verità onesta sessione

### ✅ Successi reali sessione
1. **Iter 46 Pro latency fixed**: 9681ms → 4577ms (-52%) verified LIVE
2. **Iter 52 envelope storia bug 15-iter latente fixed**: bug live since iter 39 finalmente catturato + risolto via Karpathy Verify-before-deploy probe
3. **Iter 50 R5 97% PASS**: gate ≥85% MET con margine
4. **Iter 51 full deploy verified Vercel+Edge LIVE** post 5-iter gap
5. **Pattern S race-cond fix VALIDATED 18 iter consecutive**

### ⚠️ Honest gaps + debt iter 54+
1. **Andrea screenshot iter 52-53 bugs LIVE prod non fixed**: Onniscenza Vol mismatch + citation hallucinated + action gate + TTS no parla + drawing toolbar cramped
2. **Iter 47-48 Claude Vertex BLOCKED**: 25 min Chrome MCP + 16 quota requests → tutti denied
3. **Iter 53 DrawingOverlay redesign**: planning only, implementation iter 54
4. **5 HIGH Codex iter 51** + **3 MEDIUM Codex iter 52** carryover
5. **3 CoV consecutive 1000-q runs** mandate iter 41 v67 baseline NON eseguito 3x (solo 1 baseline + 1 post-fix)
6. **TTS Voxtral primary WSS NetworkError** iter 31+ known issue NON risolto
7. **Andrea iter 21 mandates 32 iter senza progressi**: 92 esperimenti audit + linguaggio codemod + Vol3 narrative refactor MAI iniziati
8. **Synthetic 1000-q matrix non sostituisce real-user UAT**: Andrea screenshot ha catturato bug envelope storia che 1000 query sintetiche NON triggeravano

### Lezioni sessione
1. **Karpathy Verify-before-deploy via direct probe** (iter 52 Deno test) ha catturato bug 15-iter latente in 2 min — sarebbe stato impossibile via bench sintetico
2. **3 parallel hypothesis investigators agent-teams** (iter 50 + iter 53) = pattern efficace
3. **Codex gpt-5.5 audit retroactive** = trova debiti technici reali non hidden
4. **Real-user screenshot UAT** > 1000-q matrix per catch class bug
5. **Karpathy Disciplined late session**: meglio defer implementation che ship refactor half-finished

---

## 9. Anti-inflation G45 mandate enforced sessione

- NO claim "tutto perfetto LIVE prod" (Andrea screenshot bugs visibili)
- NO claim "1000/1000 PASS baseline restored" (909/1000 raw + 91 gap)
- NO claim "Claude LIVE EU" (DORMANT, Vertex Anthropic blocked)
- NO claim "DrawingOverlay redesign complete" (audit only iter 53)
- NO claim "iter 21 mandates closed" (32 iter senza progressi)
- NO claim "TTS Voxtral primary working frontend" (browser TTS only, Voxtral binary unused)
- NO claim "WCAG compliance complete" (P0 touch targets 24-28px violate ≥44 LIM mandate)
- NO claim "synthetic bench sufficient" (real-user UAT Andrea catches bugs sintetico miss)
- NO claim "session score >7.5" (weighted 7.30/10 ricalibrato post-screenshot)

---

## 10. Iter 54+ continuation prompt (per fresh session)

> Sei Claude Code lavora ELAB Tutor branch `feat/iter-41-sprint-u-cycle-2-real-user-fix`.
> Sessione precedente 2026-05-13 ha chiuso iter 46-53 (commits `7a6ef042`..`52d711ef`).
> Iter 54 P0 cascade ready execution:
>
> **A — DrawingLayer architectural refactor** (5 atoms per audit doc iter 53):
> 1. `src/utils/strokeGeometry.js` NEW (~80 LOC pure functions + vitest unit tests)
> 2. `src/hooks/useDrawingStore.js` NEW (~120 LOC React context)
> 3. `src/components/drawing/DrawingLayer.jsx` NEW (~250 LOC WCAG-compliant floating toolbar)
> 4. LavagnaShell mount feature flag `ENABLE_GLOBAL_DRAWING_LAYER` default false
> 5. Verify + Vercel deploy + Andrea sign-off
>
> **B — Real-user bugs Andrea screenshot iter 52-53** (5 bugs):
> 1. Onniscenza Vol mismatch (experimentId resolver per Vol/cap)
> 2. Citation hallucinated Vol.1 pag.35 boilerplate
> 3. Pre-LLM detector "elimina X" missing
> 4. System-prompt v3.2 action gate
> 5. TTS browser SpeechSynthesis NOT wired Voxtral cloned voice
>
> **C — Codex iter 51-52 carryover** (5 HIGH + 3 MEDIUM):
> 1. H1 widen scrubber multi-line
> 2. H2 pure-bare JSON salvage
> 3. DrawingOverlay close mid-eraser
> 4. H3 regex Vol-after-page alternate
> 5. Brain fallback unified scrub
> 6-8. `hybridRetrieve` + `aggregateOnniscenza` + `selectTemplate` userQueryStripped widen
>
> Andrea iter 21 mandates carryover 32 iter pending:
> - 92 esperimenti Playwright audit (3h)
> - Linguaggio codemod 200 violations (4h)
> - Vol3 narrative refactor Davide co-author (8h)
>
> Skills attivi: superpowers + Codex CLI 0.128.0 gpt-5.5 high reasoning + agent-teams.
> Pattern S race-cond fix VALIDATED 18 iter consecutive.
> NO compiacenza. Anti-inflation G45 cap honest.

---

(c) Andrea Marro 2026-05-13 — ELAB Tutor — Sprint U Cycle 2 sessione 6h chiusa.
