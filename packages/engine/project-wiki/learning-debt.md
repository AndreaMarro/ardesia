# Learning Debt Ledger (PLAN §3.4)

## Scopo
Il Learning Debt Ledger è il "registro debito" del percorso didattico — concetti non padroneggiati, dubbi sospesi, esercizi non corretti, prerequisiti deboli. Aggrega i dati da PathMemory + DidacticDelta in item azionabili, ciascuno con evidenze e citazioni.

## Moduli
- `lessonos/graph/learning_debt.py` — `LearningDebtLedger` dataclass frozen + `compute_learning_debt(memory, delta, path_id="p1")` pura computazione (zero LLM calls)
- Esportato via `lessonos/graph/__init__.py`

## Categorie di debito (5, da PLAN §3.4 + §26.2)
1. **unmastered_concept** — concetti con status "problematic" nel PathMemory (da delta.still_open + scan diretto PathMemory.concept_graph, deduplicati per nome). **severity** derivata da per-concept difficulty FSRS: `severity = 1.0 + (D-5.0)/5.0`, clamped a [0.2, 2.0] (`file:line 84-113`)
2. **under_practiced** — concetti in ≥2 lezioni ma pochi esercizi (keyword-match su exercise_bank vs n_lesson). severity default=1.0 (non derivata da difficulty) 
3. **over_repeated** — concetti in 3+ lezioni (soglia PLAN §3.3 §14.2 ripetizione eccessiva)
4. **open_doubt** — domande/errori ricorrenti da PathMemory.recurring_misconceptions
5. **weak_prerequisite** — prerequisiti dichiarati in ConceptExtraction.prerequisites ma MAI introdotti nel PathMemory.concept_graph (analisi nuova rispetto al Delta)

## Design
- `LearningDebtItem` (da `lessonos/models/entities.py:118`) con debt_id determinista `<path_id>#<kind>#<idx>`
- `LearningDebtLedger` con `items: tuple`, `total_items: int`, `by_kind: MappingProxyType[str, int]` (immutabile)
- Ogni item: debt_id, path_id, kind, description, lesson_id (ultima lezione), resolved=False, citations
- `DEBT_KINDS: frozenset` — vocabolario controllato (5 tipi)
- Guard: ValueError se PathMemory.concept_graph vuoto; delta vuoto = return ledger con zero item (graceful)

## File
- `lessonos/graph/learning_debt.py:1-370` — modulo completo (dataclass, 5 detect funzioni + compute orchestration)
- `lessonos/graph/__init__.py:9-12` — export LearningDebtLedger, compute_learning_debt, DEBT_KINDS
- `tests/test_learning_debt.py:1-430` — 16 test (5 categorie + edge cases)

## Review
Review Claude Code (`./bin/review.sh`): 2 fix veri — `by_kind` da dict a MappingProxyType (immutabilità frozen dataclass), debt_id indexing da `len(items)` a explicit counter locale.

M4 completo (MILESTONES.md aggiornato: tutti i task M4 checkati). Prossimo: M5 eval harness.
