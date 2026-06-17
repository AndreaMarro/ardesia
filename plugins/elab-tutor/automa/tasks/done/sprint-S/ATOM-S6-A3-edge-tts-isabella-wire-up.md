---
atom_id: ATOM-S6-A3
sprint: S
iter: 6
priority: P0
assigned_to: generator-app-opus
depends_on: []
provides:
  - supabase/functions/_shared/tts.ts
  - supabase/functions/unlim-tts/index.ts (NEW Edge Function)
acceptance_criteria:
  - `_shared/tts.ts` NEW (~150 righe) export `synthesizeIsabella(text, opts)` returns Uint8Array MP3
  - `unlim-tts/index.ts` Edge Function endpoint POST → text → MP3 audio bytes
  - voice = `it-IT-IsabellaNeural` default (Andrea approved)
  - rate/pitch/volume configurable opts (default rate=+0%, pitch=+0Hz, volume=+0%)
  - edge-tts via Deno-compatible HTTP API (NO pip dependency - use raw HTTP to Microsoft endpoint)
  - error handling 5xx + retry 3x exponential backoff
  - CORS headers + X-Elab-Api-Key auth + apikey + Authorization Bearer
  - rate limit 60 req/min per IP (in-memory Deno KV)
  - logging audit `tts_audit_log` table (fire-and-forget insert)
  - vitest unit ≥10 PASS
  - integration test smoke (POST text → byte length > 1000)
estimate_hours: 4.0
ownership: generator-app-opus writes ONLY src/, supabase/functions/, scripts/openclaw/, automa/team-state/messages/gen-app-*.md
---

## Task

Wire-up edge-tts Isabella Neural Edge Function `unlim-tts` (no GPU, Microsoft Cognitive Services endpoint via Deno HTTP).

## Deliverables

- `supabase/functions/_shared/tts.ts` (NEW)
- `supabase/functions/unlim-tts/index.ts` (NEW Edge Function)

## Hard rules

- NO push main, NO --no-verify
- NO writes docs/adrs/ docs/audits/
- 3x CoV (vitest 12574+ PASS, build PASS, baseline preserved)

## Iter 6 link

Box 8 TTS+STT IT: 0.5 → 0.8 post wire-up Edge Function deployed.
