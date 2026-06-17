# Iter 37 Phase 3 STT Live Smoke — 9-Cell Matrix Audit

**Author**: Tester-4 Sprint T iter 37 Phase 3 fix agent
**Date**: 2026-04-30
**Branch**: `e2e-bypass-preview`
**Working dir**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`
**Atom**: A4-VERIFY (~1h budget)
**Runner**: `scripts/smoke/stt-live-iter37.mjs` (409 LOC NEW)
**Output report**: `scripts/bench/output/stt-live-iter37/stt-live-iter37-1777575188855.json`
**Endpoint under test**: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-stt` (LIVE prod, Edge Function v post-iter-32 + Maker-1 iter 37 Phase 1 fix)

## 1. Executive verdict

**FAIL — 0 / 9 cells PASS** (verdict thresholds: PASS >=6/9, WARN 3-5/9, FAIL <3/9).

Maker-1 iter 37 Phase 1 A4 input handler (multipart + JSON base64 + raw audio/* binary, magic-byte container detect Ogg/WebM/MP3/WAV/FLAC/MP4) **DOES correctly accept all three input shapes** at the Edge Function layer. Each cell reaches `cfWhisperSTT` and forwards to Cloudflare Workers AI. **However Cloudflare Workers AI Whisper Large v3 Turbo rejects every payload with HTTP 400 `AiError: Invalid input` (code 8001)** for all 3 audio containers (MP3, WAV, OGG/Opus) and both wire shapes the CF client tries (base64-json then raw-binary fallback).

The Maker-1 iter 37 fix at the Edge Function input layer is **architecturally sound** but does not unblock end-to-end STT — the failure has shifted one hop downstream (CF Whisper), confirming the iter 31-32 close note "STT bug carryover (server fix iter 32, CF format deeper iter 32+)" is **STILL UNRESOLVED iter 37 close**.

## 2. Test design

### 2.1 Audio sample acquisition

| Sample id     | Format desired | Source                                                                                              | Detected container | Bytes   | Italian speech? |
|---------------|----------------|-----------------------------------------------------------------------------------------------------|--------------------|---------|-----------------|
| `mp3-fixture` | mp3            | Existing Voxtral fixture `scripts/bench/output/voxtral-test/voxtral-T1.mp3` (iter 31 IT TTS output) | mp3 (ID3v2)        | 29 555  | yes             |
| `wav-tts`     | wav            | Live `unlim-tts` POST `format: 'wav'` of phrase "Ragazzi, oggi accendiamo il LED."                  | wav (RIFF/WAVE)    | 280 364 | yes             |
| `ogg-tts`     | opus           | Live `unlim-tts` POST `format: 'opus'` of same phrase                                               | ogg (OggS)         | 20 032  | yes             |

All three containers detected correctly client-side via the same magic-byte regex set Maker-1 added server-side (Ogg, RIFF/WAVE, ID3, MPEG sync, EBML/WebM, fLaC, ftyp/MP4). Voxtral TTS works for all three formats — `unlim-tts` Edge Function returned HTTP 200 with valid audio payloads in each container, Content-Type echoed in response (`audio/wav`, `audio/opus`, `audio/mpeg`).

### 2.2 Three input shapes per audio sample

The runner sends each of the three audio buffers to `unlim-stt` via three distinct request shapes that exercise the three branches Maker-1 added at `supabase/functions/unlim-stt/index.ts:46-76`:

- **Shape A `raw-binary`** — `Content-Type: audio/{container}` (e.g. `audio/mpeg`, `audio/wav`, `audio/ogg`) with raw bytes in body, plus `x-session-id` and `x-language` headers.
- **Shape B `multipart`** — `multipart/form-data` with `audio` File field (correct MIME type per container), `language` and `sessionId` form fields.
- **Shape C `json-base64`** — `Content-Type: application/json` body `{audio_base64, language: 'it', sessionId}`.

3 audio formats x 3 input shapes = 9 cells.

### 2.3 Acceptance criteria

Per cell:

- HTTP 200 response from `unlim-stt`, AND
- non-empty transcript in response (`text` or `transcript` field), AND
- at least one Italian keyword match from `['ragazz', 'oggi', 'led', 'accend']` (case-insensitive substring).

Cell verdict: PASS / WARN (HTTP 200 + transcript but no IT keyword) / FAIL / BLOCKED (sample missing) / ERROR (exception during request).

Aggregate verdict: PASS >=6/9, WARN 3-5/9, FAIL <3/9.

## 3. Pre-flight env check

Mandate spec required `SUPABASE_ANON_KEY` and `ELAB_API_KEY` in `~/.zshrc`.

| Var                  | In `~/.zshrc`? | Present at runtime? | Notes                                                                                  |
|----------------------|----------------|---------------------|----------------------------------------------------------------------------------------|
| `SUPABASE_ANON_KEY`  | YES            | YES                 | Loaded via `grep ... ~/.zshrc` per spec invocation.                                    |
| `ELAB_API_KEY`       | NO             | NO (placeholder)    | Not exported in `~/.zshrc`. `unlim-stt` does NOT call `verifyElabApiKey` (no enforce). |

`supabase/functions/unlim-stt/index.ts` does not invoke `verifyElabApiKey` — verified by grep `grep -nE "verifyElabApiKey|X-Elab-Api-Key" supabase/functions/unlim-stt/index.ts` returns empty. Per `supabase/functions/_shared/guards.ts:66-87` the verifier is also fail-open when `ELAB_API_KEY` is unset on the server side. Either way, the missing local env did not block this smoke run. The X-Elab-Api-Key header is sent with a placeholder string so any future enforcement upgrade would surface as a clean 401 not a runtime error.

The runner is structured so that if a future iteration adds enforcement, supplying the real key via env unblocks it without source change.

## 4. 9-cell matrix results

Run started 2026-04-30 18:52:55 UTC, finished 2026-04-30 18:53:06 UTC (~11s wall).

| # | Sample        | Shape         | HTTP | Latency | Error                  | Transcript | IT match | Verdict |
|---|---------------|---------------|------|---------|------------------------|------------|----------|---------|
| 1 | `mp3-fixture` | `raw-binary`  | 500  | 307 ms  | Transcription failed   | (empty)    | no       | FAIL    |
| 2 | `mp3-fixture` | `multipart`   | 500  | 262 ms  | Transcription failed   | (empty)    | no       | FAIL    |
| 3 | `mp3-fixture` | `json-base64` | 500  | 462 ms  | Transcription failed   | (empty)    | no       | FAIL    |
| 4 | `wav-tts`     | `raw-binary`  | 500  | 384 ms  | Transcription failed   | (empty)    | no       | FAIL    |
| 5 | `wav-tts`     | `multipart`   | 500  | 860 ms  | Transcription failed   | (empty)    | no       | FAIL    |
| 6 | `wav-tts`     | `json-base64` | 500  | 846 ms  | Transcription failed   | (empty)    | no       | FAIL    |
| 7 | `ogg-tts`     | `raw-binary`  | 500  | 379 ms  | Transcription failed   | (empty)    | no       | FAIL    |
| 8 | `ogg-tts`     | `multipart`   | 500  | 210 ms  | Transcription failed   | (empty)    | no       | FAIL    |
| 9 | `ogg-tts`     | `json-base64` | 500  | 367 ms  | Transcription failed   | (empty)    | no       | FAIL    |

All nine cells return identical-shape error envelope from `unlim-stt`:
```json
{ "success": false, "error": "Transcription failed",
  "details": "CF Whisper 400: {\"errors\":[{\"message\":\"AiError: AiError: Invalid input (<uuid>)\",\"code\":8001}],\"success\":false,\"result\":{},\"messages\":[]}" }
```

The `code: 8001` `AiError: Invalid input` is Cloudflare Workers AI's generic input-rejection error for the Whisper Large v3 Turbo model. It is not the auth-failure shape (would be 401/403), not the rate-limit shape (would be 429), and not a network shape (we get a deterministic 400 from CF).

## 5. What this proves vs falsifies

### 5.1 Confirmed working

- `unlim-tts` Edge Function emits valid IT audio in WAV, MP3, and OGG/Opus containers (all three TTS calls succeeded mid-smoke, audio buffers saved to disk and magic-byte-validated).
- `unlim-stt` Edge Function input handler accepts and routes all three shapes Maker-1 wired:
  - `multipart/form-data` -> `formData()` parse -> File -> bytes (no exception).
  - `audio/*` raw -> `arrayBuffer()` (no exception).
  - `application/json` `{audio_base64}` -> `atob()` decode (no exception).
- Each shape reaches `cfWhisperSTT` (otherwise we'd see a 400 from `unlim-stt` itself, not 500 with `details: "CF Whisper 400 ..."`).
- The CF client tries base64-json shape first then on 4xx retries raw-binary (per `supabase/functions/_shared/cloudflare-client.ts:249-262`). The error message mentions `CF Whisper 400` directly, with no shape indicator, suggesting both shapes were attempted by the CF client wrapper and both rejected by CF.
- Magic-byte container detection works on all three samples (server should detect mp3, wav, ogg via the same regex bytes the runner mirrors).

### 5.2 Falsified

- The hypothesis "Maker-1 iter 37 Phase 1 A4 fixes the iter 31-32 STT bug end-to-end" — **falsified**. The architecture fix is real (request body parsing now handles three shapes correctly) but the underlying CF Whisper 400 still blocks transcription regardless of input shape or audio container.

### 5.3 Open / not-yet-tested

- We could not test what the same MP3 fixture does against CF Whisper directly (bypassing Edge Function) because `CLOUDFLARE_API_TOKEN` is not in local zshrc env. That direct test would isolate whether the issue is the model rejecting these specific containers vs a config issue in the Edge Function (e.g. wrong model id, wrong endpoint version).
- Voxtral output containers (especially Ogg Opus from `format: 'opus'`) might not be raw Ogg Opus — the magic bytes confirm OggS, but CF Whisper Large v3 Turbo's accepted codecs may not include Opus-in-Ogg. Whisper canonically expects mel-spectrogrammable codecs (PCM, MP3, FLAC, M4A); some Whisper hosts strip-decode Opus, others don't. CF's documented accepted set is small.
- WAV at 280 KB for 1.5 s phrase suggests 24 kHz/48 kHz stereo or float — Whisper expects 16 kHz mono 16-bit PCM. Voxtral's `format: 'wav'` may emit a higher sample-rate / bit-depth WAV that CF does not transcode internally.

## 6. Comparison vs iter 31-32 close

CLAUDE.md iter 31-32 close states: "STT bug carryover (server fix iter 32, CF format deeper iter 32+)" and box 8 TTS reached 0.95 while STT remained an open carryover. Iter 36 close `Box 14 INTENT exec end-to-end` lifted to 0.85 but did not address STT. Iter 37 PDR claims iter 32 P0.1 had the CF Whisper STT 3-shape fix DEPLOYED prod. Maker-1 iter 37 Phase 1 A4 deepened that with magic-byte container detection. **This live smoke confirms iter 32 + iter 37 fixes are at the wrong layer** — the Edge Function input handling is now robust, but Cloudflare Whisper itself rejects Voxtral-produced audio in all three containers with `Invalid input` 8001.

Status update for box-by-box scoring:

- Box 8 TTS 0.95 — UNCHANGED (Voxtral primary IT proven working again here, voice clone Andrea LIVE per iter 31, all three formats emit valid audio).
- STT readiness: 0/10 — no transcription end-to-end, ANY shape, ANY container.
- Maker-1 iter 37 Phase 1 A4 ship: architectural correctness **VERIFIED** (input shapes accepted) but functional end-to-end **NOT VERIFIED** (downstream CF rejection).

## 7. Root-cause hypothesis (suspected, not confirmed)

H1 (highest probability) — Cloudflare Workers AI Whisper Large v3 Turbo accepted-codec set is narrower than Voxtral's emit set. The fact that **all 3 containers** fail with the same generic `Invalid input` 8001, including a verified ID3v2 + MPEG layer III v2 22.05 kHz mono MP3 fixture (the most universally accepted Whisper input), suggests CF is rejecting somewhere upstream of decode — possibly:
- Account-tier limit (free 10k req/day exhausted? but error would be 429 not 400 8001).
- API token missing or rotated (would produce 401/403 not 400).
- The `audio` payload field expected by CF's Whisper bindings has a stricter schema than the cloudflare-client.ts is sending (e.g. CF may now require `audio: { data: "<b64>", encoding: "base64" }` envelope rather than `audio: "<b64>"` flat string). The error 8001 with `Invalid input` and no field-name hint matches that signature.

H2 — Whisper Large v3 Turbo on CF was rolled back / replaced by `@cf/openai/whisper-tiny-en` only or otherwise renamed. Less likely because the 400 says model accepted the request but rejected input, not "model not found" (would be 404).

H3 — CF Whisper has an undocumented duration / size lower bound and is rejecting the short (~1-2s) Voxtral samples. Less likely because 29 KB MP3 is well above any reasonable minimum and Voxtral produces multi-second output for the phrase.

## 8. Suggested follow-up (out of scope for Tester-4 atom)

- **Iter 38 P0**: Maker-1 / Maker-2 reproduce CF Whisper 400 with raw curl directly to `https://api.cloudflare.com/client/v4/accounts/<acct>/ai/run/@cf/openai/whisper-large-v3-turbo` using a known-good Italian sample (e.g. one of the runner's saved bins under `scripts/bench/output/stt-live-iter37/{mp3-fixture,wav-tts,ogg-tts}.bin`). This isolates Edge Function vs CF.
- Consult CF Workers AI changelog 2026-04 for Whisper API schema changes (audio-as-array vs audio-as-base64 vs audio-as-multipart) — iter 32 close mentions "CF Whisper Turbo deprecated JSON path 2026 — raw binary required" but iter 37 client tries base64-json first, retry raw-binary on 4xx. If both shapes still 400 the bindings may have moved to a *third* shape (e.g. signed url or raw-mpeg only).
- Consider direct Voxtral `transcribe` endpoint (Mistral Voxtral has STT capability natively per the iter 29 voxtral-client.ts; if Mistral Voxtral can both TTS and STT we eliminate the cross-provider container compatibility issue entirely and stay GDPR EU FR).
- Decommission CF Whisper if Voxtral STT covers IT K-12 with quality >= 90 percent and migrate `cfWhisperSTT` -> `voxtralSTT` in `unlim-stt/index.ts`.

## 9. Files produced this atom

| File                                                                                                       | LOC | Purpose                                                                         |
|------------------------------------------------------------------------------------------------------------|-----|---------------------------------------------------------------------------------|
| `scripts/smoke/stt-live-iter37.mjs`                                                                        | 410 | Runner: 3-format x 3-shape STT live matrix, no deps beyond Node 22 stdlib.      |
| `scripts/bench/output/stt-live-iter37/stt-live-iter37-1777575188855.json`                                  | n/a | Latest matrix run JSON (9 cells, full request/response per cell incl details).  |
| `scripts/bench/output/stt-live-iter37/{mp3-fixture,wav-tts,ogg-tts}.bin`                                   | n/a | Audio buffers under test (preserved for downstream debug & direct CF curl).     |
| `docs/audits/iter-37-stt-live-smoke.md`                                                                    | n/a | This audit.                                                                     |

Note: runner ended up at 410 LOC (vs spec ~150) because the matrix orchestration (sample loading via TTS round-trip, magic-byte detect mirroring, three distinct fetch shapes, deterministic verdict) was not factor-able into a smaller harness without sacrificing readability of per-cell output. No external deps were added.

## 10. Honesty caveats

1. **ELAB_API_KEY not in `~/.zshrc`**. Smoke ran with placeholder value; the unlim-stt Edge Function does not currently enforce `verifyElabApiKey`. If a future iter adds enforcement, this runner will return 401 cleanly and the same matrix can re-run after env provisioning.
2. **No ffmpeg available locally**. We did not need it because Voxtral TTS emits all three required containers natively. If Voxtral ever drops `format: 'wav'` or `format: 'opus'` support, the runner falls back to a synthesized 440 Hz sine WAV stub (no Italian speech) and that cell's verdict will be at most WARN by design.
3. **Voice-clone Andrea audio sample missing**. We used Voxtral default voice for the WAV/OGG samples. Per CLAUDE.md iter 31, voice-clone IT Andrea is LIVE with `voice_id 9234f1b6-766a-485f-acc4-e2cf6dc42327`. Adding `voice_id` to the TTS request would make the audio more representative of prod conditions but cannot affect CF Whisper's 8001 rejection (which fires before any speaker-identity processing).
4. **No direct CF call attempted**. We did not bypass `unlim-stt` to call CF directly because `CLOUDFLARE_API_TOKEN` is not in zshrc and reading `.env` is blocked by the project safety hook. The hypothesis section calls out this limitation explicitly.
5. **Single phrase tested**. We sent the same Italian phrase "Ragazzi, oggi accendiamo il LED." for all 9 cells. A multi-phrase sweep was out of budget and would not have changed the conclusion given the deterministic 8001 across all 9 cells with identical UUIDs in the error indicating CF treats each request as fresh.
6. **Edge Function version not pinned**. We did not query `unlim-stt` for its deployed version stamp; we tested whatever was live at 18:52 UTC 2026-04-30 prod. Per CLAUDE.md iter 37 close v50 was the most recent unlim-chat redeploy; unlim-stt's last update is iter 32 fix per `supabase/functions/unlim-stt/index.ts:40-46` comment. If unlim-stt was redeployed silently after our smoke, results may differ.
7. **No anti-regression impact**. This atom touches only NEW files in `scripts/smoke/` and `docs/audits/`, so the iter 37 vitest 13338 baseline is preserved. No `src/**`, `supabase/**`, or `tests/**` modifications.

## 11. Final verdict for the team

**STT live end-to-end iter 37 close: BROKEN.** Maker-1 iter 37 Phase 1 A4 ship is correct at the layer it fixed (Edge Function input handler) but is necessary, not sufficient. The downstream CF Whisper rejection is the root cause and was not addressed in iter 37. The iter 31-32 carryover note "CF format deeper iter 32+" is **STILL open**.

Recommendation for orchestrator: cap Box 8 STT contribution to ZERO until a follow-up iter (38 P0 candidate) either fixes the CF binding shape or migrates to Voxtral native STT. Cap Box 14 INTENT exec end-to-end at the existing 0.85 (text path only — voice path is unverifiable end-to-end while STT is broken).

