"""Grounded-memory MCP wrapper (M3 white-label B2B — PLATFORM-MAESTRO §48,§80).

A dependency-free, in-process JSON-RPC 2.0 surface (MCP semantics) exposing
LessonOS teacher-scoped retrieval as a single MCP tool: ``grounded_memory_recall``.

The wrapper's reason to exist is the grounding invariant. Every memory item it
emits is RE-VERIFIED against the persisted store (``verify_citation``, PLAN
§13.4) before leaving the boundary: the MCP surface is structurally incapable of
returning a recall that does not resolve to a real, same-lesson segment owned by
the querying teacher. Candidates that fail (fabricated seg_id, cross-lesson
contamination, cross-teacher leak, or non-segment source) are dropped and
DECLARED in ``dropped_ungrounded`` — never emitted.

Scope (MVP): segment-grounded recall (verbatim transcript provenance). Capsule
hits carry no seg_id to ground and are dropped+declared. No network, no new
dependency (stdlib only), no fs/shell capability — the TOOLHOST security
invariant (docs/TOOLHOST-SPEC-v0.md). This module is a pure request→response
handler; wiring it to stdio/HTTP transport is the caller's concern.
"""

from __future__ import annotations

import json
from typing import Any

from lessonos.graph.grounding import verify_citation
from lessonos.retrieval.dense import Embedder
from lessonos.retrieval.teacher import retrieve_teacher_context, teacher_lesson_ids
from lessonos.store.base import Store

PROTOCOL_VERSION = "2025-06-18"  # MCP spec revision implemented
SERVER_NAME = "lessonos-grounded-memory"
SERVER_VERSION = "0.1.0"
TOOL_NAME = "grounded_memory_recall"

_DEFAULT_TOP_K = 5
_MAX_TOP_K = 50

# JSON-RPC 2.0 error codes (spec §5.1).
INVALID_REQUEST = -32600
METHOD_NOT_FOUND = -32601
INVALID_PARAMS = -32602
INTERNAL_ERROR = -32603

_TOOL_SCHEMA: dict[str, Any] = {
    "name": TOOL_NAME,
    "description": (
        "Recall teacher-scoped lesson context. Every result is grounded: it "
        "resolves to a real persisted transcript segment in a lesson the "
        "teacher owns, and carries the verbatim segment text as provenance."
    ),
    "inputSchema": {
        "type": "object",
        "properties": {
            "teacher_id": {
                "type": "string",
                "description": "Owner whose lessons scope the recall.",
            },
            "query": {
                "type": "string",
                "description": "Natural-language recall query.",
            },
            "top_k": {
                "type": "integer",
                "minimum": 1,
                "maximum": _MAX_TOP_K,
                "default": _DEFAULT_TOP_K,
                "description": "Maximum grounded results to return.",
            },
        },
        "required": ["teacher_id", "query"],
    },
}


class _ToolError(Exception):
    """Carries a JSON-RPC error code out of tool dispatch."""

    def __init__(self, code: int, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def _result(req_id: Any, result: Any) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": req_id, "result": result}


def _error(req_id: Any, code: int, message: str) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": req_id, "error": {"code": code, "message": message}}


class GroundedMemoryServer:
    """Stateless JSON-RPC 2.0 / MCP handler over a single :class:`Store`.

    Construct once per store; ``handle`` is a pure function of the request and
    the store's current state. Notifications (requests with no ``id``) return
    ``None`` (JSON-RPC forbids responding to them).
    """

    def __init__(self, store: Store, *, embedder: Embedder | None = None) -> None:
        self._store = store
        self._embedder = embedder

    # ── JSON-RPC envelope ────────────────────────────────────────────────
    def handle(self, request: dict[str, Any]) -> dict[str, Any] | None:
        if not isinstance(request, dict) or request.get("jsonrpc") != "2.0":
            return _error(None, INVALID_REQUEST, "not a JSON-RPC 2.0 request")

        method = request.get("method")
        req_id = request.get("id")
        is_notification = "id" not in request

        if not isinstance(method, str):
            return None if is_notification else _error(
                req_id, INVALID_REQUEST, "missing or non-string 'method'"
            )

        # Notifications never get a response, regardless of method.
        if is_notification:
            return None

        if method == "initialize":
            return _result(req_id, self._initialize())
        if method == "ping":
            return _result(req_id, {})
        if method == "tools/list":
            return _result(req_id, {"tools": [_TOOL_SCHEMA]})
        if method == "tools/call":
            try:
                return _result(req_id, self._call_tool(request.get("params")))
            except _ToolError as exc:
                return _error(req_id, exc.code, exc.message)

        return _error(req_id, METHOD_NOT_FOUND, f"unknown method {method!r}")

    def _initialize(self) -> dict[str, Any]:
        return {
            "protocolVersion": PROTOCOL_VERSION,
            "capabilities": {"tools": {"listChanged": False}},
            "serverInfo": {"name": SERVER_NAME, "version": SERVER_VERSION},
        }

    # ── tools/call dispatch ──────────────────────────────────────────────
    def _call_tool(self, params: Any) -> dict[str, Any]:
        if not isinstance(params, dict):
            raise _ToolError(INVALID_PARAMS, "params must be an object")
        name = params.get("name")
        if name != TOOL_NAME:
            raise _ToolError(METHOD_NOT_FOUND, f"unknown tool {name!r}")

        args = params.get("arguments")
        if args is None:
            args = {}
        if not isinstance(args, dict):
            raise _ToolError(INVALID_PARAMS, "arguments must be an object")

        teacher_id = args.get("teacher_id")
        if not isinstance(teacher_id, str) or not teacher_id:
            raise _ToolError(INVALID_PARAMS, "teacher_id must be a non-empty string")

        query = args.get("query")
        if not isinstance(query, str) or not query.strip():
            raise _ToolError(INVALID_PARAMS, "query must be a non-empty string")

        top_k = args.get("top_k", _DEFAULT_TOP_K)
        # bool is an int subclass — reject it explicitly.
        if isinstance(top_k, bool) or not isinstance(top_k, int):
            raise _ToolError(INVALID_PARAMS, "top_k must be an integer")
        if not (1 <= top_k <= _MAX_TOP_K):
            raise _ToolError(INVALID_PARAMS, f"top_k must be in [1, {_MAX_TOP_K}]")

        items, dropped = self._grounded_recall(teacher_id, query, top_k)
        payload = {
            "teacher_id": teacher_id,
            "query": query,
            "items": items,
            "dropped_ungrounded": dropped,
        }
        return {
            "content": [
                {"type": "text", "text": json.dumps(payload, ensure_ascii=False)}
            ],
            "structuredContent": payload,
            "isError": False,
        }

    # ── grounded recall (the structural guard) ───────────────────────────
    def _grounded_recall(
        self, teacher_id: str, query: str, top_k: int
    ) -> tuple[list[dict[str, Any]], int]:
        owned = teacher_lesson_ids(self._store, teacher_id)
        results = retrieve_teacher_context(
            self._store,
            teacher_id,
            query,
            embedder=self._embedder,
            top_k=top_k,
        )

        items: list[dict[str, Any]] = []
        dropped = 0
        for r in results:
            # Only segment-sourced hits carry a seg_id we can ground verbatim.
            if r.source != "segment":
                dropped += 1
                continue
            # Defense-in-depth: re-verify resolution + same-lesson (PLAN §13.4),
            # then ownership — never trust the retriever's scoping alone.
            try:
                verify_citation(self._store, r.source_id, r.lesson_id)
            except ValueError:
                dropped += 1
                continue
            if r.lesson_id not in owned:
                dropped += 1
                continue
            seg = self._store.get_segment(r.source_id)
            if seg is None:  # pragma: no cover - verify_citation already resolved it
                dropped += 1
                continue
            items.append(
                {
                    "seg_id": r.source_id,
                    "lesson_id": r.lesson_id,
                    "text": seg.text,  # verbatim provenance
                    "snippet": r.excerpt,  # highlighted FTS snippet
                    "rank": r.rank,
                }
            )
        return items, dropped
