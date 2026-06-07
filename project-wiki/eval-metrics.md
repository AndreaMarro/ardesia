# Eval Metrics — Groundedness and Citation Accuracy (M5-task2, PLAN §22)

## Overview

Two reusable `EvalMetric` factory functions that score eval results for citation quality. Both are designed to work with any eval result by recursively introspecting the result tree for `Citation` objects.

## Modules

- **`lessonos/eval/metrics.py`** — `build_groundedness_metric()` and `build_citation_excerpt_accuracy_metric()` (lines 1-192)
- **`lessonos/eval/__init__.py`** — exports both factories (line 8-9)
- **`tests/test_eval_harness.py`** — `TestEvalMetrics` class (lines 229-478): 9 tests

## build_groundedness_metric(store, name="groundedness") -> EvalMetric

Scans every `Citation` object in the eval result and verifies that `seg_id` resolves to a real persisted `Segment` via `store.get_segment(seg_id)`.

**Score**: `valid_citations / total_citations`. Pass if score == 1.0 (all citations grounded). Empty citation list passes with note.

**Location**: `lessonos/eval/metrics.py:77-109`

## build_citation_excerpt_accuracy_metric(store, name="citation_excerpt_accuracy") -> EvalMetric

Scans every `Citation` with a non-null `excerpt` and checks that the excerpt appears as a **case-sensitive substring** within the referenced Segment's text.

**Score**: `matching_excerpts / checked_excerpts`. Citations with `excerpt=None` are skipped (optional field per PLAN §26.1). Pass if score == 1.0 or no excerpts to check.

**Location**: `lessonos/eval/metrics.py:115-173`

## Internal: _collect_citations(result) -> list[Citation]

Recursively walks any Python object and collects all `Citation` instances. Handles `LessonCapsule`, `LessonContent`, `ConceptExtraction`, `ExerciseExtraction`, `QuestionExtraction`, `HomeworkExtraction`, dicts, lists, tuples, and arbitrary dataclasses. Uses `id()`-based cycle detection to avoid infinite recursion on circular references.

**Location**: `lessonos/eval/metrics.py:35-75`

## Integration with run_eval

Both metrics can be passed to `lessonos.eval.runner.run_eval()` via the `metrics` parameter:

```python
from lessonos.eval import run_eval, build_groundedness_metric, EvalCase

store = SQLiteStore(":memory:")
store.save_segment(Segment(seg_id="s1", ...))

metric = build_groundedness_metric(store)
report = run_eval([my_case], metrics=[metric])
```

## Tests

| Test | What it verifies |
|------|-----------------|
| `test_groundedness_all_valid` | All citations resolve → pass |
| `test_groundedness_fails_on_broken_seg_id` | Non-existent `s99` → fail |
| `test_groundedness_empty_citations_pass` | No citations → pass gracefully |
| `test_excerpt_accuracy_all_match` | Excerpt is substring of segment text → pass |
| `test_excerpt_accuracy_fails_on_mismatch` | Excerpt not in segment text → fail |
| `test_excerpt_accuracy_skips_null_excerpts` | `excerpt=None` → skip (pass) |
| `test_excerpt_accuracy_case_sensitive` | Case mismatch ('Derivata' vs 'derivata') → fail |
| `test_metrics_integrate_with_run_eval` | Custom metric via `run_eval()` produces real results |
| `test_metrics_exported_from_init` | Both factories callable from `lessonos.eval` |

## Eval Set: test_cases.py (M5-task1)

`lessonos/eval/test_cases.py` (file:line 1-1093) defines 20 `EvalCase` entries in `ALL_CASES` registry covering all pipeline stages. Each case runs on mock data (deterministic, free, fast).

### Cases by category

**Segmentation** (1): `segmentation_returns_topics` — mock-based topic grouping validates labels and segment IDs.

**Extraction** (3): `extraction_rejects_bad_grounding` (fabricated seg_id → ValueError), `extraction_valid_full_content` (all 4 fields + grounded citations), `extraction_rejects_invalid_status` (status outside CONCEPT_STATUS vocab).

**Assembly** (2): `assembly_produces_capsule` (full pipeline produces LessonCapsule), `assembly_rejects_no_segments` (ValueError on uningested lesson).

**Capsule persistence** (1): `capsule_persists_and_reloads` — save → load round-trip via store.

**Path Memory** (4): `path_memory_aggregates_concepts` (cross-lesson dedup), `path_memory_single_capsule` (minimal path), `path_memory_empty_list` (ValueError guard), `path_memory_case_insensitive_merge` (canonical merging).

**Didactic Delta** (3): `didactic_delta_detects_new` (new concept from L3), `didactic_delta_no_change` (identical data, separate objects), `didactic_delta_concept_clarified` (problematic→reviewed).

**Learning Debt** (2): `learning_debt_identifies_open` (unmastered debt), `learning_debt_over_repeated` (3+ lessons debt).

**Graph** (2): `graph_cross_lesson_connects_prerequisites` (repeats/explains edges), `graph_queries_by_concept` (where_introduced/where_reinforced).

**Next Lesson Planner** (1): `next_lesson_planner_prioritizes_gaps` (priority 0→4 ordering).

**Cost Ledger** (1): `cost_ledger_report_basic` (report with mock + Kimi entries).

### Running

```python
from lessonos.eval import run_eval
from lessonos.eval.test_cases import ALL_CASES
report = run_eval(ALL_CASES)  # 20/20 passes
print(report.summary())
```

All 20 cases pass via `run_eval(ALL_CASES)` (verified at each commit). Tests are pytest-free — they are `EvalCase` objects run through the `run_eval` runner. The `TestRunEval::test_runs_all_cases_default_metric` pytest test verifies ALL_CASES pass via the runner.

### Review history (Claude Code adversarial)

- 4 real fixes applied (2026-06-08): excerpts grounded to real substrings, tautological same-object delta test fixed, weak `>=1` assertions strengthened to `==1`, typo corrected.

## Constraints

- **Zero LLM calls**: both metrics are pure computation against a `Store` — free, fast, deterministic
- **No new dependencies**: stdlib only (dataclasses, collections.abc)
- **No DB changes**: metrics read from the existing `Store` interface; `_get_segment_text` uses `store.get_segment()` already available
- **Grounding-first**: the metrics do NOT validate excerpts for ungrounded citations (seg_id that doesn't resolve). That's the groundedness metric's job — they compose orthogonally.
