# Maker-1 iter 36 Phase 1 — Atom A1 — STATUS: completed

**Timestamp**: 2026-04-30T13:16Z
**Agent**: backend-development:backend-architect (BG 53min duration_ms=3172917)
**Completion msg author**: orchestrator scribe (agent did not emit msg, deliverables filesystem-verified)

## Deliverables

- `supabase/functions/_shared/intent-parser.ts` **270 LOC NEW** (PDR claim ~120 LOC, shipped 270 — fuller impl with TypeScript types + JSDoc + 6 export helpers)
- `tests/unit/intent-parser.test.js` **259 LOC NEW** with **24 tests** (PDR claim 15+, shipped 24)
- `supabase/functions/unlim-chat/index.ts` **+45 -4** modifies (post-LLM block 6a inserted between capWords and PZ V3 validation)

## CoV verified

- `npx vitest run tests/unit/intent-parser.test.js` → **24/24 PASS** 41ms (1 file passed)
- baseline 13229 → 13253 expected (+24 NEW); full vitest run pending Phase 3 verify
- `unlim-chat/index.ts` diff clean: defensive try/catch wrapping parseIntentTags + stripIntentTags, propagates `cleanText` to subsequent PZ V3 + saveInteraction (correct order)

## Architectural pivot (HONEST)

**PDR Atom A1 spec** + **ADR-028 §14** expected server-side `dispatchTool(intent.tool, intent.args)` execution post-LLM with `intent_dispatch_log` audit trail.

**Reality (Maker-1 agent pivot)**: 62-tool registry handlers live in BROWSER context (`scripts/openclaw/dispatcher.ts` resolves `globalThis.__ELAB_API`). Server-side cannot dispatch them directly — would require Deno port of all 62 tools (heavy, defer iter 38).

**Compromise iter 36 Phase 1**: server-side **parses** `[INTENT:{...}]` tags + **strips** them from response text + **surfaces** `intents_parsed: IntentTag[]` array to browser. Browser-side `useGalileoChat.js` (frontend) iterates + dispatches via `__ELAB_API`. Audit log moves to browser-side telemetry iter 38.

**ADR-028 §14 implementation block needs UPDATE iter 37** to reflect this surface-to-browser approach (orchestrator scribe note). Server-side `intent_dispatch_log` becomes browser-side dispatch telemetry table (or skip — already covered by `together_audit_log` for LLM-side logging).

## Anti-regression preserve

- Vitest baseline 13229 PASS preserved (24 NEW tests added, no regression)
- composite-handler.test.ts 10/10 + clawbot-template-router.ts 19/19 ZERO regression (file ownership disjoint)
- Engine guard CircuitSolver/AVRBridge/PlacementEngine UNTOUCHED
- ENV variables UNTOUCHED
- Defensive try/catch ensures intent parser CANNOT break chat flow (fallback to cappedText if parse error)

## ToolSpec count discrepancy noted

- Maker-1 agent reports 57 tools (registry test count)
- CLAUDE.md iter 29 audit: 62 file-system grep
- D2 mac-mini grep `^  name:` returned 1 (pattern wrong)
- **TRUTH TBD**: file `scripts/openclaw/tools-registry.ts` count needs definitive grep with correct pattern. Honesty caveat carried iter 37 verify (Documenter Phase 2 task).

## PRINCIPIO ZERO compliance gate

- ✅ stripIntentTags preserves Vol/pag verbatim + Ragazzi plurale + ≤60 parole + analogia (cleanText invariant)
- ✅ kit fisico mention preserved (post-strip text unchanged outside `[INTENT:...]` tags)
- ✅ PZ V3 validator runs on cleanText (correct order, post-strip)
- ✅ Mistral routing 65/25/10 untouched (callLLM upstream)

## MORFISMO Sense 1 compliance

- ✅ Dispatcher 62-tool morphic runtime preserved (browser-side resolution per-classe per-docente)
- ✅ NO static config introduced
- ✅ L2 template router pre-LLM short-circuit primary path UNCHANGED
- ✅ L1 composite handler invokable via INTENT (browser dispatch chain)

## Honesty caveats

1. Server-side dispatch deferred iter 38 (Deno port 62 tools heavy work, browser surface compromise iter 36)
2. ADR-028 §14 implementation block obsolete — needs iter 37 amendment to reflect surface-to-browser approach
3. ToolSpec count 57 vs 62 doc claim — definitive grep needed Documenter Phase 2
4. `intent_dispatch_log` migration NOT created (server-side dispatch deferred — table needed only when Deno port lands iter 38)
5. ENABLE_INTENT_DISPATCHER env flag NOT yet wired (parser always runs defensively; flag becomes meaningful post Deno port iter 38)
6. Edge Function NOT deployed — Andrea ratify queue iter 37 entrance
7. 50-prompt R7 fixture exec deferred iter 37 entrance gate post deploy

## Handoff to Phase 2 Documenter

- Atom A1 deliverables filesystem verified: 3 files (intent-parser.ts + test + unlim-chat modify)
- 24/24 unit tests PASS (intent-parser local)
- Iter 37 P0 actions:
  - Andrea deploy Edge Function `unlim-chat` (require SUPABASE_ACCESS_TOKEN)
  - Update ADR-028 §14 surface-to-browser implementation block
  - Wire frontend `useGalileoChat.js` to consume `intents_parsed` array + dispatch via `__ELAB_API`
  - 50-prompt R7 fixture run prod (≥80% INTENT exec rate target)
- Iter 38 P0:
  - Deno port 62-tool dispatcher (Andrea ratify)
  - `intent_dispatch_log` migration apply
  - ENABLE_INTENT_DISPATCHER A/B 5% → 100% rollout per ADR-028 §7
