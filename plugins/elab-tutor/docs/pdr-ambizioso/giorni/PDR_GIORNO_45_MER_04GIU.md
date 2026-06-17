# PDR Giorno 45 — Mercoledì 04/06/2026

**Sett 7** | Andrea 8h + Tea 4h | Goal: **Vision live (Llava 7B su RunPod)**.

## Task del giorno
1. **(P0) DEV: deploy Llava 7B su RunPod (vision model)** (2h)
2. **(P0) DEV: tool `vision_diagnose` integration Edge Function** (2.5h)
3. **(P0) TESTER: 20 screenshot test (LED sbagliato, wire missing, etc.)** (2.5h)
4. **(P2) Tea: PR vol 3 cap 4** (Tea 4h)

## Multi-agent dispatch
```
@team-dev "Deploy Llava 7B RunPod. /vision endpoint accept image base64."
@team-tester "20 circuit screenshot test. Each: expected diagnosis vs actual Llava output."
```

## DoD
- [ ] Llava 7B endpoint operational
- [ ] vision_diagnose tool working
- [ ] 20 screenshot test PASS (≥85% accuracy)
- [ ] Tea PR
- [ ] Handoff

## Handoff
`docs/handoff/2026-06-04-end-day.md`
