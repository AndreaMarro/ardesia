# PDR Settimana 4 — Onniscienza: RAG 6000+ chunk + Glossario Tea + BOM

**Periodo**: lunedì 12/05/2026 → domenica 18/05/2026
**Owner**: Andrea + Tea + Team Opus
**Goal**: RAG corpus expansion da 549 a 6000+ chunk (Vol 1+2+3 fully indexed) + Tea glossario completo + BOM kit ELAB consolidato. **Score target**: 7.5/10.

---

## 0. Definizione "onniscienza" UNLIM

UNLIM **onnisciente** = sa tutto su:
1. **Volumi fisici**: 100% testo Vol 1+2+3 indicizzato (~3500 pagine)
2. **Esperimenti**: 92/92 con bookText + components + AVR sketch
3. **Glossario**: 200+ termini elettrotecnica/Arduino con analogie 10-14 anni
4. **FAQ**: 100+ domande comuni con risposte Principio Zero v3
5. **Errori comuni**: 50+ pattern + diagnosi + remediation
6. **Analogie**: 80+ pre-validate (strade, tubi, ricetta, etc.)
7. **Codice esempio**: 200+ snippet Arduino/Scratch con commenti
8. **BOM hardware**: ogni componente kit ELAB con specs + uso

**Target chunk**: 6000+ (~6x current 549).

---

## 1. Obiettivi misurabili sett 4

| Obiettivo | Target |
|-----------|--------|
| RAG chunk total | 6000+ |
| Vol 1+2+3 100% indexed | sì |
| Glossario 200+ termini Tea | sì |
| FAQ 100+ Q&A | sì |
| Errori comuni 50+ pattern | sì |
| Analogie 80+ validate | sì |
| Codice esempio 200+ snippet | sì |
| BOM kit ELAB consolidato | sì |
| Recall query test ≥0.90 | sì |
| Score benchmark | 7.5 |
| Test count | 12856+ |
| Tea PR auto-merge ≥6 | ≥6 |

---

## 2. Task breakdown 7 giorni

### Lun 12/05 — Vol 1+2+3 chunk generation 5500+

- DEV: PTC use case 6 (vedi PROGRAMMATIC_TOOL_CALLING.md) — split chunks parallel
- DEV: 5500+ chunk generated da Vol 1+2+3
- TESTER: chunk quality test (no fragmenti, paragrafi semantici)
- File: `giorni/PDR_GIORNO_22_LUN_12MAG.md`

### Mar 13/05 — Embedding + pgvector insert

- DEV: PTC use case 5 — BGE-M3 embedding 6000+ chunk parallel (Semaphore 16)
- DEV: pgvector insert Supabase (batch 500 row/insert)
- TESTER: recall test 50 query → top-5 retrieval verify
- File: `giorni/PDR_GIORNO_23_MAR_13MAG.md`

### Mer 14/05 — Glossario Tea completion

- Tea: PR finale glossario 200+ termini (cumulative + Vol 3 finale)
- DEV: integra glossario in RAG corpus (chunk per termine + analogia)
- TESTER: glossario coverage test (100% termini key da Vol 1+2+3 presenti)
- File: `giorni/PDR_GIORNO_24_MER_14MAG.md`

### Gio 15/05 — FAQ + Errori comuni

- ARCHITECT: design schema FAQ + Errori (Q/A + pattern/remediation)
- DEV: 100+ FAQ + 50+ errori scritti (con Tea collaboration)
- DEV: chunk FAQ + Errori embedded
- File: `giorni/PDR_GIORNO_25_GIO_15MAG.md`

### Ven 16/05 — Analogie + Codice esempio

- Tea: 80+ analogie validate (strade, tubi, ricetta, etc.)
- DEV: 200+ snippet codice Arduino/Scratch da volumi
- DEV: chunk Analogie + Codice embedded
- Call settimanale Andrea + Tea (1h)
- File: `giorni/PDR_GIORNO_26_VEN_16MAG.md`

### Sab 17/05 — BOM kit + integration test

- Andrea + Tea + Omaric: call BOM finalizzazione (kit ELAB completo)
- DEV: BOM tradotto in JSON `src/data/bom-kit-elab.json`
- DEV: chunk BOM embedded (componenti specs + uso)
- AUDITOR: live verify UNLIM onniscienza (50 query random → recall ≥0.90)
- File: `giorni/PDR_GIORNO_27_SAB_17MAG.md`

### Dom 18/05 — Handoff + score check

- Handoff: `docs/handoff/2026-05-18-end-sett4.md`
- benchmark.cjs --write (target 7.5)
- claude-mem rebuild corpus
- File: `giorni/PDR_GIORNO_28_DOM_18MAG.md`

---

## 3. Costi sett 4

| Voce | Costo |
|------|-------|
| Together AI (heavy use RAG validation) | ~€20 |
| Hetzner CX31 | €8.21 |
| BGE-M3 inference (Hetzner self-host) | €0 (incluso) |
| Supabase pgvector storage (~50MB) | €0 (free tier OK) |
| **TOTALE settimana 4** | **~€28** |

---

## 4. Definition of Done sett 4

- [x] 6000+ chunk RAG total
- [x] Recall ≥0.90 su 50 query test
- [x] 200+ glossario Tea
- [x] 100+ FAQ
- [x] 50+ errori comuni
- [x] 80+ analogie validate
- [x] 200+ codice snippet
- [x] BOM kit ELAB JSON
- [x] Score ≥7.5
- [x] Test ≥12856
- [x] Handoff completo

---

## 5. Self-critica

- 6000+ chunk = volume enorme. Quality control campionato (10% random review Tea).
- BOM call con Omaric da schedulare con anticipo (lui vendite Arduino, busy).
- Glossario 200+ termini Tea in 4 settimane = 50/settimana. Realistic se Tea capacity 12h/sett.

**Forza ELAB. Sett 4 inizia lun 12/05.**
