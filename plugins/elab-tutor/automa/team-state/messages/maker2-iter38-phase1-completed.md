# Maker-2 iter 38 Phase 1 completed

Date: 2026-04-30T23:00:00+02:00
Agent: Maker-2 (feature-dev:code-architect)
Branch: e2e-bypass-preview
Sprint: T iter 38 Phase 1

## ADRs shipped

| ADR | File | LOC |
|-----|------|-----|
| ADR-030 | `docs/adrs/ADR-030-mistral-function-calling-intent-canonical.md` | ~280 |
| ADR-031 | `docs/adrs/ADR-031-stt-migration-voxtral-transcribe-2.md` | ~270 |
| ADR-028 §14.b | `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` (append) | ~58 |

**Total LOC delta**: ~610 (docs/adrs/ only, per file ownership mandate)

## Files

- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/adrs/ADR-030-mistral-function-calling-intent-canonical.md` (NEW)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/adrs/ADR-031-stt-migration-voxtral-transcribe-2.md` (NEW)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` (MODIFIED §14.b append)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/team-state/messages/maker2-iter38-phase1-completed.md` (this file)

## Cross-refs

- Tester-6 msg `automa/team-state/messages/tester6-iter37-phase3-completed.md` §3.4 + §4 cited in ADR-030 §2 and ADR-028 §14.b (4-way schema drift evidence)
- ADR-028 amended: §14.b appended after §14, action items for Tester-2 (scorer rules) + Maker-1/WebDesigner-1 (dispatcher object accept) + Maker-1 (system-prompt drop)
- ADR-030 cross-refs ADR-028 §14 (surface-to-browser amend ACCEPTED iter 37) + ADR-029 (routing 70/20/10)
- ADR-031 cross-refs `voxtral-client.ts` (TTS sibling iter 29) + `cloudflare-client.ts` incumbent

## Key decisions made

1. **ADR-030**: Replace prompt-teaching `[INTENT:...]` tags with Mistral `response_format: { type: 'json_schema' }`. Projected canonical rate 12.5% → ≥95%. Single canonical source: `args.id` for mountExperiment (system-prompt correct; bench scorer wrong). Fallback: regex `parseIntentTags` retained for Together AI + Brain fallback paths (non-Mistral providers lack json_schema support). Env flag `ENABLE_INTENT_JSON_SCHEMA=true` for canary.

2. **ADR-031**: Voxtral Transcribe 2 as primary STT (design iter 38, impl deferred iter 39). $0.003/min, 4% WER FLEURS Italian, EU France GDPR-clean. CF Whisper fallback retained 6 months. Completes 100% Mistral EU FR stack (Morfismo Sense 2). New file `_shared/voxtral-stt-client.ts` ~250 LOC per Maker-1 iter 39.

3. **ADR-028 §14.b**: Documents 4-way schema drift, designates ADR-030 as canonical source, provides exact line-level action items for Tester-2 (scorer realignment) and Maker-1/WebDesigner-1 (dispatcher object accept).

## Honesty caveats

1. **ADR-030 `strict: true` compatibility not verified**: Mistral json_schema with `strict: true` + `additionalProperties: true` on args object needs Maker-1 runtime verify. Fallback: `strict: false` if rejected (weaker guarantee, still schema-validated).
2. **ADR-031 model ID not verified**: `voxtral-mini-v2-2503` is the inferred model ID from Mistral announcement context. Maker-1 MUST verify exact model ID string via `GET https://api.mistral.ai/v1/models` before implementing `voxtral-stt-client.ts`.
3. **ADR-031 impl deferred iter 39**: no `src/**` or `supabase/**` changes in iter 38 per file ownership mandate. Design only. Tester-4 9-cell acceptance matrix runs iter 39.
4. **Together AI fallback gap**: ADR-030 json_schema path is Mistral-only. Together AI (10% traffic + emergency fallback) continues regex INTENT parse at ~12.5% canonical. Full closure requires either Together AI json_schema support verification (iter 39) or raising Mistral primary to 95%+ routing.
5. **File ownership respected**: NO changes to `src/**`, `supabase/**`, `tests/**`. All 3 deliverables are in `docs/adrs/` per mandate.
6. **Sub-agent had no Write tool**: Maker-2 sub-agent (feature-dev:code-architect) is read-only by design. Returned ADR text in completion message; orchestrator wrote files to disk inline (this file write done by orchestrator on Maker-2's behalf).

## Anti-regressione compliance

- Did NOT modify `src/**`, `tests/**`, `supabase/**`: VERIFIED (read-only on those paths)
- Did NOT commit or push: VERIFIED (orchestrator Phase 4 handles commit)
- vitest baseline 13474 preserve: VERIFIED (no test files touched)
- Branch e2e-bypass-preview: VERIFIED (no git operations performed)
