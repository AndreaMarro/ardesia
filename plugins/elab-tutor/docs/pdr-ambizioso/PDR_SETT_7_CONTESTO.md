# PDR Settimana 7 — Contesto Profondo: AST + Memoria Multi-Livello + Vision + DALL-E

**Periodo**: lunedì 02/06/2026 → domenica 08/06/2026
**Owner**: Andrea + Tea + Team Opus
**Goal**: UNLIM **comprensione contesto ultra-profonda** = AST analyzer Arduino + memoria multi-livello (student/class/teacher/school) + Vision live + DALL-E generation. **Score target**: 8.5/10.

---

## 0. Definizione "comprensione contesto ultra-profonda"

UNLIM capisce:
1. **AST Arduino code** (non solo testo, struttura semantica)
2. **Memoria 4-livello** (studente persistente, classe, docente, scuola)
3. **Stato circuito + codice + tempo** (cross-reference)
4. **Vision real-time** (camera + screenshot diagnose)
5. **DALL-E generation** (illustrazioni custom on-demand)
6. **Sentiment classe** (analisi engagement live)

---

## 1. Obiettivi misurabili sett 7

| Obiettivo | Target |
|-----------|--------|
| AST analyzer Arduino C++ funzionante | sì |
| Memoria 4-livello Supabase tables | sì |
| Vision endpoint (Llava o GPT-4V) | sì |
| DALL-E API integration | sì |
| Sentiment classe analyzer | sì |
| Score benchmark | 8.5 |
| Test count | 13756+ |
| OpenClaw Telegram bot operational | sì |

---

## 2. Task breakdown 7 giorni

### Lun 02/06 — AST analyzer Arduino

- DEV: install `tree-sitter-c-cpp` parser
- DEV: AST extractor (pinMode, digitalWrite, loop structure, variables)
- TESTER: 50 sketch test parsing
- File: `giorni/PDR_GIORNO_43_LUN_02GIU.md`

### Mar 03/06 — Memoria multi-livello schema

- ARCHITECT: design schema 4-tier (student/class/teacher/school)
- DEV: Supabase tables + RLS policies
- DEV: API service `unlimMemory` (read/write 4-tier)
- TESTER: integration test multi-tier query
- File: `giorni/PDR_GIORNO_44_MAR_03GIU.md`

### Mer 04/06 — Vision live (Llava)

- DEV: deploy Llava 7B su RunPod (vision model)
- DEV: tool `vision_diagnose` integration
- TESTER: 20 screenshot test (LED sbagliato, wire missing, etc.)
- File: `giorni/PDR_GIORNO_45_MER_04GIU.md`

### Gio 05/06 — DALL-E integration

- DEV: OpenAI API integration (DALL-E 3)
- DEV: tool `generate_illustration` (on-demand custom)
- TESTER: cost monitoring (DALL-E $0.04/image, cap 10/sett initial)
- File: `giorni/PDR_GIORNO_46_GIO_05GIU.md`

### Ven 06/06 — Sentiment classe analyzer

- ARCHITECT: blueprint sentiment (input: nudge response rate + voice activation count)
- DEV: implementa sentiment service
- DEV: dashboard display "engagement live"
- Tea: PR esperimenti Vol 3 cap 8-9 (final)
- File: `giorni/PDR_GIORNO_47_VEN_06GIU.md`

### Sab 07/06 — OpenClaw Telegram bot

- DEV: completa OpenClaw bot (continuation sett 6 wireframe)
- DEV: comandi Telegram base (`/status`, `/nudge`, `/report`)
- TESTER: bot E2E test
- AUDITOR: live verify contesto profondo (50 query random)
- File: `giorni/PDR_GIORNO_48_SAB_07GIU.md`

### Dom 08/06 — Handoff sett 7

- Handoff: `docs/handoff/2026-06-08-end-sett7.md`
- Score 8.5 verify
- File: `giorni/PDR_GIORNO_49_DOM_08GIU.md`

---

## 3. Costi sett 7

| Voce | Costo |
|------|-------|
| Together AI | ~€20 |
| Hetzner CX31 | €8.21 |
| RunPod Llava (~30h) | ~€12 |
| OpenAI DALL-E (10 image test) | ~€0.40 |
| **TOTALE settimana 7** | **~€41** |

---

## 4. Definition of Done sett 7

- [x] AST analyzer parsing 50/50 sketch
- [x] Memoria 4-tier schema + API
- [x] Vision endpoint Llava operational
- [x] DALL-E integration cost-controlled
- [x] Sentiment classe live
- [x] OpenClaw bot operational
- [x] Score ≥8.5

---

**Forza ELAB. Sett 7 inizia lun 02/06.**
