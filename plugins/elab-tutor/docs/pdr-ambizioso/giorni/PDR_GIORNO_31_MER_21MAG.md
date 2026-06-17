# PDR Giorno 31 — Mercoledì 21/05/2026

**Sett 5** | Andrea 8h + Tea 4h | Goal: **Tool 24-27 diagnostica + rule engine 15+ pattern**.

## Task del giorno
1. **(P0) ARCHITECT: rule engine schema (15+ pattern, vedi PDR_SETT_5 sezione 4)** (1.5h)
2. **(P0) DEV: diagnostica engine + 4 tool wrapper (diagnose_circuit, suggest_fix, solution_hint, split_suggestion)** (4h)
3. **(P0) TESTER: 15 pattern test ognuno con scenario edge case** (2.5h)
4. **(P2) Tea: PR vol 2 cap 7 esperimenti** (Tea 4h)

## Multi-agent dispatch
```
@team-architect "Rule engine schema 15+ pattern. docs/architectures/diagnostica-rule-engine.md."
@team-dev "Implement engine + 4 tool wrapper. Match pattern → diagnosi → remediation."
@team-tester "15 scenario test ognuno. tests/integration/diagnostica-rules.test.js."
```

## DoD
- [ ] Rule engine schema docato
- [ ] 4 tool diagnostica implementati
- [ ] 15+ pattern test PASS
- [ ] Tea PR
- [ ] Handoff

## Handoff
`docs/handoff/2026-05-21-end-day.md`
