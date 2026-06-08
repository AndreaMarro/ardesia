# PipelineOrchestrator — run_pipeline() + PipelineResult

`lessonos/pipeline.py` — reusable pipeline orchestrator for the LessonOS Core Engine.

## Why extract from CLI

- `cli.py:run_path()` prints to stdout and returns a bare dict — not reusable programmatically
- `run_pipeline()` returns a ``PipelineResult`` with **all intermediate objects** (capsules, memory, delta, debt, plan, store)
- Importable by tests, eval scripts, and future integrations (FastAPI, scheduled runs)
- Same mock payloads as CLI (``LESSON_MOCKS`` dict importable from ``lessonos.pipeline``)

## API

```python
from pathlib import Path
from lessonos.pipeline import run_pipeline, PipelineResult

result = run_pipeline()
# Or with custom fixture root:
result = run_pipeline(fixture_root=Path("path/to/fixtures"))
# Or with review feedback (post-lesson FSRS difficulty update):
result = run_pipeline(review_feedback={"derivata": 3, "rapporto incrementale": 5})

print(result.summary)
for capsule in result.capsules:
    print(capsule.lesson_id, len(capsule.content.concepts))
print(f"Memory: {result.memory.total_concepts} concepts")
print(f"Delta: {len(result.delta.new_concepts)} new")
print(f"Debt: {result.debt.total_items} items")
print(f"Plan: {result.plan.total_agenda_items} items")
```

## PipelineResult fields

- `path_id` — str, path identifier from path.json
- `capsules` — tuple of LessonCapsule (one per lesson with a registered mock)
- `memory` — PathMemory from all capsules
- `delta` — DidacticDelta (first N-1 vs all N), empty if <2 capsules
- `debt` — LearningDebtLedger from memory + delta
- `plan` — NextLessonPlan from memory + delta + debt
- `store` — SQLiteStore (in-memory unless passed explicitly)
- `elapsed_seconds` — wall clock time
- `total_cost_usd` — mock = $0.0; real provider = logged from CostLedger
- `total_llm_calls` — 2 per lesson (segmentation + extraction)

## Parameters

- `fixture_root` (Path, optional) — path to fixture directory, defaults to `fixtures/sample_path`
- `store` (Store, optional) — existing Store instance; creates in-memory SQLiteStore if None
- `review_feedback` (dict[str, int], optional) — SM-2 quality scores (0–5) per concept name. If provided, `apply_review_feedback` is called after PathMemory build, updating difficulty values. The updated memory feeds into Delta, Debt, and Plan computation. See `lessonos/pipeline.py:516-591`, `lessonos/graph/path_memory.py:434-526`

## Validation

- `run_pipeline(fixture_root)` validates the path exists and contains `path.json`
- Raises `ValueError` with clear message on invalid input

## Files

- `lessonos/pipeline.py` — 623 line module (`file:line 1-623`)
- `tests/test_pipeline.py` — 401 test non-tautologici (`file:line 1-401`)
- `lessonos/cli.py` — unchanged, cli imports mock payloads internally (old pattern for backward compat)
