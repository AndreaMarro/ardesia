# A2-iter43 Composite Emission — COMPLETED

**Date**: 2026-05-13
**Branch**: feat/iter-41-sprint-u-cycle-2-real-user-fix
**Agent**: A2-iter43
**Mandate**: Fix iter 41 bench bug #3 — Onnipotenza composite emission never fires.

---

## Summary

Iter 41 bench evidence showed query "accendi led, evidenzia r1 e compila" returned only
`direct-operational-experiment-nav` (first greedy match on "accendi led"), suppressing
the other 2 actions. Browser dispatched 1 of 3 expected intents.

**Root cause**: `buildDirectOperationalResponse` runs detector chain top-to-bottom and
returns FIRST match. Multi-action queries never reached the LLM where composite array
emission lives.

**Fix**: Added a server-side multi-action gate at the TOP of
`buildDirectOperationalResponse` (BEFORE all detectors). When the query contains 2+
action verbs AND does NOT mention arduino/scratch (which have their own composite
emission paths), the function returns `null`. This lets the LLM handle composite
emission via `[INTENT:{...}]` tags, which `parseIntentTags` already returns as an
array, and the browser `intentsDispatcher` already iterates.

---

## Files modified (ownership respected)

### `supabase/functions/_shared/operational-response.ts` (+19 LOC gate at TOP)

```ts
// Iter 43 A2 — Onnipotenza composite emission gate (iter 41 bench bug #3 fix).
const hasArduinoOrScratchKeyword = /\b(arduino|sketch|blink|lampegg|scratch|blocchi|blocchett\w*|blockly)\b/i.test(text);
const actionVerbMatches = text.match(/\b(accendi|metti|imposta|setta|fai|fammi|carica|apri|mostra|evidenzia|compila|play|pause|cambia|porta|vai|vado)\b/gi) || [];
if (!hasArduinoOrScratchKeyword && actionVerbMatches.length >= 2) {
  return null;
}
```

Rationale for arduino/scratch exclusion: those domain detectors below
already ship composite multi-AZIONE responses in one canonical reply
(`openeditor` + `switcheditor` + `setcode` + `compile` etc.). Iter 41 bench
bug #3 was specifically the cross-domain (mountExperiment + highlight + compile)
greedy-match suppression. Existing regression
`unlimOperationalResponse.test.js > "returns Arduino actions for code, editor
and compile in one response"` (3 verbs: apri/metti/compila + "Arduino" keyword)
remains PASS — gate skipped due to keyword presence.

### `supabase/functions/_shared/system-prompt.ts` (+13 LOC composite emission instructions)

Added "COMPOSITE MULTI-INTENT EMISSION" paragraph after Esempio 5, with 2 few-shot
examples (Esempio 6 + 7) showing the model emitting 2-3 [INTENT:...]/[AZIONE:...]
tags in sequence for multi-action queries. Browser dispatcher iterates the array.

### `tests/unit/operational-response-multi-intent.test.js` (NEW, 96 LOC, 13 tests)

3 describe groups:
- **multi-action returns null (6 tests)**: "accendi led e compila", "metti led verde poi play",
  "evidenzia r1 dopo compila", "accendi led, evidenzia r1 e compila", "fai partire e fammi vedere",
  "carica esperimento poi mostrami il LED"
- **SINGLE-action regression v67 preserved (5 tests)**: "accendi led", "compila il codice",
  "fai partire", "evidenzia r1", "fai una foto del circuito"
- **knowledge queries fall-through (2 tests)**: "Cosa fa pinMode in Arduino?", "Spiegami digitalWrite"

---

## Vitest delta

- New file `tests/unit/operational-response-multi-intent.test.js`: **13/13 PASS** 3x consecutive.
  Durations: 419ms / 155ms / 140ms (later 3x post final fix: 118ms / 90ms / 105ms).
- Regression `tests/unit/unlimOperationalResponse.test.js`: **7/7 PASS** (verified post-fix).
- Regression `tests/unit/unlimNanobotInspired200Hard.test.js`: **201/201 PASS**.
- Regression `tests/unit/unlimOperationalLedMount.test.js`: **1/1 PASS**.
- Regression `tests/unit/unlimAgentDecisionHardMode.test.js`: **4/4 PASS**.
- Regression `tests/unit/unlimHardModeAdversarial.test.js`: **3/3 PASS**.

**Vitest delta (multi-intent-related files only): +13 net (0 regressions).**

Full vitest suite NOT re-run iter 43 (heavy ~5min); orchestrator Phase 3 mandate.

---

## Matrix regression risk assessment

**Iter 41 v67 1000-matrix-failures.jsonl was already empty.** New gate is conservative:

1. **Threshold ≥2 verbs** — single-action queries (1 verb match) unaffected, all
   v67 single-action regressions preserved (verified: "accendi led", "compila il codice",
   "fai partire", "evidenzia r1", "fai una foto" all 5/5 PASS to direct source).
2. **Domain exclusion for arduino/scratch** — keyword guard preserves multi-verb arduino/scratch
   queries that already emit composite AZIONE chains (verified via regression on
   `unlimOperationalResponse.test.js` "Apri Arduino, metti il codice blink e compila"
   = 3 verbs + arduino keyword → gate SKIPPED → direct-operational-arduino emitted).
3. **No new false positives suspected** — the verb list is intentionally tight (16 specific
   action verbs from mandate). Knowledge verbs ("spiega", "cosa fa", "descrivi") are NOT
   in the gate verb list → knowledge queries unaffected.

**Expected matrix delta**: cross-domain multi-INTENT queries (target of bench bug #3)
move from `direct-operational-experiment-nav` 1-tag responses → LLM composite array
N-tag responses. Browser intentsDispatcher iterates and dispatches all N.

**Risk vector remaining**:
- Edge case "fai due cose" with non-experiment domain → falls to LLM. LLM must produce
  composite tags per the new system prompt instructions (Esempio 6+7). If LLM regresses
  to single-tag (rare with explicit few-shot), bench bug #3 reappears for that prompt.
  Mitigation: post-deploy v68 R6/R7 sample 20 multi-action prompts.

---

## Constraints respected

- ✓ File ownership: only `operational-response.ts` + `system-prompt.ts` +
  `tests/unit/operational-response-multi-intent.test.js` (NEW) touched.
- ✓ NOT touched: `unlim-chat/index.ts`, `principio-zero-validator`, `onniscenza-classifier`,
  `llm-client`, intent-parser. Composite array handling already correct
  (verified line 1075 `parseIntentTags(cappedText)` returns IntentTag[]).
- ✓ Browser `intentsDispatcher` already iterates array (proven iter 37 22/22 tests).
- ✓ G45 anti-inflation: only PASS-verified claims, no "should work".
- ✓ iter 41 v67 regression preserved: 7/7 unlimOperationalResponse + 201/201
  unlimNanobotInspired200Hard + 5/5 single-action explicit regression cases in new file.

---

## Deliverable files (absolute paths)

- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/operational-response.ts` (modified +19 LOC)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/system-prompt.ts` (modified +13 LOC)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/tests/unit/operational-response-multi-intent.test.js` (NEW 96 LOC)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/team-state/messages/A2-iter43-composite-emission-completed.md` (this file)

---

**Status**: COMPLETED — ready for Phase 3 orchestrator (commit + push, no `--no-verify`).

Pending deploy: `npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb`
to activate server-side gate prod. Pre-LLM gate returns null bypassing detector chain,
LLM emits composite array, browser dispatches all N intents.
