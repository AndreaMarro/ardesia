"""Tests for global per-teacher concept resolution (M1-1c).

Covers:
- Mention collection (one teacher only, context line, evidence counts)
- Deterministic prompt building (mock-keyable)
- Conservative parsing/validation of LLM groups (drops, never invents)
- Mapping persistence round-trip (open JSON in derived/)
- Aggregator consumption (ZERO-LLM) incl. cross-teacher contamination guards
- TeacherBook with resolution: progression/prerequisites span lessons whose
  labels differ
"""

import json

import pytest

from lessonos.graph.aggregator import aggregate_path_graph, aggregate_teacher_graph
from lessonos.graph.resolution import (
    GlobalResolution,
    ResolutionAlias,
    ResolutionEntry,
    _parse_groups,
    build_resolution_prompt,
    build_verification_prompt,
    collect_concept_mentions,
    load_resolution,
    resolve_concepts_globally,
    save_resolution,
)
from lessonos.llm.router import MockProvider, Router
from lessonos.teacher_book import build_teacher_book
from tests.test_graph_aggregator import (
    _PathStore,
    _make_capsule,
    _register_capsule,
    _register_path,
)


def _verification_pairs(mentions, groups) -> tuple[tuple[int, int], ...]:
    """Anchor-based pairs, same construction as resolve_concepts_globally."""
    pairs: list[tuple[int, int]] = []
    for _, members in groups:
        for other in members[1:]:
            pairs.append((members[0], other))
    return tuple(pairs)


def _router_for(
    store,
    teacher_id,
    response_text: str,
    *,
    verdicts: str | None = None,
) -> Router:
    """Mock router keyed on the exact prompts for *teacher_id*.

    Registers the grouping fixture and (when the grouping fixture parses to
    candidate groups) the verification fixture too — by default confirming
    every pair; pass *verdicts* to override.
    """
    mentions = collect_concept_mentions(store, teacher_id)
    prompt = build_resolution_prompt(mentions)
    fixtures = {prompt: response_text}
    try:
        groups, _ = _parse_groups(response_text, mentions)
    except ValueError:
        groups = []
    pairs = _verification_pairs(mentions, groups)
    if pairs:
        v_prompt = build_verification_prompt(mentions, pairs)
        fixtures[v_prompt] = verdicts if verdicts is not None else json.dumps(
            {"verdicts": [{"pair": i, "same": True} for i in range(len(pairs))]}
        )
    router = Router()
    router.register(MockProvider(fixtures))
    return router


def _two_lesson_store() -> _PathStore:
    """Teacher 'anna', two lessons, same concept under different labels."""
    store = _PathStore()
    _register_path(store, "p1", ["l1", "l2"], teacher_id="anna")
    c1 = _make_capsule("l1", [
        {"name": "Definizione di segnale", "status": "introduced",
         "canonical": "definizione di segnale"},
        {"name": "Energia", "status": "introduced", "canonical": "energia"},
    ])
    c2 = _make_capsule("l2", [
        {"name": "Il segnale come grandezza fisica", "status": "reinforced",
         "canonical": "il segnale"},
    ])
    _register_capsule(store, c1)
    _register_capsule(store, c2)
    return store


GROUP_SEGNALE = json.dumps(
    {"groups": [{"canonical": "segnale", "members": [
        {"i": 0, "name": "Definizione di segnale"},
        {"i": 2, "name": "Il segnale come grandezza fisica"},
    ]}]}
)


class TestCollectMentions:
    def test_collects_in_lesson_order_with_context(self):
        store = _two_lesson_store()
        mentions = collect_concept_mentions(store, "anna")
        assert [m.name for m in mentions] == [
            "Definizione di segnale", "Energia",
            "Il segnale come grandezza fisica",
        ]
        assert mentions[0].lesson_id == "l1"
        assert mentions[2].lesson_id == "l2"
        # context = first citation excerpt (helpers attach 'test excerpt')
        assert mentions[0].context == "test excerpt"
        assert mentions[0].evidence_count == 1
        assert mentions[0].canonical == "definizione di segnale"

    def test_unknown_teacher_raises(self):
        store = _two_lesson_store()
        with pytest.raises(ValueError, match="no paths"):
            collect_concept_mentions(store, "sconosciuto")

    def test_only_own_teacher_lessons(self):
        """No cross-teacher contamination at the INPUT of the pass."""
        store = _two_lesson_store()
        _register_path(store, "pb", ["b1"], teacher_id="marco")
        _register_capsule(store, _make_capsule("b1", [
            {"name": "Segnale di Marco", "status": "introduced",
             "canonical": "segnale"},
        ]))
        mentions = collect_concept_mentions(store, "anna")
        assert all(m.lesson_id in ("l1", "l2") for m in mentions)
        assert "Segnale di Marco" not in [m.name for m in mentions]

    def test_lesson_without_capsule_skipped(self):
        store = _two_lesson_store()
        _register_path(store, "p2", ["l3"], teacher_id="anna")  # no capsule
        mentions = collect_concept_mentions(store, "anna")
        assert len(mentions) == 3


class TestResolvePass:
    def test_merge_group_plus_singletons(self):
        store = _two_lesson_store()
        router = _router_for(store, "anna", GROUP_SEGNALE)
        res = resolve_concepts_globally(store, "anna", router)

        assert res.teacher_id == "anna"
        merged = res.merged_entries()
        assert len(merged) == 1
        assert merged[0].canonical == "segnale"
        assert [a.original_name for a in merged[0].aliases] == [
            "Definizione di segnale", "Il segnale come grandezza fisica",
        ]
        # original labels preserved as aliases with provenance
        assert merged[0].aliases[0].lesson_id == "l1"
        assert merged[0].aliases[1].lesson_id == "l2"
        assert merged[0].lesson_count == 2
        # singleton keeps its per-lesson canonical
        singles = [e for e in res.entries if len(e.aliases) == 1]
        assert [e.canonical for e in singles] == ["energia"]
        assert res.dropped == ()
        assert res.provider == "mock"

    def test_code_fences_tolerated(self):
        store = _two_lesson_store()
        fenced = "```json\n" + GROUP_SEGNALE + "\n```"
        router = _router_for(store, "anna", fenced)
        res = resolve_concepts_globally(store, "anna", router)
        assert len(res.merged_entries()) == 1

    def test_malformed_json_raises(self):
        store = _two_lesson_store()
        router = _router_for(store, "anna", "non sono JSON")
        with pytest.raises(ValueError, match="not valid JSON"):
            resolve_concepts_globally(store, "anna", router)

    def test_missing_groups_raises(self):
        store = _two_lesson_store()
        router = _router_for(store, "anna", json.dumps({"merges": []}))
        with pytest.raises(ValueError, match="groups"):
            resolve_concepts_globally(store, "anna", router)

    def test_invalid_members_dropped_never_invented(self):
        """Out-of-range / non-int / mismatched / duplicate members are dropped + audited."""
        store = _two_lesson_store()
        response = json.dumps({"groups": [
            {"canonical": "segnale", "members": [
                {"i": 0, "name": "Definizione di segnale"},
                {"i": 2, "name": "Il segnale come grandezza fisica"},
                {"i": 99, "name": "fuori range"},
                {"i": "x", "name": "non-int"},
                {"i": True, "name": "bool"},
                7,  # member not an object
            ]},
            {"canonical": "doppione", "members": [   # 0 already taken
                {"i": 0, "name": "Definizione di segnale"},
                {"i": 1, "name": "Energia"},
            ]},
            {"canonical": "solo", "members": [        # <2 members
                {"i": 1, "name": "Energia"},
            ]},
            {"canonical": "", "members": []},          # empty canonical
            "stringa",                                 # group not an object
        ]})
        router = _router_for(store, "anna", response)
        res = resolve_concepts_globally(store, "anna", router)

        merged = res.merged_entries()
        assert len(merged) == 1
        assert merged[0].canonical == "segnale"
        assert len(merged[0].aliases) == 2
        # 'doppione' lost index 0 → only member 1 left → discarded; mention 1
        # stays a singleton with its own canonical
        singles = [e for e in res.entries if len(e.aliases) == 1]
        assert [e.canonical for e in singles] == ["energia"]
        assert len(res.dropped) == 9

    def test_name_mismatch_member_dropped(self):
        """A member whose echoed name does not match the index is refused.

        This is the deterministic guard against LLM off-by-one/hallucinated
        indexes (the real-run false merge 'Segnale causale' + 'Misura di
        Lebesgue' came exactly from this failure mode).
        """
        store = _two_lesson_store()
        response = json.dumps({"groups": [
            {"canonical": "segnale", "members": [
                {"i": 0, "name": "Definizione di segnale"},
                {"i": 1, "name": "Il segnale come grandezza fisica"},  # actual i=1 is 'Energia'
            ]},
        ]})
        router = _router_for(store, "anna", response)
        res = resolve_concepts_globally(store, "anna", router)

        # group reduced to 1 valid member → discarded; nothing merged
        assert res.merged_entries() == ()
        assert any("name mismatch" in d for d in res.dropped)
        # all three mentions remain singletons under their own canonical
        assert len(res.entries) == 3

    def test_verification_rejects_unconfirmed_pair(self):
        """A pair judged DIFFERENT by the verification pass is not merged."""
        store = _two_lesson_store()
        router = _router_for(
            store, "anna", GROUP_SEGNALE,
            verdicts=json.dumps({"verdicts": [{"pair": 0, "same": False}]}),
        )
        res = resolve_concepts_globally(store, "anna", router)
        assert res.merged_entries() == ()
        assert any("not confirmed by verification" in d for d in res.dropped)
        assert any("fewer than 2 members after verification" in d for d in res.dropped)
        # all mentions stay singletons under their own canonical
        assert len(res.entries) == 3

    def test_verification_missing_verdict_not_confirmed(self):
        """No explicit verdict for a pair = NOT confirmed (conservative)."""
        store = _two_lesson_store()
        router = _router_for(
            store, "anna", GROUP_SEGNALE,
            verdicts=json.dumps({"verdicts": []}),
        )
        res = resolve_concepts_globally(store, "anna", router)
        assert res.merged_entries() == ()

    def test_verification_malformed_raises(self):
        store = _two_lesson_store()
        router = _router_for(
            store, "anna", GROUP_SEGNALE, verdicts="non sono JSON",
        )
        with pytest.raises(ValueError, match="verification"):
            resolve_concepts_globally(store, "anna", router)

    def test_no_mentions_empty_resolution(self):
        store = _PathStore()
        _register_path(store, "p1", ["l1"], teacher_id="anna")  # no capsules
        router = Router()
        router.register(MockProvider({}))
        res = resolve_concepts_globally(store, "anna", router)
        assert res.entries == ()

    def test_same_canonical_groups_coalesce(self):
        """Two groups (or singleton sharing canonical) collapse to one entry."""
        store = _PathStore()
        _register_path(store, "p1", ["l1", "l2", "l3"], teacher_id="anna")
        for lid, name in [("l1", "Energia del segnale"),
                          ("l2", "Energia e potenza"),
                          ("l3", "Energia")]:
            _register_capsule(store, _make_capsule(lid, [
                {"name": name, "status": "introduced", "canonical": ""},
            ]))
        response = json.dumps({"groups": [
            {"canonical": "energia", "members": [
                {"i": 0, "name": "Energia del segnale"},
                {"i": 1, "name": "Energia e potenza"},
            ]},
        ]})
        router = _router_for(store, "anna", response)
        res = resolve_concepts_globally(store, "anna", router)
        # singleton 'Energia' (canonical fallback 'energia') joins the group
        assert len(res.entries) == 1
        assert res.entries[0].canonical == "energia"
        assert len(res.entries[0].aliases) == 3


class TestPersistence:
    def test_save_load_roundtrip(self, tmp_path):
        store = _two_lesson_store()
        router = _router_for(store, "anna", GROUP_SEGNALE)
        res = resolve_concepts_globally(store, "anna", router)

        out = tmp_path / "derived" / "global_resolution" / "anna.json"
        save_resolution(res, out)
        assert out.exists()
        # open JSON, human-auditable
        data = json.loads(out.read_text(encoding="utf-8"))
        assert data["teacher_id"] == "anna"
        assert data["schema_version"] == 1

        loaded = load_resolution(out)
        assert loaded.teacher_id == res.teacher_id
        assert loaded.entries == res.entries
        assert loaded.alias_lookup() == res.alias_lookup()

    def test_load_missing_teacher_raises(self, tmp_path):
        bad = tmp_path / "bad.json"
        bad.write_text(json.dumps({"entries": []}), encoding="utf-8")
        with pytest.raises(ValueError, match="teacher_id"):
            load_resolution(bad)


class TestAggregatorConsumesMapping:
    def test_cross_lesson_merge_via_mapping(self):
        store = _two_lesson_store()
        router = _router_for(store, "anna", GROUP_SEGNALE)
        res = resolve_concepts_globally(store, "anna", router)

        # WITHOUT mapping: labels and canonicals differ → no merge
        before = aggregate_teacher_graph(store, "anna")
        assert len(before.merged_nodes) == 3

        # WITH mapping (plain data, ZERO-LLM): merged across lessons
        after = aggregate_teacher_graph(store, "anna", resolution=res)
        assert len(after.merged_nodes) == 2
        segnale = [n for n in after.merged_nodes if n.dedup_key == "segnale"]
        assert len(segnale) == 1
        node = segnale[0]
        assert node.lesson_ids == ("l1", "l2")
        # original label preserved (first seen); aliases live in the mapping
        assert node.label == "Definizione di segnale"
        # most advanced status wins; per-mention evidence merged intact
        assert node.status == "reinforced"
        assert node.evidence_count == 2

    def test_teacher_mismatch_rejected(self):
        store = _two_lesson_store()
        _register_path(store, "pb", ["b1"], teacher_id="marco")
        _register_capsule(store, _make_capsule("b1", [
            {"name": "Segnale di Marco", "status": "introduced"},
        ]))
        router = _router_for(store, "anna", GROUP_SEGNALE)
        res = resolve_concepts_globally(store, "anna", router)
        with pytest.raises(ValueError, match="contamination"):
            aggregate_teacher_graph(store, "marco", resolution=res)

    def test_path_teacher_mismatch_rejected(self):
        store = _two_lesson_store()
        _register_path(store, "pb", ["b1"], teacher_id="marco")
        _register_capsule(store, _make_capsule("b1", [
            {"name": "Segnale di Marco", "status": "introduced"},
        ]))
        router = _router_for(store, "anna", GROUP_SEGNALE)
        res = resolve_concepts_globally(store, "anna", router)
        with pytest.raises(ValueError, match="contamination"):
            aggregate_path_graph(store, "pb", resolution=res)
        # own path is fine
        graph = aggregate_path_graph(store, "p1", resolution=res)
        assert len(graph.merged_nodes) == 2

    def test_mapping_does_not_leak_other_teacher(self):
        """Aliases reference (lesson_id, name): another teacher's lesson with
        the same concept name is untouched because its lesson_id differs."""
        store = _two_lesson_store()
        _register_path(store, "pb", ["b1"], teacher_id="marco")
        _register_capsule(store, _make_capsule("b1", [
            {"name": "Definizione di segnale", "status": "introduced",
             "canonical": "definizione di segnale"},
        ]))
        router = _router_for(store, "anna", GROUP_SEGNALE)
        res = resolve_concepts_globally(store, "anna", router)
        # marco aggregated WITHOUT anna's mapping: single un-renamed node
        marco = aggregate_teacher_graph(store, "marco")
        assert len(marco.merged_nodes) == 1
        assert marco.merged_nodes[0].lesson_ids == ("b1",)
        assert marco.merged_nodes[0].dedup_key == "definizione di segnale"


class TestTeacherBookWithResolution:
    def test_progression_spans_aliased_lessons(self):
        store = _two_lesson_store()
        router = _router_for(store, "anna", GROUP_SEGNALE)
        res = resolve_concepts_globally(store, "anna", router)

        # WITHOUT mapping: progression of 'segnale' stuck at one lesson
        before = build_teacher_book(store, "anna")
        segnale_before = [p for p in before.progression
                          if p.name == "Definizione di segnale"]
        assert segnale_before[0].status_sequence == ("introduced",)

        # WITH mapping: introduced (l1) → reinforced (l2)
        after = build_teacher_book(store, "anna", resolution=res)
        assert after.total_concepts == 2
        segnale = [p for p in after.progression if p.canonical == "segnale"]
        assert len(segnale) == 1
        assert segnale[0].status_sequence == ("introduced", "reinforced")
        assert segnale[0].lesson_sequence == ("l1", "l2")
        assert segnale[0].first_lesson == "l1"

    def test_prerequisites_resolve_aliased_source(self):
        from lessonos.models.entities import GraphEdge, GraphEvidence

        store = _two_lesson_store()
        # l2: 'Energia del moto' depends_on 'Il segnale come grandezza fisica'
        cap2 = _make_capsule("l2", [
            {"name": "Il segnale come grandezza fisica", "status": "reinforced",
             "canonical": "il segnale"},
            {"name": "Energia del moto", "status": "introduced",
             "canonical": "energia del moto"},
        ])
        edge = GraphEdge(edge_id="e1", source="l2:concept:0",
                         target="l2:concept:1", edge_type="depends_on")
        ev = GraphEvidence(evidence_id="ev1", edge_id="e1",
                           seg_id="l2#s1", lesson_id="l2")
        _register_capsule(store, cap2, edges=[edge], evidence=[ev])

        router = _router_for(store, "anna", GROUP_SEGNALE)
        res = resolve_concepts_globally(store, "anna", router)
        book = build_teacher_book(store, "anna", resolution=res)

        chains = [c for c in book.prerequisites
                  if c.concept == "Energia del moto"]
        assert len(chains) == 1
        # prerequisite resolved through the GLOBAL key: the source node is the
        # merged 'segnale' concept whose label comes from l1
        assert chains[0].prerequisites == ("Definizione di segnale",)
        assert chains[0].canonical == "energia del moto"

    def test_capsule_prerequisites_resolve_through_mapping(self):
        """Prerequisites declared ON the concept (capsule field) build chains
        even without depends_on edges — the only source in corpora whose
        graphs carry no depends_on. Aliased prereq names resolve to the merged
        node's label; out-of-course names are kept verbatim."""
        store = _two_lesson_store()
        cap2 = _make_capsule("l2", [
            {"name": "Il segnale come grandezza fisica", "status": "reinforced",
             "canonical": "il segnale"},
            {"name": "Energia del moto", "status": "introduced",
             "canonical": "energia del moto",
             # alias of the merged 'segnale' + an out-of-course prereq
             "prerequisites": ["Il segnale come grandezza fisica", "limiti"]},
        ])
        _register_capsule(store, cap2)

        router = _router_for(store, "anna", GROUP_SEGNALE)
        res = resolve_concepts_globally(store, "anna", router)
        book = build_teacher_book(store, "anna", resolution=res)

        chains = [c for c in book.prerequisites
                  if c.concept == "Energia del moto"]
        assert len(chains) == 1
        assert chains[0].prerequisites == ("Definizione di segnale", "limiti")

    def test_capsule_prerequisite_self_reference_skipped(self):
        store = _two_lesson_store()
        cap2 = _make_capsule("l2", [
            {"name": "Il segnale come grandezza fisica", "status": "reinforced",
             "canonical": "il segnale",
             # prereq pointing at its own merged concept (alias in l1)
             "prerequisites": ["Il segnale come grandezza fisica"]},
        ])
        _register_capsule(store, cap2)

        router = _router_for(store, "anna", GROUP_SEGNALE)
        res = resolve_concepts_globally(store, "anna", router)
        book = build_teacher_book(store, "anna", resolution=res)

        assert all(c.canonical != "segnale" for c in book.prerequisites)
