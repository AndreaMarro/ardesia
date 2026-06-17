"""
Cross-iteration observation store for LessonOS.

Structured observations are persisted as JSONL in ``observations.jsonl`` at the
project root. This replaces the agentmemory hub (whose REST API is non-standard
and inaccessible from Hermes tools) with a file-based approach that survives
git reset --hard because it is committed.

At end of every iteration::

    from lessonos.observations import log_iteration, save_observation

    # Option A — one-shot (writes both observations.jsonl + log.jsonl)
    obs = log_iteration(
        task="M7 P2: ...",
        hypothesis="...",
        gate_passed=N,
        cost_usd=0.002,
        status="landed",
        files=["lessonos/module.py", "tests/test_module.py"],
    )

    # Option B — just observation
    save_observation(task=..., hypothesis=..., gate_passed=N, status="landed")

At ORIENT::

    from lessonos.observations import load_recent_observations
    recent = load_recent_observations(n=5)
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from dataclasses import dataclass, field, asdict

JSONL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "observations.jsonl")

# Path for the machine-readable iteration log (schema: PLAN §7 appendix)
_LOG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "log.jsonl")


@dataclass(frozen=True)
class Observation:
    """A structured cross-iteration observation.

    Attributes:
        ts: ISO-8601 UTC timestamp of the observation.
        commit: Git commit SHA (short) detected automatically.
        task: Short task identifier (e.g. "M7 P2: raw eval").
        hypothesis: One-line hypothesis for this iteration.
        file_line: Comma-separated ``file:line`` references affected.
        gate_passed: Number of passing tests at commit time.
        cost_usd: Estimated USD cost of this iteration.
        status: ``pass`` | ``blocked`` | ``invest`` | ``revert``.
        note: Free-form text note.
    """

    ts: str = field(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))
    commit: str = ""
    task: str = ""
    hypothesis: str = ""
    file_line: str = ""
    gate_passed: int = 0
    cost_usd: float = 0.0
    status: str = "pass"  # pass | blocked | invest | revert
    note: str = ""

    def to_jsonl(self) -> str:
        """Serialise to a single JSONL line (sort_keys=False for readability)."""
        return json.dumps(asdict(self), ensure_ascii=False, sort_keys=False)


def _detect_commit() -> str:
    """Return the short SHA of HEAD, or 'unknown' on failure."""
    try:
        import subprocess

        _project_root = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            capture_output=True,
            text=True,
            timeout=5,
            cwd=_project_root,
        )
        return result.stdout.strip() or "unknown"
    except Exception:
        return "unknown"


def save_observation(store_path: str = JSONL_PATH, **kwargs) -> Observation:
    """Append a structured observation to the JSONL file.

    Kwargs override Observation defaults. ``commit`` is auto-detected from git
    if not provided. Creates the file if it doesn't exist.

    Returns:
        The saved Observation (for inline use).
    """
    if "commit" not in kwargs or not kwargs["commit"]:
        kwargs["commit"] = _detect_commit()
    kwargs["gate_passed"] = int(kwargs.get("gate_passed", 0))
    obs = Observation(**kwargs)
    os.makedirs(os.path.dirname(store_path) or ".", exist_ok=True)
    with open(store_path, "a") as f:
        f.write(obs.to_jsonl() + "\n")
    return obs


def log_iteration(
    task: str,
    hypothesis: str = "",
    gate_passed: int = 0,
    cost_usd: float = 0.0,
    status: str = "pass",
    files: list[str] | None = None,
    note: str = "",
    *,
    model: str = "deepseek-chat",
) -> Observation:
    """One-shot helper: saves observation + appends to log.jsonl.

    Combines step 7 of the pipeline (AGENTS.md §3):
    - Writes to ``observations.jsonl`` for cross-iteration memory
    - Appends to ``log.jsonl`` for the machine-readable driver log

    Args:
        task: Short task identifier.
        hypothesis: One-line hypothesis being tested.
        gate_passed: Number of passing tests.
        cost_usd: Estimated cost of this iteration.
        status: ``pass`` | ``blocked`` | ``invest`` | ``revert``.
        files: List of file paths affected by this iteration.
        note: Free-form note.
        model: Model name used for the iteration (default: deepseek-chat).

    Returns:
        The saved Observation.
    """
    commit = _detect_commit()
    file_line = ", ".join(files) if files else ""

    # 1. Save observation (use module-level path so monkey-patching works)
    # NOTE: dual-write is NOT atomic — if log.jsonl write fails (disk full,
    # permissions), the observation is saved but no log entry. This is
    # acceptable for v0: observation survives, log is best-effort.
    obs_kwargs = dict(
        store_path=JSONL_PATH,
        commit=commit,
        task=task,
        hypothesis=hypothesis,
        file_line=file_line,
        gate_passed=gate_passed,
        cost_usd=cost_usd,
        status=status,
        note=note,
    )
    obs = save_observation(**obs_kwargs)

    # 2. Append to log.jsonl
    log_entry = {
        "ts": obs.ts,
        "task": task,
        "hypothesis": hypothesis,
        "model": model,
        "iters": 1,
        "cost_usd": round(cost_usd, 6),
        "status": status,
        "gate": f"{gate_passed} passed",
        "files": files or [],
    }
    os.makedirs(os.path.dirname(_LOG_PATH) or ".", exist_ok=True)
    with open(_LOG_PATH, "a") as f:
        f.write(json.dumps(log_entry, ensure_ascii=False, sort_keys=False) + "\n")

    return obs


def load_recent_observations(n: int = 5, store_path: str = JSONL_PATH) -> list[Observation]:
    """Return the most recent N observations (newest first)."""
    if not os.path.exists(store_path):
        return []
    with open(store_path) as f:
        lines = f.readlines()
    obs_list = []
    for line in reversed(lines):
        line = line.strip()
        if not line:
            continue
        try:
            data = json.loads(line)
            data["gate_passed"] = int(data.get("gate_passed", 0))
            obs_list.append(Observation(**data))
        except (json.JSONDecodeError, TypeError, ValueError):
            continue
        if len(obs_list) >= n:
            break
    return obs_list


def search_observations(query: str, store_path: str = JSONL_PATH) -> list[Observation]:
    """Simple substring search over observations (newest-first)."""
    if not os.path.exists(store_path):
        return []
    results = []
    with open(store_path) as f:
        lines = f.readlines()
    for line in reversed(lines):
        line = line.strip()
        if not line or query not in line:
            continue
        try:
            data = json.loads(line)
            data["gate_passed"] = int(data.get("gate_passed", 0))
            results.append(Observation(**data))
        except (json.JSONDecodeError, TypeError, ValueError):
            continue
    return results
