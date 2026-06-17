# Maker-2 iter 36 Phase 1 — Atom A3 ADR-028 — STATUS: completed

**Timestamp**: 2026-04-30T12:50Z
**Agent**: feature-dev:code-architect (read-only) + orchestrator scribe persistence

## Deliverables

- `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` ~410 LOC
- 14/14 sezioni covered (13 mandate + §14 implementation reference Atom A1 cross-link)

## Cross-refs cited (read-only verified by agent)

- `scripts/openclaw/dispatcher.ts` 386 LOC (62-tool L0 Map + L1 composite opt-in)
- `scripts/openclaw/composite-handler.ts` 634 LOC (L1 morphic + audit pattern)
- `supabase/functions/_shared/clawbot-template-router.ts` (L2 pre-LLM short-circuit)
- `supabase/functions/_shared/principio-zero-validator.ts` `stripTags` lines 48-53 (PZ V3 pipeline)
- `supabase/functions/unlim-chat/index.ts` insertion point identified post-`callLLM`
- ADR-010 audit table pattern source
- ADR-013 L1 composite reference
- ADR-019 Sense 1.5 morfismo runtime
- CLAUDE.md §1 PRINCIPIO ZERO + §2 MORFISMO Sense 1+1.5+2

## Architecture decisions

1. Server-side INTENT parser non-greedy regex `/\[INTENT:(\{[\s\S]*?\})\]/g` + defensive JSON.parse
2. Deno port `_shared/clawbot-dispatcher.ts` from `scripts/openclaw/dispatcher.ts` (62-tool)
3. `intent_dispatch_log` Supabase table (mirror `together_audit_log` ADR-010 pattern)
4. `ENABLE_INTENT_DISPATCHER=true|false` env flag rollback lever
5. PZ V3 + `stripIntentTags` preserves Vol/pag verbatim + Ragazzi plurale invariant

## Honesty caveats

- Agent (`feature-dev:code-architect`) had READ-ONLY tool set (Glob/Grep/LS/Read, no Write)
- ADR-028 file persisted by orchestrator scribe (parent agent) from architectural blueprint
- Mistral tool-call native alternative deferred iter 38 (conflict PZ V3 ≤60 parole)
- L3 dynamic JS DEV-only unchanged — production L0+L1+L2 only
- 50-prompt R7 fixture exec deferred iter 37+ (NO claim "Onnipotenza LIVE" without R7 ≥80% verified prod)
- ToolSpec count CLAUDE.md iter 29 audit confirms 62 file-system grep (vs older 52/57 doc claims) — D2 mac-mini grep `^  name:` returned 1 (pattern wrong, file format diverso) — Maker-1 ownership verify Atom A1

## Compliance gate 8/8 (PDR §0)

- ✅ Linguaggio: ADR text NON è response UNLIM (gate N/A doc-level), but stripIntentTags preserves Ragazzi+Vol/pag
- ✅ Kit fisico mention: §8 PRINCIPIO ZERO compliance section explicit
- ✅ Palette: ADR doc text-only (gate N/A)
- ✅ Iconografia: ADR doc text-only (gate N/A)
- ✅ Morphic runtime: §9 dispatcher dynamic Map lookup, NO static cascade
- ✅ Cross-pollination: §3 L0+L1+L2+L3 layered
- ✅ Triplet coerenza: ADR doc text-only (gate N/A)
- ✅ Multimodale: Voxtral/Vision/STT preserved via cleanText post-strip (no impact)

## Handoff to Phase 2 Documenter

- ADR-028 PROPOSED status — Andrea ratify queue iter 37 (~6 min decision)
- Implementation: iter 36 Phase 1 Atom A1 Maker-1 (intent-parser.ts + 15+ tests + unlim-chat wire-up)
- Migration apply: iter 37 P0 (`supabase db push --linked` post ratify)
- Rollout: iter 37 Shadow 0% → Canary 5% → ramp per §7 schedule
- Audit log volume retention: iter 38 partition 90-day (cite §12 Consequences)
- 50-prompt R7 fixture exec: iter 37 entrance gate or iter 38 P1
