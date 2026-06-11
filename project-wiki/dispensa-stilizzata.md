# Dispensa Stilizzata (M1-4)

Modulo per generare dispense didattiche **nello stile del docente** a partire dal TeacherBook e dalle capsule. Ogni claim fattuale cita un segmento reale del transcript — gate fail-closed (identico al summary M0).

## Architettura

### `lessonos/style.py` (ZERO-LLM)
`StyleProfile` frozen dataclass + `derive_style_profile(store, teacher_id)`:

- **exercise_density** = esercizi / concetti (dal TeacherBook + capsule)
- **question_density** = domande / segmenti
- **prereq_explicitness** = catene prerequisiti / concetti
- **concept_granularity** = concetti / 1000 parole trascritte
- **registro** = `"colloquiale" | "formale" | "misto"` — euristica da filler/formal markers nei segmenti
- **tics** = top-5 n-gram ricorrenti (unigram/bigram/trigram, min 3 occorrenze, stopword esclusi)

Deterministico: stesso store + teacher_id → stesso StyleProfile.

### `lessonos/dispensa.py` (core)
Pipeline a 4 fasi:

1. **`build_dispensa_prompt(teacher_id, style, concepts)`** — costruisce prompt deterministico. Lo stile guida struttura e tono:
   - exercise_density alta → ogni sezione APRE con esercizio svolto
   - question_density alta → struttura a domande-risposta
   - prereq_explicitness alta → box "Prima devi sapere"
   - registro+tics → istruzione nel prompt di usare il registro del docente

2. **`generate_dispensa(store, teacher_id, router, style=None)`** — carica TeacherBook, risolve concetti, chiama LLM (via router, mock in test), parsifica risposta JSON. Budget ~$0.05/dispensa.

3. **`verify_dispensa(doc, store)`** — riusa `graph/grounding.verify_citation` su ogni claim:
   - seg_id risolvibile, stessa lezione (cross-lesson guard), excerpt verbatim
   - Gate fail-closed: 0 claims o >20% unverified = `ValueError`
   - Paragrafi non-grounded droppati + dichiarati nel footer

4. **`render_dispensa_md(doc, report)`** — ZERO-LLM, markdown con sezioni, citazioni, footer grounding.

### `bin/run_dispensa.sh` — runner riproducibile
```bash
bash bin/run_dispensa.sh prof_pratico              # singolo docente
bash bin/run_dispensa.sh pratico socratico rigoroso # piu docenti
bash bin/run_dispensa.sh                            # default: 3 sim + andrea
```

Env: `DB_PATH`, `DERIVED_DIR`, `PROVIDER`, `MODEL`.

## Test
- **Divergenza stilistica** (test del prodotto): stesse capsule, 2 StyleProfile opposti (pratico exercise-first vs socratico domande-first) → markdown strutturalmente diverso ("Esercizio" in Sezione 1 vs "Domanda")
- **Gate fail-closed**: 0 claims → ValueError; 100% unverified → ValueError; 16.7% unverified → PASS
- **Prompt-injection**: contenuto segmento non altera template JSON
- **Determinismo**: prompt, parsing, rendering byte-per-byte identici

## Specifica completa
`docs/ORDERS-M1-4.md` — spec vincolante per il builder.

## File
- `lessonos/style.py` — StyleProfile + derivazione (ZERO-LLM, file:line)
- `lessonos/dispensa.py` — generazione dispensa (file:line)
- `tests/test_style.py` — 10 test (file:line)
- `tests/test_dispensa.py` — 19 test (file:line)
- `bin/run_dispensa.sh` — runner
- `docs/ORDERS-M1-4.md` — spec prodotto
