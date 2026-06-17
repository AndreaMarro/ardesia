# PDR Giorno 36 — Lunedì 26/05/2026

**Sett 6** (VOICE) | Andrea 8h + Tea 4h | Goal: **Voxtral 4B deploy Hetzner + HTTP API wrapper**.

## Task del giorno
1. **(P0) DEV: setup container Voxtral 4B Hetzner (GPU shared OK)** (3h)
2. **(P0) DEV: HTTP API wrapper (text → mp3 audio)** (2h)
3. **(P0) TESTER: latency test (target <2s per 60-word response)** (2h)
4. **(P0) ARCHITECT: ADR-011 Voxtral vs ElevenLabs vs Edge TTS Microsoft** (1h)
5. **(P2) Tea: PR Vol 2 cap 9** (Tea 4h)

## Multi-agent dispatch
```
@team-architect "ADR-011 TTS provider scelta. Quality + cost + GDPR. docs/decisions/ADR-011-tts-voxtral.md."
@team-dev "Deploy Voxtral 4B Hetzner. HTTP wrapper /tts endpoint."
@team-tester "Latency test 50 phrase Italian. Target <2s 60-word."
```

## DoD
- [ ] Voxtral container running
- [ ] HTTP /tts endpoint working
- [ ] Latency <2s 60-word
- [ ] ADR-011 scritto
- [ ] Tea PR
- [ ] Handoff

## Rischi
- Voxtral GPU richiesta ma shared limitato → CPU OK più lento (3-4s acceptable)
- Voxtral pronuncia italiana subottimale → fallback Edge TTS Microsoft già attivo

## Handoff
`docs/handoff/2026-05-26-end-day.md`
