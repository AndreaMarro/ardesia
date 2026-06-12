# Obsidian Vault Export (M1-7, M1-7b)

## Overview

`lessonos/export/obsidian_vault.py` — proietta il database del motore in un vault Obsidian navigabile.
ZERO LLM, ZERO modifiche al motore core.

## CLI

```
lessonos export-vault --teacher <id> --out <path> [--db PATH] [--derived PATH] [--canvas]
```

## Struttura vault

- `concetti/<slug>.md` — schede concetto con frontmatter YAML + prerequisiti + evidenze
- `trascrizioni/<lesson>.md` — trascrizioni con ^seg-<id> block anchor
- `wiki/` — riepiloghi lezione wikilink-ificati
- `dispense/` — dispense stilizzate wikilink-ificate
- `teacher_book/` — libri del docente wikilink-ificati
- `grafo-prerequisiti.canvas` — JSON Canvas 1.0 opzionale

## Invarianti

1. **Idempotenza byte-per-byte** — seconda esecuzione produce output identico.
2. **raw_to_merged** — mapping autoritativo dall'aggregatore (`AggregatedPathGraph.raw_to_merged`, M1-7b). Mappa OGNI raw_id (es. `l2:concept:0`) al merged node_id (`path:l1:concept:0`).
3. **Dipendenze** — `depends_on`(A->B): B è prereq di A; `explains`(A->B): A è prereq di B.
4. **rmtree guard** — blocca cancellazione di derived/, raw/, /, ~, cwd.

## File chiave

- `lessonos/export/obsidian_vault.py` (vault export, 450 righe) `file:1-450`
- `lessonos/graph/aggregator.py` (raw_to_merged costruzione) `file:89-163`
- `lessonos/models/entities.py` (AggregatedPathGraph.raw_to_merged) `file:238`
- `tests/test_obsidian_vault.py` (29 test, 4 M1-7b content) `file:1-820`
