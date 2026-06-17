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

from lessonos.capsule.assembly import LessonCapsule, _serialise_capsule
from lessonos.capsule.extraction import (
    Citation,
    ConceptExtraction,
    LessonContent,
)
from lessonos.mcp import grounded_memory as gm
from lessonos.mcp.grounded_memory import (
    INVALID_PARAMS,
    INVALID_REQUEST,
    METHOD_NOT_FOUND,
    PREREQUISITES_TOOL_NAME,
    PROGRESSION_TOOL_NAME,
    PROTOCOL_VERSION,
    TOOL_NAME,
    GroundedMemoryServer,
)
from lessonos.models.entities import (
    ConceptProgression,
    GraphEdge,
    GraphEvidence,
    GraphNode,
    Lesson,
    Path,
    PrerequisiteChain,
    Segment,
    TeacherBook,
    TeacherConcept,
)
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

    def test_tools_list_exposes_all_grounded_tools(self) -> None:
        resp = _server().handle({"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
        tools = resp["result"]["tools"]
        assert [t["name"] for t in tools] == [
            TOOL_NAME,
            PROGRESSION_TOOL_NAME,
            PREREQUISITES_TOOL_NAME,
        ]
        by_name = {t["name"]: t for t in tools}
        assert by_name[TOOL_NAME]["inputSchema"]["required"] == ["teacher_id", "query"]
        assert by_name[PROGRESSION_TOOL_NAME]["inputSchema"]["required"] == ["teacher_id"]
        assert by_name[PREREQUISITES_TOOL_NAME]["inputSchema"]["required"] == ["teacher_id"]

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


# ── grounded_memory_progression fixtures ────────────────────────────────────


def _concept(name, status, canonical, prereqs=()):
    return ConceptExtraction(
        name=name, status=status, canonical=canonical, prerequisites=tuple(prereqs)
    )


def _save_capsule(store: SQLiteStore, lesson_id: str, concepts) -> None:
    """Persist a capsule + a graph node per concept (idx-aligned with the book)."""
    content = LessonContent(lesson_id=lesson_id, concepts=tuple(concepts))
    capsule = LessonCapsule(lesson_id=lesson_id, timeline=(), content=content)
    store.save_capsule(lesson_id, _serialise_capsule(capsule))
    for idx, c in enumerate(concepts):
        node_id = f"{lesson_id}:concept:{idx}"
        store.save_graph_node(
            lesson_id,
            GraphNode(node_id=node_id, node_type="concept", ref_id=node_id, label=c.name),
        )


def _save_edge_with_evidence(
    store: SQLiteStore, lesson_id, edge_id, source, target, *, seg_id, excerpt
) -> None:
    """Edge referencing a concept node, grounded by one evidence row.

    ``excerpt=None`` produces an UNVERIFIED citation (quotes nothing); a real
    excerpt must be a verbatim substring of the segment text the test stored.
    """
    store.save_graph_edge(
        lesson_id,
        GraphEdge(edge_id=edge_id, source=source, target=target, edge_type="explains"),
    )
    store.save_evidence(
        GraphEvidence(
            evidence_id=f"{edge_id}#ev0",
            edge_id=edge_id,
            seg_id=seg_id,
            excerpt=excerpt,
            lesson_id=lesson_id,
        )
    )


def _progression_store() -> SQLiteStore:
    """One teacher, two lessons; a real-style concept that progresses.

    * ``vettore`` — introduced (l1) → reinforced (l2), grounded by a verbatim
      citation. Must be SERVED.
    * ``energia`` — introduced (l1) → reinforced (l2), but its only citation has
      no excerpt (UNVERIFIED). Must be DROPPED + declared.
    * a second teacher ``t_other`` for isolation.
    """
    store = SQLiteStore(":memory:")
    store.save_path(Path(path_id="p_main", title="Fisica", subject="fisica",
                         lesson_ids=("l1", "l2"), teacher_id="t_main"))
    store.save_path(Path(path_id="p_other", title="Fisica2", subject="fisica",
                         lesson_ids=("lo",), teacher_id="t_other"))
    store.save_lesson(Lesson(lesson_id="l1", path_id="p_main", title="Lezione 1", order=1))
    store.save_lesson(Lesson(lesson_id="l2", path_id="p_main", title="Lezione 2", order=2))
    store.save_lesson(Lesson(lesson_id="lo", path_id="p_other", title="Lezione X", order=1))

    # Real segments the verbatim grounding resolves against.
    store.save_segment(Segment(seg_id="l1#s0", lesson_id="l1", start=0, end=1,
                               text="Un vettore ha modulo, direzione e verso."))
    store.save_segment(Segment(seg_id="l2#s0", lesson_id="l2", start=0, end=1,
                               text="Il vettore nello spazio si somma componente per componente."))

    # l1/l2: vettore + energia progress; massa is a single-lesson edge sink so the
    # two progressions never share an edge (and thus never share a citation).
    _save_capsule(store, "l1", [
        _concept("Vettore", "introduced", "vettore"),
        _concept("Energia", "introduced", "energia"),
        _concept("Massa", "introduced", "massa"),
    ])
    _save_capsule(store, "l2", [
        _concept("Vettore nello spazio", "reinforced", "vettore"),
        _concept("Energia cinetica", "reinforced", "energia"),
    ])
    # vettore → massa: VERBATIM excerpt → grounded.
    _save_edge_with_evidence(store, "l1", "e_vet", "l1:concept:0", "l1:concept:2",
                             seg_id="l1#s0", excerpt="vettore")
    # energia → massa: evidence has NO excerpt → unverified → dropped.
    _save_edge_with_evidence(store, "l1", "e_ene", "l1:concept:1", "l1:concept:2",
                             seg_id="l1#s0", excerpt=None)
    return store


def _progression_call(server, teacher_id, **args):
    request = {
        "jsonrpc": "2.0",
        "id": 11,
        "method": "tools/call",
        "params": {"name": PROGRESSION_TOOL_NAME,
                   "arguments": {"teacher_id": teacher_id, **args}},
    }
    resp = server.handle(request)
    assert resp is not None
    return resp


# ── grounded_memory_progression: end-to-end sample lesson ────────────────────


class TestGroundedProgression:
    def test_serves_only_verbatim_grounded_progression(self) -> None:
        """vettore (verbatim-grounded) is served; energia (no excerpt) dropped."""
        store = _progression_store()
        server = GroundedMemoryServer(store)
        payload = _payload(_progression_call(server, "t_main"))

        canonicals = {it["canonical"] for it in payload["items"]}
        assert "vettore" in canonicals, "verbatim-grounded progression must be served"
        assert "energia" not in canonicals, "unverified-evidence progression must be dropped"
        # massa's only citation is an off-concept excerpt ("vettore"); concept-tie
        # drops it. energia's citation has no excerpt. Both dropped + declared.
        assert "massa" not in canonicals, "off-concept-excerpt progression must be dropped"
        assert payload["dropped_ungrounded"] == 2

    def test_off_concept_excerpt_is_not_served_as_grounding(self) -> None:
        """An excerpt that grounds a related edge but does not mention the concept
        (inherited from the other edge endpoint) must NOT ground the concept."""
        store = _progression_store()
        server = GroundedMemoryServer(store)
        payload = _payload(_progression_call(server, "t_main"))
        # massa is the target of edge "vettore -> massa" whose only excerpt is
        # "vettore"; serving massa with that excerpt would be a false grounding.
        for it in payload["items"]:
            assert it["canonical"] != "massa"

    def test_progression_carries_status_sequence_and_grounding(self) -> None:
        store = _progression_store()
        server = GroundedMemoryServer(store)
        payload = _payload(_progression_call(server, "t_main"))

        item = next(it for it in payload["items"] if it["canonical"] == "vettore")
        # The persisted cross-lesson progression is served verbatim.
        assert item["status_sequence"] == ["introduced", "reinforced"]
        assert item["lesson_sequence"] == ["l1", "l2"]
        assert item["first_lesson"] == "l1"
        # Grounding proof resolves to a real same-lesson segment, verbatim.
        grounding = item["grounding"]
        seg = store.get_segment(grounding["seg_id"])
        assert seg is not None
        assert grounding["text"] == seg.text
        assert grounding["excerpt"] in seg.text
        assert grounding["lesson_id"] == seg.lesson_id

    def test_unknown_teacher_yields_empty_not_error(self) -> None:
        store = _progression_store()
        server = GroundedMemoryServer(store)
        # Unknown teacher (no paths) → empty, not an error (mirrors recall).
        payload = _payload(_progression_call(server, "t_ghost"))
        assert payload["items"] == []
        assert payload["dropped_ungrounded"] == 0

    def test_missing_teacher_id_is_invalid_params(self) -> None:
        store = _progression_store()
        server = GroundedMemoryServer(store)
        resp = server.handle({
            "jsonrpc": "2.0", "id": 1, "method": "tools/call",
            "params": {"name": PROGRESSION_TOOL_NAME, "arguments": {}},
        })
        assert resp["error"]["code"] == INVALID_PARAMS


# ── grounded_memory_progression: structural guard (adversarial) ──────────────


class TestProgressionGroundingGuard:
    def _poison_book(self, monkeypatch, *, evidence_lesson, excerpt, owned_seg=True):
        """Make build_teacher_book return a book whose vettore progression is
        grounded by an attacker-controlled citation."""
        store = _progression_store()
        seg_id = "l1#s0" if owned_seg else "does_not_exist"
        tc = TeacherConcept(
            name="Vettore", canonical="vettore", status="introduced",
            lesson_ids=("l1", "l2"),
            citations=(GraphEvidence(
                evidence_id="x", edge_id="e", seg_id=seg_id,
                excerpt=excerpt, lesson_id=evidence_lesson,
            ),),
        )
        prog = ConceptProgression(
            name="Vettore", canonical="vettore", first_lesson="l1",
            status_sequence=("introduced", "reinforced"),
            lesson_sequence=("l1", "l2"),
        )
        book = TeacherBook(
            teacher_id="t_main", fundamental_concepts=(tc,), progression=(prog,),
        )
        monkeypatch.setattr(gm, "build_teacher_book", lambda *a, **k: book)
        return GroundedMemoryServer(store)

    def test_fabricated_seg_id_is_dropped(self, monkeypatch) -> None:
        server = self._poison_book(monkeypatch, evidence_lesson="l1",
                                   excerpt="vettore", owned_seg=False)
        payload = _payload(_progression_call(server, "t_main"))
        assert payload["items"] == []
        assert payload["dropped_ungrounded"] == 1

    def test_cross_lesson_citation_is_dropped(self, monkeypatch) -> None:
        # seg l1#s0 really belongs to l1, but the citation claims l2 → contamination.
        server = self._poison_book(monkeypatch, evidence_lesson="l2", excerpt="vettore")
        payload = _payload(_progression_call(server, "t_main"))
        assert payload["items"] == []
        assert payload["dropped_ungrounded"] == 1

    def test_non_verbatim_excerpt_is_dropped(self, monkeypatch) -> None:
        # Excerpt is not a substring of the segment text → verify_citation raises.
        server = self._poison_book(monkeypatch, evidence_lesson="l1",
                                   excerpt="parola inventata")
        payload = _payload(_progression_call(server, "t_main"))
        assert payload["items"] == []
        assert payload["dropped_ungrounded"] == 1

    def test_progression_spanning_unowned_lesson_is_dropped(self, monkeypatch) -> None:
        store = _progression_store()
        tc = TeacherConcept(
            name="Vettore", canonical="vettore", status="introduced",
            citations=(GraphEvidence(
                evidence_id="x", edge_id="e", seg_id="l1#s0",
                excerpt="vettore", lesson_id="l1",
            ),),
        )
        # lesson_sequence references l_foreign, which t_main does not own.
        prog = ConceptProgression(
            name="Vettore", canonical="vettore", first_lesson="l1",
            status_sequence=("introduced", "reinforced"),
            lesson_sequence=("l1", "l_foreign"),
        )
        book = TeacherBook(
            teacher_id="t_main", fundamental_concepts=(tc,), progression=(prog,),
        )
        monkeypatch.setattr(gm, "build_teacher_book", lambda *a, **k: book)
        server = GroundedMemoryServer(store)
        payload = _payload(_progression_call(server, "t_main"))
        assert payload["items"] == []
        assert payload["dropped_ungrounded"] == 1


# ── grounded_memory_prerequisites fixtures ───────────────────────────────────


def _prerequisites_store() -> SQLiteStore:
    """One teacher, a real-style lesson whose concepts declare prerequisites.

    * ``derivata`` — declares prereq ``limiti`` (out-of-course, kept verbatim),
      grounded by a verbatim citation that mentions the concept. SERVED.
    * ``energia`` — declares prereq ``lavoro`` but its only citation has no
      excerpt (UNVERIFIED). DROPPED + declared.
    * ``massa`` — a single-lesson edge sink with no declared prereq, so it yields
      no chain (and never shares a citation with the others).
    * a second teacher ``t_other`` for isolation.
    """
    store = SQLiteStore(":memory:")
    store.save_path(Path(path_id="p_main", title="Matematica", subject="matematica",
                         lesson_ids=("l1",), teacher_id="t_main"))
    store.save_path(Path(path_id="p_other", title="Mat2", subject="matematica",
                         lesson_ids=("lo",), teacher_id="t_other"))
    store.save_lesson(Lesson(lesson_id="l1", path_id="p_main", title="Lezione 1", order=1))
    store.save_lesson(Lesson(lesson_id="lo", path_id="p_other", title="Lezione X", order=1))

    # Real segment the verbatim grounding resolves against (mentions "derivata").
    store.save_segment(Segment(seg_id="l1#s0", lesson_id="l1", start=0, end=1,
                               text="La derivata misura la pendenza della funzione."))
    # A second same-lesson segment that does NOT mention "derivata" (used by the
    # adversarial concept-tie test: a verbatim excerpt from here must not ground
    # the derivata chain).
    store.save_segment(Segment(seg_id="l1#s1", lesson_id="l1", start=2, end=3,
                               text="La funzione varia nel tempo."))

    _save_capsule(store, "l1", [
        _concept("Derivata", "introduced", "derivata", prereqs=("limiti",)),
        _concept("Energia", "introduced", "energia", prereqs=("lavoro",)),
        _concept("Massa", "introduced", "massa"),
    ])
    # derivata → massa: VERBATIM excerpt mentioning derivata → grounds derivata.
    _save_edge_with_evidence(store, "l1", "e_der", "l1:concept:0", "l1:concept:2",
                             seg_id="l1#s0", excerpt="derivata")
    # energia → massa: evidence has NO excerpt → unverified → energia dropped.
    _save_edge_with_evidence(store, "l1", "e_ene", "l1:concept:1", "l1:concept:2",
                             seg_id="l1#s0", excerpt=None)
    return store


def _prerequisites_call(server, teacher_id, **args):
    request = {
        "jsonrpc": "2.0",
        "id": 13,
        "method": "tools/call",
        "params": {"name": PREREQUISITES_TOOL_NAME,
                   "arguments": {"teacher_id": teacher_id, **args}},
    }
    resp = server.handle(request)
    assert resp is not None
    return resp


# ── grounded_memory_prerequisites: end-to-end sample lesson ──────────────────


class TestGroundedPrerequisites:
    def test_serves_only_verbatim_grounded_chain(self) -> None:
        """derivata (verbatim-grounded) is served; energia (no excerpt) dropped."""
        store = _prerequisites_store()
        server = GroundedMemoryServer(store)
        payload = _payload(_prerequisites_call(server, "t_main"))

        canonicals = {it["canonical"] for it in payload["items"]}
        assert "derivata" in canonicals, "verbatim-grounded chain must be served"
        assert "energia" not in canonicals, "unverified-evidence chain must be dropped"
        assert payload["dropped_ungrounded"] == 1

    def test_chain_carries_prerequisites_and_grounding(self) -> None:
        store = _prerequisites_store()
        server = GroundedMemoryServer(store)
        payload = _payload(_prerequisites_call(server, "t_main"))

        item = next(it for it in payload["items"] if it["canonical"] == "derivata")
        # The persisted prerequisite chain is served verbatim.
        assert item["concept"] == "Derivata"
        assert item["prerequisites"] == ["limiti"]
        assert item["lesson_ids"] == ["l1"]
        # Grounding proof resolves to a real same-lesson segment, verbatim.
        grounding = item["grounding"]
        seg = store.get_segment(grounding["seg_id"])
        assert seg is not None
        assert grounding["text"] == seg.text
        assert grounding["excerpt"] in seg.text
        assert grounding["lesson_id"] == seg.lesson_id

    def test_unknown_teacher_yields_empty_not_error(self) -> None:
        store = _prerequisites_store()
        server = GroundedMemoryServer(store)
        payload = _payload(_prerequisites_call(server, "t_ghost"))
        assert payload["items"] == []
        assert payload["dropped_ungrounded"] == 0

    def test_cross_teacher_isolation_holds(self) -> None:
        """t_other (different lesson) never sees t_main's grounded chain."""
        store = _prerequisites_store()
        server = GroundedMemoryServer(store)
        payload = _payload(_prerequisites_call(server, "t_other"))
        assert payload["items"] == []

    def test_missing_teacher_id_is_invalid_params(self) -> None:
        store = _prerequisites_store()
        server = GroundedMemoryServer(store)
        resp = server.handle({
            "jsonrpc": "2.0", "id": 1, "method": "tools/call",
            "params": {"name": PREREQUISITES_TOOL_NAME, "arguments": {}},
        })
        assert resp["error"]["code"] == INVALID_PARAMS


# ── grounded_memory_prerequisites: structural guard (adversarial) ────────────


class TestPrerequisitesGroundingGuard:
    def _poison_book(self, monkeypatch, *, evidence_lesson, excerpt,
                     owned_seg=True, chain_lessons=("l1",), seg_id="l1#s0"):
        """Make build_teacher_book return a book whose derivata chain is grounded
        by an attacker-controlled citation."""
        store = _prerequisites_store()
        if not owned_seg:
            seg_id = "does_not_exist"
        tc = TeacherConcept(
            name="Derivata", canonical="derivata", status="introduced",
            lesson_ids=("l1",),
            citations=(GraphEvidence(
                evidence_id="x", edge_id="e", seg_id=seg_id,
                excerpt=excerpt, lesson_id=evidence_lesson,
            ),),
        )
        chain = PrerequisiteChain(
            concept="Derivata", canonical="derivata",
            prerequisites=("limiti",), lesson_ids=chain_lessons,
        )
        book = TeacherBook(
            teacher_id="t_main", fundamental_concepts=(tc,), prerequisites=(chain,),
        )
        monkeypatch.setattr(gm, "build_teacher_book", lambda *a, **k: book)
        return GroundedMemoryServer(store)

    def test_fabricated_seg_id_is_dropped(self, monkeypatch) -> None:
        server = self._poison_book(monkeypatch, evidence_lesson="l1",
                                   excerpt="derivata", owned_seg=False)
        payload = _payload(_prerequisites_call(server, "t_main"))
        assert payload["items"] == []
        assert payload["dropped_ungrounded"] == 1

    def test_cross_lesson_citation_is_dropped(self, monkeypatch) -> None:
        # seg l1#s0 really belongs to l1, but the citation claims l2 → contamination.
        server = self._poison_book(monkeypatch, evidence_lesson="l2", excerpt="derivata")
        payload = _payload(_prerequisites_call(server, "t_main"))
        assert payload["items"] == []
        assert payload["dropped_ungrounded"] == 1

    def test_non_verbatim_excerpt_is_dropped(self, monkeypatch) -> None:
        server = self._poison_book(monkeypatch, evidence_lesson="l1",
                                   excerpt="parola inventata")
        payload = _payload(_prerequisites_call(server, "t_main"))
        assert payload["items"] == []
        assert payload["dropped_ungrounded"] == 1

    def test_off_concept_excerpt_is_dropped(self, monkeypatch) -> None:
        # l1#s1 ("La funzione varia nel tempo.") is a real same-lesson owned
        # segment, and "funzione" is a verbatim substring of it — but it does NOT
        # mention the dependent concept "derivata" → concept-tie drops it.
        server = self._poison_book(monkeypatch, evidence_lesson="l1",
                                   excerpt="funzione", seg_id="l1#s1")
        payload = _payload(_prerequisites_call(server, "t_main"))
        assert payload["items"] == []
        assert payload["dropped_ungrounded"] == 1

    def test_chain_spanning_unowned_lesson_is_dropped(self, monkeypatch) -> None:
        # lesson_ids references l_foreign, which t_main does not own.
        server = self._poison_book(monkeypatch, evidence_lesson="l1",
                                   excerpt="derivata", chain_lessons=("l1", "l_foreign"))
        payload = _payload(_prerequisites_call(server, "t_main"))
        assert payload["items"] == []
        assert payload["dropped_ungrounded"] == 1
