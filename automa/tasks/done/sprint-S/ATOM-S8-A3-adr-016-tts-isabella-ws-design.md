---
id: ATOM-S8-A3
sprint: S-iter-8
priority: P0
owner: architect-opus
phase: 1
deps: []
created: 2026-04-27
---

## Task
Design ADR-016 TTS Isabella WebSocket Deno migration (replace iter 6 HTTP stub with rany2/edge-tts WSS protocol).

## Acceptance criteria
- [ ] CoV vitest 12599+ PASS preserved (read-only verify)
- [ ] build PASS exit 0 (defer if heavy)
- [ ] file ownership respected — write ONLY `docs/adrs/ADR-016-*.md` + `automa/team-state/messages/architect-*.md`
- [ ] ADR ~400 LOC YAML frontmatter complete
- [ ] Sections: Context (iter 6 edge-tts-client.ts 162 LOC HTTP stub gap), Decision (Microsoft Edge TTS WSS endpoint `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1`), Consequences, Implementation (Deno WebSocket protocol details, SSML payload, audio frame parsing), Test Plan (B4 TTS Isabella 50 sample bench), Rollback (revert to HTTP stub iter 6)
- [ ] Reference rany2/edge-tts protocol mandatory — handshake + Trusted-Client-Token header + SSML config message + audio chunked frames
- [ ] Voice: `it-IT-IsabellaNeural` confirmed (Andrea iter 5 P3 approval)
- [ ] B4 pass thresholds: latency p50 <2s, p95 <5s, MOS ≥4.0/5, success ≥98%
- [ ] Alternatives evaluated: Coqui XTTS-v2 self-hosted (GPU dependency), ElevenLabs Italian (cost), Voxtral 4B (early-access)
- [ ] PRINCIPIO ZERO + MORFISMO compliance: voice register italiano narrator volumi
- [ ] BLOCKS ATOM-S8-A4 (gen-app-opus impl)

## Output files
- `docs/adrs/ADR-016-tts-isabella-websocket-deno-migration-2026-04-27.md` (NEW, ~400 LOC)
- `automa/team-state/messages/architect-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` (completion or batched with ADR-015)

## Done when
ADR-016 file exists ≥350 LOC, WSS protocol details documented, SSML payload schema present, B4 thresholds documented.
