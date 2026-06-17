# PDR Settimana 5 — Onnipotenza: 30+ Tool Calls + Diagnostica Rules + Multi-Step Chains

**Periodo**: lunedì 19/05/2026 → domenica 25/05/2026
**Owner**: Andrea + Tea + Team Opus
**Goal**: UNLIM **onnipotente** = 30+ tool call integrate + diagnostica rule engine 15+ pattern + multi-step chains state machine. **Score target**: 8.0/10.

---

## 0. Definizione "onnipotenza" UNLIM

UNLIM **onnipotente** = pilota a 360° simulatore + lavagna + Arduino + dashboard + RAG con:

1. **30+ tool call** invokable runtime
2. **Diagnostica rule engine** 15+ pattern circuit errors
3. **Multi-step chains** state machine con retry/rollback
4. **Programmatic Tool Calling** per batch ops
5. **Decisioni autonome** complesse (es. "spiega questo circuito")

---

## 1. Lista 30+ tool call ELAB

### Tool simulatore (10)

1. `get_circuit_state` — read components + wires
2. `mount_experiment` — load esperimento da catalogo
3. `add_component` — add LED/Resistore/etc.
4. `connect_wire` — wire from-to
5. `set_component_value` — modifica resistance/voltage
6. `clear_circuit` — wipe canvas
7. `highlight_component` — visual highlight
8. `highlight_pin` — pin highlight
9. `clear_highlights` — wipe highlight
10. `capture_screenshot` — base64 image

### Tool Arduino (5)

11. `compile_arduino` — C++ → HEX (n8n)
12. `upload_hex` — HEX → AVR emulation
13. `serial_write` — write Arduino serial
14. `serial_read` — read Arduino output
15. `pause_resume_simulation` — control AVR

### Tool RAG + book (4)

16. `search_book_text` — RAG retrieval
17. `cite_book_page` — pag. number lookup
18. `get_glossary_term` — termine + analogia
19. `get_experiment_metadata` — esperimento detail

### Tool dashboard + sessions (4)

20. `get_class_progress` — Supabase classe stats
21. `save_session` — Supabase persist
22. `load_sessions` — Supabase retrieve
23. `nudge_class` — broadcast nudge

### Tool diagnostica (4)

24. `diagnose_circuit` — rule engine + LLM
25. `suggest_fix` — remediation suggestion
26. `solution_hint` — hint progressivo
27. `split_suggestion` — semplifica circuit

### Tool voice + vision (3)

28. `tts_speak` — Voxtral TTS
29. `stt_transcribe` — Whisper STT
30. `vision_diagnose` — screenshot → LLM vision

### Tool report + UI (3)

31. `generate_report_fumetto` — apri Report
32. `toggle_drawing` — lavagna drawing mode
33. `set_ui_panel` — control panel visibility

**Totale: 33 tool**.

---

## 2. Obiettivi misurabili sett 5

| Obiettivo | Target |
|-----------|--------|
| 33 tool definite + invokable | 33/33 |
| Tool examples ogni def (accuracy 90%) | 33/33 |
| Diagnostica rule engine 15+ pattern | sì |
| Multi-step chains 3+ esempio | sì |
| PTC use case 8+ implementati | sì |
| Score benchmark | 8.0 |
| Test count | 13156+ |
| Tea PR ≥6 | ≥6 |
| Live verify 33 tool E2E | 33/33 |

---

## 3. Task breakdown 7 giorni

### Lun 19/05 — Tool 1-15 (simulator + Arduino)

- DEV: implementa 15 tool def con examples (vedi PROGRAMMATIC_TOOL_CALLING.md sez 5)
- TESTER: PTC parallel test 15 tool (vedi use case 8)
- File: `giorni/PDR_GIORNO_29_LUN_19MAG.md`

### Mar 20/05 — Tool 16-23 (RAG + dashboard)

- DEV: tool 16-23 implementati
- TESTER: integration test ogni tool
- File: `giorni/PDR_GIORNO_30_MAR_20MAG.md`

### Mer 21/05 — Tool 24-27 (diagnostica)

- ARCHITECT: rule engine schema (15+ pattern)
- DEV: diagnostica engine + 4 tool wrapper
- TESTER: 15 pattern test ognuno con scenario
- File: `giorni/PDR_GIORNO_31_MER_21MAG.md`

### Gio 22/05 — Tool 28-33 (voice + vision + UI)

- DEV: tool voice + vision + UI control
- TESTER: E2E test
- File: `giorni/PDR_GIORNO_32_GIO_22MAG.md`

### Ven 23/05 — Multi-step chains state machine

- ARCHITECT: design state machine multi-step (es. "diagnose + fix + verify")
- DEV: 3 chain esempi:
  - Chain 1: "Spiega circuito" → search_book + capture + diagnose + cite
  - Chain 2: "Fix errore" → diagnose + suggest_fix + apply + verify
  - Chain 3: "Lezione completa" → mount + explain + interactive + report
- TESTER: chain test E2E
- File: `giorni/PDR_GIORNO_33_VEN_23MAG.md`

### Sab 24/05 — PTC + monitoring

- DEV: implementa PTC per ogni batch op (CoV, audit, narrations)
- AUDITOR: live verify 33 tool funzionano + chain working
- File: `giorni/PDR_GIORNO_34_SAB_24MAG.md`

### Dom 25/05 — Handoff + score

- Handoff: `docs/handoff/2026-05-25-end-sett5.md`
- Score 8.0 target verify
- File: `giorni/PDR_GIORNO_35_DOM_25MAG.md`

---

## 4. Diagnostica rule engine — 15+ pattern

| Pattern | Trigger | Diagnosi | Remediation |
|---------|---------|----------|-------------|
| LED no light + wired | LED on, no current | Polarity reversed OR resistor too high | Swap LED, reduce R |
| Short circuit | Power directly to GND | Wire missing component | Insert resistor |
| Open circuit | Component floating | Wire disconnect | Reconnect wire |
| Wrong polarity capacitor | Polarized cap reversed | Polarity match anode/cathode | Swap orientation |
| MOSFET no switch | Gate not driven | Gate floating OR threshold not reached | Drive gate, check Vgs |
| Arduino pin output low | digitalWrite HIGH no signal | Pin mode INPUT default | Set pinMode OUTPUT |
| Serial no output | Serial.print no result | Baud rate mismatch | Match Serial.begin |
| Pull-up missing | Button reads random | Floating input | Add pull-up R or INPUT_PULLUP |
| PWM not working | analogWrite no fade | Pin not PWM-capable | Use 3, 5, 6, 9, 10, 11 |
| ADC reads 0 or 1023 | analogRead noise | Floating analog input | Connect to known voltage |
| I2C no response | Wire.requestFrom timeout | Address wrong OR no pull-up SDA/SCL | Check addr, add pull-up |
| ... 4+ more | ... | ... | ... |

---

## 5. Costi sett 5

| Voce | Costo |
|------|-------|
| Together AI (heavy 33 tool test) | ~€25 |
| RunPod testing GPU | ~€8 |
| Hetzner CX31 | €8.21 |
| **TOTALE settimana 5** | **~€41** |

---

## 6. Definition of Done sett 5

- [x] 33/33 tool def + examples
- [x] 33/33 tool E2E test PASS
- [x] Diagnostica engine 15+ pattern
- [x] 3 multi-step chains operative
- [x] PTC 8+ use case
- [x] Score ≥8.0
- [x] Test ≥13156

---

## 7. Self-critica

- 33 tool + diagnostica + chains in 7 giorni = **molto ambizioso**.
- Realistic: 25-30 tool sett 5, 3-5 slip a sett 6.
- Diagnostica rule engine richiede dataset edge case Tea (BOM-aware).

**Forza ELAB. Sett 5 inizia lun 19/05.**
