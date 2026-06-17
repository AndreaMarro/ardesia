# Grounding — Invariante Anti-Allucinazione

**Principio**: LessonOS non fabbrica mai citazioni. Ogni claim specifico deve risolvere a una fonte esistente.

## Invariante Core (PLAN §13.4)

> **CITAZIONI OBBLIGATORIE** — ogni claim specifico porta una citazione fondata: `{type, lesson_id/source_id, timestamp|page, excerpt}`. Mai citazioni inventate — groundedness by construction.

**Citazione**: PLAN.md:28 definisce citazioni obbligatorie.

## Implementazione

### 1. Segment Come Àncore di Grounding

I `Segment` persistiti nel DB sono gli àncore: ogni citazione nel Lesson Capsule deve risolvere a un `seg_id` esistente.

**Citazioni**:
- lessonos/models/entities.py:66-79 — `Segment` dataclass: "The grounding anchor: every citation in a Lesson Capsule must point at an existing seg_id (PLAN §13.4)"
- STATUS.md:14 — "ÀNCORE DI GROUNDING: le citazioni del Lesson Capsule M2 dovranno risolvere a un seg_id esistente"

### 2. ValueError su Citazione Penzolante

Se un LLM cita un `seg_id` non esistente → `ValueError` fail-fast. NO fabricazione silenziosa.

**Citazioni**:
- lessonos/capsule/segmentation.py:86-90 — `ValueError` se topic cita `seg_id` unknown: `"topic {topic!r} cites unknown segment {sid!r} (not persisted for lesson {lesson_id!r})"`
- lessonos/capsule/extraction.py:146-151 — `ValueError` se citation cita `seg_id` non in `valid_ids`: `"citation cites unknown segment {seg_id!r} (not persisted for lesson {lesson_id!r})"`

### 3. MockProvider Non Fabbrica

`MockProvider` restituisce SOLO fixture registrate per prompt esatto. Prompt ignoto → `KeyError` (non inventare output).

**Citazione**: lessonos/llm/router.py:28-48 — `MockProvider.complete()` solleva `KeyError` se `prompt not in self._fixtures` (linea 42-43).

### 4. Start/End Derivati da Segmenti Reali

I `TopicSpan.start`/`end` NON vengono dal LLM, ma derivati da `min(start)`/`max(end)` dei segmenti reali citati → timeline grounded sul transcript.

**Citazione**: lessonos/capsule/segmentation.py:92-99 — `start=min(s.start for s in cited), end=max(s.end for s in cited)` — start/end derivati, MAI dal modello.

### 5. Fixture con Integrità Referenziale

Le fixture stesse rispettano grounding: ogni `timeline_event.seg_id` punta a un segmento esistente nel transcript.

**Citazione**: tests/test_fixtures_sample_path.py valida groundedness-by-construction delle fixture (verifica che ogni `timeline_event` con `seg_id` risolva a un segmento esistente).

## Test di Groundedness

- **test_capsule_segmentation.py** — verifica che topic con `seg_id` penzolante (`l1s99`) sollevi `ValueError`
- **test_capsule_extraction.py** — verifica che citation con `seg_id` penzolante sollevi `ValueError`
- **test_fixtures_sample_path.py** — verifica integrità referenziale: `seg_id` nelle fixture risolvono a segmenti esistenti

## Conseguenze

1. **Nessuna citazione inventata** — grounding garantito by construction
2. **Fail-fast su inconsistenza** — ValueError esplicito, non corruzione silente
3. **LLM decide raggruppamento, non i fatti** — modello organizza, non fabbrica dati
