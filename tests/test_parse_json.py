"""Tests for the ``_extract_json`` helper (lessonos/capsule/parsing.py).

Covers all three extraction strategies:
1. Bare JSON (fast path, mock behaviour).
2. Markdown code fences (```json … ```).
3. Inline JSON in prose (fallback).

Also covers edge cases: empty string, invalid content, deeply nested JSON.
"""

from __future__ import annotations

import json
import pytest

from lessonos.capsule.parsing import extract_json


class TestExtractJson:
    """Suite for :func:`extract_json`."""

    # ── Strategy 1: bare JSON (fast path) ──────────────────────────────

    def test_bare_dict(self) -> None:
        result = extract_json('{"a": 1, "b": 2}')
        assert result == {"a": 1, "b": 2}

    def test_bare_list(self) -> None:
        result = extract_json('[{"topic": "A", "seg_ids": ["s1"]}]')
        assert result == [{"topic": "A", "seg_ids": ["s1"]}]

    def test_bare_with_whitespace(self) -> None:
        result = extract_json('  \n  {"x": 42}  \n')
        assert result == {"x": 42}

    def test_bare_nested(self) -> None:
        payload = {"concepts": [{"name": "Limit", "status": "introduced"}]}
        result = extract_json(json.dumps(payload))
        assert result == payload

    # ── Strategy 2: markdown code fences ───────────────────────────────

    def test_fenced_json(self) -> None:
        raw = '```json\n{"a": 1, "b": 2}\n```'
        assert extract_json(raw) == {"a": 1, "b": 2}

    def test_fenced_json_no_lang(self) -> None:
        raw = '```\n[1, 2, 3]\n```'
        assert extract_json(raw) == [1, 2, 3]

    def test_fenced_json_with_prose_before(self) -> None:
        raw = 'Here is the analysis:\n\n```json\n{"topic": "Limits", "seg_ids": ["s1", "s2"]}\n```'
        result = extract_json(raw)
        assert result == {"topic": "Limits", "seg_ids": ["s1", "s2"]}

    def test_fenced_json_with_prose_after(self) -> None:
        raw = '```json\n{"score": 0.95}\n```\n\nI hope this helps!'
        assert extract_json(raw) == {"score": 0.95}

    def test_fenced_json_full_surrounding(self) -> None:
        """Real-world case: DeepSeek wraps JSON in prose + fences."""
        raw = """Based on the lesson transcript, here is the topic segmentation:

```json
[
  {"topic": "Introduzione alle derivate", "seg_ids": ["l1s1", "l1s2"]},
  {"topic": "Calcolo di derivate semplici", "seg_ids": ["l1s3"]}
]
```

The segments above cover the key topics in this lesson."""
        result = extract_json(raw)
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["topic"] == "Introduzione alle derivate"

    def test_fenced_json_with_extra_backticks(self) -> None:
        """Triple backticks inside the content should not break parsing."""
        raw = '```json\n{"code": "printf(\\"hello\\");"}\n```'
        result = extract_json(raw)
        assert result == {"code": 'printf("hello");'}

    def test_fenced_json_empty_fence(self) -> None:
        """Empty code block should fall through to next strategy."""
        raw = "```json\n```\nSome text after an empty fence."
        with pytest.raises(ValueError, match="Could not extract valid JSON"):
            extract_json(raw)

    # ── Strategy 3: inline JSON in prose ───────────────────────────────

    def test_inline_json_in_prose(self) -> None:
        raw = 'After analysing the lesson, the result is {"pass": true, "score": 0.9} and that is final.'
        result = extract_json(raw)
        assert result == {"pass": True, "score": 0.9}

    def test_inline_list_in_prose(self) -> None:
        raw = 'The extracted topics are:\n[{"topic": "A", "seg_ids": ["s1"]}].'
        result = extract_json(raw)
        assert result == [{"topic": "A", "seg_ids": ["s1"]}]

    def test_inline_first_bracket_wins(self) -> None:
        """If text has multiple JSON-like structures, the first is used."""
        raw = '[1, 2] later text {"x": 3}'
        result = extract_json(raw)
        assert result == [1, 2]

    # ── Edge cases ─────────────────────────────────────────────────────

    def test_empty_string(self) -> None:
        with pytest.raises(ValueError, match="Could not extract valid JSON"):
            extract_json("")

    def test_whitespace_only(self) -> None:
        with pytest.raises(ValueError, match="Could not extract valid JSON"):
            extract_json("   \n  \t  ")

    def test_no_json_at_all(self) -> None:
        with pytest.raises(ValueError, match="Could not extract valid JSON"):
            extract_json("This is plain text without any JSON structure.")

    def test_malformed_json(self) -> None:
        with pytest.raises(ValueError, match="Could not extract valid JSON"):
            extract_json('{"broken": true')

    def test_invalid_syntax_in_fence(self) -> None:
        raw = "```json\n{invalid:\n```"
        with pytest.raises(ValueError, match="Could not extract valid JSON"):
            extract_json(raw)

    def test_nested_deeply(self) -> None:
        """Deeply nested JSON (10+ levels) should parse correctly."""
        deep = {"level1": {"level2": {"level3": {"level4": "deep"}}}}
        raw = json.dumps(deep)
        result = extract_json(raw)
        assert result == deep

    def test_large_array(self) -> None:
        """Array with many elements should parse correctly."""
        large = [{"id": i, "name": f"item_{i}"} for i in range(100)]
        raw = json.dumps(large)
        result = extract_json(raw)
        assert len(result) == 100

    def test_unicode_in_json(self) -> None:
        """Unicode characters in JSON should survive round-trip."""
        raw = '{"tema": "Introduzione alle derivate", "difficoltà": 3}'
        result = extract_json(raw)
        assert result["tema"] == "Introduzione alle derivate"
        assert result["difficoltà"] == 3
