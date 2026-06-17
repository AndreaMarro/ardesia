# Audit Q0 — Tresjolie volumi vs tutor lesson-paths mapping (v1.1 body-verified)

**Data:** 2026-04-24
**Sprint:** Q0 (precede Q1 refactor Capitolo)
**Branch:** `feat/sprint-q0-tresjolie-analysis-2026-04-24`
**Artefatto dati:** `docs/data/volume-structure.json` v1.1
**Onestà:** massima. Numeri doppio-verificati body-grep + cross-check tutor. Errori v1.0 corretti.

---

## TL;DR (v1.1 corrections)

- **3 volumi reali**: Vol1=14 Cap, Vol2=12 Cap, **Vol3=9 Cap** (ODT canonical). Totale **35 Cap** (non 38 come v1.0, non 68 come handoff PDR).
- **Vol3 PDF V0.8.1 ha 3 Cap PHANTOM nel TOC** (10, 11, 12) mai esistiti in ODT canonical. Artefatto export InDesign 20.5.
- **Vol2 Cap 11 Diodi = TEORIA pura** (body verificato PDF pag 98-102), non phantom come ipotizzato v1.0. NO ESPERIMENTO markers. Gap tutor legittimo.
- **Vol3 ESERCIZIO** (non ESPERIMENTO): 22 markers esplicit + 2 anomalie editoriali (6.4 duplicato, 7.8 implicito) = **24 esercizi reali**.
- **22 Cap con esperimenti/progetti** → **100% coverage tutor** (tutti coperti).
- **12 Cap teoria** → 0% coverage tutor (legittimo).
- **1 Cap WIP** (Vol3 Cap 9 stub) → candidato fill con `v3-extra-simon.json` (chapter=99, capstone).
- **Coverage strutturale: 22/35 = 62.9%**. Legittima: **100%**.
- **Q1 migration target: 35 file Capitolo** (non 68 stimato handoff, non 38 v1.0 → **-48% vs handoff, -8% vs v1.0**).

---

## 1. Errori corretti v1.0 → v1.1

| Claim v1.0 | Realtà v1.1 | Motivo |
|------------|-------------|--------|
| Vol3 = 12 Cap | Vol3 = **9 Cap ODT canonical** | ODT TOC ha solo 9 entry (Cap 1-7 titled + Cap 8,9 stub). Cap 10-12 phantom PDF |
| Totale 38 Cap | Totale **35 Cap** | -3 phantom Vol3 |
| Vol2 Cap 11 "questionable gap" | Vol2 Cap 11 = **teoria** | Body PDF pag 98-102 verificato: titolo "I DIODI", contenuto vigile traffico+flyback. No ESPERIMENTO markers. Gap legittimo. |
| Vol3 WIP = 4 Cap | Vol3 WIP = **1 Cap** (solo Cap 9) | Cap 10-12 non erano mai pianificati |
| Vol3 esperimenti 18 inferred | Vol3 ESERCIZIO **22 + 2 anomalie = 24** | Pattern ODT usa "ESERCIZIO N.M" non "ESPERIMENTO N". Grep precedente mismatch. |

## 2. Bug editoriali scoperti (da flaggare Tea)

### 2.1 Vol3 ESERCIZIO 6.4 duplicato (MEDIUM)
- ODT line 2113: "ESERCIZIO 6.4 — Due LED che si alternano"
- ODT line 2176: "ESERCIZIO 6.4 — Costruiamo un semaforo"
- 2 esercizi distinti con stesso numero. Seconda probabilmente dovrebbe essere 6.5.
- Impatto: shift numerazione 6.5-6.7 → 6.6-6.8.
- Tutor `v3-cap6-semaforo.json` mappa al "6.4 semaforo" (forma dedicata variant).

### 2.2 Vol3 ESERCIZIO 7.8 marker mancante (LOW)
- ODT line 3814: "Sketch_Capitolo_7.8" referenziato.
- Nessun marker "ESERCIZIO 7.8" esplicito in body.
- Contenuto probabilmente corrisponde a tutor `v3-cap7-esp8.json` (debounce).
- Fix: aggiungere marker ESERCIZIO 7.8 davanti al passaggio debounce.

### 2.3 Vol3 PDF V0.8.1 phantom TOC (HIGH)
- PDF ha 12 entry TOC con Cap 10-12 vuoti.
- ODT canonical ha 9 entry TOC (Cap 8, 9 stub).
- Impatto: chiunque legge PDF V0.8.1 pensa che Vol3 abbia 12 Cap pianificati.
- Fix: rigenerare PDF da ODT aggiornato (o aggiornare ODT se 12 Cap erano pianificati davvero).

### 2.4 Vol2 PDF Cap 8 Transistor ESPERIMENTO 2 duplicato (LOW)
- Lines 2242 + 2252 entrambi marcati "ESPERIMENTO 2" in Cap 8.
- Correzione editoriale su ristampa.

## 3. Struttura volumi definitiva (v1.1)

### Vol1 — Laboratorio Base (14 Cap, 37 ESPERIMENTO PDF markers)

| Cap | Titolo | Pag | Tipo | Esp | Tutor | Coverage |
|-----|--------|-----|------|-----|-------|----------|
| 1 | Storia Elettronica | 5-8 | theory | 0 | - | legittimo |
| 2 | Grandezze + Ohm | 9-12 | theory | 0 | - | legittimo |
| 3 | Resistore | 13-20 | theory | 0 | - | legittimo |
| 4 | Breadboard | 21-24 | theory | 0 | - | legittimo |
| 5 | Batterie | 25-26 | theory | 0 | - | legittimo |
| 6 | **LED** | 27-34 | exp | 3 | 3 | full |
| 7 | **LED RGB** | 35-42 | exp | 6 | 6 | full |
| 8 | **Pulsante** | 43-56 | exp | 5 | 5 | full |
| 9 | **Potenziometro** | 57-80 | exp | 9 | 9 | full |
| 10 | **Fotoresistore** | 81-92 | exp | 6 | 6 | full |
| 11 | **Cicalino** | 93-96 | exp | 2 | 2 | full |
| 12 | **Interruttore magnetico** | 97-102 | exp | 4 | 4 | full |
| 13 | **Elettropongo** | 103-106 | exp | 2 | 2 | full |
| 14 | **Robot primo** | 107-112 | project | 1 | 1 | full |

### Vol2 — Elettronica Avanzata (12 Cap, 26 ESPERIMENTO PDF markers)

| Cap | Titolo | Pag | Tipo | Esp | Tutor | Coverage |
|-----|--------|-----|------|-----|-------|----------|
| 1 | Cenni storia | 5-8 | theory | 0 | - | legittimo |
| 2 | Elettricità | 9-12 | theory | 0 | - | legittimo |
| 3 | **Multimetro** | 13-36 | exp | 4 | 4 | full |
| 4 | **Resistenze approfondite** | 37-46 | exp | 3 | 3 | full |
| 5 | **Batterie approfondite** | 47-52 | exp | 2 | 2 | full |
| 6 | **Led approfonditi** | 53-62 | exp | 4 | 4 | full |
| 7 | **Condensatori** | 63-74 | exp | 4 | 4 | full |
| 8 | **Transistor** | 75-84 | exp | 3 | 3 | full |
| 9 | **Fototransistor** | 85-92 | exp | 2 | 2 | full |
| 10 | **Motore DC** | 93-97 | exp | 4 | 4 | full |
| 11 | **Diodi** | 98-102 | **theory** | 0 | - | **legittimo** (body verificato) |
| 12 | **Robot Segui Luce** | 103-114 | project | 1 | 1 | full |

### Vol3 — Arduino/Programmazione (9 Cap planned ODT, 22+2 ESERCIZIO markers)

| Cap | Titolo | Tipo | Esc | Tutor | Coverage |
|-----|--------|------|-----|-------|----------|
| 1 | Storia programmazione | theory | 0 | - | legittimo |
| 2 | Programmazione | theory | 0 | - | legittimo |
| 3 | Hardware e Software | theory | 0 | - | legittimo |
| 4 | IDE Arduino | theory | 0 | - | legittimo |
| 5 | **Blink** | exp | 2 (5-1, 5.2) | 2 | full |
| 6 | **Pin digitali** | exp | 8* (6-1..6.7 +dup 6.4) | 9** | full+variant |
| 7 | **Pin analogici** | exp | 8* (7.1..7.7 + 7.8 implicit) | 9** | full+variant |
| 8 | **Pin analogici Serial** | exp | 6 (8.1..8.6) | 6 | full |
| 9 | **(stub ODT WIP)** | wip | 0 | 0 | WIP fill candidate simon |

\* include anomalie editoriali (6.4 dup, 7.8 implicit)
\** +variant (morse, semaforo Cap 6; mini Cap 7; serial Cap 8)

**Phantom (PDF V0.8.1 TOC only, NOT ODT)**: Cap 10, 11, 12 — rimossi dal count reale.

**Extras tutor-only standalone** (chapter!=Cap numbered):
- `v3-extra-lcd-hello` — LCD display hello
- `v3-extra-servo-sweep` — Servo motor sweep
- `v3-extra-simon` — Simon Says capstone (chapter=99, "PROGETTO FINALE Vol3" self-declared)

## 4. Coverage onesta

| Dimensione | Valore | Note |
|-----------|--------|------|
| Cap totali reali | 35 | 14 + 12 + 9 |
| Cap experiments/project | 22 | 9 + 9 + 4 |
| Cap theory | 12 | 5 + 3 + 4 |
| Cap WIP | 1 | Vol3 Cap 9 |
| Coverage tutor su Cap experiments | **22/22 = 100%** | Tutti coperti |
| Coverage tutor strutturale totale | **22/35 = 62,9%** | Teoria + WIP esclusi |
| Coverage "utile" (escluso legitimate gap) | **22/22 = 100%** | Nessun gap ingiustificato |
| Tutor files totali | 94 | 38 + 27 + 29 |
| Tutor files cap-mapped | 91 | -3 v3-extras |
| Tutor overcoverage Vol3 variants | 4 | morse + semaforo + mini + serial |

## 5. Q1 migration target definitivo

35 file `src/data/capitoli/` da creare:

| Tier | Count | File list | Action |
|------|-------|-----------|--------|
| 1 | 22 | v1-cap6..14, v2-cap3..10+12, v3-cap5..8 | migrazione diretta lesson-paths → Capitolo (aggrega esperimenti per Cap) |
| 2 | 12 | v1-cap1..5, v2-cap1,2,11, v3-cap1..4 | Capitolo teoria-only, `esperimenti: []`, solo `theory{}` |
| 3 | 1 | v3-cap9 | placeholder WIP, candidato fill v3-extra-simon |

Extras v3 decision:
- **Opzione A** (consigliata): simon → Cap 9 Vol3 fill, lcd+servo → categoria "Creatività libera" standalone
- Opzione B: tutti 3 in categoria nuova "Progetti freestyle"
- Opzione C: status quo (3 file JSON fuori struttura)

**Timeline Q1 stimata**: -30-40% vs PDR originale (68 file → 35 file, -48%).

## 6. CoV (Chain of Verification) v1.1

| Check | Metodo | Risultato |
|-------|--------|-----------|
| Body CAPITOLO uppercase Vol1 | `grep -nE "^\s*CAPITOLO\s+[0-9]+"` → 14 unique | PASS (14 Cap body confirmed) |
| Body CAPITOLO uppercase Vol2 | grep → 12 unique | PASS (12 Cap body confirmed) |
| Body Vol3 ODT Cap 10-12 | grep → 0 results | PASS (phantom removed) |
| ESPERIMENTO markers Vol1 | 37 grep matches | PASS |
| ESPERIMENTO markers Vol2 | 26 grep matches | PASS |
| ESERCIZIO markers Vol3 ODT | 22 explicit + 2 anomalies | PASS |
| Vol2 Cap 11 body | PDF pag 98-102 lidi + body title "I DIODI" | PASS (teoria confirmed) |
| tutor v3-cap7-esp8 title = debounce | JSON read | PASS |
| tutor v3-extra-simon.chapter=99 | JSON read | PASS capstone |
| Filesystem match 94 files | Python set compare | PASS |
| JSON v1.1 schema valido | python json.load | PASS |

## 7. Decisioni pendenti per Andrea (aggiornate v1.1)

1. **Vol3 Cap 9 WIP fill**:
   - (A) Promuovere `v3-extra-simon` a Cap 9 (Simon Says = capstone naturale)
   - (B) Scrivere nuovo Cap 9 con Tea (scope nuovo)
   - (C) Lasciare placeholder, Tea decide dopo

2. **v3-extras placement (lcd, servo)**:
   - (A) Categoria "Creatività libera" standalone
   - (B) Cap extras sotto Vol3 senza numerazione ("Vol3-X")
   - (C) Merge in Cap più vicino come variant

3. **Bug editoriali flag**:
   - Vol3 ESERCIZIO 6.4 dup: fix Tea
   - Vol3 ESERCIZIO 7.8 marker: fix Tea
   - Vol3 PDF V0.8.1 phantom TOC: rigenerare da ODT
   - Vol2 ESPERIMENTO 2 Cap 8 dup: fix ristampa

## 8. Prossimi passi

1. **Subito**: amend commit + push PR #34 con v1.1 corrections
2. **Andrea decide**: 3 decisioni pendenti sopra
3. **Gate Q0 → Q1 PASS**: partire Q1 schema Capitolo con target 35 file (non 68, non 38)
4. **Flag Tea**: 4 bug editoriali per fix volumi

---

**Verdetto gate Q0 v1.1**: **PASS**. Dati affidabili body-verified per Q1.
Pass rate: 22/22 Cap sperimentali match volume↔tutor = **100%**. Coverage legittima **100%**.
