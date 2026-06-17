---
id: ATOM-S8-A4
sprint: S-iter-8
priority: P0
owner: gen-app-opus
phase: 1
deps: [ATOM-S8-A3]
created: 2026-04-27
---

## Task
Rewrite `supabase/functions/_shared/edge-tts-client.ts` (iter 6 HTTP stub 162 LOC) to WebSocket protocol per ADR-016 + rany2/edge-tts reference.

## Acceptance criteria
- [ ] CoV vitest 12599+ PASS preserved (existing 18 unit tests `tests/unit/edge-tts-isabella.test.js` MUST still pass with new impl OR updated to new contract)
- [ ] build PASS exit 0 (defer if heavy)
- [ ] file ownership respected — write ONLY `supabase/functions/_shared/edge-tts-client.ts` + `supabase/functions/unlim-tts/index.ts` + `automa/team-state/messages/gen-app-*.md`
- [ ] WSS endpoint `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4`
- [ ] Handshake: Sec-MS-GEC + Sec-MS-GEC-Version headers (compute via UUID + timestamp)
- [ ] SSML payload: voice `it-IT-IsabellaNeural`, rate/pitch/volume params
- [ ] Audio frames parsing: binary WS messages with `Path:audio` header → concat OGG/MP3 chunks
- [ ] Total impl ~200-400 LOC TypeScript Deno-compatible (Deno.upgradeWebSocket NOT needed — client mode)
- [ ] Function signature preserved: `synthesizeIsabella(text: string, opts?: {rate?, pitch?, volume?}): Promise<Uint8Array>`
- [ ] Error handling: timeout 10s, retry 1x, fallback throw with diagnosable message
- [ ] PRINCIPIO ZERO + MORFISMO compliance: testo italiano dei volumi sintetizzato verbatim, no truncation

## Output files
- `supabase/functions/_shared/edge-tts-client.ts` (REWRITTEN, ~200-400 LOC, was 162 stub)
- `supabase/functions/unlim-tts/index.ts` (MODIFIED if needed, ~5-10 LOC contract sync)
- `automa/team-state/messages/gen-app-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` (completion)

## Done when
WS protocol implemented, handshake working, audio frames assembled, function signature preserved, completion msg emitted.
