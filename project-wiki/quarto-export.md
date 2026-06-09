# Quarto Course Exporter

P1: `lessonos/export/quarto.py` — `export_quarto()` produce `_quarto.yml` + `index.qmd` + `modules/*.qmd` + aggregati esercizi/quiz. Output: `QuartoCoursePack(files=dict)`.

P2: `export_quarto_slides()` produce `_quarto.yml` (format: revealjs) + `slides.qmd` con sezioni per modulo e slide per atomo. Output: `QuartoSlidesPack(files=dict)`.

## Features

- **Deterministico, zero-LLM**: pura trasformazione dati da CourseBlueprint + ContentAtoms
- **Formati**: book (html/pdf/epub) e slides (revealjs)
- **Moduli**: ogni modulo diventa un chapter/section con lezioni, contenuti, esercizi, quiz
- **Materiali**: sezione materiali del corso se forniti
- **Filtri**: `include_ai_atoms` esclude/includi atomi AI-inferred; `content_atom_ids` selettore per modulo

## CLI

```bash
lessons compile-course <folder> --target quarto     # book format
lessons compile-course <folder> --target quarto-slides  # revealjs slides
```

## Files prodotti

### Book
- `_quarto.yml` — project:type:book, format html/pdf/epub, chapters
- `index.qmd` — overview + modulo listing
- `modules/<slug>.qmd` — modulo detail con contenuti, esercizi, quiz
- `exercises.qmd` / `quiz.qmd` — aggregati se presenti

### Slides (revealjs)
- `_quarto.yml` — format: revealjs, theme simple, slide-number, incremental
- `slides.qmd` — H1 corso + H2 modulo + H3 atomi, separati da `---`

## Test

73 test totali (50 book + 23 slides) in `tests/test_export_quarto.py`.

Source: `lessonos/export/quarto.py` (file:line)
- `export_quarto()`: quarto.py:47-242
- `export_quarto_slides()`: quarto.py:396-552
- `_build_quarto_yml()`: quarto.py:248-292
- `_build_quarto_slides_yml()`: quarto.py:555-583
