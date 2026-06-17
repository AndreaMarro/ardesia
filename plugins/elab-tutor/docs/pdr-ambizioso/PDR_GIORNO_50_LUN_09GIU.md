# PDR Giorno 50 — Lunedì 09/06/2026

**Sett 8** (RELEASE) | Andrea 8h + Tea 4h | Goal: **OpenClaw layer docente completo (comandi avanzati)**.

## Task del giorno
1. **(P0) DEV: comandi Telegram completi (`/lezione_oggi`, `/studente_X`, `/dashboard`, `/nudge_classe`)** (4h)
2. **(P0) DEV: report PDF generation Telegram (`/report_settimana`)** (2.5h)
3. **(P0) TESTER: bot E2E test 20 comandi (PTC parallel)** (1.5h)
4. **(P2) Tea: doc finale layer docente Telegram per UAT** (Tea 4h)

## Multi-agent dispatch
```
@team-dev "OpenClaw comandi avanzati. Report PDF generation via puppeteer or pdfkit."
@team-tester "E2E test 20 comandi. Acceptance: tutti rispondono <5s, output coerente."
```

## DoD
- [ ] 20 comandi Telegram operational
- [ ] /report_settimana PDF gen
- [ ] E2E test 20/20 PASS
- [ ] Tea doc UAT pronto
- [ ] Handoff

## Handoff
`docs/handoff/2026-06-09-end-day.md`
