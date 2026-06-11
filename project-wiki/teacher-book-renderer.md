# TeacherBook Renderer (M1-3)

ZERO-LLM markdown renderer che produce documenti strutturati da `TeacherBook`.

## Modulo

`lessonos/teacher_book_renderer.py` — tre funzioni pubbliche:

```python
render_teacher_book(book: TeacherBook) -> str
render_comparative_report(books: dict[str, TeacherBook]) -> str
render_qualitative_diff(books, focus_ids=("prof_pratico", "prof_socratico", "prof_rigoroso")) -> str
```

## Sezioni del TeacherBook markdown

1. **Title + Metadata** — teacher_id, statistiche aggregate (concetti, lezioni, edges, evidence)
2. **Overview** — frase narrativa con le statistiche
3. **Fundamental Concepts** — concetti ordinati per `evidence_count` decrescente (enfasi pedagogica del docente), con citazioni grounded (`seg_id` + excerpt verbatim troncato a 100 char). Se >5 citazioni, mostra "+N more" note.
4. **Problematic Concepts** — concetti con `status='problematic'`, con citazioni
5. **Status Progression** — evoluzione dello status cross-lezione (introduced→reinforced→reviewed→mastered). Ogni status è accoppiato alla lezione corrispondente via `zip(status_sequence, lesson_sequence)`: `_introduced_ (l1) → _reinforced_ (l2)`. Se le sequenze hanno lunghezza diversa, fallback: tutti i lesson_id vengono mostrati per ogni status.
6. **Prerequisite Chains** — dipendenze `depends_on` + capsule-declared prerequisites
7. **Grounding footer** — firma "ZERO-LLM, fully grounded" con conteggio totale evidence

## Comparative report

`render_comparative_report` produce:
- Tabella markdown con tutti i docenti e metriche (Concepts, Edges, Evidence, Lessons, Problematic, Prereqs)
- Per-teacher highlights con top-3 concetti, problematici, prerequisite chains esemplari

## Qualitative diff (stili opposti)

`render_qualitative_diff(books, focus_ids)` produce un documento markdown con 6 sezioni:

1. **Per-Style Characterisation** — narrativa per ogni stile (evidence density, prerequisite depth, top-3 concepts)
2. **Comparative Metrics** — tabella 3-colonne head-to-head (Concepts, Edges, Evidence, Evidence/Concept, Prereqs, Problematic)
3. **Fundamental Concepts Comparison** — top-5 concetti per ogni stile
4. **Prerequisite Structure** — profondità media, deepest chain per stile
5. **Qualitative Takeaway** — paragrafo narrativo per stile basato sulle metriche
6. **Footer** — firma ZERO-LLM

## Invarianti

1. **ZERO-LLM**: nessuna chiamata router, interamente deterministico
2. **Grounded**: ogni citazione preserva `seg_id` e excerpt verbatim dal grafo
3. **Stabile**: stesso input → stesso output byte-per-byte (testato)
4. **Nessuna modifica a moduli esistenti**: solo moduli nuovi + test

## Test

16 test in `tests/test_teacher_book_renderer.py`:
- Basic structure (tutte le sezioni presenti)
- Fundamental ranking (ordine per evidence_count preservato)
- Problematic (sezione separata, messaggio se assenti)
- Progression (status sequence con lesson IDs)
- Prerequisites (concept → dependency mapping)
- Empty TeacherBook (nessun crash)
- Citation excerpt truncation (>100 char)
- More than 5 citations shows "+N more" note
- Report structure (tabella + highlights)
- Report with problematic
- Empty report
- Determinismo byte-per-byte (report)
- **Qualitative diff structure** (6 sezioni, ZERO-LLM footer)
- **Qualitative diff empty books** (nessun crash)
- **Qualitative diff deterministic** (byte-per-byte stabilità)
- Comparative report deterministic

## Runner scripts

- `bin/run_teacher_book.sh <teacher_id>` — build + render per un docente
- `bin/run_all_teacher_books.sh` — build + render per tutti i 10 docenti + comparative report

Output in `~/maestro-data/fisica1-sim/derived/teacher_book/`.

## File

- `lessonos/teacher_book_renderer.py` — renderer (3 funzioni pubbliche)
- `tests/test_teacher_book_renderer.py` — 16 test
- `bin/run_teacher_book.sh` — per-teacher runner
- `bin/run_all_teacher_books.sh` — batch runner + report + diff
- `~/maestro-data/fisica1-sim/derived/teacher_book/REPORT.md` — comparative report
- `~/maestro-data/fisica1-sim/derived/teacher_book/QUALITATIVE-DIFF.md` — qualitative style diff
- `~/maestro-data/fisica1-sim/derived/teacher_book/<teacher_id>.md` — 10 markdown files
