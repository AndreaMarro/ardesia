# project-wiki/ — Index

Ogni pagina + riassunto 1 riga.

## Meta

- **schema.md** — convenzioni wiki: 1 concetto/pagina, citazioni verificate, index+log, codice-vince-su-doc
- **log.md** — storia append-only delle modifiche wiki

## Architettura e Principi

- **architecture.md** — decisioni architetturali fondamentali (Python, SQLite, router multi-LLM, JSON strutturati)
- **grounding.md** — invariante anti-allucinazione: citazioni validate, ValueError su seg_id fabbricato

## Sistemi Core

- **llm-router.md** — router astratto + provider mock (deterministico) + kimi (Moonshot eval-gated)
- **data-model.md** — 9 entità domain + vincoli vocab (EDGE_TYPES, CONCEPT_STATUS) validati a costruzione
- **store.md** — layer persistenza astratto (Store ABC) + SQLiteStore relazionale
- **capsule-pipeline.md** — pipeline estrazione Lesson Capsule: ingest → segmentation → extraction
- **path-memory.md** — Path Memory: aggregazione path-level da capsules (M3-task3)
- **didactic-delta.md** — Didactic Delta: diff tra versioni PathMemory (M4-task1, PLAN §3.3)
|- **learning-debt.md** — Learning Debt Ledger: 5 categorie di debito didattico da PathMemory + Delta (M4-task2, PLAN §3.4)
|- **next-lesson-planner.md** — Next Lesson Plan: agenda prioritizzata per la prossima lezione da PathMemory + Delta + Debt (M4-task3, PLAN §8.2)
