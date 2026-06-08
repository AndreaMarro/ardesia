"""
Cross-iteration observation store for LessonOS.

Structured observations are persisted as JSONL in `observations.jsonl` at the
project root. This replaces the agentmemory hub (whose REST API is non-standard
and inaccessible from Hermes tools) with a file-based approach that survives
git reset --hard because it is committed.

At end of every iteration:  save_observation(...)
At ORIENT:                  load_recent_observations(n=5) or search_observations(query)
"""

import json
import os
from datetime import datetime, timezone
from dataclasses import dataclass, field, asdict
from typing import Optional

JSONL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "observations.jsonl")


@dataclass(frozen=True)
class Observation:
    """A structured cross-iteration observation."""
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
        return json.dumps(asdict(self), ensure_ascii=False, sort_keys=False)


def save_observation(store_path: str = JSONL_PATH, **kwargs) -> Observation:
    """Append a structured observation to the JSONL file.

    Kwargs override Observation defaults. 'commit' auto-detected from git if not
    provided. Creates the file if it doesn't exist.
    """
    if "commit" not in kwargs or not kwargs["commit"]:
        try:
            import subprocess
            # Project root is one level up from this file (lessonos/ -> project root)
            _project_root = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
            result = subprocess.run(
                ["git", "rev-parse", "--short", "HEAD"],
                capture_output=True, text=True, timeout=5,
                cwd=_project_root,
            )
            kwargs["commit"] = result.stdout.strip() or "unknown"
        except Exception:
            kwargs["commit"] = "unknown"
    # Ensure integer
    kwargs["gate_passed"] = int(kwargs.get("gate_passed", 0))
    obs = Observation(**kwargs)
    os.makedirs(os.path.dirname(store_path) or ".", exist_ok=True)
    with open(store_path, "a") as f:
        f.write(obs.to_jsonl() + "\n")
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
