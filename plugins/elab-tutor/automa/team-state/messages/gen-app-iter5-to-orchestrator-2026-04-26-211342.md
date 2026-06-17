# gen-app-opus iter 5 → orchestrator

ts: 2026-04-26T21:13:42+02:00
agent: generator-app-opus
sprint: S iter 5 PHASE 1
authorization: Andrea explicit "al posto di gemini usa together ai"

## TL;DR
Together AI primary wire-up DONE. llm-client.ts default already 'together' (iter 3). unlim-chat callLLM already routes via LLM_PROVIDER (no Gemini direct call). Added explicit comment marker iter 5. Migrations dry-run shows DRIFT (1 remote-only migration `20260420070003` not in local repo) → HALT auto-push per protocol. Tests 12574 PASS (1 pre-existing wiki failure orthogonal).

## Files modified

| Path | Lines | Note |
|------|-------|------|
| `supabase/functions/unlim-chat/index.ts` | +3 | Comment marker iter 5 Andrea decision |
| `supabase/functions/_shared/llm-client.ts` | 0 | Already correct (iter 3) — verified default 'together' line 192 |

## Task A1 — llm-client.ts default provider state

VERIFIED line 192:
```ts
const provider = (Deno.env.get('LLM_PROVIDER') || 'together').trim().toLowerCase();
```
- Default: `together` ✅
- Vision (images): ALWAYS Gemini (line 215-218, Llama 70B no vision)
- Together failure → auto-fallback Gemini (line 226-236)
- `callLLMWithFallback` chain shipped iter 3 (115 lines wired RunPod→Gemini→Together gated)

## Task A2 — unlim-chat wire state

VERIFIED line 268 already uses `callLLM(...)` (NOT `callGemini` direct).
- No breaking signature change
- Brain fallback chain preserved (line 277-294)
- Comment marker added line 266-268: "Sprint S iter 5: Andrea decision — Together AI primary, Gemini fallback"
- Reference: R5 49/50 PASS audit `docs/audits/2026-04-26-sprint-s-iter4-r5-together-direct-RESULT.md`

## Task A3 — Migrations apply state

DRY-RUN OUTPUT:
```
Local          | Remote         | Time
001            |                | 001
               | 20260420070003 | 2026-04-20 07:00:03
20260426152944 |                | 2026-04-26 15:29:44
20260426152945 |                | 2026-04-26 15:29:45
```

DRIFT DETECTED:
- Remote has `20260420070003` (NOT in local migrations/)
- Local has `001` (NOT in remote)
- Local 2 expected migrations queued: `together_audit_log` + `openclaw_tool_memory`

DECISION: HALT auto-push. Reason: spec says "IF dry-run shows ONLY 2 expected migrations THEN apply ELSE HALT". 4 mismatches > 2 expected.

NEXT STEPS for Andrea:
1. Decide repair path:
   - Option A: `supabase migration repair --status reverted 20260420070003` then `supabase db push --linked`
   - Option B: `supabase db pull --linked` first to sync remote schema into local
2. Inspect remote `20260420070003` content (likely abandoned/superseded)
3. Re-run dry-run after repair, push only when 2 expected migrations diff

NON-blocking for Together wire-up (Edge Function code change works without migrations).

## Task A4 — Test gate (NO deploy)

vitest run (basic reporter):
```
Test Files  1 failed | 233 passed (234)
Tests  1 failed | 12574 passed | 7 skipped | 8 todo (12590)
Duration  61.25s
```

- 12574 PASS (vs iter 4 baseline 12575: -1, BUT failure is pre-existing test on wiki concepts assertion 0.767 < 0.8, see below)
- 7 skipped + 8 todo unchanged
- ZERO regressions from iter 5 changes

Failure detail:
- File: `tests/unit/wiki/wiki-concepts.test.js:41`
- Assertion: `analogia/files.length >= 0.8` (got 0.767)
- Cause: NEW wiki .md files added iter 3+4 (analog-write, if-else, zener, for-loop) lack "Analogia" section ratio drop below threshold
- ORTHOGONAL to iter 5 scope (Together wire-up doesn't touch wiki/)
- Pre-existing issue (test introduced commit 4896094 q4 wiki expansion)

Build status: SKIPPED per spec ("skip se troppo lento", iter 3 last successful build verified ~14m).

## Open issues

1. **Migration drift**: remote `20260420070003` orphan needs Andrea decision (repair vs pull)
2. **Wiki test red**: not iter 5 fault, candidate spawn-task for scribe (add Analogia sections to 4 missing wiki concepts)
3. **Edge Function NOT deployed**: per spec "NO deploy autonomous" → Andrea manual `supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb`
4. **iter 3 uncommitted work**: `llm-client.ts` 202-line addition (callLLMWithFallback chain + together-fallback gate integration) still uncommitted on working tree per scribe iter 3 race condition note. Iter 5 inherits dirty state.
5. **TOGETHER_API_KEY env on Edge Function**: must verify set on Supabase project elab-unlim before deploy (likely already set iter 1+2)

## CoV 3x

| Check | Status |
|-------|--------|
| vitest ≥12575 PASS | ⚠️ 12574 (-1 pre-existing wiki red, NOT iter 5 fault) |
| build PASS | SKIPPED per spec |
| No regression | ✅ ZERO from iter 5 changes |
| Migrations applied | ❌ HALT (drift) — documented |

## Hard rules respected

- ✅ NO push main
- ✅ NO merge senza Andrea
- ✅ NO deploy Edge Function autonomous
- ✅ NO --no-verify
- ✅ TDD discipline (red wiki test pre-existing, NOT introduced)
- ✅ Karpathy: Surgical (3 lines comment), Goal-driven (Andrea decision)
- ✅ Migration apply ONLY if dry-run clean (HALT correct)

## Files iter 5 phase 1 deliverables

- `supabase/functions/unlim-chat/index.ts` (M, +3)
- `automa/team-state/messages/gen-app-iter5-to-orchestrator-2026-04-26-211342.md` (NEW)

End message.
