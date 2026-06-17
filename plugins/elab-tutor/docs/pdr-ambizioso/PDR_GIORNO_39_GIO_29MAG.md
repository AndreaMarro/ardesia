# PDR Giorno 39 — Giovedì 29/05/2026

**Sett 6** | Andrea 8h + Tea 4h | Goal: **openWakeWord browser-side custom "Ehi UNLIM"**.

## Task del giorno
1. **(P0) DEV: install openWakeWord browser-side (custom train "Ehi UNLIM")** (3h)
2. **(P0) DEV: WebAudio API integration browser** (2h)
3. **(P0) TESTER: false positive rate test (target <5% in 1h normal speech)** (2h)
4. **(P2) Tea: PR vol 3 cap 2** (Tea 4h)

## Multi-agent dispatch
```
@team-dev "openWakeWord browser. Custom train 'Ehi UNLIM' italiano. WebAudio capture continuo low-power."
@team-tester "False positive 1h speech ambient. Target <5%. Misurare wake-up latency <500ms."
```

## DoD
- [ ] Wake word "Ehi UNLIM" funzionante
- [ ] False positive <5%
- [ ] Latency wake <500ms
- [ ] Tea PR
- [ ] Handoff

## Rischi
- openWakeWord training Italian custom richiede dataset → use few-shot Anthropic + augmentation
- WebAudio permissions browser → onboarding educativo per docente

## Handoff
`docs/handoff/2026-05-29-end-day.md`
