"""FastAPI minimale per LessonOS Core Engine (M6-task2, opzionale PLAN §15).

Espone la pipeline demo su HTTP:

- ``GET /health`` — health check
- ``POST /paths/demo`` — esegue l'intera pipeline demo e restituisce JSON

Usage
-----
    uv run uvicorn lessonos.api:app --port 8000
"""

from __future__ import annotations

from types import MappingProxyType
from typing import Any

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from lessonos.capsule.assembly import assemble_lesson_capsule
from lessonos.cli import _build_router, _find_project_root
from lessonos.graph.didactic_delta import compute_didactic_delta
from lessonos.graph.learning_debt import compute_learning_debt
from lessonos.graph.next_lesson_planner import compute_next_lesson_plan
from lessonos.graph.path_memory import build_path_memory
from lessonos.store.fixture_loader import (
    ingest_lesson_moments,
    ingest_lesson_segments,
    load_sample_path,
)
from lessonos.store.sqlite import SQLiteStore

app = FastAPI(
    title="LessonOS Core Engine API",
    version="0.1.0",
    description=(
        "Headless didactic engine — Lesson Capsules, Path Memory, "
        "Didactic Delta, Learning Debt"
    ),
)


# ---------------------------------------------------------------------------
# JSON serialisation helpers (handle frozen dataclasses + MappingProxyType)
# ---------------------------------------------------------------------------


def _serialise(obj: Any) -> Any:
    """Recursively serialise frozen dataclasses + nested collections to JSON-safe dicts."""
    if isinstance(obj, MappingProxyType):
        return {k: _serialise(v) for k, v in obj.items()}
    if obj is None:
        return None
    if hasattr(obj, "__dataclass_fields__"):
        out: dict[str, Any] = {}
        for f in obj.__dataclass_fields__:
            out[f] = _serialise(getattr(obj, f))
        return out
    if isinstance(obj, (list, tuple)):
        return [_serialise(v) for v in obj]
    if isinstance(obj, (set, frozenset)):
        return [_serialise(v) for v in obj]
    if isinstance(obj, dict):
        return {k: _serialise(v) for k, v in obj.items()}
    # Primitives (str, int, float, bool) pass through
    return obj


# ---------------------------------------------------------------------------
# Pipeline helper
# ---------------------------------------------------------------------------


def run_demo_pipeline() -> dict[str, Any]:
    """Run the full demo pipeline on ``fixtures/sample_path``.

    Returns JSON-serialisable dict with keys:
    ``path``, ``capsules``, ``memory``, ``delta``, ``debt``, ``plan``.
    """
    project_root = _find_project_root()
    fixture_root = project_root / "fixtures" / "sample_path"

    store = SQLiteStore(":memory:")
    path = load_sample_path(store, fixture_root)
    lesson_ids = path.lesson_ids

    # Phase 1: ingest segments + moments
    for lid in lesson_ids:
        ingest_lesson_segments(store, lid, fixture_root)
        ingest_lesson_moments(store, lid, fixture_root)

    # Phase 2: assemble capsules (mock LLM)
    capsules = []
    for lid in lesson_ids:
        router = _build_router(store, lid)
        if router is None:
            continue
        capsule = assemble_lesson_capsule(store, lid, router)
        capsules.append(capsule)

    # Phase 3: Path Memory
    memory = build_path_memory(capsules, path_title=path.title)

    # Phase 4: Didactic Delta (L1+L2 vs L1+L2+L3)
    old_memory = build_path_memory(capsules[:-1], path_title=path.title)
    delta = compute_didactic_delta(old_memory, memory)

    # Phase 5: Learning Debt
    ledger = compute_learning_debt(memory, delta, path_id=path.path_id)

    # Phase 6: Next Lesson Plan
    plan = compute_next_lesson_plan(
        memory, delta, ledger, path_id=path.path_id
    )

    return {
        "path": _serialise(path),
        "capsules": _serialise(capsules),
        "memory": _serialise(memory),
        "delta": _serialise(delta),
        "debt": _serialise(ledger),
        "plan": _serialise(plan),
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/health")
async def health():
    """Health check — returns version and status."""
    return {"status": "ok", "version": "0.1.0"}


@app.post("/paths/demo")
async def run_demo():
    """Esegue l'intera pipeline demo sul percorso-fixture sintetico ``fixtures/sample_path``.

    Returns JSON strutturato con ``path``, ``capsules``, ``memory``, ``delta``,
    ``debt``, ``plan``.
    """
    try:
        result = run_demo_pipeline()
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "type": type(e).__name__},
        )
