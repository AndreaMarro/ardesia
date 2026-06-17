"""
ELAB Automa — File-based Task Queue Manager
Tasks are YAML files in queue/{pending,active,done,failed}/
"""

import hashlib
import json
import os
import time
from datetime import datetime
from pathlib import Path

QUEUE_ROOT = Path(__file__).parent / "queue"
DIRS = ["pending", "active", "done", "failed"]


def _ensure_dirs():
    for d in DIRS:
        (QUEUE_ROOT / d).mkdir(parents=True, exist_ok=True)


def _parse_yaml_simple(text: str) -> dict:
    """Minimal YAML parser for our task format (no external deps)."""
    result = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" in line:
            key, val = line.split(":", 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            # Type coercion
            if val.lower() in ("true", "false"):
                val = val.lower() == "true"
            elif val.isdigit():
                val = int(val)
            result[key] = val
    return result


def _write_yaml_simple(data: dict, path: Path):
    """Write simple key: value YAML."""
    lines = []
    for k, v in data.items():
        if isinstance(v, str) and ("\n" in v or ":" in v):
            lines.append(f'{k}: "{v}"')
        else:
            lines.append(f"{k}: {v}")
    path.write_text("\n".join(lines) + "\n")


def list_tasks(status: str = "pending") -> list:
    """List all tasks in a given status directory, sorted by priority."""
    _ensure_dirs()
    d = QUEUE_ROOT / status
    tasks = []
    for f in sorted(d.glob("*.yaml")):
        data = _parse_yaml_simple(f.read_text())
        data["_file"] = f.name
        data["_path"] = str(f)
        tasks.append(data)
    # Sort by priority (P0 first)
    tasks.sort(key=lambda t: t.get("priority", "P9"))
    return tasks


def get_next_task():
    """Get the highest-priority pending task."""
    tasks = list_tasks("pending")
    return tasks[0] if tasks else None


def claim_task(filename: str) -> bool:
    """Move task from pending to active."""
    _ensure_dirs()
    src = QUEUE_ROOT / "pending" / filename
    dst = QUEUE_ROOT / "active" / filename
    if not src.exists():
        return False
    # Add claim metadata
    data = _parse_yaml_simple(src.read_text())
    data["claimed_at"] = datetime.now().isoformat()
    data["claimed_by"] = "orchestrator"
    _write_yaml_simple(data, dst)
    src.unlink()
    return True


def complete_task(filename: str, result: str = "ok") -> bool:
    """Move task from active to done."""
    _ensure_dirs()
    src = QUEUE_ROOT / "active" / filename
    dst = QUEUE_ROOT / "done" / filename
    if not src.exists():
        return False
    data = _parse_yaml_simple(src.read_text())
    data["completed_at"] = datetime.now().isoformat()
    data["result"] = result
    _write_yaml_simple(data, dst)
    src.unlink()
    return True


def fail_task(filename: str, error: str = "unknown") -> bool:
    """Move task from active to failed."""
    _ensure_dirs()
    src = QUEUE_ROOT / "active" / filename
    dst = QUEUE_ROOT / "failed" / filename
    if not src.exists():
        return False
    data = _parse_yaml_simple(src.read_text())
    data["failed_at"] = datetime.now().isoformat()
    data["error"] = error[:500]
    _write_yaml_simple(data, dst)
    src.unlink()
    return True


def create_task(task_id: str, priority: str, title: str, description: str, tags: str = "") -> str:
    """Create a new pending task. Returns filename."""
    _ensure_dirs()
    filename = f"{priority}-{task_id}.yaml"
    path = QUEUE_ROOT / "pending" / filename

    # Dedup: check if same task exists in any status
    content_hash = hashlib.md5(f"{task_id}{title}".encode()).hexdigest()[:8]
    for d in DIRS:
        existing = QUEUE_ROOT / d / filename
        if existing.exists():
            return f"DUPLICATE:{d}/{filename}"

    data = {
        "id": task_id,
        "priority": priority,
        "title": title,
        "description": description,
        "tags": tags,
        "created_at": datetime.now().isoformat(),
        "hash": content_hash,
    }
    _write_yaml_simple(data, path)
    return filename


def rescue_stale_active(max_age_seconds: int = 3600) -> int:
    """Move active tasks older than max_age_seconds back to pending.
    This prevents tasks from being permanently stuck when the orchestrator crashes."""
    _ensure_dirs()
    active_dir = QUEUE_ROOT / "active"
    pending_dir = QUEUE_ROOT / "pending"
    rescued = 0
    now = time.time()
    for f in active_dir.glob("*.yaml"):
        file_age = now - f.stat().st_mtime
        if file_age > max_age_seconds:
            data = _parse_yaml_simple(f.read_text())
            data["rescued_at"] = datetime.now().isoformat()
            data["rescue_reason"] = f"stale active ({int(file_age)}s)"
            dest = pending_dir / f.name
            if not dest.exists():
                _write_yaml_simple(data, dest)
            f.unlink()
            rescued += 1
    return rescued


def stats() -> dict:
    """Get queue statistics."""
    _ensure_dirs()
    return {d: len(list((QUEUE_ROOT / d).glob("*.yaml"))) for d in DIRS}


if __name__ == "__main__":
    _ensure_dirs()
    print("Queue stats:", json.dumps(stats()))
    print("\nPending tasks:")
    for t in list_tasks("pending"):
        print(f"  [{t.get('priority', '?')}] {t.get('title', t.get('_file', '?'))}")
