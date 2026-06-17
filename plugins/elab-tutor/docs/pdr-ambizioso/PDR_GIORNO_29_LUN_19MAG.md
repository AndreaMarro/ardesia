# PDR Giorno 29 — Lunedì 19/05/2026

**Sett 5** (ONNIPOTENZA) | Andrea 8h + Tea 4h | Goal: **Tool 1-15 (simulator + Arduino) implementati con examples**.

## Task del giorno
1. **(P0) DEV: implementa tool 1-10 simulator (get_circuit_state, mount_experiment, add_component, connect_wire, set_value, clear_circuit, highlight_component, highlight_pin, clear_highlights, capture_screenshot)** (4h)
2. **(P0) DEV: implementa tool 11-15 Arduino (compile_arduino, upload_hex, serial_write, serial_read, pause_resume_simulation)** (2h)
3. **(P0) DEV: examples per ogni tool def (accuracy 90%)** (1h)
4. **(P0) TESTER: PTC parallel test 15 tool E2E** (1h)
5. **(P2) Tea: PR esperimenti vol 2 cap 5** (Tea 4h)

## Multi-agent dispatch
```
@team-architect "Schema 33 tool def (vedi PDR_SETT_5_ONNIPOTENZA.md sezione 1)."
@team-dev "Implement tool 1-15. Each with examples (Anthropic accuracy 90%)."
@team-tester "PTC parallel test 15 tool. tests/integration/edge-tools-15.test.js."
```

## DoD
- [ ] Tool 1-15 implementati + examples
- [ ] 15/15 E2E PASS
- [ ] Tea PR
- [ ] Handoff

## Handoff
`docs/handoff/2026-05-19-end-day.md`
