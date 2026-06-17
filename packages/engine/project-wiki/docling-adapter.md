# Docling-adapter — PDF, DOCX, HTML, VTT, SRT extraction (P1, ZERO new deps)

Converte sorgenti non-native (PDF, DOCX, HTML, VTT, SRT) in testo puro,
usando subprocess per pdftotext/pandoc e stdlib per HTML/VTT/SRT.

## API

- `docling_extract(file_path, source_type) -> str | None` — dispatcher principale

## Estrattori

| Formato | Metodo | Tool esterno | Fallback se assente |
|---------|--------|-------------|---------------------|
| PDF | `pdftotext -nopgbrk` via subprocess | poppler (pdftotext) | None |
| DOCX | `pandoc -t plain` via subprocess | pandoc | None |
| HTML | `html.parser` (stdlib) — salta script/style | Nessuno | None (file vuoto) |
| VTT | Text parser — rimuove WEBVTT/timestamp/NOTE | Nessuno | None |
| SRT | Text parser — rimuove numero/timestamp | Nessuno | None |

## Integrazione con SourceMaterial

`source_extractor.py:_extract_single_source` ora chiama `docling_extract` per
pdf/docx/html/vtt/srt invece del placeholder "richiede Docling adapter". Se
l'estrazione fallisce (tool mancante o file vuoto), restituisce `SourceMaterial`
con `.error` differenziato per tipo:

- PDF: "Richiede pdftotext (poppler) — esegui 'brew install poppler'"
- DOCX: "Richiede pandoc — esegui 'brew install pandoc'"
- HTML: "Parsing HTML fallito (file vuoto o malformato)"
- VTT: "Parsing VTT fallito (file vuoto o malformato)"
- SRT: "Parsing SRT fallito (file vuoto o malformato)"

## Source di riferimento

- `lessonos/export/docling_adapter.py:1-239` — implementazione completa
- `tests/test_docling_adapter.py:1-536` — 25 test: dispatch, 5 estrattori, edge cases, integrazione con CourseFolder

## Design

Zero-LLM, deterministico, zero new Python deps (solo subprocess + stdlib).
Graceful fallback: se pdftotext/pandoc non installati → None → errore
differenziato. HTML/VTT/SRT sempre disponibili (stdlib/text parser).
