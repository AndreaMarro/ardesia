# ADR-003 — JWT 401 Edge Function curl auth

**Status**: Proposed (pending live verify-edge-function.sh execution with SUPABASE_ANON_KEY)
**Date**: 2026-04-23
**Sprint day**: 04
**Owner**: Andrea Marro

## Context

Day 01 foundations audit flagged 401 Unauthorized on CLI curl to Supabase Edge Functions (e.g. `unlim-chat`, `unlim-diagnose`). Block carried through Day 02/03 as open P1.

Observed failure:
```bash
curl -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
# → 401 {"code":401,"message":"Missing authorization header"}
```

## Root cause

Supabase Edge Functions enforce JWT verification by default. Browser requests send implicit anon key via Supabase client SDK. CLI curl lacks this and needs both:

1. `apikey` header — Supabase gateway auth
2. `Authorization: Bearer <ANON_KEY>` — JWT verification gate

Single `apikey` header alone insufficient. Both required.

## Decision

**Canonical curl pattern for CLI smoke tests**:

```bash
curl -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d '{"message":"test"}'
```

Env var `SUPABASE_ANON_KEY` must be set. Anon key is PUBLIC (client-side accessible) — safe to use in CLI scripts and CI. Still **never** commit actual value; use `.env.local` or secrets.

## Consequences

**Positive**:
- CLI smoke tests work consistently (no more 401)
- Stress test 50-prompt batch (STEP 3.5.2) unblocked
- Post-deploy verify scripts reliable

**Negative**:
- One extra header per curl (cosmetic)
- Ops must remember dual header pattern

**Neutral**:
- No code change in Edge Function itself (JWT verify remains default)
- Matches Supabase docs recommendation

## Verification

Script `scripts/cli-autonomous/verify-edge-function.sh` encapsulates pattern. Returns 0 on 200 OK, non-zero on error.

## References

- Supabase docs: JWT verification on Edge Functions
- Blocker origin: `automa/team-state/blockers.md` Day 01 P0-3
- Canonical project ref ADR: `docs/architectures/gemini-to-together-switch.md`
