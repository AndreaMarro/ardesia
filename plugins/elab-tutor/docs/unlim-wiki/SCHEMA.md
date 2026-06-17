# UNLIM Wiki — SCHEMA + Conventions

**Ref:** ADR-006 karpathy-llm-wiki-three-layer
**Layer:** L3 (schema) of three-layer pattern
**Purpose:** defines conventions, ingest workflow, lint rules for L2 wiki markdown files.

---

## Three-layer pattern

```
L1 Raw (immutable)       →  src/data/rag-chunks.json + PDF volumi
L2 Wiki (LLM-authored)   →  docs/unlim-wiki/  (this dir)
L3 Schema (conventions)  →  docs/unlim-wiki/SCHEMA.md  (this file)
```

**L1 fonte di verità storica, mai modificabile da LLM.**
**L2 compound memory LLM-owned, evolve nel tempo.**
**L3 regole per mantenere L2 coerente.**

---

## File types

```
docs/unlim-wiki/
├── SCHEMA.md                         # L3 — this file
├── index.md                          # Catalog (LLM reads first)
├── log.md                             # Append-only audit (ingest/query/lint)
├── concepts/                         # LLM-evolving analogies + glossary
│   ├── led.md
│   ├── resistenza.md
│   ├── legge-ohm.md
│   └── ...
├── experiments/                      # 92 experiments (1 per esperimento)
│   └── v1-cap6-esp1.md
├── lessons/                          # 27 lezioni (1 per lezione)
│   └── lezione-01.md
├── errors/                           # errori comuni + diagnosi
│   └── led-not-lighting.md
└── students/                         # compound memory per classe (gitignored, Supabase)
```

---

## Front-matter convention

Ogni file markdown DEVE iniziare con:

```yaml
---
id: <unique-id>                      # es. "led", "v1-cap6-esp1", "lezione-01"
type: concept | experiment | lesson | error | student
title: "Nome leggibile"
locale: it | en | es | fr | de       # default it
volume_ref: 1 | 2 | 3                 # se applicabile
pagina_ref: 27                        # se applicabile
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
updated_by: <agent-name>              # es. "architect", "planner", "scribe"
tags: [led, circuito, base]
---
```

---

## Content convention

### Concepts
- 1 concept = 1 file
- Max 600 parole
- Struttura:
  1. Definizione 1-frase (cita Vol.X pag.Y)
  2. Analogia per bambino 8-14 (es. "come piccola lampadina")
  3. Formula/parametri chiave (se quantitativo)
  4. Esperimenti correlati (link a experiments/)
  5. Errori comuni (link a errors/)

### Experiments
- 1 file per esperimento
- Include bookText citato da `src/data/volume-references.js`
- Componenti kit (da Omaric list)
- Step passo-passo
- Expected outcome

### Lessons
- 1 file per lezione (27 totali)
- Link a esperimenti inclusi
- Sequenza didattica

### Errors
- 1 file per errore tipico
- Sintomo → causa probabile → fix step-by-step
- Include screenshot reference se disponibile

---

## Ingest workflow

### Manual
1. Scrittore (agent o umano) crea/modifica file sotto `docs/unlim-wiki/`
2. Pre-commit hook lint (sezione sotto)
3. Commit + PR
4. Merge → Wiki LLM cache invalidate

### LLM-assisted (Sprint 6+)
1. `@architect` o `@scribe` produce draft concept/experiment/lesson
2. Draft in `docs/unlim-wiki/draft-*.md`
3. Human review → move to canonical location
4. Lint + merge

### Automatic append-only log
Ogni modifica a `docs/unlim-wiki/**` → append 1 riga a `log.md`:
```
2026-04-23T10:00Z | architect | concepts/led.md | create | "led.md — concept base Vol.1 pag.27"
```

---

## Lint rules (pre-commit)

Script `scripts/wiki-lint.mjs` (da creare Sprint 6 Day 41) verifica:

1. Ogni file ha front-matter completo
2. `id` unico across wiki
3. `volume_ref` + `pagina_ref` coerenti con L1 (se citano Vol/pag)
4. Links relativi risolvono (no broken ref)
5. Principio Zero v3: contenuto parla ai ragazzi, non docente
6. Max 800 parole per file (soft limit, warning)
7. No PII in students/*.md (hard check)

---

## Query workflow

UNLIM usa Wiki come layer 2 retrieval:

```js
// Pseudo-code dispatcher
const chunks = await ragRetrieve(query);                   // L1 raw
const wikiHits = await wikiRetrieve(query);                // L2 LLM-owned
const context = mergeSnapshot(chunks, wikiHits, sessions); // state-snapshot-aggregator
```

Wiki L2 viene caricato via `scripts/wiki-corpus-loader.mjs` + `scripts/wiki-query-core.mjs` (ADR-007 module extraction pattern).

---

## Onestà

- Oggi: 3 concept seed files (led, resistenza, legge-ohm).
- Sprint 6 Day 41-42: espansione a ~15-20 concetti + 27 lezioni stub.
- Sprint 7-8: full 92 experiments + errors library.
- Target Sprint 12: 200+ markdown pages in wiki, indexed via BGE-M3 pgvector.

**Wiki NON sostituisce RAG chunks.** Sono complementari: chunks = raw text retrieval, wiki = structured LLM-owned concepts con link e evoluzione.
