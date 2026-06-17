# TRES JOLIE Volumi (PDF/ODT) vs Software ELAB — Alignment Audit

**Data**: 2026-05-10
**Scope**: confronto strutturale tra i 3 manuali cartacei (TRES JOLIE) e le rappresentazioni software:
1. Lesson-paths JSON (`src/data/lesson-paths/`, 94 file)
2. `src/data/volume-references.js` (94 entry enriched bookText)
3. `supabase/functions/_shared/system-prompt.ts` (knowledge inline)
4. `supabase/functions/_shared/unlim-ai-profiles.ts` (`UNLIM_VOLUME_*_KNOWLEDGE_PACK`)

**Sorgenti**:
- Vol1 PDF: `ELAB - TRES JOLIE/1 ELAB VOLUME UNO/2 MANUALE VOLUME 1/MANUALE VOLUME 1 ITALIANO.pdf` (estratto in `/tmp/vol1.txt`, 2369 righe)
- Vol2 PDF: `ELAB - TRES JOLIE/2 ELAB VOLUME DUE/2 MANUALE VOLUME  2/MANUALE VOLUME 2 ITALIANO.pdf` (estratto in `/tmp/vol2.txt`, 3017 righe)
- Vol3 ODT: `ELAB - TRES JOLIE/3 ELAB VOLUME TRE/2 MANUALE VOLUME 3/MANUALE VOLUME 3 WORD.odt` (NO PDF, 96781 char in `/tmp/vol3.txt`)

---

## 1. Capitoli — TRES JOLIE TOC vs software

### Volume 1 (PDF, 14 capitoli)
TOC PDF (`/tmp/vol1.txt:13-26`):

| Cap | Titolo PDF | Pag PDF | In `lesson-paths/` | In `volume-references.js` | In `unlim-ai-profiles.ts` Pack |
|-----|-----------|---------|--------------------|---------------------------|-------------------------------|
| 1   | La Storia dell'Elettronica | 5  | ❌ | ❌ | ❌ |
| 2   | Le grandezze elettriche e la legge di Ohm | 9 | ❌ | ❌ | ❌ |
| 3   | Cos'è un resistore? | 13 | ❌ | ❌ | ❌ |
| 4   | Cos'è la breadboard? | 21 | ❌ | ❌ | ❌ |
| 5   | Cosa sono le batterie? | 25 | ❌ | ❌ | ❌ |
| 6   | Cos'è il diodo LED? | 27 | ✅ esp1-3 | ✅ p.27 | ✅ |
| 7   | Cos'è il LED RGB? | 35 | ✅ esp1-6 | ✅ | ✅ |
| 8   | Cos'è un pulsante? | 43 | ✅ esp1-5 | ✅ | ✅ |
| 9   | Cos'è un potenziometro? | 57 | ✅ esp1-9 | ✅ | ✅ |
| 10  | Cos'è un fotoresistore? | 81 | ✅ esp1-6 | ✅ | ✅ |
| 11  | Cos'è un cicalino? | 93 | ✅ esp1-2 | ✅ | ✅ |
| 12  | L'interruttore magnetico | 97 | ✅ esp1-4 | ✅ | ✅ |
| 13  | Cos'è l'elettropongo? | 103 | ✅ esp1-2 | ✅ | ✅ |
| 14  | Costruiamo il nostro primo robot | 107 | ✅ esp1 | ✅ | ✅ |

**Discrepanza**: Cap 1-5 (storia, Ohm, resistore, breadboard, batterie) totalmente assenti nel software. Sono concetti teorici introduttivi del libro fisico. UNLIM non ha contesto strutturato per "Cos'è la breadboard" (cap.4 p.21) né "legge di Ohm" (cap.2 p.9), pur essendo riferimenti citati nel system-prompt (es. `system-prompt.ts:171-174` cita "Vol.1 cap.2" Ohm ma il knowledge pack `UNLIM_VOLUME_1_KNOWLEDGE_PACK` parte da Cap.6 LED — `unlim-ai-profiles.ts:81`).

### Volume 2 (PDF, 12 capitoli)
TOC PDF (`/tmp/vol2.txt:9-20`):

| Cap | Titolo PDF | Pag | In `lesson-paths/` | In `volume-references.js` | In Pack |
|-----|-----------|-----|--------------------|---------------------------|---------|
| 1   | Altri cenni di storia dell'elettronica | 5 | ❌ | ❌ | ❌ |
| 2   | Cos'è l'elettricità? | 9 | ❌ | ❌ | ❌ |
| 3   | Il Multimetro | 13 | ✅ esp1-4 | ✅ | ✅ |
| 4   | Approfondiamo le resistenze | 37 | ✅ esp1-3 | ✅ | ✅ |
| 5   | Approfondiamo le Batterie | 47 | ✅ esp1-2 | ✅ | ✅ |
| 6   | Approfondiamo i Led | 53 | ✅ esp1-4 | ✅ | ✅ |
| 7   | Cosa sono i condensatori? | 63 | ✅ esp1-4 | ✅ | ✅ |
| 8   | Cosa sono i Transistor? | 75 | ✅ esp1-3 | ✅ | ✅ |
| 9   | Cosa sono i fototransistor? | 85 | ✅ esp1-2 | ✅ | ✅ |
| 10  | Il motore a corrente continua | 93 | ✅ esp1-4 | ✅ p.93 | ✅ |
| 11  | I diodi | 103 | ❌ | ❌ | parziale (citato in pack come "diodo") |
| 12  | Costruiamo il nostro primo Robot marciante! | 109 | ✅ esp1 | ✅ p.103 (FAIL) | ✅ |

**Discrepanze**:
- Cap 1-2 storia + elettricità: assenti software (come Vol1).
- **Cap 11 "I diodi" (p.103) assente in `lesson-paths/`** — manca file `v2-cap11-esp*.json`. Capitolo intero saltato (esperimenti 1-4 nel PDF a `vol2.txt:2619-2649`).
- **Bug pagine `volume-references.js:858`**: `'v2-cap12-esp1'` ha `bookPage: 103, chapterPage: 103`, ma il PDF dice **Cap 12 inizia a p.109** (`vol2.txt:19`). Pagina 103 nel PDF corrisponde a Cap 11 (I diodi). Errore di mapping editoriale.
- Cap 12 robot software lo chiama "Robot Segui Luce" (`volume-references.js:858`), il PDF lo chiama "Robot marciante" (`vol2.txt:19`). Disallineamento titolo.

### Volume 3 (ODT, NON PDF — 9 capitoli planned, 7 scritti)
TOC ODT (`/tmp/vol3.txt`):

| Cap ODT | Titolo ODT | In `lesson-paths/` | In `volume-references.js` | In Pack |
|---------|-----------|--------------------|---------------------------|---------|
| 1 | Un viaggio nella storia della programmazione | ❌ | ❌ | ❌ |
| 2 | Cos'è la programmazione | ❌ | ❌ | ❌ |
| 3 | Hardware e Software | ❌ | ❌ | ❌ |
| 4 | Introduciamo Arduino | ❌ | ❌ | ❌ |
| 5 | Il nostro primo programma (Blink) | ✅ esp1-2 | ✅ MA titolo errato | ✅ |
| 6 | Il mondo discreto: i pin digitali | ✅ esp1-7+morse+semaforo | ✅ MA titolo "I pin digitali" | ✅ |
| 7 | Il mondo continuo: i pin analogici | ✅ esp1-8+mini | ✅ | ✅ |
| 8 | (titolo: VISUALIZZARE DATI: IL MONITOR SERIALE) | ✅ esp1-5+serial | ✅ | ✅ parziale |
| 9 | (placeholder, "Non è finita qui!") | ❌ | ❌ | ❌ |
| extra | (non nel libro) | ✅ lcd-hello, servo-sweep, simon | ✅ | parziale |

**Discrepanze critiche Vol3**:
- ODT non PDF: Davide non ha consegnato il PDF finale. L'audit usa testo ODT estratto via XML (`/tmp/vol3.txt`).
- **Cap 1-4 (Storia programmazione, Cos'è la programmazione, Hardware/Software, Introduciamo Arduino) totalmente assenti software** — tutto il setup narrativo Arduino del libro è saltato.
- **Software inizia da Cap 5 ma il libro Cap 5 non si chiama "Come è fatto un programma Arduino?" (`volume-references.js:879`) — si chiama "Il nostro primo programma (Blink)"** (`vol3.txt`). Lesson-path `v3-cap5-esp1.json:11` è coerente ("Il nostro primo programma") ma `volume-references.js` no.
- **Cap 6 si chiama "Il mondo discreto: i pin digitali"** non solo "I pin digitali" come da `lesson-paths/v3-cap6-semaforo.json:11`.
- **3 esperimenti `v3-extra-*` (lcd-hello, servo-sweep, simon)** sono nel software ma NON nel libro. Violazione Morfismo Sense 2: software con esperimenti che non esistono nel cartaceo.
- **Cap 9 ODT è solo placeholder "Non è finita qui!"** — coerente con software che non ha v3-cap9.
- Cap 8 ODT fine si interrompe a "Obiettivo del capitolo Fino ad ora Arduino ha lavorato in silenzio…" (text incompleto in ODT). Software ha 6 esperimenti v3-cap8 — DOVE viene il contenuto?

---

## 2. Knowledge pack UNLIM (`unlim-ai-profiles.ts:78-118`)

| Pack | Range capitoli citati | TOC reale | Mismatch |
|------|----------------------|-----------|----------|
| `UNLIM_VOLUME_1_KNOWLEDGE_PACK` (riga 78) | Cap 6-14 | Cap 1-14 | manca Cap 1-5 (Storia/Ohm/resistore/breadboard/batterie) |
| `UNLIM_VOLUME_2_KNOWLEDGE_PACK` (riga 92) | Multimetro, Resistenze, Batterie, Condensatore, Diodo, MOSFET, Relè, Motore DC, Fototransistor (no Cap N) | Cap 3-12 | usa label tematici, ignora numeri Cap; **manca cap 1-2 storia/elettricità** + relè non è cap autonomo nel libro (è citato dentro Cap 8 Transistor) |
| `UNLIM_VOLUME_3_KNOWLEDGE_PACK` (riga 106) | Pin digitali, input digitali, analogico, PWM, Scratch, Servo, Buzzer, Debug | Cap 1-9 | manca Cap 1-4 (Storia/Programmazione/HW-SW/Introduciamo Arduino); Servo+Scratch non sono capitoli del libro |

`system-prompt.ts:434` esempio: `mountExperiment id v3-cap6-semaforo` — coerente coi lesson-paths.
`system-prompt.ts:171,174,177,193,196,199` cita "Vol.1 cap.2", "Vol.1 cap.6", "Vol.3 cap.7", "Vol.1 cap.4", "Vol.3 cap.6" come few-shot. **Cap 2 e Cap 4 Vol.1 NON ESISTONO in lesson-paths/RAG** — UNLIM è istruito a citare capitoli che non ha mai indicizzato.

---

## 3. Sample esperimenti — narrativa software vs PDF

| Esp | Software (lesson-path / volume-references) | PDF cita | Match |
|-----|--------------------------------------------|----------|-------|
| `v1-cap6-esp1` | "Accendi il tuo primo LED" — 470Ω + LED + breadboard + batt 9V (`v1-cap6-esp1.json:12,30-40`; `volume-references.js:28-40`) | `vol1.txt:964` ESPERIMENTO 1 con stessi componenti | ✅ |
| `v2-cap8-esp1` | "MOSFET come interruttore" Cap 8 Transistor (`v2-cap8-esp1.json:10-14`) | `vol2.txt:2169` "MOSFET, nello specifico a canale N" | ✅ contenuto |
| `v2-cap10-esp1` | "Motore DC base, fili rosso/nero in batteria" `bookPage:95` (`volume-references.js:815`) | `vol2.txt:18` Cap 10 inizia p.93 | ⚠️ p.95 plausibile ma non verificabile da TOC; bookPage non corroborato |
| `v3-cap5-esp1` | "Blink con LED_BUILTIN" / chapter_title "Il nostro primo programma" (`v3-cap5-esp1.json:11`) MA `volume-references.js:879` dice "Come è fatto un programma Arduino?" | ODT cap.5 = "Il nostro primo programma!" | ⚠️ lesson-path OK, volume-references.js WRONG |
| `v3-cap6-semaforo` | "Semaforo 3 LED" / chapter_title "I pin digitali" (`v3-cap6-semaforo.json:11`) | ODT cap.6 = "Il mondo discreto: i pin digitali" | ⚠️ titolo abbreviato |

---

## 4. Discrepanze sintetiche

1. **Capitoli teorici introduttivi mai nel software** (Vol1 cap.1-5, Vol2 cap.1-2, Vol3 cap.1-4): 11 capitoli totali assenti. UNLIM non ha pack/RAG strutturato per "legge di Ohm", "breadboard", "Cos'è la programmazione". Few-shot in `system-prompt.ts:171,193` cita "Vol.1 cap.2" e "Vol.1 cap.4" ma il pack parte da cap.6.
2. **Vol2 Cap.11 "I diodi" (p.103) saltato** — 4 esperimenti nel PDF, 0 nel software (`lesson-paths/` no `v2-cap11-*`).
3. **Vol3 PDF mancante** — solo ODT con cap.8-9 incompleti. Software ha v3-cap8 esp1-5+serial pieni: ground truth incerto.
4. **Bug `volume-references.js:858-870`** — Cap 12 V2 "Robot Segui Luce" mappato a `bookPage:103`, ma p.103 = Cap.11 "I diodi" e Cap.12 inizia a p.109. Inoltre titolo PDF è "Robot marciante", non "Segui Luce".
5. **Bug `volume-references.js:879`** — Cap 5 V3 etichettato "Come è fatto un programma Arduino?", titolo reale ODT "Il nostro primo programma (Blink)".
6. **3 esperimenti `v3-extra-*` (lcd-hello, servo-sweep, simon)** non esistono nel libro fisico → violano Morfismo Sense 2 (triplet coerenza esterna).
7. **`UNLIM_VOLUME_2_KNOWLEDGE_PACK` cita "Relè" come componente autonomo** — nel PDF Vol2 non c'è capitolo "Relè"; concetto è dentro Cap.8 Transistor.
8. **Pack non numerano i capitoli V2 e V3** (solo V1 li numera) — incoerenza interna pack: docente non può citare "Vol.2 cap.7" da knowledge pack come fa con Vol.1.

## 5. Raccomandazioni operative

- **P0**: scrivere lesson-paths placeholder per Vol1 cap.1-5 + Vol2 cap.1-2 + Vol3 cap.1-4 anche solo come "pagine teoriche" (no esperimenti fisici) → evita citazioni UNLIM di capitoli inesistenti nel software.
- **P0**: creare `v2-cap11-esp1..4.json` per "I diodi" — il libro ha 4 esperimenti, il software 0.
- **P0**: fix `volume-references.js:858` Cap.12 V2 → `bookPage:109, chapter:"Capitolo 12 - Costruiamo il nostro primo Robot marciante"`.
- **P0**: fix `volume-references.js:879` Cap.5 V3 → `chapter:"Capitolo 5 - Il nostro primo programma (Blink)"`.
- **P1**: convertire ODT V3 → PDF finale + ri-estrarre testo per `volume-references.js`. Cap.8-9 ODT incompleti: chiedere a Davide draft testo.
- **P1**: sincronizzare `UNLIM_VOLUME_*_KNOWLEDGE_PACK` con TOC reali, rimuovere Relè da V2 pack se non capitolo, aggiungere riferimento Cap.numerati in V2/V3.
- **P2**: decidere se eliminare `v3-extra-*` (Morfismo) o documentarli come "esperimenti laboratorio non da volume".

**File di riferimento citati**:
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/data/volume-references.js:28,815,858,879`
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/data/lesson-paths/` (94 JSON, manca v2-cap11-*)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/unlim-ai-profiles.ts:78,92,106`
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/system-prompt.ts:171,174,177,193,196,199,434`
