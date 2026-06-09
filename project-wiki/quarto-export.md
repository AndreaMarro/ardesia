# Quarto Course Exporter (P1) — _quarto.yml + .qmd files

Il Quarto Exporter trasforma un CourseBlueprint + ContentAtoms in una struttura
di progetto [Quarto](https://quarto.org/) pronta per rendering (HTML, PDF, slides).

**Frase guida:** Output deterministico, zero-LLM, pura trasformazione dati.

## Output structure

```
<output_dir>/
  _quarto.yml          — Quarto project config (project:type:book, chapters, format)
  index.qmd            — course index page with module TOC
  modules/
    <module_slug>.qmd  — per-modulo: contenuti, esercizi, quiz
  exercises.qmd        — (opzionale) tutti gli esercizi aggregati
  quiz.qmd             — (opzionale) tutte le domande quiz aggregate
```

## API (`lessonos/export/quarto.py`)

### `export_quarto(blueprint, atoms=None, *, output_dir='', filename='index.qmd', include_ai_atoms=False) -> QuartoCoursePack`

- **`blueprint`**: CourseBlueprint da esportare.
- **`atoms`**: Opzionale. Dict `lesson_id → tuple of ContentAtom`. Se None, moduli
  mostrano solo lezioni e obiettivi.
- **`output_dir`**: Directory di output. Vuota = solo pack in memoria (test).
- **`filename`**: Nome del file qmd principale (default: `index.qmd`).
- **`include_ai_atoms`**: Default False. Se True, include atomi `explicit_ai_inference=True`.

### `QuartoCoursePack`

Frozen dataclass: `files: Dict[str, str]` — mappa `file_path_relativo → contenuto`.

## Formati Quarto generati

### `_quarto.yml`
Configurazione completa del progetto:
```yaml
project:
  type: book
title: "..."
book:
  title: "..."
  author: "..."
  chapters:
    - index.qmd
    - modules/mod1_derivate.qmd
    - ...
format:
  html:
    theme: cosmo
  pdf:
    documentclass: scrreport
  epub:
    cover: ""
```

### Module .qmd files
- Sezione `# <Modulo>` con obiettivi e lezioni elencate
- Contenuti atom (definition, explanation, etc.) come `### <Tipo>` heading + body
- Esercizi in `::: {.callout-exercise}` blocks
- Quiz in `::: {.callout-question}` blocks

### Atom formatting (`quarto.py:277-345`)
- `_format_content_atom(atom)` → `### Type` heading + body + source_refs + flag
- `_format_exercise_in_quarto(atom)` → `::: {.callout-exercise}` block
- `_format_quiz_in_quarto(atom)` → `::: {.callout-question}` block
- `_slugify(title)` → filename-safe slug (spazi → underscore, accenti rimossi)
- `_escape_yaml(value)` → YAML-safe string escaping

## Test (`tests/test_export_quarto.py`)

46 test, 7 categorie:
1. **Slugify** (5 test): caratteri speciali, accenti, spazi
2. **YAML escape** (4 test): doppi apici, #, plain text
3. **Content atom formatting** (4 test): type heading, source_refs, teacher_approved
4. **Export structure** (12 test): _quarto.yml, index.qmd, modules/, ValueError empty
5. **Atoms in modules** (7 test): rendering, AI-inferred exclusion, content_atom_ids filter
6. **Exercise/Quiz** (5 test): callout blocks, aggregate exercises.qmd/quiz.qmd
7. **Output to disk** (4 test): write to output_dir, module subdir, content match

## Design decisions

- **ZERO-LLM, ZERO deps nuove**: stdlib only (os, dataclasses, typing)
- **Frozen dataclass** con factory dict per `files` (come Markdown/LiaScript exporters)
- **Firma identica** a `export_liascript`/`export_course_markdown` per coerenza API
- **Atomi test sempre `explicit_ai_inference=True`** per evitare grounding violations
  (l'export è consumer passivo, non verifica grounding)
- **Stessa logica di filtro** dei moduli (content_atom_ids, lesson_id membership)
  già validata in markdown/liascript exporters
