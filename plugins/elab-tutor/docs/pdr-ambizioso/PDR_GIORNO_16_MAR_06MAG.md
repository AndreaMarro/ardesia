# PDR Giorno 16 — Martedì 06/05/2026

**Sett 3** | Andrea 8h + Tea 3h | Goal: **Edge Function unlim-chat-v2 deployed + multi-step loop maxSteps:5**.

## Pre-flight
```bash
git status; git pull; npx vitest run --reporter=dot | tail -3
```

## Task del giorno
1. **(P0) DEV: deploy Edge Function nuova `unlim-chat-v2` con Vercel AI SDK** (3h)
2. **(P0) DEV: implementa multi-step loop (maxSteps: 5)** (2h)
3. **(P0) DEV: streaming SSE response → browser** (1h)
4. **(P0) TESTER: E2E test query → multi-step → response** (2h)
5. **(P2) Tea: PR esperimenti Vol 1 cap 7 (auto-merge)** (Tea 3h)

## Multi-agent dispatch
```
@team-dev "Deploy Edge Function unlim-chat-v2. Multi-step loop maxSteps:5. Stream SSE."
@team-tester "E2E test: query 'spiegami LED' → multi-step (RAG search + cite + response) → streaming."
@team-reviewer "Review PR unlim-chat-v2 deploy. Security: no PII leak, CORS strict."
```

## PTC use case
**5 query parallel multi-step**: stress test multi-step loop.

## DoD
- [ ] Edge Function deployed + healthy
- [ ] Multi-step loop max 5 step working
- [ ] Streaming SSE → browser working
- [ ] E2E test PASS
- [ ] Tea PR
- [ ] Handoff

## Rischi
- Edge Function timeout 60s default (Supabase limit) → cap multi-step time
- SSE chunked response issue → fallback newline-delimited JSON

## Handoff
`docs/handoff/2026-05-06-end-day.md`
