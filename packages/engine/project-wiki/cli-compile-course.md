# CLI compile-course — Compila una cartella corso in formato esportabile

Il comando `lessonos compile-course` (P1, COORDINATION.md §18) è un wiring
puro che compone i moduli esistenti (CourseFolder loader + CourseBlueprint
builder + exporter) in una singola CLI. Supporta anche `--target all` (P2)
per eseguire tutti e 5 gli esportatori in sequenza.

## Usage

```
lessonos compile-course <folder> [--target markdown|liascript|quarto|quarto-slides|moodle-xml|all] [--output DIR] [--include-ai-atoms] [--review] [--approve] [--theme THEME]
```

## Pipeline

1. **`load_course_folder(folder)`** (`lessonos/course/folder_loader.py:24-76`) — carica course.json
2. **`build_course_blueprint(course)`** (`lessonos/course/folder_loader.py:155-177`) — costruisce blueprint deterministico
3. **Route a exporter** per target:
   - `markdown` → `export_course_markdown()` (`lessonos/export/markdown_course.py:42-186`)
   - `liascript` → `export_liascript()` (`lessonos/export/liascript.py:44-185`)
   - `quarto` → `export_quarto()` (`lessonos/export/quarto.py`)
   - `quarto-slides` → `export_quarto_slides()` (`lessonos/export/quarto.py`)
   - `moodle-xml` → `export_moodle_xml()` (`lessonos/export/moodle_xml.py`)
   - `all` → iterates all 5 targets sequentially
4. **Output** nella directory specificata (default: `<course_folder>/_build/<target>/`).
   - Per `--target all`, default: `<course_folder>/_build/markdown/`, `_build/liascript/`, ecc.
   - Per `--output /custom + --target all`, scrive in `/custom/markdown/`, `/custom/liascript/`, ecc.
   - Per singolo target `--output /custom`, scrive direttamente in `/custom/` (compatibile)
5. **Teacher review** (opzionale, se --review o --approve): solo sul primo target quando `--target all`.

## CLI Implementation (`lessonos/cli.py`)

Parser: `_parse_args` lines 736-790 — `compile-course` subparser with folder posizionale.
Handler: `main()` lines 841-990 — iterates targets, try/except su ValueError, exit code 1 su errore.
Teacher review integration: per-single-target, o solo primo target per `all`.

## Test Coverage (`tests/test_cli_compile_course.py`)

29 test non-tautologici:

| Categoria | Test |
|-----------|------|
| Parser | 8 test: default args, all targets, --include-ai-atoms, --output, --review, --approve, --review+--approve, --target all |
| Error paths | 3 test: folder not found, no course.json, invalid blueprint |
| Happy paths | 8 test: markdown default, explicit, custom output, liascript, quarto, content check, empty module, output dir created |
| Teacher review | 5 test: --review (0 note, status, review.json), --approve (1 note, approved, output), --both, --review with custom output, moodle-xml target |
| P2 quarto-slides | 3 test: --theme beige, --theme default, --target all produces 5 formats |
| P2 --target all | 2 test: --target all produce tutti e 5 i formati; --review stampato solo una volta (non 5) |

## Design

- **ZERO-LLM**: puro wiring tra moduli deterministici già testati
- **ZERO deps nuove**: nessuna dipendenza aggiuntiva
- **Error-first**: ValueError catturati con messaggio chiaro e exit code 1
- **Output lazy**: crea la directory solo se necessario (rispetto dei moduli esistenti)
- **Backward compat**: singolo target mantiene formato output storico ("Course compiled (markdown): ...") e percorso di output invariato
