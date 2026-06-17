"""JSON extraction helpers for LLM response parsing.

LessonOS capsule pipeline (segmentation → extraction → assembly) receives
LLM responses that must be parsed as structured JSON.  Real providers
(DeepSeek, Kimi, etc.) sometimes wrap JSON in markdown code fences
(`` ```json ... ``` ``) or include free-text prose before/after the JSON
block.  This module provides a robust extraction helper that tolerates
both patterns — keeping the mock-path deterministic, but fixing the one
gap that blocks real-time eval (COORDINATION.md § CLAUDE-SAYS 2026-06-08).

Design:
- ``_extract_json`` is a **private** helper.  The capsule pipeline modules
  (segmentation, extraction) import it directly; it is not part of the
  public API.
- Tests use sample strings with fences and surrounding prose to verify
  the extraction logic.
- The mock router already returns bare JSON (no fence), so the existing
  test set remains unchanged.
"""

from __future__ import annotations

import json
import re
from typing import Any


def extract_json(text: str) -> Any:
    """Parse the first JSON value found in *text*, tolerating markdown fences
    and surrounding prose.

    Strategy (in order of preference):
    1. If the text is already valid bare JSON, return it directly.
    2. Look for a markdown code block containing JSON (`` ```json ... ``` ``)
       and extract the content between the fences.
    3. Scan the text for the first ``[`` or ``{`` character and try to parse
       from that position as a last resort (catches inline JSON in prose).
    4. If nothing works, raise ``ValueError`` with a descriptive message.

    Args:
        text: Raw LLM response string.

    Returns:
        The parsed JSON value (typically a ``list`` or ``dict``).

    Raises:
        ValueError: No valid JSON could be extracted from *text*.
    """
    # --- Strategy 1: bare JSON (fast path, existing mock behaviour) ---
    stripped = text.strip()
    if stripped:
        try:
            return json.loads(stripped)
        except json.JSONDecodeError:
            pass

    # --- Strategy 2: markdown code fences ---
    # Match ```json ... ``` (with optional language tag)
    fence_pattern = re.compile(
        r"```(?:json)?\s*\n?(.*?)```", re.DOTALL | re.IGNORECASE
    )
    m = fence_pattern.search(text)
    if m:
        inner = m.group(1).strip()
        try:
            return json.loads(inner)
        except json.JSONDecodeError:
            pass

    # --- Strategy 3: first JSON bracket ---
    # Find the first '[' or '{' and try to parse from there.
    # This is a fallback for responses where the JSON is inline in prose
    # but not wrapped in fences.
    for start_char, depth_fn in (("[", _find_array_end), ("{", _find_object_end)):
        pos = text.find(start_char)
        if pos == -1:
            continue
        end = depth_fn(text, pos)
        if end > pos:
            candidate = text[pos : end + 1]
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                continue

    # --- Nothing worked ---
    raise ValueError(
        f"Could not extract valid JSON from LLM response. "
        f"Response preview: {text[:200]!r}"
    )


def _find_array_end(text: str, start: int) -> int:
    """Find the position of the matching ``]`` for the ``[`` at *start*.

    Handles nested brackets and strings with escaped quotes.
    Returns -1 if no matching bracket is found.
    """
    return _find_matching_bracket(text, start, "[", "]")


def _find_object_end(text: str, start: int) -> int:
    """Find the position of the matching ``}`` for the ``{`` at *start*.

    Handles nested braces and strings with escaped quotes.
    Returns -1 if no matching brace is found.
    """
    return _find_matching_bracket(text, start, "{", "}")


def _find_matching_bracket(
    text: str, start: int, open_ch: str, close_ch: str
) -> int:
    """Find the matching close bracket for *open_ch* at *start*.

    Walks the string character by character, tracking nesting depth and
    skipping over string literals (including escaped quotes).

    Depth-tracking strategy:
    - ``depth``: tracks how many open brackets/braces deep we are.
    - ``in_string``: when ``True``, skip characters until we hit the
      closing unescaped ``"`` (handles ``\\`` escaped quotes).
    - Returns -1 if the bracket is never closed (avoids infinite loops).
    """
    depth = 0
    in_string = False
    i = start
    while i < len(text):
        ch = text[i]
        if in_string:
            if ch == "\\":
                # Skip the escaped character
                i += 2
                continue
            elif ch == '"':
                in_string = False
        else:
            if ch == '"':
                in_string = True
            elif ch == open_ch:
                depth += 1
            elif ch == close_ch:
                depth -= 1
                if depth == 0:
                    return i
        i += 1
    return -1
