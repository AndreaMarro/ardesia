# Course Foundry (P0a) — Compila cartella lezioni reali -> corso strutturato

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

### Test (`tests/test_course_p0a.py`)

40 test non-tautologici:
- Schema validation: 5 entità (frozen, ValueError su input invalido, immutabilità)
- Folder loader: valid/invalid paths, source refs, module refs, missing file, duplicate, unknown ref
- CourseBlueprint builder: con/senza moduli, fallback modulo unico
- Fixture integrazione: sample_course carica, 3 lezioni ordinate, source files esistono, refs risolti

### Bug trovato (Claude Code review)

`_load_modules()` in `folder_loader.py:132` non validava lesson_ids dei moduli contro le lezioni
caricate — un manifest poteva referenziare lesson_ids inesistenti e caricare senza errore.
Fix: validazione con `known_lesson_ids` set + ValueError (`folder_loader.py:139-144`).
