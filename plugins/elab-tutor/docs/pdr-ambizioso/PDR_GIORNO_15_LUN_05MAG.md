# PDR Giorno 15 — Lunedì 05/05/2026

**Sett 3** (BRIDGE) | Andrea 8h + Tea 3h | Goal: **Vercel AI SDK install + first tool `get_circuit_state`**.

## Pre-flight
```bash
git status; git pull; cat docs/handoff/2026-05-04-end-sett2.md
```

## Task del giorno
1. **(P0) DEV: install `ai` + `@ai-sdk/togetherai` su edge function** (1h)
2. **(P0) DEV: implementa primo tool `get_circuit_state` + bridge SSE browser** (3h)
3. **(P0) TESTER: integration test tool invocation Edge Function → SSE → browser** (2h)
4. **(P0) ARCHITECT: ADR-008 Vercel AI SDK adoption blueprint** (1h)
5. **(P2) Tea: PR esperimenti Vol 1 cap 6 (auto-merge)** (Tea 3h)

## Multi-agent dispatch
```
@team-architect "ADR-008 Vercel AI SDK scheletro UNLIM. Output docs/decisions/ADR-008-vercel-ai-sdk.md."
@team-dev "Setup Vercel AI SDK Edge Function + tool 1. supabase/functions/unlim-chat-v2/index.ts."
@team-tester "Integration test tool invocation + SSE bridge. tests/integration/edge-tool-bridge.test.js."
```

## DoD
- [ ] Vercel AI SDK installed
- [ ] Tool 1 `get_circuit_state` invokable
- [ ] SSE bridge browser → Edge Function working
- [ ] ADR-008 scritto
- [ ] Tea PR auto-merged
- [ ] Handoff

## Rischi
- Vercel AI SDK breaking changes vs docs context7 → check version pinning
- SSE Supabase Edge Function compatibility → fallback polling

## Handoff
`docs/handoff/2026-05-05-end-day.md`
