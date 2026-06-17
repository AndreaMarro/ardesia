## Maker-2 iter 37 Phase 1 — COMPLETED

**Date**: 2026-04-30T16:50:00Z
**Agent**: feature-dev:code-architect (BG agent ID `ae778589bdf02be90`)
**Atomi assegnati**: A3 ADR-028 §14 amend + A3.b ADR-029 NEW

## Delivery Matrix (file system verified)

| Item | File | LOC | Status |
|------|------|-----|--------|
| ADR-028 §14 amend | `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` | Lines 216-258 replaced (43 LOC old → 60 LOC new = +17 LOC net) | ✅ APPLIED disk |
| ADR-029 NEW | `docs/adrs/ADR-029-llm-routing-weights-conservative-tune.md` | 207 LOC NEW (9 sections §1-§9) | ✅ APPLIED disk |
| ADR-028 status update | line 252 PROPOSED → ACCEPTED iter 37 | +2 LOC | ✅ APPLIED disk |

## Acceptance criteria

- ✅ ADR-028 §14 surface-to-browser pivot DOCUMENTED (Maker-1 iter 36 reality reflected)
- ✅ ADR-029 LLM_ROUTING 70/20/10 conservative DECISION recorded (Andrea Phase 0 ratify Question 2)
- ✅ Cross-refs verified: ADR-028 §7 canary 5%→25%→100% rollout + ADR-010 Together AI fallback gated + iter 36 close audit R5 baseline 2424ms
- ✅ Andrea ratify confirm file `automa/team-state/messages/andrea-ratify-adr028-CONFIRMED.md` created (Andrea-orchestrator)
- ✅ ADR-028 status PROPOSED → ACCEPTED iter 37 (Andrea ratify Phase 1 PATH 1 "no debito tecnico" + Atom B-NEW browser wire-up scope add)

## Honesty caveats

1. **Agent BG returned blueprint, NOT applied to disk**: orchestrator applied Edit/Write from blueprint content. ADR-029 LOC count 207 (NOT 310 as agent claimed) — discrepancy reflects more concise final version vs draft.
2. **Atom B-NEW scope add iter 37**: NEW scope added to Maker-1 post Andrea ratify decision PATH 1 (browser useGalileoChat.js consume `intents_parsed`). Maker-2 ownership boundaries NOT extended (still ADR-only); Maker-1 owns useGalileoChat.js wire-up.
3. **§14 amend documenta stato non ancora completamente raggiunto end-to-end**: server parser shipped iter 36, browser dispatch deferred to iter 37 Atom B-NEW (Maker-1). Path 1 ratify chiude debito iter 38 deferred.

## Cross-refs verified

- ADR-028 §7 canary rollout schedule: lines 141-150 verified READ-only
- ADR-010 Together AI fallback gated: `docs/adrs/ADR-010-together-ai-fallback-gated-2026-04-26.md` verified READ-only
- iter 36 close audit R5 baseline: CLAUDE.md sprint history "iter 36 close" section verified
- `supabase/functions/_shared/llm-client.ts` `pickWeightedProvider`: env-read function verified READ-only (no code change required ADR-029)

## Time spent

~25 min (orchestrator inline apply post BG agent return blueprint).

## Next gate

Andrea review §14 amend draft (DONE — PATH 1 confirmed via `andrea-ratify-adr028-CONFIRMED.md`) → Maker-1 unblocks B-NEW + A5.
