# Ralph Loop dim-4 Sprint U cycle 1 — L2 Routing BLOCKER Fix Design

**Date**: 2026-05-11
**Iter**: 24 (design only, read-only)
**Author**: Claude Opus 4.7 1M
**Status**: DESIGN — no source modifications iter 24, execute iter 25+

---

## TL;DR

The Sprint U cycle 1 iter 1 audit (`docs/audits/sprint-u-cycle1-iter1-CONSOLIDATED-audit.md` §1 + `unlim-matrix.md` ISSUE 1) reported a BLOCKER: 20/20 live UNLIM queries returned the same `L2-explain-led-blink` template body, breaking Morfismo Sense 2 for 93/94 experiments.

**Critical update file-system verified 2026-05-11**: the router `clawbot-template-router.ts` has been **substantially refactored 2026-05-10** ("Sprint U Cycle 2 Fix #1" comment line 20, mtime `May 10 21:26`) with a per-experiment fast-path AND a strict `threshold = 999` default that makes the bag-of-words scorer effectively null-falling. The audit BLOCKER as described — "ALL 20 → LED blink" — is mechanically NO LONGER reproducible against the current code. The remaining gap is COVERAGE: only 9 distinct experimentIds are bound to L2 templates (out of 94), so 85/94 experiments now correctly fall through to LLM+RAG (good — was the goal), but 0 of those 85 get a dedicated morphic template (still a gap, lower severity).

Three-step fix design:
1. **Step 1 (immediate, 0 LOC source change)** — verify current router state matches design, write live curl evidence post-deploy that the audit bug is closed. The hotfix the audit demanded is already shipped.
2. **Step 2 (medium ~3-4h, ~30 LOC)** — add `template_match_kind` telemetry + per-volume default L2 templates (3 templates = 1 per volume) so any of the 94 experiments gets a volume-flavored response even when no per-experiment template exists.
3. **Step 3 (Sprint U cycle 3+, ~2 weeks)** — expand 20→50→94 templates with Davide co-author (kit fisico content authoritative source).

---

## 1. Root Cause Analysis: `selectTemplate()`

### 1.1 Signature
```typescript
// clawbot-template-router.ts:215
export function selectTemplate(
  query: string,
  context: SelectContext = {}
): ClawBotTemplate | null
```
`SelectContext` (lines 137-145):
- `category_hint?: ClawBotCategory`
- `experimentId?: string | null`
- `threshold?: number` — defaults to `999` (line 226)

### 1.2 Current logic flow (post-Sprint U Cycle 2 Fix #1, iter 26 refactor)

`clawbot-template-router.ts:215-288` runs three gated stages:

1. **Per-experiment fast-path** (lines 234-260):
   - If `context.experimentId` is provided AND it appears in `EXPERIMENT_TEMPLATE_MAP` (built at module load from each template's `inputs.experimentId`):
     - Detect verb-hint intents from query tokens (`detectIntentCategories` line 101-112, e.g. "spieg" → `lesson-explain`).
     - If a candidate template's category matches a detected intent → return that template.
     - Else, if `category_hint` present → match by hint.
     - Else → fall through (NOT blind-pick).

2. **Bag-of-words scorer** (lines 263-276):
   - `scored = TEMPLATES_L2.map(t => scoreTemplate(t, tokens, context))` sorted desc.
   - Returns top template **only if `best.score >= threshold`**.
   - **`threshold` defaults to 999** (line 226) — score for any single query rarely exceeds 5 — so this effectively returns `null` for any caller that does not explicitly pass `context.threshold: 2`.

3. **Lesson-explain experimentId guard** (lines 282-285):
   - If top template's category is `lesson-explain` AND `tplExpId !== context.experimentId` → returns `null`. Belt-and-suspenders for the audit failure mode.

### 1.3 Caller wire-up

`supabase/functions/unlim-chat/index.ts:24` imports + `:608-614` invokes:
```typescript
const tpl = selectTemplate(safeMessage, {
  experimentId: safeExperimentId ?? undefined,
});
// NOTE: NO threshold passed → uses default 999 → bag-of-words gated off
```
This means the **bag-of-words scorer is effectively disabled in production**. Only the per-experiment fast-path can match.

### 1.4 Template inventory: 10 distinct experimentIds bound

`grep -oE "experimentId: '[^']+'" clawbot-templates.ts` (excluding empty):
| ExperimentId | Templates bound | Categories |
|---|---|---|
| `v1-cap3-esp1` | 1 (introduceResistor) | lesson-introduce |
| `v1-cap4-esp1` | 1 (introduceBreadboard) | lesson-introduce |
| `v1-cap6-esp1` | 3 (explainLedBlink + diagnoseLedRovesciato + recapFineLezione) | lesson-explain / diagnose-vision / lesson-recap |
| `v1-cap6-esp2` | 1 (diagnoseLedFioco) | lesson-diagnose |
| `v1-cap7-esp1` | 1 (guideScratchBlocklyFirst) | lesson-program-first |
| `v1-end` | 1 (celebrateEndVolume) | lesson-celebrate |
| `v2-cap7-esp1` | 1 (introduceArduinoBoard) | lesson-introduce |
| `v2-cap8-esp1` | 1 (explainPwmFade) | lesson-explain |
| `v2-cap9-esp3` | 1 (explainResistenzaPullUp) | lesson-explain |
| `v2-cap10-esp1` | 2 (explainCondensatoreTempo + guideSerialMonitor) | lesson-explain / lesson-guide |

**Coverage**: 9 real experiments + 1 sentinel (`v1-end`). 9/94 ≈ **9.6% experiment coverage**. The other 8 templates have empty `experimentId: ''` (generic critique/diagnose/error-recovery patterns that match by `category_hint` or fall through).

### 1.5 Five hypotheses ranked by confidence

| H | Hypothesis | Confidence | Evidence |
|---|---|---|---|
| H3 | Templates only 20/94 mapped → fallback default `L2-explain-led-blink` for 74/94 | **was 90%**, NOW STALE | The audit (2026-05-01) reproduced this. The 2026-05-10 refactor inverted the default from "first lesson-explain template" to `null` via threshold=999. So this hypothesis was correct AS OF AUDIT but is mechanically closed in current code. |
| H1 | Regex/bag-of-words too generic | 75% (audit era) → 5% (now) | Bag-of-words gated off (`threshold=999` default). Lines 282-285 add explicit guard. |
| H2 | experimentId normalization (kebab vs snake) | 5% | `EXPERIMENT_TEMPLATE_MAP` uses literal string keys; lesson-paths JSON files all use kebab-case (`v1-cap6-esp1.json`); index.ts:609 passes `safeExperimentId` directly. No normalization bug found. |
| H4 | Pre-LLM short-circuit fires before RAG retrieval → no context to discriminate | 30% (architecturally true) | The template path at line 608 is BEFORE step 4 (LLM call) and BEFORE step 3.5 RAG retrieval (line 362). When a template matches, RAG context is never injected into the response body — the template carries a `ragRetrieve` step but its handler stub returns `[]` (line 613 `ragRetrieve: async () => []`). This is a real second-order gap but does NOT cause the audit BLOCKER (templates that DO match are still experiment-specific from their hardcoded text). |
| H5 | Combination | n/a | H3+H4 were the real combined cause as of audit; H3 already mitigated. |

**Confirmed root cause AS OF AUDIT**: H3. The router pre-refactor returned the first/best-scoring `lesson-explain` template for any query that contained tokens like "spiega" or "LED" — and only `L2-explain-led-blink` had high enough score to win.

**Confirmed status TODAY**: H3 is **mechanically closed** by the 2026-05-10 refactor (threshold=999 + line 282-285 guard). Remaining gap is **coverage**: 85/94 experiments now correctly route to LLM+RAG (which is the Sense-2-aligned fallback per the audit's own Cycle 2 handoff §4), but none of those 85 get a dedicated morphic template body.

---

## 2. Templates Inventory — `clawbot-templates.ts`

20 templates inlined (file 425 LOC, `TEMPLATES_L2` array lines 73-414):

| # | id | category | bound experimentId | description (compact) |
|---|---|---|---|---|
| 1 | `L2-celebrate-end-volume` | lesson-celebrate | `v1-end` | Chiusura volume completo, recap capitoli, transizione next volume |
| 2 | `L2-celebrate-experiment-complete` | feedback-positive | _empty_ | Feedback positivo dopo esperimento riuscito + suggerisce next |
| 3 | `L2-critique-circuit-photo` | critique-vision | _empty_ | Critica costruttiva foto webcam vs schema riferimento volume |
| 4 | `L2-debug-short-circuit` | diagnose-error | _empty_ | Rilevamento cortocircuito breadboard via vision Gemini |
| 5 | `L2-diagnose-led-fioco` | lesson-diagnose | `v1-cap6-esp2` | LED basso brightness diagnosi vision + suggerisci R 220Ohm |
| 6 | `L2-diagnose-led-rovesciato` | diagnose-vision | `v1-cap6-esp1` | LED catodo errato (polarità invertita) — Vision + rotazione 180° |
| 7 | `L2-diagnose-no-current` | diagnose | _empty_ | Circuito non funziona, vision identifica 1 errore principale |
| 8 | `L2-explain-condensatore-tempo` | lesson-explain | `v2-cap10-esp1` | Condensatore + τ=RC con analogia secchio |
| 9 | `L2-explain-led-blink` | lesson-explain | `v1-cap6-esp1` | Spiega LED blink (Blink) — adatta tono docente Sense 1.5 |
| 10 | `L2-explain-pwm-fade` | lesson-explain | `v2-cap8-esp1` | PWM + analogWrite analogia rubinetto rapido |
| 11 | `L2-explain-resistenza-pull-up` | lesson-explain | `v2-cap9-esp3` | Pull-up resistor + INPUT_PULLUP analogia palla in cima |
| 12 | `L2-guide-arduino-compile` | guide-action | _empty_ | Primo compile via n8n endpoint + retry on failure |
| 13 | `L2-guide-mount-experiment` | guide-build | _empty_ | Montaggio step-by-step kit fisico Omaric |
| 14 | `L2-guide-scratch-blockly-first` | lesson-program-first | `v1-cap7-esp1` | Primo programma Scratch/Blockly → C++ Arduino |
| 15 | `L2-guide-serial-monitor` | lesson-guide | `v2-cap10-esp1` | Serial.begin(9600) + Serial.println walkie-talkie |
| 16 | `L2-introduce-arduino-board` | lesson-introduce | `v2-cap7-esp1` | Prima sessione Arduino Vol.2 cap.7 pin map |
| 17 | `L2-introduce-breadboard` | lesson-introduce | `v1-cap4-esp1` | Orientamento bus alimentazione + righe |
| 18 | `L2-introduce-resistor` | lesson-introduce | `v1-cap3-esp1` | Verbose introductive resistore + analogia rubinetto |
| 19 | `L2-recap-fine-lezione` | lesson-recap | `v1-cap6-esp1` | Chiusura lezione, sintesi 3 punti, frase ai ragazzi |
| 20 | `L2-reroute-from-error` | error-recovery | _empty_ | Ricovero post-errore compile/runtime con RAG |

**Coverage analysis**:
- 12/20 templates bound to a specific `experimentId` (covering 9 distinct experiments + 1 sentinel)
- 8/20 templates generic (`experimentId: ''`) — match purely by category_hint or fall through
- **Gap**: 85 of 94 experiments have NO dedicated L2 template body. Per audit Cycle 2 handoff §4 plan, this is correct-by-design — uncovered experiments must use LLM+RAG to get experiment-specific synthesis from volume content. But there's still a Morfismo Sense 2 lift opportunity (Step 2 below).

**Flag — onesto count check**: design doc spec said "20 templates inlined Deno-compat". File system count = 20. NOT significantly less. ✅

---

## 3. Fix Design — 3 Steps

### Step 1 (immediate, 0 LOC source change) — Verify audit bug closed, ship evidence

**Problem**: The audit (2026-05-01) was authored against the pre-refactor router. The 2026-05-10 refactor ("Sprint U Cycle 2 Fix #1") has already shipped the exact fix the audit's Cycle 2 handoff §4 requested. Without live curl evidence, the BLOCKER will appear open in subsequent audits.

**Action** (no code change — just verify + document):
```bash
# Re-run the 20-experiment matrix from sprint-u-cycle1-iter1-unlim-matrix.md §Detail Matrix
# against the deployed Edge Function and assert:
#   1. response.template_id is unique across at least 8 distinct values
#      (matches 9 bound experimentIds — v1-cap6-esp1 may match 3 templates by verb)
#   2. response bodies are NOT byte-identical
#   3. Experiments without per-experiment templates show source != 'clawbot-l2-*'
#      (i.e. they fell through to LLM+RAG)
curl -X POST "$SUPABASE_URL/functions/v1/unlim-chat" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"audit-test-1","message":"Spiega il LED blink","experimentId":"v1-cap6-esp1"}' | jq .template_id
# expect: "L2-explain-led-blink"

curl ... -d '{"experimentId":"v3-cap8-serial", "message":"Spiega comunicazione seriale"}' | jq .source
# expect: NOT 'clawbot-l2-*', should be LLM source (gemini/together/mistral)
```

**Diff sketch** (telemetry doc only, in `docs/audits/`):
```diff
+ # File: docs/audits/sprint-u-cycle1-iter2-routing-verify.md (NEW)
+ Re-run 2026-05-11 of unlim-matrix.md §Detail Matrix
+   - 10 experiments with bound L2 templates → 10 distinct template_ids returned
+   - 84 experiments without bound L2 templates → source: 'together'/'gemini' (LLM path)
+ Result: audit BLOCKER ISSUE 1 mechanically closed. ISSUE 3 (response not experiment-specific)
+ moves to LLM+RAG quality concern (separate workstream).
```

**Risk**: None (no code change).
**Effort**: 30 min curl + verify + write evidence doc.
**Impact**: closes Sprint U cycle 1 BLOCKER row in tracker.

---

### Step 2 (medium ~3-4h, ~30 LOC) — Add `template_match_kind` telemetry + per-volume default L2 templates

**Problem**: After Step 1 verification, 85/94 experiments still fall through to LLM+RAG with no morphic template body. Quality depends entirely on LLM synthesis + RAG retrieval. The audit's Morfismo Sense 2 concern stands at lower severity: LLM responses are NOT byte-identical anymore but neither are they kit-volume-anchored without a template scaffold.

**Action — Phase A — Telemetry (5 LOC)**:

```diff
# File: supabase/functions/_shared/clawbot-template-router.ts
@@ line 215-288 selectTemplate
- export function selectTemplate(query: string, context: SelectContext = {}): ClawBotTemplate | null {
+ export interface SelectResult {
+   template: ClawBotTemplate | null;
+   match_kind: 'per_experiment' | 'category_hint' | 'volume_default' | 'bag_of_words' | 'none';
+ }
+ export function selectTemplate(query: string, context: SelectContext = {}): ClawBotTemplate | null {
+   return selectTemplateWithKind(query, context).template;
+ }
+ export function selectTemplateWithKind(query: string, context: SelectContext = {}): SelectResult {
    ... existing body ...
-   if (matched) { ... return tpl; }
+   if (matched) { ... return { template: tpl, match_kind: 'per_experiment' }; }
    ... at every return, also annotate match_kind ...
  }
```

```diff
# File: supabase/functions/unlim-chat/index.ts:608-614
- const tpl = selectTemplate(safeMessage, { experimentId: safeExperimentId ?? undefined });
+ const tplResult = selectTemplateWithKind(safeMessage, { experimentId: safeExperimentId ?? undefined });
+ const tpl = tplResult.template;
  if (tpl) {
    ...
+   template_match_kind: tplResult.match_kind,  // log in response + saveInteraction
  }
```

**Action — Phase B — Add 3 per-volume default templates (~25 LOC each in `clawbot-templates.ts`)**:

```diff
# File: supabase/functions/_shared/clawbot-templates.ts
@@ append to TEMPLATES_L2 array
+ {
+   id: 'L2-default-vol1',
+   name: 'defaultVol1Generic',
+   description: 'Fallback morphic Vol.1 — kit fisico ELAB intro + breadboard + LED + resistore base. Plurale Ragazzi + cita Vol.1 generico (pag determined runtime by RAG).',
+   category: 'lesson-explain',
+   principio_zero: { plurale_obbligatorio: 'Ragazzi,', citazione_verbatim: true, max_parole: 60, max_frasi: 3, vol_pag: 'Vol.1', analogia: 'kit ELAB primo passo elettronica' },
+   inputs: { experimentId: '', volumeId: 'vol1' },
+   sequence: [
+     { step: 'rag-retrieve-vol1', tool: 'ragRetrieve', args: { query: '${inputs.experimentId}', topK: 3, source: 'vol1', wikiFusion: true }, expected_status: 'ok' },
+     { step: 'speak-default', tool: 'speakTTS', args: { text: "Ragazzi, Vol.1 pag.${citation.page}: '${citation.verbatim}'. Aprite il kit ELAB e seguite la pagina del volume.", voice: 'it-IT-IsabellaNeural', speed: 0.95 }, expected_status: 'ok' },
+   ],
+   fallback_strategy: 'halt-on-error',
+   expected_total_latency_ms: 3500,
+ },
+ // similar for L2-default-vol2 (Arduino base) and L2-default-vol3 (capstone projects)
```

```diff
# File: supabase/functions/_shared/clawbot-template-router.ts
@@ inside selectTemplate, before final bag-of-words block (line ~262)
+ // Volume-default fallback (Step 2 Phase B 2026-05-11):
+ // If experimentId starts with v1-/v2-/v3- but has no per-experiment template,
+ // route to the volume default template (always carries plurale + Vol.N citation).
+ if (typeof context.experimentId === 'string' && /^v[123]-/.test(context.experimentId)) {
+   const vol = context.experimentId[1]; // '1' | '2' | '3'
+   const defaultId = `L2-default-vol${vol}`;
+   const def = TEMPLATES_L2.find(t => t.id === defaultId);
+   if (def) return def;  // (with match_kind: 'volume_default')
+ }
```

**Risk**:
- Default template fires for any experimentId in v1-/v2-/v3- prefix → must verify RAG retrieval still injects experiment-specific page numbers (otherwise "Vol.1 pag.${citation.page}" stays unresolved string).
- Mitigation: env flag `L2_VOLUME_DEFAULTS_ENABLED=false` initially. Canary 5%→25%→100% per ADR-028 §7 pattern.

**Effort**: 3-4h (1h refactor `selectTemplateWithKind` + 1h author 3 default templates + 1h unit tests + 30min canary rollout config).

**Impact**: lifts L2 hit rate from ~10% (9/94) to ~100% (94/94) while preserving experiment-specific routing for the 9 bound experiments. Closes Morfismo Sense 2 coverage gap at scaffolding level.

---

### Step 3 (Sprint T/U deferred ~2 weeks) — Expand 20 → 94 L2 templates with Davide co-author

**Problem**: Step 2 volume defaults are scaffolds — they still depend on RAG to inject page-level citations. For full Morfismo Sense 2 — where the L2 template body IS the kit-volume content morphism — we need a dedicated template per experiment OR per chapter.

**Action**: per ADR-027 (Volumi narrative refactor, status PROPOSED, Davide co-author iter 33+) — add 50 medium-coverage templates (Vol.1 cap.6-14 + Vol.2 cap.3-12 + Vol.3 cap.5-12 core 30), each with:
- Hardcoded `Vol.N pag.NNN` citation from Davide's ODT/PDF
- Analogia specifica capitolo (NOT generic "kit ELAB")
- Sequence with `ragRetrieve` injected as enrichment, not primary content source

**Effort**: ~10 templates/week × 5 weeks = 5 weeks. Davide writes content, Andrea wires to TS array. Defer Sprint U cycle 3+ → V cycle 1.

**Risk**: content drift if volumes get rev'd mid-flight. Mitigation: `expected_total_latency_ms` + `vol_pag` are frozen at template creation; if volume page numbers shift, run codemod sync script (similar to `npm run sync-volumi` mentioned in CLAUDE.md §Aggiornabile coerentemente).

---

## 4. Test Plan Post-Fix

### 4.1 Step 1 verification (no code change)

```bash
# 10 experiments from the unlim-matrix §Detail Matrix
EXPERIMENTS=(v1-cap6-esp1 v2-cap10-esp1 v3-cap8-serial v3-cap6-morse v1-cap3-esp1 v2-cap7-esp1 v3-cap6-esp1 v1-cap10-esp1 v2-cap9-esp3 v3-cap5-esp1)
for exp in "${EXPERIMENTS[@]}"; do
  RESP=$(curl -s -X POST "$SUPABASE_URL/functions/v1/unlim-chat" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sessionId\":\"verify-$exp\",\"message\":\"Spiega questo esperimento\",\"experimentId\":\"$exp\"}")
  echo "$exp: $(echo "$RESP" | jq -r '.source // empty'),$(echo "$RESP" | jq -r '.template_id // "N/A"')"
done
```

**Pass criteria** (assertable):
1. Distinct `template_id` values returned ≥ 8 (was 1 in audit).
2. Body bytes (`.response` field) byte-identical < 50% of pairs (was 100% identical in audit).
3. Experiments without bound templates show `source != 'clawbot-l2-*'` (LLM path).
4. PRINCIPIO ZERO checks per `principio-zero-validator.ts`:
   - 100% `Ragazzi,` plurale opener
   - ≥85% `Vol.N pag.NNN` strict citation (loose was 100% in audit; strict was 0% — depends on Step 2 RAG path injecting real page numbers)
   - 100% ≤ 120 parole per `feedback_unlim_language_rules_10may2026.md`

### 4.2 Step 2 unit tests (post-Phase A telemetry + Phase B defaults)

```typescript
// scripts/openclaw/clawbot-template-router.test.ts (extend)
test('selectTemplateWithKind returns volume_default for uncovered Vol.3 experiment', () => {
  const r = selectTemplateWithKind('Spiega Serial', { experimentId: 'v3-cap8-serial' });
  expect(r.template?.id).toBe('L2-default-vol3');
  expect(r.match_kind).toBe('volume_default');
});

test('selectTemplateWithKind prefers per_experiment over volume_default', () => {
  const r = selectTemplateWithKind('Spiega LED blink', { experimentId: 'v1-cap6-esp1' });
  expect(r.template?.id).toBe('L2-explain-led-blink');
  expect(r.match_kind).toBe('per_experiment');
});
```

### 4.3 Step 3 stress test (long-term)

Re-run the audit harness `tests/e2e/sprint-u-cycle1-iter1-vol1-vol2-full.spec.js` + `vol3-full.spec.js` across 94 experiments post each template batch authoring. Target: template hit rate ≥ 80% (75/94), strict citation rate ≥ 85%, byte-identical body pairs ≤ 5%.

---

## 5. Risk & Rollback Plan

### 5.1 Step 1 — no risk
Read-only verification.

### 5.2 Step 2 — feature-flag canary

```diff
# .env / Supabase secrets
+ L2_VOLUME_DEFAULTS_ENABLED=false  # iter 25: false → 5% → 25% → 100%
```

```diff
# File: supabase/functions/_shared/clawbot-template-router.ts
+ const L2_DEFAULTS_ENABLED = Deno.env.get('L2_VOLUME_DEFAULTS_ENABLED') === 'true';
@@ inside selectTemplate volume_default block
- if (def) return def;
+ if (def && L2_DEFAULTS_ENABLED) return def;
```

**Rollback** (no DB migration, no schema change): `npx supabase secrets set L2_VOLUME_DEFAULTS_ENABLED=false` → instant revert. Existing per-experiment templates unaffected.

**Latency risk** Andrea may flag: removing the L2 short-circuit for 85 experiments exposes them to LLM-only flow (~2-5s p95 vs ~316ms template path). Mitigation: Promise.all parallelization (already shipped iter 38 A3) + Onniscenza classifier skip for chit-chat (iter 37 A2) + R5 baseline 4496ms avg already documented as -34% lift vs realistic baseline (iter 37 audit §6 caveat 4). Net: 85 experiments will be ~10× slower than the wrongly-firing template path BUT WILL be correct, which is the entire point.

### 5.3 Step 3 — content drift risk

Per ADR-027 Volumi narrative refactor — Davide co-author. Risk: ODT/PDF page numbers shift mid-batch. Mitigation: `scripts/sync-volumi.mjs` codemod (CLAUDE.md §Aggiornabile coerentemente) + hard-fail unit test that asserts every `vol_pag` field matches an entry in `src/data/volume-references.js`.

---

## 6. Honest Caveats

1. **Audit was authored against pre-2026-05-10 router state**. The BLOCKER as literally described ("ALL 20 → LED blink") is NOT reproducible against current `clawbot-template-router.ts`. This design doc treats the audit finding as historically correct but mechanically closed, with Step 1 verification mandatory before declaring it "Sprint U BLOCKER closed".

2. **Telemetry gap**: current router returns just `ClawBotTemplate | null`. No way for index.ts caller to log WHY a match happened (per-experiment? category_hint? bag-of-words?). Step 2 Phase A fixes this; without it, future audits cannot disambiguate causes.

3. **RAG ↔ template ordering**: Step 2 default templates ASSUME `executeTemplate` will receive a real `ragRetrieve` function injected by index.ts. As of iter 38 close, index.ts:613 stubs `ragRetrieve: async () => []`. Step 2 must also wire the real `hybridRetrieve` from `_shared/rag.ts:266-283` into the template executor — otherwise `${citation.page}` and `${citation.verbatim}` stay literal strings in user output (broken citation). This is the actual implementation work for Step 2, not just template authoring.

4. **94 vs 92 vs 87 vs 7 lesson-paths confusion across sprints**: lesson-paths dir count file-system verified iter 24 = **94 JSON files** (matches Sprint U audit count). Earlier CLAUDE.md history mentions 87 (iter 36 Mac Mini D3) + 92 (iter 21 mandate) + 7 missing (iter 37 P0.5). Reconcile iter 25+ — out of scope this design doc.

5. **TEMPLATES_L2 count = exactly 20**, file-system verified, NOT inflated. Coverage 9/94 ≈ 10% (NOT 12/94 because v1-cap6-esp1 binds 3 templates that count once for distinct-experiment metric).

---

## 7. Cross-References

- **Source files cited**:
  - `supabase/functions/_shared/clawbot-template-router.ts:215-288` (selectTemplate body)
  - `supabase/functions/_shared/clawbot-templates.ts:73-414` (TEMPLATES_L2 array)
  - `supabase/functions/unlim-chat/index.ts:24` (import) + `:608-614` (call site)
- **Audit context**:
  - `docs/audits/sprint-u-cycle1-iter1-CONSOLIDATED-audit.md` §1 (BLOCKER row)
  - `docs/audits/sprint-u-cycle1-iter1-unlim-matrix.md` ISSUE 1/2/3 (full Detail Matrix)
- **Lesson-paths sample**:
  - `src/data/lesson-paths/v1-cap6-esp1.json` (template reference, 94 files total)
- **Related ADRs**:
  - ADR-027 Volumi narrative refactor (PROPOSED, Davide co-author iter 33+) — gates Step 3
  - ADR-028 §14 surface-to-browser INTENT dispatcher — orthogonal to L2 routing
  - ADR-026 content-safety-guard runtime — fires post-LLM, independent

---

*Design doc by Claude Opus 4.7 1M context iter 24 — 2026-05-11 — Ralph Loop dim-4 Sprint U cycle 1.*
*Read-only: ZERO source files modified. Execute Step 1 verification iter 25 entrance. Execute Step 2 iter 25-26 with canary. Step 3 deferred Sprint V cycle 1 with Davide co-author.*
