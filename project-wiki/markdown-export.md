# Markdown Course Export (P1) — Render CourseBlueprint + ContentAtoms in markdown

Il Markdown Course Exporter trasforma un CourseBlueprint (+ ContentAtoms) in una
struttura di file markdown pronta per pubblicazione.

## File Principali

- **`lessonos/export/__init__.py`** — re-export di `export_course_markdown`
- **`lessonos/export/markdown_course.py:1-186`** — `export_course_markdown()`: funzione principale
- **`lessonos/export/markdown_course.py:192-227`** — `_format_atom()`: formatta un ContentAtom in markdown
- **`lessonos/export/markdown_course.py:230-241`** — `_slugify()`: crea slug per nomi file
- **`tests/test_export_markdown.py`** — 38 test non-tautologici

## Output Structure

```
<output_dir>/
  course.md              — overview + TOC dei moduli
  modules/
    mod1_<slug>.md       — modulo con lezioni + atomi
    mod2_<slug>.md
    ...
  exercises.md           — atomi di tipo exercise (aggregati)
  quiz.md                — atomi di tipo quiz_question (aggregati)
```

## Caratteristiche

- **ZERO-LLM**: pura trasformazione dati, nessuna chiamata API
- **ZERO nuove deps**: solo stdlib `os`, `dataclasses`, `typing`
- **Deterministico**: stessi input → stessi output, sempre
- **Frozen output**: `MarkdownCoursePack` è frozen dataclass
- **AI-inferred exclusion**: atomi con `explicit_ai_inference=True` esclusi per default
- **Backward compatible**: `atoms=None` produce solo struttura modulo senza contenuti

## Test Coverage (38 test)

| Categoria | Test | Coverage |
|-----------|------|----------|
| _slugify | 5 test | ascii, accenti, alphanumeric, empty, already-safe |
| _format_atom | 7 test | type badge, body, source_refs, flags, confidence |
| Export structure | 9 test | course.md, TOC, modules, objectives, empty |
| Atoms in modules | 4 test | rendering, AI exclusion flag, multi-module separation |
| Aggregate files | 5 test | exercises.md, quiz.md, AI exclusion |
| Output to disk | 4 test | write files, subdir, content match, no-disk mode |
| AI inference | 2 test | exclusion default, non-AI atoms preserved |
| Integration | 2 test | sample_course real fixture + atoms |

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Empty course (no modules) | course.md con `Moduli: 0` |
| No atoms provided | solo struttura modulo (lezioni) |
| AI-inferred atoms | esclusi per default (`include_ai_atoms=False`) |
| Module with no lesson_ids | modulo elencato, vuoto |
| Non-ASCII title | accenti skippati in slug → fallback `"module"` |
| Output dir vuoto | pack in memoria, no disk writes |

## Design Rationale

1. **Separazione rendering/esportazione**: il markdown exporter è un consumer passivo
   di CourseBlueprint + ContentAtom — non crea/cerca citazioni, non tocca lo Store.
2. **AI atomi esclusi per default**: le summary/objective AI-inferred sono poco utili
   nell'export senza revisione docente. `include_ai_atoms=True` per uso interno.
3. **File aggregati separati**: exercises.md e quiz.md permettono di stampare
   fascicoli separati per esercizi e verifiche.
4. **Determinismo**: fondamentale per diff e versionamento del corso.
