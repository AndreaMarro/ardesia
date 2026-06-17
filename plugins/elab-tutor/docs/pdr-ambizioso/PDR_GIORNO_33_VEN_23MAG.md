# PDR Giorno 33 — Venerdì 23/05/2026

**Sett 5** | Andrea 8h + Tea 4h | Goal: **Multi-step chains state machine 3 esempi + call settimanale**.

## Task del giorno
1. **(P0) ARCHITECT: design state machine multi-step (retry/rollback)** (1.5h)
2. **(P0) DEV: 3 chain implementati** (4h):
   - Chain 1: "Spiega circuito" → search_book + capture + diagnose + cite
   - Chain 2: "Fix errore" → diagnose + suggest_fix + apply + verify
   - Chain 3: "Lezione completa" → mount + explain + interactive + report
3. **(P0) TESTER: chain E2E test 3 scenario** (1.5h)
4. **(P1) Andrea + Tea: call settimanale 18:00 Telegram** (1h)

## Multi-agent dispatch
```
@team-architect "State machine multi-step chain. Retry/rollback on failure. docs/architectures/multi-step-chain-sm.md."
@team-dev "3 chain implementati. Retry max 2 per step. Rollback via state tracking."
@team-tester "E2E 3 chain scenario. Edge case: fail step N → rollback N-1."
```

## DoD
- [ ] State machine design docato
- [ ] 3 chain operative
- [ ] E2E test PASS
- [ ] Call Tea fatta
- [ ] Handoff

## Handoff
`docs/handoff/2026-05-23-end-day.md`
