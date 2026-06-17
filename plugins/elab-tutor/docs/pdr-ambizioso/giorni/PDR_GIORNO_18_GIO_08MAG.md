# PDR Giorno 18 — Giovedì 08/05/2026

**Sett 3** | Andrea 8h + Tea 3h | Goal: **Tool 3+4+5 (highlight, serial_write, diagnose_circuit)**.

## Task del giorno
1. **(P0) DEV: tool `highlight_component` (forward browser SSE)** (1.5h)
2. **(P0) DEV: tool `serial_write` (Arduino emulation bridge)** (1.5h)
3. **(P0) DEV: tool `diagnose_circuit` (rule-based + LLM)** (3h)
4. **(P0) TESTER: 5/5 tools E2E test (PTC parallel)** (2h)
5. **(P2) Tea: PR glossario Vol 2 cap 1 (auto-merge)** (Tea 3h)

## Multi-agent dispatch
```
@team-dev "Implement tool 3 highlight_component, tool 4 serial_write, tool 5 diagnose_circuit. Examples obbligatori per accuracy 90%."
@team-tester "PTC parallel test 5 tools. tests/integration/edge-tools-5.test.js."
@team-reviewer "Review 5 tool def + examples accuracy."
```

## DoD
- [ ] Tool 3+4+5 implementati
- [ ] Tool examples per accuracy 90%
- [ ] 5/5 tool E2E PASS
- [ ] Tea PR
- [ ] Handoff

## Handoff
`docs/handoff/2026-05-08-end-day.md`
