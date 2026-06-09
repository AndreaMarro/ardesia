# LLM-Planner Stub — `lessonos/course/planner.py`

P1: bridge between raw CourseFolder materials and the export pipeline.
Defines the interface that an LLM-based planner will later implement for
real content analysis. For v0: deterministic/mock, zero-LLM.

**Frase guida:** Interfaccia per "ogni lezione deve rendere più intelligente la
prossima" — il planner propone moduli/atomi basandosi sui materiali reali.

## PlannerResult

`PlannerResult` frozen dataclass (`lessonos/course/planner.py:72-98`):

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `blueprint` | `CourseBlueprint` | Moduli + struttura del corso |
| `materials` | `Dict[str, PlannerMaterial]` | Materiali sorgente caricati |
| `source_lessons` | `tuple[str, ...]` | Lezioni ordinate del corso |
| `warnings` | `tuple[str, ...]` | Issue non-bloccanti (es. source mancanti) |

Validazione:
- `blueprint` deve essere `CourseBlueprint` → ValueError su tipo errato
- `source_lessons` devono essere subset delle lezioni del blueprint → ValueError

## PlannerMaterial

`PlannerMaterial` frozen dataclass (`lessonos/course/planner.py:34-58`):

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `source_id` | `str` | Stable identifier (non vuoto) |
| `content` | `str` | Testo estratto (non vuoto) |
| `lesson_id` | `str \| None` | Lezione di appartenenza (None = globale) |
| `filename` | `str` | Nome file originale |
| `source_type` | `str` | Tipo (markdown, text, pdf, etc.) |

Validazione: `source_id` e `content` non vuoti → ValueError.

## plan_course()

`plan_course(folder_path, *, audience='', level='', include_source_materials=True)` → `PlannerResult`

(`lessonos/course/planner.py:141-175`)

Pipeline:
1. `load_course_folder(folder_path)` — carica course.json
2. `build_course_blueprint(course)` — blueprint deterministico
3. `_load_planner_materials(course)` — materiali sorgente da `extract_source_materials()`

Zero-LLM, deterministico, frozen/ValueError pattern.

## CLI Wiring

`lessonos/cli.py` (`compile-course` handler, `lessonos/cli.py:814-884`):
- Ora usa `plan_course(str(folder_path))` invece di `load_course_folder` + `build_course_blueprint` separati
- Output mostra `n_materials` (numero di materiali sorgente caricati)
- Warnings dal planner stampati come stderr

## Test Coverage

`tests/test_course_planner.py` — 21 test, 3 classi:

1. **TestPlannerMaterial** (4 test): minimale, full fields, empty source_id/Content raises ValueError
2. **TestPlannerResult** (5 test): minimale, con materials, not-blueprint raises, source_lesson membership, frozen
3. **TestPlanCourse** (12 test): integrazione con temp directory reali — valid course, con/senza materials, audience/level, missing folder/course.json, source_lessons ordinati, missing source file, determinismo, empty modules fallback, filename/source_type preserved, zero warnings per corso valido
