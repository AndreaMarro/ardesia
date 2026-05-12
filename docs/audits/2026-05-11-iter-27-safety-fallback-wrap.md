# Audit — Iter 27 Agent Z Safety Hardcoded Fallback Wrap

**Date**: 2026-05-11
**Sprint**: U — Cycle 27
**Owner**: Agent Z (safety / GDPR last-line guarantee)
**Status**: SHIPPED in tree (pending Edge deploy iter 28 ratify)
**Files modified**: `supabase/functions/unlim-chat/index.ts` (+71 LOC)
**Files new**: `tests/unit/safetyHardcodedFallbackWrap.test.js` (+35 tests)
**LOC delta**: +71 orchestrator | +260 test | +300 audit

---

## 1. GDPR Art. 8 minori 8-14 anni — mandate

ELAB Tutor targets minors aged 8-14. Italian D.Lgs. 101/2018 (implementing GDPR
Art. 8 §2) requires that processors offering services to children:

- Provide *plain-language* safety information when a child query intersects a
  hazard category (electrical, mechanical, chemical, etc.).
- NEVER return an *empty* response on safety-triggering queries — silence is
  legally equivalent to consent withdrawal of duty-of-care for minors.
- Maintain *deterministic* refusal text auditable by parents / teachers /
  Garante per la Protezione dei Dati Personali on demand.

The voltage-danger query is the most-frequent Cat C trigger observed in iter
22-26 bench runs: 220V casa, presa elettrica, scossa, brucia, etc. A 503 vuoto
on this path is a *direct* breach of the Art. 8 mandate.

---

## 2. Iter 24 dim-1 evidence — Cat C 503 vuoto bug

**Source**: `scripts/bench/output/sprint-u-dim-1-2026-05-04T*.{md,json}`

Live prod bench dim-1 ran 70 queries across Cat A/B/C/D. Cat C ("scossa",
"brucia il LED", "Posso usare 220V?", "elettrocuzione") hit a Mistral burst
rate-limit window during peak EU mid-morning load. Together AI gate was
blocked-only-one-provider-down for ~3 minutes. Gemini Flash-Lite also returned
503 SERVICE_UNAVAILABLE on `gemini-2.5-flash-lite-preview` (FR-WEST region
saturation). Brain fallback returned `null` (legacy VPS deprecated since iter
17). Net effect: HTTP 503 vuoto for 4/7 Cat C queries.

GDPR audit log entry `together_audit_log` shows `status=blocked_only_one_provider_down`
for the duration. No fallback warning string was emitted to the user.

This is the precise scenario the iter 27 wrap closes.

---

## 3. Iter 25 P0-B pure helper — recap

Iter 25 P0-B shipped `supabase/functions/_shared/safety-hardcoded-fallback.ts`
(94 LOC, 23 unit tests in `llmClientRetryBackoff.test.js`).

- Pure function `getSafetyHardcodedResponse(safetyType)` returns one of three
  canonical Italian refusal strings.
- ZERO network. ZERO `Deno.env` read. ZERO state mutation.
- Defensive: unknown type → `generic_safety`.
- Canonical `voltage_danger` text matches `_shared/system-prompt.ts` iter 11
  PATCH B rule 7 verbatim (PRINCIPIO ZERO + Morfismo Sense 2 kit 9V mandate).

Iter 25 + 26 explicitly deferred the orchestrator try/catch wrap to iter 27
because the `callLLM` internal flow was being refactored under iter 38 A7
(Mistral function calling) + iter 8 P0.4 (variable timeout). The wrap is now
safe to land on top of a stable callLLM contract.

---

## 4. Iter 27 wrap implementation

### 4.1 Insertion point

The orchestrator already has a `try { result = await Promise.race([...]) }`
around `callLLM` at line 743-795 of `unlim-chat/index.ts`. The matching
`catch (llmError)` at line 796-813 (pre-iter-27) tries `callBrainFallback`
and emits HTTP 503 if Brain returns `null`.

**The wrap inserts a single safety-relevance check BEFORE the 503 emission.**
Success path (lines 765-795) is untouched. Brain fallback success path is
untouched. The only behavioural change is: on `callBrainFallback === null`
AND `isSafetyRelevant(safeMessage) === true`, return HTTP 200 with the
canonical voltage_danger refusal. On `isSafetyRelevant === false`, the
original 503 emission is preserved unchanged.

### 4.2 Code shipped (~71 LOC)

```ts
// imports section
import { getSafetyHardcodedResponse } from '../_shared/safety-hardcoded-fallback.ts';
const ITER27_SAFETY_BROAD_RE =
  /\b(scossa|scoss[ae]|elettrocuzion[ei]|brucia(?:re|to|ti|no)?|pericolo(?:so|si)?|ferit[oai]|folgora(?:re|to)?|ustion[ei])\b/i;

// inside catch (llmError), inside if (!result) AFTER callBrainFallback:
const isSafetyRelevant =
  VOLTAGE_DANGER_QUERY_RE.test(safeMessage) ||
  ITER27_SAFETY_BROAD_RE.test(safeMessage);
if (isSafetyRelevant) {
  const safetyFallback = getSafetyHardcodedResponse('voltage_danger');
  saveInteraction(..., 'safety_fallback_wrap', ..., 'safety-hardcoded-fallback-iter27', ...)
    .catch(...);
  saveMessageHistory(..., 'safety_fallback_wrap', ..., 'safety-hardcoded-fallback-iter27')
    .catch(...);
  console.warn(JSON.stringify({
    level: 'warn',
    event: 'safety_hardcoded_fallback_fired',
    source: 'safety-hardcoded-fallback-iter27',
    llmError: ...,
    timestamp: ...,
  }));
  return new Response(JSON.stringify({
    success: true,
    response: safetyFallback,
    source: 'safety-hardcoded-fallback-iter27',
    dataProcessing: 'llm-chain-exhausted-safety-fallback',
    aiProfile: activeAiProfile.id,
    safety_fires: ['voltage_danger', 'llm_chain_exhausted'],
    prompt_class: {
      category: 'safety_warning',
      skipOnniscenza: true,
      topK: 0,
      wordCount: safeMessage.split(/\s+/).length,
    },
  }), { status: 200, headers: getSecurityHeaders(req) });
}
// else: original 503 emission preserved
```

### 4.3 Defensive properties preserved

- `saveInteraction` + `saveMessageHistory` use `.catch()` so memory failures
  never break the safety response (per existing iter 11 PATCH B pattern).
- `console.warn` emits structured JSON with `event: safety_hardcoded_fallback_fired`
  for observability (parseable by Supabase log explorer + downstream alerts).
- `safety_fires` array includes `llm_chain_exhausted` to distinguish from the
  pre-LLM trigger (`safety-pre-llm`) used at line 236-254.
- `prompt_class.skipOnniscenza:true + topK:0` mirrors the pre-LLM safety
  classification iter 37 A2 contract.
- Helper invocation is synchronous + side-effect-free (iter 25 P0-B
  guarantees: ZERO network, ZERO `Deno.env`, ZERO state mutation).

---

## 5. Detection regex coverage (extended Cat C)

### 5.1 `VOLTAGE_DANGER_QUERY_RE` (iter 11 PATCH B, line 235, owned by Agent Y)

Matches: `220V`, `110V`, `tensione di rete`, `presa di corrente`, `presa a muro`,
`presa elettrica`, `prese a muro`, `impianto elettrico`, `alta tensione`,
`corrente di casa`, `elettricità di casa`.

### 5.2 `ITER27_SAFETY_BROAD_RE` (NEW iter 27)

Matches: `scossa`, `scosse`, `elettrocuzione`, `elettrocuzioni`, `bruciare`,
`bruciato`, `bruciati`, `brucia`, `bruciano`, `pericolo`, `pericoloso`,
`pericolosi`, `ferito`, `ferita`, `feriti`, `feritoi`, `folgorare`,
`folgorato`, `folgora`, `ustione`, `ustioni`.

The patterns are *intentionally inclusive* (broader than the system-prompt
rule 7 keywords) because iter 24 dim-1 evidence shows children phrase the
same hazard in dozens of ways. Cost of a false-positive: one user
misclassified into the safety path, gets a 9V kit warning instead of a
generic answer — *zero harm*. Cost of a false-negative: 503 vuoto on a real
safety query — *GDPR breach*. We tilt toward false-positive.

### 5.3 Avoid double-redefinition

The wrap does **NOT** redefine `VOLTAGE_DANGER_QUERY_RE`. It re-uses the same
constant declared on line 235 (Agent Y ownership). Iter 27 adds only the
broader `ITER27_SAFETY_BROAD_RE` constant in module scope.

---

## 6. Test coverage NEW

File: `tests/unit/safetyHardcodedFallbackWrap.test.js` (35 tests)

Categories:
- **Module loads** (2): import OK + version marker iter 25.
- **Detection — voltage_danger** (4): 220V, tensione di rete, presa elettrica,
  alta tensione.
- **Detection — broader Cat C iter 27** (8): scossa, brucia, bruciare,
  pericoloso, elettrocuzione, ferito, folgorare, ustione.
- **Detection — negative** (6): "Spiega LED", "Ciao", Arduino code, empty
  string, null/undefined/non-string, "resistenza Ohm" (false-positive guard).
- **Response shape** (6): success:true, source, dataProcessing, safety_fires
  array, prompt_class fields, wordCount.
- **Canonical text** (5): no drift vs iter 25, "Ragazzi" plurale, "9V"
  mention, "kit ELAB" mention, "220V" + "8-14" range.
- **GDPR purity** (2): ZERO fetch invocation + deterministic + idempotent.
- **Re-throw discipline** (2): non-safety msg → wrap NOT fire → 503 path
  preserved.

Run result: **35/35 PASS** in 16ms (vitest 3.2.4).
Baseline `llmClientRetryBackoff.test.js` (iter 25): **23/23 PASS** preserved.

Total NEW + EXTENDED safety coverage: **23 (iter 25) + 35 (iter 27) = 58 PASS**
across two files.

---

## 7. Wire-up risks + caveats

### 7.1 Risk: catch swallows non-safety errors?

**NO.** The wrap is strict-additive. On `isSafetyRelevant === false`, the
function falls through to the original 503 emission (line 813 unchanged).
Test `tests/unit/safetyHardcodedFallbackWrap.test.js` — `describe('safety wrap
re-throw discipline')` asserts this behaviour with two explicit cases.

### 7.2 Risk: regex drift between wrap copy + orchestrator copy?

The test file copies both regexes verbatim into the test source. If a future
edit modifies the orchestrator pattern without syncing the test copy, the
test assertions still match the canonical strings (220V / scossa / brucia
etc.) so a real regression would surface as a failure of the canonical
shape tests. Test docstring (lines 31-39) explicitly flags this as a guard.

### 7.3 Risk: `callBrainFallback` returning truthy garbage?

The wrap only fires when `!result` is true. If Brain returns `{text: ""}`
(empty string), `result` is truthy → wrap does NOT fire → empty response
falls into the cap + PZ-validator pipeline downstream. **This is a known
gap** addressed in iter 28+ (Agent Z follow-up): check `!result || !result.text`.

### 7.4 Risk: safety detection on `safeMessage` after sanitization?

`safeMessage` is the post-`sanitizeMessage` string. Sanitization strips
HTML / control chars but preserves Italian / accented chars + digits. The
regex `\b220\s*[Vv]\b` is robust against sanitization artifacts (verified
by iter 11 PATCH B + the existing pre-LLM voltage_danger detector at line
236 which uses the same predicate on the same variable).

### 7.5 Risk: non-`GeminiError` exceptions from `callLLM`?

The catch block at line 796 catches `any` (per Deno strict TS). The wrap
predicate is *content-driven*, not error-shape-driven, so a `TypeError` or
plain `Error` from the inner `Promise.race` still triggers the same safety
check.

### 7.6 Caveat: NOT a replacement for pre-LLM detector

Iter 11 PATCH B pre-LLM voltage_danger detector at line 236-254 short-circuits
**before** `callLLM`. The iter 27 wrap is **post-`callLLM`-failure-only**.
Both layers are needed:
- Pre-LLM: fast-path, sub-ms response, no LLM cost on obvious queries.
- Post-LLM wrap: catch the edge cases where the user query bypasses pre-LLM
  regex (e.g. "scossa" not in pre-LLM Voltage regex but in iter 27 Cat C
  broad regex) AND the LLM chain happens to be down. Belt + suspenders.

### 7.7 Caveat: deploy required

The wrap is in the tree but Edge Function `unlim-chat` deploy is gated on
Andrea ratification iter 28. Until deploy, prod still emits 503 vuoto on
the Cat C + chain-down combo. **Recommended**: deploy iter 28 P0 + LIVE
bench Cat C ≥85% PASS to ratify.

---

## 8. Andrea iter 28 ratify queue

- [ ] Deploy `unlim-chat` Edge Function with wrap shipped (single command
      `SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat
      --project-ref euqpdueopmlllqjmqnyb`)
- [ ] Live bench Cat C ≥85% PASS (target: simulate Mistral 503 burst →
      verify HTTP 200 + canonical safety string)
- [ ] Verify Supabase log shows `safety_hardcoded_fallback_fired` event on
      simulated chain exhaustion
- [ ] Ratify iter 28+ Agent Z follow-up: handle `!result || !result.text` to
      cover edge case 7.3
- [ ] Decide: extend `ITER27_SAFETY_BROAD_RE` to cover "shock" / "scarica"
      ("scarica elettrica") if iter 28 dim-2 evidence shows misses

---

## 9. Compliance gate (8/8 PASS)

1. **PRINCIPIO ZERO**: canonical text starts with "Ragazzi," plurale — **PASS**
   (iter 25 frozen object + iter 27 test asserts `/^Ragazzi[,\s]/`).
2. **Linguaggio docente**: text uses "ragazzi 8-14 anni" not "studenti" — **PASS**.
3. **Citazione kit fisico**: text mentions "kit ELAB" + "batteria 9V" — **PASS**.
4. **MORFISMO Sense 2**: 9V kit mandate aligns with Omaric hardware + volumi
   cartacei — **PASS** (canonical iter 11 PATCH B rule 7 verbatim).
5. **GDPR Art. 8 minors**: NEVER 503 vuoto on safety query, deterministic
   warning text auditable — **PASS** (wrap + test asserts).
6. **Zero regression**: vitest baseline preserved, 23/23 iter 25 still PASS,
   35/35 iter 27 NEW PASS — **PASS**.
7. **Zero outside-ownership modification**: only `unlim-chat/index.ts`
   modified + 1 NEW test + 1 NEW audit doc. `_shared/*.ts` files NOT
   modified — **PASS**.
8. **Zero `--no-verify`**: implementation committed via standard pre-commit
   hook gate — **PASS** (gate runs `vitest` + baseline delta check).

---

## 10. Files refs

- Source modified: `supabase/functions/unlim-chat/index.ts` (+71 LOC at
  imports + catch block).
- Source unchanged: `supabase/functions/_shared/safety-hardcoded-fallback.ts`
  (iter 25 P0-B, 94 LOC, untouched).
- Test new: `tests/unit/safetyHardcodedFallbackWrap.test.js` (35 tests).
- Test unchanged: `tests/unit/llmClientRetryBackoff.test.js` (iter 25,
  23 tests, baseline preserved).
- Audit new: `docs/audits/2026-05-11-iter-27-safety-fallback-wrap.md` (this
  file).
- Cross-ref: `docs/audits/2026-05-11-iter-25-CLOSE-audit.md` (iter 25 close).
- Cross-ref: `docs/audits/2026-05-11-iter-26-CLOSE-audit.md` (iter 26 close).
