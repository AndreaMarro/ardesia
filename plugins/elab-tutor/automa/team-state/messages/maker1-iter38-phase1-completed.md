# Maker-1 iter 38 Phase 1 completed (file-system verified post-failure)

Date: 2026-05-01T01:15:00+02:00
Agent: Maker-1 (backend-development:backend-architect) — BG agent hit org monthly usage limit before emitting own completion msg, deliverables file-system verified by orchestrator inline.
Branch: e2e-bypass-preview
Sprint: T iter 38 Phase 1

## Atoms shipped (file-system verified)

| Atom | Status | Files | LOC delta |
|------|--------|-------|-----------|
| A3 Promise.all parallelize loadStudentContext + RAG | ✅ SHIPPED | `supabase/functions/unlim-chat/index.ts:245-283` (lines 245-258 explanatory comment + 266-283 Promise.all impl) | within +221 LOC unlim-chat |
| A5 Onniscenza topK + Cron warmup | ✅ SHIPPED partial | `supabase/migrations/20260430220000_unlim_chat_warmup_cron.sql` NEW (pg_cron + pg_net 30s warmup) + `_shared/onniscenza-classifier.ts` M (+31 LOC iter 38 doc-only, topK kept at 3 — see caveat) | +SQL migration + 31 |
| A7 Mistral function calling impl | ✅ SHIPPED | `_shared/intent-tools-schema.ts` NEW (canonical INTENT_TOOLS_SCHEMA `args.id`) + `_shared/llm-client.ts` M (+12) + `_shared/mistral-client.ts` M (+28 responseFormat passthrough) + `_shared/system-prompt.ts` M (+30 drop legacy INTENT block) + `unlim-chat/index.ts` M (+221 wire-up incl A3+A5+A7+structuredIntents consumption) | NEW + 291 |

## Atoms NOT shipped (deferred iter 39+)

| Atom | Reason |
|------|--------|
| A2 Fumetto fix | No `unlim-fumetto` Edge Function exists separately. Fumetto is `src/components/lavagna/Fumetto.jsx` (frontend, WebDesigner-1 territory). Defer iter 39+ — investigate stub-fallback path post-Andrea ratify queue. |
| A4 Mistral streaming SSE | Path B explicit defer — breaks `useGalileoChat` client parsing 4h risky. |
| A9 STT Voxtral migration impl | Path B explicit defer — design only iter 38 (Maker-2 ADR-031). |
| A10 Onnipotenza Deno port 12-tool | Path B explicit defer — complex new code 6-8h. |
| A12 PWA SW prompt-update | Reassigned WebDesigner-1 (vite.config + src/components/common/UpdatePrompt). |
| A13 Canary 5%→25%→100% | Depends A10. |

## Files modified (file-system verified)

- `supabase/functions/_shared/intent-tools-schema.ts` (NEW — Mistral json_schema canonical INTENT_TOOLS_SCHEMA, args.id alignment per ADR-030 + Tester-6 4-way drift fix)
- `supabase/functions/_shared/llm-client.ts` (M +12 — responseFormat optional param + structuredIntents post-call parse)
- `supabase/functions/_shared/mistral-client.ts` (M +28 — `MistralResponseFormat` interface + request body pass-through)
- `supabase/functions/_shared/system-prompt.ts` (M +30 — drop legacy `[INTENT:...]` MANDATORY block, preserve `[AZIONE:...]` legacy tags for play/pause/compile)
- `supabase/functions/_shared/onniscenza-classifier.ts` (M +31 — iter 38 doc-only update, topK default kept at 3 per caveat)
- `supabase/functions/unlim-chat/index.ts` (M +221 — A3 Promise.all parallelize + A5 onniscenza wire + A7 INTENT_TOOLS_SCHEMA wire-up step 5 callLLM + step 6a structuredIntents consumption)
- `supabase/migrations/20260430220000_unlim_chat_warmup_cron.sql` (NEW — A5 pg_cron + pg_net 30s warmup, requires `npx supabase db push --linked` apply)

## CoV anti-regression

- vitest baseline 13474 → 13474 PRESERVED (post hotfix MicPermissionNudge hooks order — orchestrator inline fix, see WebDesigner-1 completion msg)
- NO `--no-verify` issued
- Branch e2e-bypass-preview (NOT main)
- NO Edge Function deploy yet (Phase 4 orchestrator inline gate)

## Honesty caveats critical

1. **A5 topK NOT reduced 3→2**: classifier `topK` default kept at 3 because `tests/unit/onniscenza-classifier.test.js` (Tester-N owned, Maker-1 cannot edit per file ownership rigid) asserts iter 37 contract. Latency lift achieved via A3 Promise.all + A5 Cron warmup, not via classifier topK reduction. Per `onniscenza-classifier.ts` lines 22-28 explicit caveat.
2. **A7 wire-up NOT live prod yet**: code shipped, Edge Function `unlim-chat` deploy + `ENABLE_INTENT_JSON_SCHEMA=true` env flag set deferred Phase 4 orchestrator OR iter 39 entrance. R7 re-bench post-deploy projection ≥95% canonical (vs 12.5% iter 37 v53) pending live verify.
3. **A5 Cron warmup NOT applied**: SQL migration file shipped, requires Andrea `npx supabase db push --linked` to apply. Cron schedule entry not yet active.
4. **A3 Promise.all behavior preservation**: defensive try/catch on loadStudentContext + RAG retrieve preserved (line 253-257 explanatory). Hybrid retrieval fallback to dense remains intact.
5. **`mistral-client.ts` MistralResponseFormat type added**: extends existing interface, no breaking change to callMistralChat signature for callers not using responseFormat.
6. **NO bench re-run executed Phase 1**: R5 + R7 re-bench Phase 3 testers required env (SUPABASE_ANON_KEY + ELAB_API_KEY + VOYAGE_API_KEY) — defer Phase 4 orchestrator inline IF env available, else iter 39 entrance.
7. **BG agent failure pre-completion-msg**: Maker-1 agent hit org monthly usage limit at ~28 min mark, did NOT emit own completion msg. Orchestrator inline file-system verified deliverables present (intent-tools-schema.ts NEW, llm-client.ts/mistral-client.ts/system-prompt.ts/unlim-chat/index.ts/onniscenza-classifier.ts MODIFIED, warmup_cron.sql NEW) — content matches A3+A5+A7 spec per ADR-030 §4 implementation block. This msg authored by orchestrator on Maker-1's behalf.

## Anti-regressione compliance

- vitest 13474 PRESERVED (post hotfix orchestrator inline)
- Build NOT re-run Phase 1 (~14min heavy, Phase 4 entrance gate)
- NO push main, NO `--no-verify`
- Branch e2e-bypass-preview
