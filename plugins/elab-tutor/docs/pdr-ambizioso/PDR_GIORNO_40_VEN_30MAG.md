# PDR Giorno 40 — Venerdì 30/05/2026

**Sett 6** | Andrea 8h + Tea 4h | Goal: **Apostrophe bug fix + 36 voice command E2E + Tea Vol 3 cap 6-7**.

## Task del giorno
1. **(P0) DEV: fix apostrophe TTS bug (Italian "l'errore" preservato)** (1.5h)
2. **(P0) TESTER: PTC use case 8 — 36 voice command E2E parallel Semaphore(6)** (3h)
3. **(P1) Tea: PR esperimenti Vol 3 cap 6-7** (Tea 4h)
4. **(P1) Andrea + Tea: call settimanale 18:00 Telegram** (1h)
5. **(P2) DEV: regression test full** (1h)

## Multi-agent dispatch
```
@team-dev "Fix apostrophe TTS. src/services/api.js process text pre-TTS preserve apostrophes."
@team-tester "PTC 36 voice command E2E. Vedi PROGRAMMATIC_TOOL_CALLING.md use case 8."
```

## DoD
- [ ] Apostrophe bug fix verified
- [ ] 36/36 voice command PASS
- [ ] Tea PR
- [ ] Call Tea fatta
- [ ] Regression PASS
- [ ] Handoff

## Handoff
`docs/handoff/2026-05-30-end-day.md`
