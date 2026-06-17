# Cross-Fixture Grounding Audit (P2)

Audit centralizzato che esegue `run_pipeline` su ogni fixture path e verifica
che TUTTE le citazioni in TUTTE le capsule abbiano **grounding valido**:

1. `Citation.seg_id` risolve a un Segment persistito nello Store
2. `Citation.excerpt` (se non None) è substring del testo del segmento referenziato

## Fixture testate

| Fixture | Lezioni | Dominio |
|---------|---------|---------|
| `fixtures/sample_path/` | 4 | Calcolo (derivate, integrali) |
| `fixtures/spaced_path/` | 2 | Spaced Repetition (SM-2, FSRS) |
| `fixtures/bio_path/` | 2 | Biologia (fotosintesi) |

## Test (`tests/test_pipeline_cross_fixture_grounding.py`)

6 test totali:

- `test_cross_fixture_grounding_audit[sample_path-4]` (parametrized) — 4 lessons, verifica grounding su concept/exercise/question/homework citations
- `test_cross_fixture_grounding_audit[spaced_path-2]` — 2 lessons
- `test_cross_fixture_grounding_audit[bio_path-2]` — 2 lessons
- `test_cross_fixture_grounding_audit_duplicate_seg_id_still_resolves` — seg_id attraverso lezioni multiple risolve
- `test_cross_fixture_grounding_audit_no_seg_id_invented` — canary su bio_path: nessun seg_id fantasma
- `test_store_returns_none_for_nonexistent_seg_id` — framework proof: `store.get_segment("l99s99")` → None

## Invariante

Nessuna citazione fabbricata sopravvive al test. Il test è **non-tautologico**:
verifica risoluzione EFFETTIVA dei seg_id nello store, non solo che il campo
non sia None.

## Storia

- 2026-06-16: creato come P2 backlog dopo Course Foundry completato. 1272 pass.
