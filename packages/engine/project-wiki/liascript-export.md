# LiaScript Course Exporter — `lessonos/export/liascript.py`

P1 export deterministico (zero-LLM) che trasforma un `CourseBlueprint` + `ContentAtoms` opzionali in un corso LiaScript interattivo (.md singolo).

## Output

Singolo file .md compatibile LiaScript (`course.md` di default):

- **YAML frontmatter** — author (da audience), description (da level), format URL LiaScript
- **Titolo + metadati** — audience, level, n moduli, n lezioni in blockquote
- **Table of Contents** — anchor link per ogni modulo (`#module_0_derivate`)
- **Moduli** — ogni modulo con:
  - `<a name>` anchor per navigazione
  - Sezione obiettivi (se presenti)
  - Elenco lezioni (con inline code `` `lesson_id` ``)
  - Esercizi interattivi (code block javascript vuoto)
  - Quiz interattivi con sintassi LiaScript `?[]`
  - Atomi non-interattivi come plain content
- Separatori `---` tra moduli

## Regole

- `include_ai_atoms=False` (default): atomi con `explicit_ai_inference=True` o tipo in `{summary, objective}` sono ESCLUSI
- `content_atom_ids` filtrano gli atomi per modulo (se presenti nel blueprint)
- Atomi con `lesson_id` non in nessun modulo: scartati silenziosamente
- ValueError su blueprint senza moduli
- ZERO-LLM, deterministico, stdlib only

## API

```python
pack = export_liascript(
    blueprint,
    atoms={"l1_id": (atom1, atom2, ...)},
    output_dir="/path/to/output",  # vuoto = solo in-memory
    filename="corso.md",
    include_ai_atoms=False,
)
# pack.files["corso.md"] -> str
```

## Test coverage (`tests/test_export_liascript.py`)

20 test:
- File prodotto, formato `.md`
- Frontmatter YAML con format, author
- Titolo, moduli, obiettivi, TOC, separator
- ValueError su moduli vuoti
- Audience/level pass-through
- Filename customizable
- Output su disco + content match
- Quiz atoms in formato `?[]`
- AI-inferred atoms esclusi/inclusi per flag
- Unknown lesson scartati
- Atomi vuoti, content_atom_ids filter
