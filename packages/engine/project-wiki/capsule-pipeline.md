# Capsule Pipeline — Estrazione Lesson Capsule

Pipeline per estrarre Lesson Capsule (PLAN §16.1, §26.1) da transcript + timeline + fonti. M2 milestone: ingest → segmentation → extraction.

## Modulo

**Package**: lessonos/capsule/

Contiene le fasi della pipeline:
- `lessonos/capsule/segmentation.py` — segmentazione per argomenti (TopicSpan)
- `lessonos/capsule/extraction.py` — estrazione concetti/esercizi/dubbi/compiti

## Fasi Pipeline

### 1. Ingest (M2-task1)

Carica transcript segments + timeline_events nello store come àncore di grounding.

**Entità**:
- `Segment` — segmento transcript (seg_id/lesson_id/start/end/text)
- `Moment` — timeline event (moment_id/lesson_id/t/kind/seg_id nullable)

**Funzioni** (non esportate, usate internamente):
- `ingest_lesson_segments(store, lesson_id)` — legge lessons/<id>.json, salva segmenti VERBATIM
- `ingest_lesson_moments(store, lesson_id)` — mappa `timeline_events` a `Moment`, seg_id anchored

**Citazioni**:
- STATUS.md:14 — "M2-task1 ingest transcript LANDATO. [...] ÀNCORE DI GROUNDING"
- STATUS.md:15 — "M2-task1 (parte 2) ingest timeline_events come Moment LANDATO"

**Grounding**: ogni `moment.seg_id` deve risolvere a un `Segment` persistito (vedi grounding.md).

### 2. Segmentazione Topic (M2-task2)

Raggruppa segmenti persistiti in span topic-coherent via LLM. L'LLM decide solo il **raggruppamento**, non i fatti.

**File**: lessonos/capsule/segmentation.py

#### TopicSpan
Span topic-coherent di una lezione (PLAN §26.1 timeline entry).

**Citazione**: lessonos/capsule/segmentation.py:20-32 — `TopicSpan` dataclass: `lesson_id`, `topic`, `seg_ids` tuple (grounding), `start`/`end` derivati da segmenti (linea 25-26).

#### build_segmentation_prompt
Costruisce prompt deterministico (stabile → mock-keyable). Espone `seg_id` + testo, istruisce LLM a restituire JSON `[{topic, seg_ids}]`.

**Citazione**: lessonos/capsule/segmentation.py:35-46 — `build_segmentation_prompt(segments)`: espone SOLO i seg_id elencati (linea 40), "non inventarne" (linea 40).

#### segment_lesson_topics
Legge segmenti dallo store, chiama router, valida ogni `seg_id` citato. Citazione penzolante → `ValueError`.

**Citazioni**:
- lessonos/capsule/segmentation.py:49-101 — `segment_lesson_topics()` completo
- lessonos/capsule/segmentation.py:64-68 — legge segmenti, costruisce `by_id` dict, solleva `ValueError` se no segments
- lessonos/capsule/segmentation.py:70-73 — chiama router con prompt deterministico
- lessonos/capsule/segmentation.py:76-91 — valida ogni entry: `ValueError` se topic label mancante (linea 80), `ValueError` se seg_ids vuoti (linea 82), `ValueError` se seg_id unknown (linea 86-90)
- lessonos/capsule/segmentation.py:92-99 — costruisce `TopicSpan` con `start=min(...)`, `end=max(...)` — derivati da segmenti REALI, MAI dal modello

**Grounding**: vedi grounding.md — citazione penzolante → ValueError, start/end derivati.

### 3. Estrazione Content (M2-task3)

Estrae concepts/exercises/student_questions/homework dai segmenti persistiti via LLM. Tutte le citazioni validate.

**File**: lessonos/capsule/extraction.py

#### Entità Estratte

**Citation** — citazione grounded (seg_id + excerpt opzionale + confidence opzionale).

**Citazione**: lessonos/capsule/extraction.py:19-30 — `Citation` frozen dataclass: "seg_id must resolve to a persisted Segment for the lesson."

**ConceptExtraction** — concetto estratto con `status` ∈ CONCEPT_STATUS.

**Citazione**: lessonos/capsule/extraction.py:33-47 — `ConceptExtraction`: `name`, `status` (validato via `__post_init__` linea 42-47), `prerequisites` tuple, `citations` tuple.

**ExerciseExtraction** — esercizio estratto.

**Citazione**: lessonos/capsule/extraction.py:50-56 — `ExerciseExtraction`: `prompt`, `solution` nullable, `citations` tuple.

**QuestionExtraction** — domanda studente estratta.

**Citazione**: lessonos/capsule/extraction.py:59-64 — `QuestionExtraction`: `question`, `citations` tuple.

**HomeworkExtraction** — compito estratto.

**Citazione**: lessonos/capsule/extraction.py:67-72 — `HomeworkExtraction`: `task`, `citations` tuple.

**LessonContent** — contenuto estratto completo.

**Citazione**: lessonos/capsule/extraction.py:75-87 — `LessonContent`: `lesson_id`, `concepts`/`exercises`/`student_questions`/`homework` tuple. Docstring (linea 79-81): "All citations MUST be grounded: each Citation.seg_id must resolve to a persisted Segment for the lesson."

#### build_extraction_prompt
Prompt deterministico per estrazione content. Espone vocab CONCEPT_STATUS + seg_id disponibili.

**Citazioni**:
- lessonos/capsule/extraction.py:90-110 — `build_extraction_prompt(segments)`
- lessonos/capsule/extraction.py:97 — espone `CONCEPT_STATUS` sorted → LLM non può usare status invalidi
- lessonos/capsule/extraction.py:104 — istruisce "Usa SOLO i seg_id elencati; non inventarne"
- lessonos/capsule/extraction.py:108-109 — espone `[{seg.seg_id}] {seg.text}` per ogni segmento

#### extract_lesson_content
Legge segmenti, chiama router, valida OGNI `Citation.seg_id`. Citazione penzolante → `ValueError`.

**Citazioni**:
- lessonos/capsule/extraction.py:113-216 — `extract_lesson_content()` completo
- lessonos/capsule/extraction.py:128-133 — legge segmenti, costruisce `valid_ids` frozenset, solleva `ValueError` se no segments
- lessonos/capsule/extraction.py:135-137 — chiama router con prompt deterministico
- lessonos/capsule/extraction.py:139-159 — `_parse_citations()`: valida ogni citation, `ValueError` se `seg_id` mancante (linea 146) o unknown (linea 148-151)
- lessonos/capsule/extraction.py:161-174 — parsea concepts: `ValueError` se `name` mancante (linea 164) o `status` mancante (linea 166); `ConceptExtraction.__post_init__` valida status ∈ CONCEPT_STATUS
- lessonos/capsule/extraction.py:176-186 — parsea exercises: `ValueError` se `prompt` mancante (linea 179)
- lessonos/capsule/extraction.py:188-197 — parsea questions: `ValueError` se `question` mancante (linea 191)
- lessonos/capsule/extraction.py:199-208 — parsea homework: `ValueError` se `task` mancante (linea 202)

**Grounding**: vedi grounding.md — OGNI citazione validata contro segmenti persistiti.

## Output: Lesson Capsule (PLAN §26.1)

Pipeline M2 produce componenti del Lesson Capsule:
- **Timeline** — lista di `TopicSpan` (da segmentation)
- **Concepts** — lista di `ConceptExtraction` (da extraction)
- **Exercises** — lista di `ExerciseExtraction` (da extraction)
- **Questions** — lista di `QuestionExtraction` (da extraction)
- **Homework** — lista di `HomeworkExtraction` (da extraction)

Assemblaggio capsule completo = task futura M2+.

**Citazione**: STATUS.md:18 documenta "Next: M2 — assemblaggio Lesson Capsule completo (timeline + concepts + exercises + questions + homework, schema §26.1)".

### 4. Assemblaggio Capsule (M2-task4)

Compone timeline + content in `LessonCapsule` — output finale della pipeline M2.

**File**: `lessonos/capsule/assembly.py`

#### LessonCapsule

Capsule completa di una lezione (PLAN §26.1). Frozen dataclass.

**Citazione**: `lessonos/capsule/assembly.py`:19-30 — `LessonCapsule`: `lesson_id`, `timeline` tuple `TopicSpan`, `content` `LessonContent`. Docstring: "Every `seg_id` inside has been validated against persisted segments by the segmentation and extraction steps."

#### assemble_lesson_capsule

Chiama `segment_lesson_topics` poi `extract_lesson_content`, ritorna `LessonCapsule`. Propaga `ValueError` se grounding fallisce in uno dei due sub-step.

**Citazione**: `lessonos/capsule/assembly.py`:33-57 — `assemble_lesson_capsule(store, lesson_id, router)` completo. Nessuna persistenza aggiuntiva: il compositore delega ai sub-step già esistenti.

### 5. Persistenza Capsule (M2-task5)

Salva la Lesson Capsule assemblata come JSON blob nel layer Store (str-based, senza circular dep tra store e assembly.py). Evita di rieseguire la pipeline LLM a ogni lettura.

**File**: `lessonos/capsule/assembly.py`

#### assemble_lesson_capsule(..., save=True)

Il parametro `save=False` opzionale persiste automaticamente il capsule dopo l'assemblaggio. `store.save_capsule(lesson_id, json.dumps(asdict(capsule)))`.

**Citazione**: `lessonos/capsule/assembly.py:46` — `save: bool = False`; linee 69-70 — `if save: store.save_capsule(...)`.

#### load_capsule(store, lesson_id) -> LessonCapsule | None

Carica un capsule persistito e lo deserializza (ricostruisce le dataclass frozen). Ritorna `None` se non presente.

**Citazione**: `lessonos/capsule/assembly.py:75-88` — `load_capsule()`: legge JSON da `store.get_capsule()`, chiama `_deserialise_capsule` (linee 96-171) che ricostruisce `LessonCapsule` con `TopicSpan`, `Citation`, `ConceptExtraction`, `ExerciseExtraction`, `QuestionExtraction`, `HomeworkExtraction`, `LessonContent` dalle strutture JSON.

#### Store ABC: save_capsule / get_capsule

Metodi str-based nel contratto astratto: `save_capsule(lesson_id: str, capsule_data: str) -> None` e `get_capsule(lesson_id: str) -> str | None`.

**Citazione**: `lessonos/store/base.py:55-72` — nuovi metodi astratti per capsule persistence.

#### SQLiteStore: tabella capsules

Schema: `lesson_id` TEXT PRIMARY KEY, `capsule_data` TEXT NOT NULL, `created_at` TEXT DEFAULT datetime('now'). SCHEMA_VERSION 3->4.

**Citazione**: `lessonos/store/sqlite.py:17` — `SCHEMA_VERSION = 4`; linee 54-58 — tabella `capsules`; linee 243-259 — `save_capsule()` / `get_capsule()` implementazioni con `INSERT OR REPLACE`.

**Grounding**: Non introduce nuove citazioni o validazioni — il capsule era già grounded prima della persistenza (validato da segmentation + extraction). Al reload tutte le citazioni risolvono ai segmenti originali.

**Grounding**: garantita dai sub-step (segmentation + extraction); l'assembler non introduce nuove citazioni.

### 6. Defensive Mode (FM4 — Robustezza su Dati Reali)

Quando `defensive=True`, l'estrazione e l'assemblaggio NON crashano su un singolo
item malformato — lo droppano e registrano in `capsule.dropped`. Questo garantisce
zero-allucinazione (nessuna citation fabbricata sopravvive) preservando la lezione
da una singola citation cattiva (Claude eval reale 2026-06-08).

**File**: `lessonos/capsule/extraction.py:linee 186-198` — `_parse_citations()`: se
`defensive=True`, cattura `ValueError`/`TypeError`/`KeyError`/`AttributeError` per
ogni citation e lo droppa invece di propagare.

**File**: `lessonos/capsule/extraction.py:linee 214-230` — I loop per concepts/
exercises/questions/homework passano ciascuno per `_parse_citations()`, quindi
TUTTI e 4 gli item types godono della protezione defensive.

**Copertura test**: `tests/test_capsule_assembly.py`:
- `test_defensive_drops_bad_citation_and_none_field` — concept con bad seg_id + None field
- `test_defensive_false_still_raises_on_bad_seg_id` — strict mode crasha ancora
- `test_defensive_drops_bad_citation_per_item_type` (parametrizzato, 4 casi) — OGNI
  item type (concept, exercise, student_question, homework) droppa citation fabbricata
  e mantiene quella valida, registrando in `dropped`

**Citazione**: `tests/test_capsule_assembly.py:156-210` — test parametrizzato con
`_ITEM_SPECS` che mappa ogni item type alla sua struttura dati.

## Test Coverage

**M2 test suite**: 81 passed + 1 skipped (STATUS.md ultima riga).

Test verificano:
- Grounding: citazione penzolante → ValueError
- Validazione: status/edge_type invalidi → ValueError
- Campi obbligatori mancanti → ValueError
- Immutabilità entità frozen
- Round-trip fixture → store → rilettura
- Prompt espone SOLO seg_id disponibili
- **Assembly end-to-end**: ogni citation nel capsule assemblato risolve a un segmento persistito
- **Propagazione errori**: ValueError da segmentation/extraction bubble up attraverso `assemble_lesson_capsule`

## Design Rationale

1. **LLM decide raggruppamento, non i fatti** — modello organizza, store fornisce dati
2. **Fail-fast su citazione invalida** — ValueError esplicito (grounding.md)
3. **Prompt deterministico** — stabile, mock-keyable per test riproducibili
4. **Vocab esposto nel prompt** — LLM bounded (CONCEPT_STATUS, seg_id disponibili)
5. **Start/end derivati** — timeline grounded su transcript reale

**Citazione**: STATUS.md:16 conferma "GROUNDING (PLAN §13.4): il LLM decide SOLO il raggruppamento — ogni seg_id citato deve risolvere a un Segment persistito per quella lezione, altrimenti ValueError".
