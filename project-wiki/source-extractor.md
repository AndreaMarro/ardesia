# Source Material Extractor — Docling-adapter foundation (P1)

Legge i materiali sorgente da un CourseFolder e produce `SourceMaterial` con contenuto testuale.

## API

- `extract_source_materials(course: CourseFolder, *, include_lesson_sources=True) → SourceMaterialPack`
  - Legge `sources/` globali + (opzionale) `lessons/<lesson_id>/sources/` per-lezione
  - Supporta nativamente: markdown (.md), text (.txt) — stdlib-only
  - Formati non supportati (pdf, docx, etc.): restituiscono `SourceMaterial.error` con messaggio "richiede Docling adapter"
  - `ValueError` se `course.folder_path` non esiste su disco

- `get_source_content(pack: SourceMaterialPack, source_id: str) → str | None`

- `SourceMaterial` (frozen): source_id, filename, source_type, content, lesson_id (opz.), error (opz.)
- `SourceMaterialPack` (frozen): materials dict + errors dict

## Source di riferimento

- `lessonos/export/source_extractor.py:1-260` — implementazione completa
- `tests/test_source_extractor.py:1-350` — 24 test: 4 classi (SourceMaterial, SourceMaterialPack, ExtractGlobalSources, ExtractLessonSources, ExtractEdgeCases, GetSourceContent)

## Design

Zero-LLM, deterministico, stdlib-only per formati nativi. `SourceMaterial.error` pattern per formati non supportati (graceful degradation). Il Docling-adapter futuro implementerà l'estrazione PDF/DOCX/VTT/SRT.

## Pattern: separated-error

I sorgenti con formati non ancora supportati non bloccano l'estrazione: vengono raccolti in `errors` dict, non in `materials`. Questo permette alla pipeline di continuare con ciò che è disponibile, preservando la segnalazione di ciò che manca.
