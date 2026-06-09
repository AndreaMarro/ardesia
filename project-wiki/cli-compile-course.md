# CLI compile-course — Compila una cartella corso in formato esportabile

Il comando `lessonos compile-course` (P1, COORDINATION.md §18) è un wiring
puro che compone i moduli esistenti (CourseFolder loader + CourseBlueprint
builder + exporter) in una singola CLI.

## Usage

```
lessonos compile-course <folder> [--target markdown|liascript|quarto] [--output DIR] [--include-ai-atoms] [--review] [--approve]
```

## Pipeline

1. **`load_course_folder(folder)`** (`lessonos/course/folder_loader.py:24-76`) — carica course.json
2. **`build_course_blueprint(course)`** (`lessonos/course/folder_loader.py:155-177`) — costruisce blueprint deterministico
3. **Route a exporter** per target:
   - `markdown` → `export_course_markdown()` (`lessonos/export/markdown_course.py:42-186`)
   - `liascript` → `export_liascript()` (`lessonos/export/liascript.py:44-185`)
   - `quarto` → `export_quarto()` (`lessonos/export/quarto.py`)
4. **Output** nella directory specificata (default: `<course_folder>/_build/<target>/`)
5. **Teacher review** (opzionale, se --review o --approve): crea TeacherReviewSet vuoto, opzionalmente lo auto-approva con una nota APPROVE a livello COURSE, serializza come `review.json` nell'output dir.

## CLI Implementation (`lessonos/cli.py`)

Parser: `_parse_args` lines 736-776 — `compile-course` subparser with folder posizionale.
Handler: `main()` lines 815-930 — try/except su ValueError, exit code 1 su errore.
Teacher review integration: `main()` lines 899-929 — crea/review_set serializzato.

## Test Coverage (`tests/test_cli_compile_course.py`)

22 test non-tautologici:

| Categoria | Test |
|-----------|------|
| Parser | 7 test: default args, all targets, --include-ai-atoms, --output, --review, --approve, --review+--approve |
| Error paths | 3 test: folder not found, no course.json, invalid blueprint |
| Happy paths | 8 test: markdown default, explicit, custom output, liascript, quarto, content check, empty module, output dir created |
| Teacher review | 4 test: --review (0 note, status, review.json), --approve (1 note, approved, output), --both, --review with custom output |

## Design

- **ZERO-LLM**: puro wiring tra moduli deterministici già testati
- **ZERO deps nuove**: nessuna dipendenza aggiuntiva
- **Error-first**: ValueError catturati con messaggio chiaro e exit code 1
- **Output lazy**: crea la directory solo se necessario (rispetto dei moduli esistenti)
