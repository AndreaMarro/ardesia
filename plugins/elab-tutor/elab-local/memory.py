"""Session memory — JSON file-based storage.

Each session has a JSON file in ~/.elab-local/sessions/{session_id}.json.
Stores conversation history + per-session memory key-value pairs.
Matches the cloud nanobot API format exactly.
"""
import json
import time
from pathlib import Path
from typing import Optional

from config import MEMORY_DIR, MAX_SESSION_MESSAGES, SESSION_TTL


def _ensure_dir():
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)


def _session_path(session_id: str) -> Path:
    # Sanitize session ID (prevent path traversal)
    safe_id = "".join(c for c in session_id if c.isalnum() or c in "-_")
    if not safe_id:
        safe_id = "default"
    return MEMORY_DIR / f"{safe_id}.json"


def _load_session(session_id: str) -> dict:
    path = _session_path(session_id)
    if path.exists():
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            # Check TTL
            if time.time() - data.get("updated_at", 0) > SESSION_TTL:
                print(f"[Memory] Session {session_id} expired, resetting")
                return _new_session(session_id)
            return data
        except (json.JSONDecodeError, KeyError):
            print(f"[Memory] Corrupt session {session_id}, resetting")
    return _new_session(session_id)


def _new_session(session_id: str) -> dict:
    return {
        "session_id": session_id,
        "history": [],
        "memory": {},
        "created_at": time.time(),
        "updated_at": time.time(),
    }


def _save_session(session_id: str, data: dict):
    _ensure_dir()
    data["updated_at"] = time.time()
    path = _session_path(session_id)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# === PUBLIC API ===


def save_to_session(session_id: str, role: str, content: str):
    """Append a message to session history."""
    data = _load_session(session_id)
    data["history"].append({
        "role": role,
        "content": content,
        "timestamp": time.time(),
    })
    # Trim to max
    if len(data["history"]) > MAX_SESSION_MESSAGES:
        data["history"] = data["history"][-MAX_SESSION_MESSAGES:]
    _save_session(session_id, data)


def get_history(session_id: str) -> list:
    """Get conversation history for a session."""
    data = _load_session(session_id)
    return data.get("history", [])


def get_memory(session_id: str) -> dict:
    """Get full session data (history + memory)."""
    return _load_session(session_id)


def sync_memory(session_id: str, memory_data: dict) -> dict:
    """Sync memory from frontend. Merges with existing."""
    data = _load_session(session_id)
    if "memory" in memory_data:
        data["memory"].update(memory_data["memory"])
    if "history" in memory_data:
        # Frontend can push history too
        for msg in memory_data["history"]:
            if msg not in data["history"]:
                data["history"].append(msg)
        if len(data["history"]) > MAX_SESSION_MESSAGES:
            data["history"] = data["history"][-MAX_SESSION_MESSAGES:]
    _save_session(session_id, data)
    return data


def cleanup_expired():
    """Remove expired session files. Called periodically."""
    _ensure_dir()
    now = time.time()
    removed = 0
    for path in MEMORY_DIR.glob("*.json"):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            if now - data.get("updated_at", 0) > SESSION_TTL:
                path.unlink()
                removed += 1
        except Exception:
            pass
    if removed:
        print(f"[Memory] Cleaned up {removed} expired sessions")
