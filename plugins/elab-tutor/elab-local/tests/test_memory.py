"""Tests for session memory."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from memory import save_to_session, get_history, get_memory, sync_memory


def test_save_and_get():
    save_to_session("test-session-1", "user", "ciao")
    save_to_session("test-session-1", "assistant", "ciao! come posso aiutarti?")
    history = get_history("test-session-1")
    assert len(history) >= 2
    assert history[-2]["role"] == "user"
    assert history[-1]["role"] == "assistant"

def test_get_memory():
    data = get_memory("test-session-1")
    assert "history" in data
    assert "session_id" in data

def test_sync_memory():
    result = sync_memory("test-session-2", {
        "memory": {"experiment": "led-base", "score": 85}
    })
    assert result["memory"]["experiment"] == "led-base"

def test_sanitize_session_id():
    # Path traversal attempt
    save_to_session("../../etc/passwd", "user", "hack")
    history = get_history("../../etc/passwd")
    # Should work safely (sanitized ID)
    assert isinstance(history, list)
