# Course Foundry (P0a+b) — Compila cartella lezioni reali -> corso strutturato

Il Course Foundry trasforma una cartella di lezioni reali del docente in un corso
completo tracciabile (moduli, dispense, esercizi, quiz, pacchetti esportabili).
Tutto tracciabile alle lezioni/fonti (lineage). Moat: corso DALLE lezioni REALI
nello stile del docente, non AI-course-generator generico.

**Frase guida:** Ogni lezione deve rendere più intelligente la prossima.

## P0a — CourseFolder schema + folder_loader + fixture

### Schema (`lessonos/course/schema.py`)

5 frozen dataclass validate a costruzione (ValueError fail-fast):

- **`CourseLessonRef`** (`lessonos/course/schema.py:16-32`): lesson_id/title/order/source_ids.
  - `lesson_id` non vuoto, `title` non vuoto, `order >= 1`, `source_ids` entries non vuote.
- **`CourseSourceRef`** (`lessonos/course/schema.py:38-52`): source_id/filename/source_type.
  - `source_id`/`filename`/`source_type` non vuoti. Default source_type="text".
- **`ModuleBlueprint`** (`lessonos/course/schema.py:58-74`): title/lesson_ids/objectives.
  - `title` non vuoto, `lesson_ids` entries non vuote.
- **`CourseBlueprint`** (`lessonos/course/schema.py:80-92`): title/modules/audience/level/source_lessons.
  - Blueprint strutturato costruito DA un CourseFolder (deterministico, ZERO-LLM).
- **`CourseFolder`** (`lessonos/course/schema.py:98-131`): title/folder_path/lessons/sources/modules.
  - DUPLICATI lesson_id/source_id → ValueError (`lessonos/course/schema.py:112-124`).
  - Ordine lezioni NON crescente → ValueError (`lessonos/course/schema.py:126-131`).

### Folder Loader (`lessonos/course/folder_loader.py`)

- **`load_course_folder(folder_path)`** (`lessonos/course/folder_loader.py:34-81`): legge `course.json`
  dalla cartella, carica sorgenti e lezioni, restituisce CourseFolder.
  - Cartella inesistente → ValueError (`folder_loader.py:44`).
  - course.json mancante → ValueError (`folder_loader.py:47`).
  - File sorgente mancante su disco → ValueError (`lessonos/course/folder_loader.py:97-103`).
  - source_id sconosciuto referenziato da lezione → ValueError (`folder_loader.py:116-120`).
  - lesson_id sconosciuto referenziato da modulo → ValueError (`folder_loader.py:139-144`).

- **`build_course_blueprint(course)`** (`lessonos/course/folder_loader.py:158-178`): costruisce blueprint
  deterministico (usa moduli se presenti, altrimenti modulo unico fallback). ZERO-LLM.

### Fixture (`fixtures/sample_course/`)

- `course.json` — manifest: "Calcolo 2 — Integrali e ODE", 3 lezioni, 3 sorgenti, 3 moduli.
- `lessons/l1_derivatives/`, `lessons/l2_integrals/`, `lessons/l3_differential_equations/` — cartelle
  lezione con materiali specifici (`exercises.md`).
- `sources/derivatives.md`, `sources/integrals.md`, `sources/ode.md` — materiali globali condivisi.

## P0b — ContentAtom + capsule_to_atoms converter

### ContentAtom (`lessonos/course/atoms.py:28-89`)

`ContentAtom` frozen dataclass: unità minima di contenuto didattico tracciabile.

Campi:
- `atom_id: str` — `<lesson_id>/<atom_type>/<n>` (es. `l1_derivatives/definition/0`)
- `atom_type: str` — ∈ `ATOM_TYPES` (13 tipi: definition/explanation/example/exercise/
  quiz_question/student_question/misconception/homework/summary/objective/prerequisite/
  teacher_note/source_excerpt)
- `lesson_id: str`, `body: str`
- `source_refs: tuple[Citation, ...]` — **OBBLIGATORIE** salvo `explicit_ai_inference=True`
- `teacher_approved: bool` (default False)
- `confidence: float | None`
- `explicit_ai_inference: bool` (default False) — flag per atomi inferiti dal modello

Validazione: `atom_type` invalido → ValueError; `source_refs` vuote senza flag → ValueError.

### Capsule-to-Atoms converter (`lessonos/course/atoms.py:93-158`)

`capsule_to_atoms(capsule: LessonCapsule) -> tuple[ContentAtom, ...]` mappa:
- ConceptExtraction → `definition` (status=introduced/new), `example` (reinforced),
  `explanation` (problematic). atom_id = `<lesson_id>/<type>/<n>` con contatori separati.
- ExerciseExtraction → `exercise`
- QuestionExtraction → `student_question`
- HomeworkExtraction → `homework`
- Timeline TopicSpan → `summary` (con explicit_ai_inference=True, zero source_refs)

### Test (`tests/test_course_p0b.py`)

43 test non-tautologici:
- ATOM_TYPES vocab (14 test: tutti i 13 tipi + count + unknown)
- ContentAtom validation (11 test: atom_type, empty fields, source_refs rule, flag, immutabilità)
- capsule_to_atoms (18 test: mapping per status, exercise/question/homework, timeline summary,
  atom_id invariant, deterministico, confidence averaging, empty capsule)

## P0c — CourseBlueprint builder with content_atom_ids (`lessonos/course/blueprint.py`)

### Builder (`lessonos/course/blueprint.py:1-102`)

`build_course_blueprint(course, atoms=None, audience="", level="")` — builder determinista.

- Se `course.modules` esiste, li usa come base; altrimenti modulo unico fallback (backward compat).
- Se `atoms` (dict lesson_id → tuple[ContentAtom]) è fornito: assegna ogni atom_id al modulo che contiene la sua lesson_id.
- `audience`/`level` pass-through su CourseBlueprint.
- `source_lessons` = lesson_id ordinate del course (inferenza automatica).

### Schema (`lessonos/course/schema.py:75-77`)

`ModuleBlueprint.content_atom_ids: tuple[str, ...] = ()` — nuovo campo P0c, backward compatible (default `()`). Contiene gli atomi assegnati al modulo.

### Test (`tests/test_course_p0c.py`)

13 test non-tautologici:
- Backward compat: 4 test (nessun atoms, moduli esistenti, empty course)
- Atom assignment: 5 test (single/multiple/unknown/empty/cross-module)
- Audience/level: 3 test (empty/default/partial)
- Integration: 1 test su sample_course reale con 3 moduli
