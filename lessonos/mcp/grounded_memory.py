"""Grounded-memory MCP wrapper (M3 white-label B2B — PLATFORM-MAESTRO §48,§80).

A dependency-free, in-process JSON-RPC 2.0 surface (MCP semantics) exposing
LessonOS teacher-scoped memory as MCP tools:

  * ``grounded_memory_recall`` — verbatim segment recall for a query.
  * ``grounded_memory_progression`` — a teacher's persisted concept
    progressions (introduced → reinforced → …), each backed by a real citation.

The wrapper's reason to exist is the grounding invariant. Every memory item it
emits is RE-VERIFIED against the persisted store (``verify_citation``, PLAN
§13.4) before leaving the boundary: the MCP surface is structurally incapable of
returning a recall that does not resolve to a real, same-lesson segment owned by
the querying teacher. Candidates that fail (fabricated seg_id, cross-lesson
contamination, cross-teacher leak, or non-segment source) are dropped and
DECLARED in ``dropped_ungrounded`` — never emitted.

The progression tool serves the ``ConceptProgression`` rows that
``build_teacher_book`` derives from persisted capsules + graph (ZERO-LLM). It
applies the SAME guard: a progression is emitted only when the concept carries
at least one VERIFIED verbatim citation (``is_verified_excerpt`` +
``verify_citation``) resolving to a same-lesson segment the teacher owns. A
progression whose evidence was never verbatim-grounded, was purged (GDPR
erasure), or belongs to another lesson/teacher is dropped + declared — never
served as if grounded.

Scope (MVP): segment-grounded recall + concept progression (verbatim transcript
provenance). Capsule hits carry no seg_id to ground and are dropped+declared. No
network, no new dependency (stdlib only), no fs/shell capability — the TOOLHOST
security invariant (docs/TOOLHOST-SPEC-v0.md). This module is a pure
request→response handler; wiring it to stdio/HTTP transport is the caller's
concern.
"""

from __future__ import annotations

import json
from typing import Any

from lessonos.graph.grounding import is_verified_excerpt, verify_citation
from lessonos.graph.utils import content_tokens
from lessonos.models.entities import ConceptProgression, GraphEvidence, TeacherConcept
from lessonos.retrieval.dense import Embedder
from lessonos.retrieval.teacher import retrieve_teacher_context, teacher_lesson_ids
from lessonos.store.base import Store
from lessonos.teacher_book import build_teacher_book

PROTOCOL_VERSION = "2025-06-18"  # MCP spec revision implemented
SERVER_NAME = "lessonos-grounded-memory"
SERVER_VERSION = "0.1.0"
TOOL_NAME = "grounded_memory_recall"
PROGRESSION_TOOL_NAME = "grounded_memory_progression"

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

_PROGRESSION_TOOL_SCHEMA: dict[str, Any] = {
    "name": PROGRESSION_TOOL_NAME,
    "description": (
        "Return a teacher's persisted concept progressions (how each concept "
        "evolved across lessons: introduced → reinforced → reviewed → "
        "mastered). Every progression is grounded: it is only returned when the "
        "concept carries a verified verbatim citation resolving to a real "
        "transcript segment in a lesson the teacher owns."
    ),
    "inputSchema": {
        "type": "object",
        "properties": {
            "teacher_id": {
                "type": "string",
                "description": "Owner whose persisted progressions to serve.",
            },
        },
        "required": ["teacher_id"],
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
            return _result(
                req_id, {"tools": [_TOOL_SCHEMA, _PROGRESSION_TOOL_SCHEMA]}
            )
        if method == "tools/call":
            try:
                return _result(req_id, self._call_tool(request.get("params")))
            except _ToolError as exc:
                return _error(req_id, exc.code, exc.message)
            except Exception as exc:  # boundary: never leak a raw traceback
                return _error(req_id, INTERNAL_ERROR, f"internal error: {exc}")

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
        if name == TOOL_NAME:
            return self._call_recall(self._tool_args(params))
        if name == PROGRESSION_TOOL_NAME:
            return self._call_progression(self._tool_args(params))
        raise _ToolError(METHOD_NOT_FOUND, f"unknown tool {name!r}")

    @staticmethod
    def _tool_args(params: dict[str, Any]) -> dict[str, Any]:
        args = params.get("arguments")
        if args is None:
            args = {}
        if not isinstance(args, dict):
            raise _ToolError(INVALID_PARAMS, "arguments must be an object")
        return args

    @staticmethod
    def _require_teacher_id(args: dict[str, Any]) -> str:
        teacher_id = args.get("teacher_id")
        if not isinstance(teacher_id, str) or not teacher_id:
            raise _ToolError(INVALID_PARAMS, "teacher_id must be a non-empty string")
        return teacher_id

    @staticmethod
    def _wrap(payload: dict[str, Any]) -> dict[str, Any]:
        return {
            "content": [
                {"type": "text", "text": json.dumps(payload, ensure_ascii=False)}
            ],
            "structuredContent": payload,
            "isError": False,
        }

    def _call_recall(self, args: dict[str, Any]) -> dict[str, Any]:
        teacher_id = self._require_teacher_id(args)

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
        return self._wrap({
            "teacher_id": teacher_id,
            "query": query,
            "items": items,
            "dropped_ungrounded": dropped,
        })

    def _call_progression(self, args: dict[str, Any]) -> dict[str, Any]:
        teacher_id = self._require_teacher_id(args)
        items, dropped = self._grounded_progression(teacher_id)
        return self._wrap({
            "teacher_id": teacher_id,
            "items": items,
            "dropped_ungrounded": dropped,
        })

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

    # ── grounded progression (the structural guard) ──────────────────────
    def _grounded_progression(
        self, teacher_id: str
    ) -> tuple[list[dict[str, Any]], int]:
        try:
            book = build_teacher_book(self._store, teacher_id)
        except ValueError:
            # Unknown/path-less teacher: empty, not an error (mirror recall).
            return [], 0
        owned = teacher_lesson_ids(self._store, teacher_id)
        # fundamental_concepts is the full concept set (sorted), each carrying
        # the grounded citations the guard needs.
        by_canonical: dict[str, TeacherConcept] = {
            c.canonical: c for c in book.fundamental_concepts
        }

        items: list[dict[str, Any]] = []
        dropped = 0
        for prog in book.progression:
            grounding = self._ground_progression(prog, by_canonical, owned)
            if grounding is None:
                dropped += 1
                continue
            items.append(
                {
                    "name": prog.name,
                    "canonical": prog.canonical,
                    "first_lesson": prog.first_lesson,
                    "status_sequence": list(prog.status_sequence),
                    "lesson_sequence": list(prog.lesson_sequence),
                    "grounding": grounding,
                }
            )
        return items, dropped

    def _ground_progression(
        self,
        prog: ConceptProgression,
        by_canonical: dict[str, TeacherConcept],
        owned: set[str],
    ) -> dict[str, Any] | None:
        """Return a verbatim grounding proof for *prog*, or None to drop it.

        A progression is grounded iff (1) every lesson it spans is owned by the
        teacher and (2) its concept carries at least one VERIFIED verbatim
        citation that re-resolves to a same-lesson persisted segment the teacher
        owns. Defense-in-depth: never trust the builder's scoping alone.
        """
        # (1) ownership of every lesson the progression spans.
        for lid in (prog.first_lesson, *prog.lesson_sequence):
            if lid and lid not in owned:
                return None

        tc = by_canonical.get(prog.canonical)
        if tc is None:
            return None

        # (2) a verified verbatim citation that actually mentions THIS concept.
        # A concept's citations are collected from every edge incident to it
        # (source OR target in build_teacher_book), so an edge "A explains B"
        # attaches A's excerpt to B as well. Requiring the segment to mention
        # the concept ties the served provenance to the concept it grounds —
        # an off-concept excerpt (e.g. "vettore" served for "massa") is dropped.
        concept_terms = content_tokens(prog.name) | content_tokens(prog.canonical)
        for cit in tc.citations:
            proof = self._ground_citation(cit, owned, concept_terms)
            if proof is not None:
                return proof
        return None

    def _ground_citation(
        self, cit: GraphEvidence, owned: set[str], concept_terms: frozenset[str]
    ) -> dict[str, Any] | None:
        if not is_verified_excerpt(cit.excerpt):
            return None
        seg = self._store.get_segment(cit.seg_id)
        if seg is None:
            return None
        lesson_id = cit.lesson_id or seg.lesson_id
        try:
            verify_citation(self._store, cit.seg_id, lesson_id, cit.excerpt)
        except ValueError:
            return None
        if lesson_id not in owned:
            return None
        # The verbatim segment must actually discuss this concept (concept-tie):
        # at least one significant concept token appears in the segment text.
        if concept_terms and not (concept_terms & content_tokens(seg.text)):
            return None
        return {
            "seg_id": cit.seg_id,
            "lesson_id": lesson_id,
            "excerpt": cit.excerpt,
            "text": seg.text,  # verbatim provenance
        }
