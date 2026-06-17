# PDR Giorno 38 — Mercoledì 28/05/2026

**Sett 6** | Andrea 8h + Tea 4h | Goal: **Whisper Turbo Cloudflare Workers AI**.

## Task del giorno
1. **(P0) Andrea: signup Cloudflare Workers AI (free tier 10K/day)** (30 min)
2. **(P0) DEV: API wrapper STT (audio → text)** (2.5h)
3. **(P0) TESTER: 50 voice sample test (Italian children speech)** (2h)
4. **(P1) ARCHITECT: ADR-012 Whisper Turbo CF vs OpenAI Whisper API** (1h)
5. **(P2) Tea: PR vol 3 cap 1 esperimenti** (Tea 4h)

## Multi-agent dispatch
```
@team-dev "Cloudflare Workers AI Whisper Turbo wrapper. Endpoint /stt accept audio blob."
@team-tester "50 voice sample test. Includere accent regionali Italia (Nord, Sud, isole)."
@team-architect "ADR-012 Whisper Turbo CF (free 10K/day) vs OpenAI ($0.006/min)."
```

## DoD
- [ ] CF Workers AI account
- [ ] STT endpoint working
- [ ] 50 sample test pass (WER <10%)
- [ ] ADR-012 scritto
- [ ] Tea PR
- [ ] Handoff

## Handoff
`docs/handoff/2026-05-28-end-day.md`
