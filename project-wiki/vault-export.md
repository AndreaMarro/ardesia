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
- `dispense/` — dispense stilizzate con badge per-claim (M2-5: `✅`/`✗` per claim verificato/non verificato)
- `teacher_book/` — libri del docente con badge per-evidenza (M2-5: `✅`/`✗`)
- `grafo-prerequisiti.canvas` — JSON Canvas 1.0 opzionale

## Invarianti

1. **Idempotenza byte-per-byte** — seconda esecuzione produce output identico.
2. **raw_to_merged** — mapping autoritativo dall'aggregatore (`AggregatedPathGraph.raw_to_merged`, M1-7b). Mappa OGNI raw_id (es. `l2:concept:0`) al merged node_id (`path:l1:concept:0`).
3. **Dipendenze** — `depends_on`(A->B): B è prereq di A; `explains`(A->B): A è prereq di B.
4. **rmtree guard** (`obsidian_vault.py:167-214`, RETRO-FIX `88622ab`) — l'output DENTRO derived/ (layout documentato `derived/vault/<teacher>`) è cancellabile per il ri-export; blocca output UGUALE o ANTENATO di derived/, qualsiasi overlap con raw/ (FRATELLO di derived/ nel layout reale, candidate da parent risolto e non-risolto, risolte contro symlink), confronto casefolded su macOS (APFS case-insensitive), exact-match per /, ~, cwd. Il guard precedente era INVERTITO (bloccava dentro-derived → ogni 2° export reale alzava ValueError, retro-review CRITICO 2026-06-12).
5. **Badge per-claim** (M2-5) — le pagine dispensa vault ricevono badge `✅`/`✗` post-process via `_add_dispensa_badges()` e `claim_badge()`. TeacherBook markdown generato ZERO-LLM nel vault via `render_teacher_book()` (già badge-ato da M2-3 `_render_citations`).

## File chiave

- `lessonos/export/obsidian_vault.py` (vault export, 450 righe) `file:1-450`
- `lessonos/graph/aggregator.py` (raw_to_merged costruzione) `file:89-163`
- `lessonos/models/entities.py` (AggregatedPathGraph.raw_to_merged) `file:238`
- `tests/test_obsidian_vault.py` (37 test: 4 M1-7b content, 8 TestRmtreeGuard) `file:1-960`

## Esecuzione reale (M1-7c, 2026-06-12)

Eseguito su DB reale Teoria-Segnali (4 lezioni, ~700KB):

- **96/96 pagine concetto** generate, tutte con Evidenze non vuota
- **0 occorrenze "(concetto non trovato)"** in tutto il vault
- **258 ^seg anchor** nella trascrizione prima_lezione
- **Canvas**: 96 nodi, 0 archi (nessuna relazione concetto→concetto in questo dataset — onesto)
- **Idempotenza**: secondo run byte-per-byte identico
- **Nessun fix codice**: DB reale compatibile al 100%

Output: `~/maestro-data/teoria-segnali-2021/derived/vault/andrea/` (114 file, 948KB)
