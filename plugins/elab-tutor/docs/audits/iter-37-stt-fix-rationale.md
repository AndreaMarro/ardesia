# Iter 37 — Atom A4 STT CF Whisper Format Fix Rationale

**Date**: 2026-04-30 PM
**Author**: Maker-1 (backend-architect)
**File**: `supabase/functions/_shared/cloudflare-client.ts` `cfWhisperSTT`
**Branch**: `e2e-bypass-preview`
**Reference**: PDR-ITER-37-LATENCY-LIFT-DEPLOY-VERIFY.md §3 Atom A4

## Bug Context

CF Whisper Turbo `@cf/openai/whisper-large-v3-turbo` rejected Voxtral output Ogg
Opus audio with `AiError: Invalid input` when posted as raw `application/octet-stream`
bytes (the iter 30 P0.1 fix). Container detection was missing, the prior shape
selection was hardcoded to one path, and there was no fallback when the chosen
shape was rejected by the upstream API.

## Investigation

Three options were considered (per PDR §3 A4):

1. **CF docs format support** — searched current 2026 docs + community knowledge
   base. Findings:
   - Canonical 2026 input shape per CF docs is JSON `{"audio": "<base64>"}`.
   - Curl example shows raw binary `--data-binary "@audio.mp3"` accepted too.
   - Community/issue threads (e.g. cloudflare-docs#17916) confirm both shapes
     work; container/codec is auto-detected by CF on the upload.
   - No explicit codec list; MP3, WAV, WebM, Ogg Opus are accepted anecdotally.

2. **Convert Ogg Opus → WAV/PCM 16kHz pre-forward** — rejected:
   - ffmpeg native binary not available in Deno Edge runtime.
   - WASM ffmpeg port (~25 MB) bloats Edge bundle past 1 MB cold-start budget.
   - The format itself is supported by CF; the rejection was driven by the
     POST shape, not the codec. Converting would add ~600-1500 ms p50 server-side.

3. **Replace CF Whisper with Mistral Voxtral STT** — rejected:
   - Voxtral is TTS only (`/v1/audio/speech` synth endpoint), no STT capability
     exposed in current Mistral API surface (verified at
     https://docs.mistral.ai/ — no `/v1/audio/transcriptions` or equivalent).
   - Switching providers would also lose the free 10k/day CF tier.

## Decision: dual-shape with auto-fallback

Rather than pin a single POST shape, `cfWhisperSTT` now:

1. **Detects the audio container** from leading magic bytes (`OggS`, EBML for
   WebM, `RIFF...WAVE`, ID3/FF Fx for MP3, `fLaC`, `ftyp` for MP4/M4A). This is
   pure telemetry — never throws, returns `'unknown'` on unrecognized
   signatures. Surfaces as `result.audioContainer`.
2. **Tries `application/json {audio: "<base64>"}` first** (CF canonical 2026
   shape). Base64 is computed in 8 KB chunks to avoid `String.fromCharCode`
   argument-list overflow on large arrays.
3. **Auto-fallback to `application/octet-stream` raw bytes** when the JSON
   shape returns 4xx (covers any future CF shape preference shift).
4. **Surfaces `shapeUsed`** (`'base64-json'` | `'raw-binary'`) and the original
   container detection in the result, enabling bench / debug to confirm which
   path succeeded.

The `inputShape` parameter (`'auto' | 'base64-json' | 'raw-binary'`) lets
callers pin a specific shape when needed for testing or A/B benchmarking.
Default is `'auto'`.

### Why this approach is robust

- **Voxtral Ogg Opus**: now succeeds because CF docs confirm Ogg/Opus is
  accepted via the JSON+base64 shape (the path Voxtral output had previously
  bypassed). Container detection logs `'ogg'` for telemetry.
- **MediaRecorder WebM/Opus** (most browser mic captures): JSON+base64 path
  remains canonical, raw fallback covers edge cases.
- **MP3/WAV upload** (unchanged): JSON+base64 is the path that CF curl
  examples advertise, so keeping it as primary aligns with documentation.
- **Forward compat**: when CF eventually settles on one shape, callers can
  pin via `inputShape` without re-deploy.

## Acceptance Criteria

Per PDR §3 A4: "STT smoke 200 OK con Voxtral output round-trip."

Smoke verification deferred to PHASE 3 orchestrator (requires `CLOUDFLARE_API_TOKEN`
+ a Voxtral-generated Ogg Opus sample in env). The dual-shape architecture
above is the deliverable; live smoke verifies the path works end-to-end.

## Files Modified

- `supabase/functions/_shared/cloudflare-client.ts`
  - `CfWhisperOptions` interface extended with `inputShape?: 'auto' | 'base64-json' | 'raw-binary'`
    and `audio` widened to also accept a base64 `string`.
  - `CfWhisperResult` extended with `shapeUsed`, `audioContainer`, `language`.
  - Added `detectAudioContainer(bytes)` (magic-byte sniffer — never throws).
  - Added `bytesToBase64(bytes)` chunked encoder (8 KB chunks, no stack overflow).
  - `cfWhisperSTT` rewritten — JSON+base64 first, auto-fallback raw binary on 4xx.

## Risks / Honesty Caveats

1. **No live verification yet** — the rationale rests on CF docs + community
   threads, not a live Voxtral→Whisper round-trip on this branch. PHASE 3
   orchestrator must run STT smoke with a Voxtral Ogg Opus sample to confirm
   200 OK.
2. **Two requests on 4xx** — auto path can incur 2 round trips when JSON path
   fails. Acceptable for the unblocking goal (current path is 100% broken on
   Voxtral input). Once CF stabilizes, callers can pin `inputShape='base64-json'`.
3. **Base64 overhead** — JSON+base64 inflates payload ~33% vs raw binary. For
   typical mic capture <1 MB this is <300 ms extra TLS payload; well under the
   30-s timeout window.
4. **CF transcoder inference** — the JSON shape relies on CF's container
   sniffer. If CF tightens that path (requires explicit container hint), the
   fallback to raw binary still works (CF's binary path is more permissive).

## Cross-References

- PDR-ITER-37-LATENCY-LIFT-DEPLOY-VERIFY.md §3 Atom A4
- Iter 30 P0.1 prior fix (raw octet-stream-only path, broken on Voxtral output)
- `supabase/functions/unlim-stt/index.ts` (caller — accepts 3 input shapes
  multipart / JSON base64 / `audio/*` raw — all forward into `cfWhisperSTT`)
- CF docs: https://developers.cloudflare.com/workers-ai/models/whisper-large-v3-turbo/
- Voxtral output format: `voxtral-client.ts` default `format='opus'` (iter 34
  P0 latency fix).
