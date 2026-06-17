---
id: ATOM-S8-A6
sprint: S-iter-8
priority: P0
owner: gen-app-opus
phase: 1
deps: []
created: 2026-04-27
---

## Task
Wire ClawBot composite handler live: validate `use_composite=true` dispatcher path on production, implement `postToVisionEndpoint` sub-handler real (was stub iter 6). Make composite execute end-to-end.

## Acceptance criteria
- [ ] CoV vitest 12599+ PASS preserved (existing 5 composite-handler tests GREEN)
- [ ] build PASS exit 0 (defer if heavy)
- [ ] file ownership respected — write ONLY `scripts/openclaw/composite-handler.ts` + `scripts/openclaw/dispatcher.ts` + `scripts/openclaw/postToVisionEndpoint.ts` (NEW) + `automa/team-state/messages/gen-app-*.md`
- [ ] `use_composite=true` flag enabled validate via dispatcher (iter 6 added composite branch wire-up +35 LOC, validate end-to-end)
- [ ] `postToVisionEndpoint` sub-handler real impl (replace stub) — POST to `unlim-diagnose` Edge Function with screenshot Base64 + capture topology + return structured response
- [ ] Composite executes 3-tool sequences end-to-end: highlight → speak → camera, mountExperiment → analyze → suggest, vision describe → diagnose → speak, RAG retrieve → synthesize → tts
- [ ] Memory cache TTL 24h pgvector hit logged
- [ ] PZ v3 warnings count (warn-only, not block)
- [ ] PRINCIPIO ZERO + MORFISMO compliance: composite outputs respect plurale "Ragazzi,", citazioni Vol/pag, ≤60 parole

## Output files
- `scripts/openclaw/composite-handler.ts` (MODIFIED, ~50-100 LOC additions live wire-up)
- `scripts/openclaw/dispatcher.ts` (MODIFIED, ~10-20 LOC live validation)
- `scripts/openclaw/postToVisionEndpoint.ts` (NEW, ~80-150 LOC real impl)
- `automa/team-state/messages/gen-app-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` (completion or batched A2/A4)

## Done when
postToVisionEndpoint real impl present, dispatcher branch validated, 5 existing composite tests still PASS (green), completion msg emitted.
