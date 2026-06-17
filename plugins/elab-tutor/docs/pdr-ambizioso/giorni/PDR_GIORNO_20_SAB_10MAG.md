# PDR Giorno 20 — Sabato 10/05/2026

**Sett 3** | Andrea 6h sabato | Goal: **Anthropic fallback + Sentry monitoring + AUDITOR live verify**.

## Task del giorno
1. **(P0) DEV: fallback chain Together → Anthropic Claude (rate limit, error 5xx)** (2h)
2. **(P0) DEV: Sentry integration error tracking Edge Function** (1.5h)
3. **(P0) AUDITOR: live verify fallback scenario (kill Together, verify Anthropic kicks in)** (1.5h)
4. **(P1) TESTER: integration test fallback chain** (1h)

## Multi-agent dispatch
```
@team-dev "Fallback chain Together → Anthropic Sonnet. Trigger: 429 rate limit OR 5xx OR timeout 10s. Sentry integration."
@team-auditor "Kill Together AI temporarily (mock 503). Verify Anthropic fallback transparent. Output evidence."
```

## DoD
- [ ] Fallback chain implementato
- [ ] Sentry tracking integrato
- [ ] AUDITOR fallback verify PASS
- [ ] Handoff

## Handoff
`docs/handoff/2026-05-10-end-day.md`
