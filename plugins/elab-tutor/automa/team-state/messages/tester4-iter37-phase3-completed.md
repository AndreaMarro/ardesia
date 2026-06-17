# Tester-4 iter 37 Phase 3 — completed

**From**: Tester-4 (Atom A4-VERIFY)
**To**: Orchestrator iter 37 Phase 3
**Date**: 2026-04-30
**Branch**: `e2e-bypass-preview`
**Status**: COMPLETE

## Deliverables

- `scripts/smoke/stt-live-iter37.mjs` (410 LOC NEW) — STT live smoke runner, 3 audio formats x 3 input shapes = 9-cell matrix.
- `docs/audits/iter-37-stt-live-smoke.md` (168 LOC NEW) — full audit with results, verdict, root-cause hypotheses, honesty caveats.
- `scripts/bench/output/stt-live-iter37/` — JSON report + 3 audio fixture bins preserved for downstream debug.

## 9-cell matrix smoke results

| # | Sample        | Shape         | HTTP | Latency | Verdict |
|---|---------------|---------------|------|---------|---------|
| 1 | mp3-fixture   | raw-binary    | 500  | 307 ms  | FAIL    |
| 2 | mp3-fixture   | multipart     | 500  | 262 ms  | FAIL    |
| 3 | mp3-fixture   | json-base64   | 500  | 462 ms  | FAIL    |
| 4 | wav-tts       | raw-binary    | 500  | 384 ms  | FAIL    |
| 5 | wav-tts       | multipart     | 500  | 860 ms  | FAIL    |
| 6 | wav-tts       | json-base64   | 500  | 846 ms  | FAIL    |
| 7 | ogg-tts       | raw-binary    | 500  | 379 ms  | FAIL    |
| 8 | ogg-tts       | multipart     | 500  | 210 ms  | FAIL    |
| 9 | ogg-tts       | json-base64   | 500  | 367 ms  | FAIL    |

**Pass rate: 0 / 9 cells.**

All 9 cells return identical `unlim-stt` error envelope: HTTP 500 with `details: "CF Whisper 400: AiError: Invalid input (code 8001)"`. Maker-1 iter 37 Phase 1 A4 input handler accepts all three shapes correctly at the Edge Function layer (no body-parse exceptions, all paths reach `cfWhisperSTT`). The 400 is rejected by Cloudflare Workers AI Whisper Large v3 Turbo itself, downstream of Maker-1's fix.

## Verdict

**FAIL** (PASS threshold >= 6/9, WARN 3-5/9, FAIL <3/9).

STT live end-to-end iter 37 close = BROKEN.

Maker-1 iter 37 Phase 1 fix is architecturally correct (Edge Function 3-shape input handler verified working) but does not unblock end-to-end STT — the iter 31-32 carryover "CF format deeper iter 32+" remains UNRESOLVED iter 37 close.

## Comparison vs iter 31-32 close

CLAUDE.md iter 31-32 stated "STT bug carryover (server fix iter 32, CF format deeper iter 32+)". Iter 32 P0.1 fix lifted the Edge Function from JSON-only to 3-shape input handler. Iter 37 P1 A4 added magic-byte container detection. **Both fixes verified at Edge Function layer**. CF Whisper itself still rejects all Voxtral-produced audio (MP3, WAV, OGG/Opus) with 8001 — same generic error, different one-hop-deeper layer.

## Honesty caveats

1. ELAB_API_KEY not in `~/.zshrc` — used placeholder (unlim-stt does not call `verifyElabApiKey`, fail-open path).
2. ffmpeg not available locally — not blocking, Voxtral TTS emits all three target containers natively.
3. Voice-clone Andrea audio sample not used — Voxtral default voice; would not affect CF 8001 rejection (fires pre-speaker-id).
4. Direct CF Whisper bypass not attempted — `CLOUDFLARE_API_TOKEN` not in zshrc, `.env` access blocked by project safety hook.
5. Single phrase tested ("Ragazzi, oggi accendiamo il LED.") — multi-phrase out of budget, deterministic 8001 across all 9 cells implies same outcome with other phrases.
6. unlim-stt Edge Function version not pinned — tested whatever was live at 18:52 UTC 2026-04-30 prod.
7. ZERO regression — only NEW files under `scripts/smoke/` + `docs/audits/`. vitest baseline 13338 preserved (no `src/**`, `supabase/**`, `tests/**` touched). No `--no-verify`, no push main.

## Recommendation to orchestrator

- Cap Box 8 STT contribution to ZERO until iter 38 P0 fix (CF binding shape OR migrate to Voxtral native STT).
- Cap Box 14 INTENT exec end-to-end at existing 0.85 (text path only — voice path unverifiable while STT broken).
- Iter 38 P0 candidate: Maker-1 / Maker-2 reproduce CF Whisper 400 with raw curl direct to CF (bypassing Edge Function) using preserved bins under `scripts/bench/output/stt-live-iter37/{mp3-fixture,wav-tts,ogg-tts}.bin` — isolates Edge Function vs CF responsibility.
