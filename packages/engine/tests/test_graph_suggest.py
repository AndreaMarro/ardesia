"""rank_bridge_concepts: betweenness ranking of pedagogical bridge concepts.

A bridge concept lies on many prerequisite paths between other concepts. We
build a small but non-trivial prerequisite structure where one concept is the
unique articulation point between a 'foundations' cluster and an 'advanced'
cluster, and assert it ranks strictly first by betweenness centrality.

Non-tautological: the ranking is driven by graph topology, not by insertion
order. The bridge appears LAST in the capsule list yet ranks first; a leaf
concept appears first yet ranks last.
"""

from __future__ import annotations

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import ConceptExtraction, LessonContent
from lessonos.graph.suggest import BridgeConcept, rank_bridge_concepts


def _capsule(lesson_id: str, concepts: list[ConceptExtraction]) -> LessonCapsule:
    return LessonCapsule(
        lesson_id=lesson_id,
        timeline=(),
        content=LessonContent(lesson_id=lesson_id, concepts=tuple(concepts)),
    )


def _build_signal_path() -> list[LessonCapsule]:
    """foundations -> 'trasformata' -> advanced. 'trasformata' is the bridge.

    segnale, funzione  (leaves, no prereqs)
        ↓ (depends_on)
    trasformata di fourier   (depends on both leaves)
        ↑ (depends_on)
    spettro, sistema lti     (both depend on the bridge)
    """
    foundations = _capsule(
        "l1",
        [
            ConceptExtraction(name="Segnale", status="introduced"),
            ConceptExtraction(name="Funzione", status="introduced"),
        ],
    )
    bridge = _capsule(
        "l2",
        [
            ConceptExtraction(
                name="Trasformata di Fourier",
                status="introduced",
                prerequisites=("segnale", "funzione"),
            ),
        ],
    )
    advanced = _capsule(
        "l3",
        [
            ConceptExtraction(
                name="Spettro",
                status="introduced",
                prerequisites=("Trasformata di Fourier",),
            ),
            ConceptExtraction(
                name="Sistema LTI",
                status="introduced",
                prerequisites=("trasformata di fourier",),
            ),
        ],
    )
    # Bridge capsule deliberately listed AFTER foundations but the ranking
    # must come from topology, not order — so list advanced last.
    return [foundations, bridge, advanced]


def test_bridge_concept_ranks_first():
    ranked = rank_bridge_concepts(_build_signal_path())

    assert [bc.name for bc in ranked][:1] == ["Trasformata di Fourier"]
    top = ranked[0]
    assert isinstance(top, BridgeConcept)
    # The bridge is the unique node on the foundations→advanced paths, so its
    # centrality is strictly greater than every other concept's.
    assert top.centrality > 0.0
    others = [bc.centrality for bc in ranked[1:]]
    assert all(top.centrality > c for c in others)


def test_leaf_and_sink_concepts_have_zero_centrality():
    ranked = rank_bridge_concepts(_build_signal_path())
    by_name = {bc.name: bc for bc in ranked}
    # Leaves (no incoming prereq path through them) and sinks are not bridges.
    assert by_name["Segnale"].centrality == 0.0
    assert by_name["Funzione"].centrality == 0.0
    assert by_name["Spettro"].centrality == 0.0
    assert by_name["Sistema LTI"].centrality == 0.0


def test_all_concepts_returned_once_dedup_by_canonical_name():
    """A concept taught across lessons (accent/case variants) counts once."""
    caps = [
        _capsule("l1", [ConceptExtraction(name="Velocità", status="introduced")]),
        _capsule("l2", [ConceptExtraction(name="velocita", status="reinforced")]),
        _capsule(
            "l3",
            [
                ConceptExtraction(
                    name="Accelerazione",
                    status="introduced",
                    prerequisites=("velocità",),
                )
            ],
        ),
    ]
    ranked = rank_bridge_concepts(caps)
    names = [bc.name for bc in ranked]
    # 'Velocità' and 'velocita' collapse to ONE bridge concept (first label).
    assert names.count("Velocità") == 1
    velocita = next(bc for bc in ranked if bc.key == "velocita")
    assert set(velocita.node_ids) == {"l1:concept:0", "l2:concept:0"}
    assert {bc.name for bc in ranked} == {"Velocità", "Accelerazione"}


def test_empty_and_single_concept_are_safe():
    assert rank_bridge_concepts([]) == []
    single = rank_bridge_concepts(
        [_capsule("l1", [ConceptExtraction(name="Solo", status="introduced")])]
    )
    assert [bc.name for bc in single] == ["Solo"]
    assert single[0].centrality == 0.0


def test_ranking_is_deterministic_with_tiebreak():
    caps = _build_signal_path()
    r1 = rank_bridge_concepts(caps)
    r2 = rank_bridge_concepts(caps)
    assert [(bc.key, bc.centrality) for bc in r1] == [
        (bc.key, bc.centrality) for bc in r2
    ]
    # Zero-centrality concepts are ordered by canonical key ascending.
    zero = [bc.key for bc in r1 if bc.centrality == 0.0]
    assert zero == sorted(zero)
