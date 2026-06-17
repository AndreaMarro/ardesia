"""End-to-end tests for the grounded-memory MCP wrapper.

Exercises the full JSON-RPC 2.0 / MCP handshake (initialize → tools/list →
tools/call) on a sample lesson, and pins the structural invariant that makes the
wrapper "grounded": no item leaves the boundary unless it resolves to a real,
same-lesson segment OWNED by the querying teacher. Ungrounded candidates are
dropped and declared — proven by injecting fabricated/cross-teacher results.
"""

from __future__ import annotations

import json

import pytest

from lessonos.mcp import grounded_memory as gm
from lessonos.mcp.grounded_memory import (
    INVALID_PARAMS,
    INVALID_REQUEST,
    METHOD_NOT_FOUND,
    PROTOCOL_VERSION,
    TOOL_NAME,
    GroundedMemoryServer,
)
from lessonos.models.entities import Lesson, Path, Segment
from lessonos.retrieval.dense import LexiconEmbedder
from lessonos.retrieval.fts import SearchResult
from lessonos.store.sqlite import SQLiteStore

_LEXICON: dict[str, list[str]] = {
    "frequenze": ["spectrum"],
    "laplace": ["laplace"],
    "trasformata": ["transform"],
}


def _embedder() -> LexiconEmbedder:
    return LexiconEmbedder(_LEXICON, fallback_to_token=False)


def _two_teacher_store() -> SQLiteStore:
    """Two teachers, each with one lexically near-identical lesson segment."""
    store = SQLiteStore(":memory:")
    store.save_path(Path(path_id="p_alpha", title="A", subject="fisica", teacher_id="t_alpha"))
    store.save_path(Path(path_id="p_beta", title="B", subject="fisica", teacher_id="t_beta"))
    store.save_lesson(Lesson(lesson_id="l_alpha", path_id="p_alpha", title="LA", order=1))
    store.save_lesson(Lesson(lesson_id="l_beta", path_id="p_beta", title="LB", order=1))
    store.save_segment(
        Segment(
            seg_id="s_alpha",
            lesson_id="l_alpha",
            start=0,
            end=1,
            text="la trasformata di Laplace scompone le frequenze del segnale",
        )
    )
    store.save_segment(
        Segment(
            seg_id="s_beta",
            lesson_id="l_beta",
            start=0,
            end=1,
            text="la trasformata di Laplace mostra le frequenze del segnale",
        )
    )
    return store


def _multi_segment_store() -> SQLiteStore:
    """One teacher, one real-style lesson with 3 segments + another teacher for isolation."""
    store = SQLiteStore(":memory:")
    store.save_path(Path(path_id="p_main", title="Fisica1", subject="fisica", teacher_id="t_main"))
    store.save_path(Path(path_id="p_other", title="Fisica2", subject="fisica", teacher_id="t_other"))
    store.save_lesson(Lesson(lesson_id="l_main", path_id="p_main", title="Lezione 1: Segnali", order=1))
    store.save_lesson(Lesson(lesson_id="l_other", path_id="p_other", title="Lezione X", order=1))

    # Multi-segment sample lecture: a teacher introducing signal theory (3 segments).
    store.save_segment(Segment(
        seg_id="s1", lesson_id="l_main", start=0, end=30,
        text="Oggi parliamo di segnali. Un segnale e' una grandezza fisica che varia nel tempo "
             "e il suo supporto misura dove il segnale e' diverso da zero."
    ))
    store.save_segment(Segment(
        seg_id="s2", lesson_id="l_main", start=31, end=60,
        text="La durata di un segnale con supporto limitato si misura come estensione temporale."
    ))
    store.save_segment(Segment(
        seg_id="s3", lesson_id="l_main", start=61, end=90,
        text="L'estremo superiore meno l'estremo inferiore del supporto definisce la durata."
    ))
    # Other teacher segment (lexically similar, must never leak).
    store.save_segment(Segment(
        seg_id="s_other", lesson_id="l_other", start=0, end=20,
        text="Un segnale e' una funzione che trasporta informazione nel tempo."
    ))
    return store


def _server() -> GroundedMemoryServer:
    return GroundedMemoryServer(_two_teacher_store(), embedder=_embedder())


def _call(server: GroundedMemoryServer, teacher_id: str, query: str, **args):
    request = {
        "jsonrpc": "2.0",
        "id": 7,
        "method": "tools/call",
        "params": {"name": TOOL_NAME, "arguments": {"teacher_id": teacher_id, "query": query, **args}},
    }
    resp = server.handle(request)
    assert resp is not None
    return resp


def _payload(resp: dict) -> dict:
    result = resp["result"]
    assert result["isError"] is False
    # text content and structuredContent must agree.
    text_payload = json.loads(result["content"][0]["text"])
    assert text_payload == result["structuredContent"]
    return text_payload


# ── handshake ─────────────────────────────────────────────────────────────


class TestHandshake:
    def test_initialize_advertises_protocol_and_server(self) -> None:
        resp = _server().handle({"jsonrpc": "2.0", "id": 1, "method": "initialize"})
        result = resp["result"]
        assert result["protocolVersion"] == PROTOCOL_VERSION
        assert result["serverInfo"]["name"] == "lessonos-grounded-memory"
        assert "tools" in result["capabilities"]

    def test_tools_list_exposes_the_single_grounded_tool(self) -> None:
        resp = _server().handle({"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
        tools = resp["result"]["tools"]
        assert [t["name"] for t in tools] == [TOOL_NAME]
        schema = tools[0]["inputSchema"]
        assert schema["required"] == ["teacher_id", "query"]

    def test_initialized_notification_gets_no_response(self) -> None:
        # No "id" member ⇒ notification ⇒ no response (JSON-RPC §4.1).
        assert _server().handle({"jsonrpc": "2.0", "method": "notifications/initialized"}) is None

    def test_ping(self) -> None:
        resp = _server().handle({"jsonrpc": "2.0", "id": 9, "method": "ping"})
        assert resp["result"] == {}


# ── grounded recall happy path ──────────────────────────────────────────────


class TestGroundedRecall:
    def test_returns_only_the_owning_teachers_grounded_segment(self) -> None:
        store = _two_teacher_store()
        server = GroundedMemoryServer(store, embedder=_embedder())
        payload = _payload(_call(server, "t_alpha", "trasformata di Laplace"))

        assert payload["items"], "expected at least one grounded hit"
        seg_ids = {it["seg_id"] for it in payload["items"]}
        lesson_ids = {it["lesson_id"] for it in payload["items"]}
        # Headline invariant: t_alpha's recall never surfaces t_beta's lesson.
        assert seg_ids == {"s_alpha"}
        assert lesson_ids == {"l_alpha"}

    def test_item_text_is_verbatim_store_provenance(self) -> None:
        store = _two_teacher_store()
        server = GroundedMemoryServer(store, embedder=_embedder())
        payload = _payload(_call(server, "t_alpha", "trasformata di Laplace"))
        item = payload["items"][0]
        seg = store.get_segment(item["seg_id"])
        assert item["text"] == seg.text  # exact, not the highlighted snippet

    def test_top_k_caps_result_count(self) -> None:
        payload = _payload(_call(_server(), "t_alpha", "Laplace", top_k=1))
        assert len(payload["items"]) <= 1

    def test_unknown_teacher_yields_empty_not_error(self) -> None:
        payload = _payload(_call(_server(), "t_ghost", "Laplace"))
        assert payload["items"] == []


# ── structural grounding guard (adversarial) ────────────────────────────────


class TestGroundingGuardDropsUngrounded:
    def test_fabricated_and_cross_teacher_hits_are_dropped_and_declared(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        store = _two_teacher_store()
        server = GroundedMemoryServer(store, embedder=_embedder())

        # Adversary: a retriever that leaks three poisoned hits plus one good one.
        poisoned = [
            SearchResult("segment", "s_alpha", "l_alpha", 0.1, "ok", "hybrid"),  # genuine
            SearchResult("segment", "does_not_exist", "l_alpha", 0.2, "x", "hybrid"),
            SearchResult("segment", "s_beta", "l_beta", 0.3, "x", "hybrid"),  # cross-teacher
            # seg_id resolves but claims the wrong lesson → cross-lesson contamination.
            SearchResult("segment", "s_beta", "l_alpha", 0.4, "x", "hybrid"),
            SearchResult("capsule", "l_alpha", "l_alpha", 0.5, "x", "hybrid"),  # no seg_id
        ]
        monkeypatch.setattr(
            gm, "retrieve_teacher_context", lambda *a, **k: list(poisoned)
        )

        payload = _payload(_call(server, "t_alpha", "anything"))
        seg_ids = {it["seg_id"] for it in payload["items"]}
        # Only the genuine same-lesson owned segment survives the guard.
        assert seg_ids == {"s_alpha"}
        assert payload["dropped_ungrounded"] == 4


# ── JSON-RPC error surface ──────────────────────────────────────────────────


class TestErrorSurface:
    def test_not_jsonrpc_2_0(self) -> None:
        resp = _server().handle({"id": 1, "method": "ping"})
        assert resp["error"]["code"] == INVALID_REQUEST

    def test_unknown_method(self) -> None:
        resp = _server().handle({"jsonrpc": "2.0", "id": 1, "method": "does/not/exist"})
        assert resp["error"]["code"] == METHOD_NOT_FOUND

    def test_unknown_tool(self) -> None:
        resp = _server().handle(
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {"name": "nope", "arguments": {}},
            }
        )
        assert resp["error"]["code"] == METHOD_NOT_FOUND

    @pytest.mark.parametrize(
        "arguments",
        [
            {"query": "x"},  # missing teacher_id
            {"teacher_id": "t_alpha"},  # missing query
            {"teacher_id": "", "query": "x"},  # empty teacher_id
            {"teacher_id": "t_alpha", "query": "   "},  # blank query
            {"teacher_id": "t_alpha", "query": "x", "top_k": 0},  # out of range
            {"teacher_id": "t_alpha", "query": "x", "top_k": True},  # bool not int
            {"teacher_id": "t_alpha", "query": "x", "top_k": "5"},  # str not int
        ],
    )
    def test_invalid_params(self, arguments: dict) -> None:
        resp = _server().handle(
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {"name": TOOL_NAME, "arguments": arguments},
            }
        )
        assert resp["error"]["code"] == INVALID_PARAMS


# ── end-to-end: multi-segment sample lesson ──────────────────────────────


class TestMultiSegmentLesson:
    """End-to-end: a real-style lesson with 3+ segments, queried through the full
    JSON-RPC / MCP grounded-memory pipeline (retrieval → grounding guard →
    response)."""

    def test_multi_segment_recall_returns_verbatim_provenance(self) -> None:
        """All 3 segments of the sample lesson are recallable with exact text."""
        store = _multi_segment_store()
        server = GroundedMemoryServer(store, embedder=_embedder())
        payload = _payload(_call(server, "t_main", "segnale supporto"))

        assert len(payload["items"]) == 2, f"expected 2 hits, got {len(payload['items'])}"
        seg_ids = {it["seg_id"] for it in payload["items"]}
        assert seg_ids == {"s1", "s2"}, (
            f"only main-teacher segments expected, got {seg_ids}"
        )
        # Verbatim provenance: every returned text matches the store exactly.
        for it in payload["items"]:
            seg = store.get_segment(it["seg_id"])
            assert seg is not None, f"seg_id={it['seg_id']} not in store"
            assert it["text"] == seg.text, (
                f"seg_id={it['seg_id']} text != store: {it['text'][:50]!r} vs {seg.text[:50]!r}"
            )

    def test_cross_teacher_isolation_holds_with_multi_segment(self) -> None:
        """t_other's lexically similar segment never leaks into t_main's recall."""
        store = _multi_segment_store()
        server = GroundedMemoryServer(store, embedder=_embedder())
        payload = _payload(_call(server, "t_main", "segnale tempo"))

        # The query matches both teachers' content, but only t_main's segments appear.
        seg_ids = {it["seg_id"] for it in payload["items"]}
        lesson_ids = {it["lesson_id"] for it in payload["items"]}
        assert "s_other" not in seg_ids, (
            f"t_other segment leaked into t_main recall: {seg_ids}"
        )
        assert "l_other" not in lesson_ids, (
            f"t_other lesson leaked: {lesson_ids}"
        )
        assert payload["items"], "expected at least one hit from t_main"
        assert len(payload["items"]) == 1, "segnale tempo should match exactly s1 in t_main scope"

    def test_each_item_has_required_fields(self) -> None:
        """Structural contract: every recalled item carries seg_id, lesson_id,
        text (verbatim), snippet, and rank."""
        store = _multi_segment_store()
        server = GroundedMemoryServer(store, embedder=_embedder())
        payload = _payload(_call(server, "t_main", "supporto"))

        assert len(payload["items"]) == 3, f"expected 3 hits, got {len(payload['items'])}"
        for item in payload["items"]:
            assert isinstance(item["seg_id"], str) and item["seg_id"]
            assert isinstance(item["lesson_id"], str) and item["lesson_id"]
            assert isinstance(item["text"], str) and item["text"]
            assert "snippet" in item  # may be empty for dense-only hits
            assert "rank" in item
