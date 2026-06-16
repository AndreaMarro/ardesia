"""Prereq→concept matching attrition in build_path_graph (GRAPH-SUGGEST-1).

The path graph adds cross-lesson ``depends_on`` edges by matching each
concept's ``prerequisites`` strings against concept names. An exact
``.lower()`` comparison drops matches whenever the LLM emits a prerequisite
with a different accent encoding, a missing accent, extra spacing, or
different case than the concept's own label. ``canonical_match_key`` folds
those away (accents/case/whitespace) WITHOUT collapsing genuinely distinct
concepts.

These tests are non-tautological: every recovered edge asserted here would
DISAPPEAR if the matching reverted to ``prereq.lower() == concept.name.lower()``
(mutation-verified), and the no-false-match test would FAIL if accent folding
over-merged distinct concepts.
"""

from __future__ import annotations

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import ConceptExtraction, LessonContent
from lessonos.graph.builder import build_path_graph


def _capsule(lesson_id: str, concepts: list[ConceptExtraction]) -> LessonCapsule:
    return LessonCapsule(
        lesson_id=lesson_id,
        timeline=(),
        content=LessonContent(lesson_id=lesson_id, concepts=tuple(concepts)),
    )


def _depends_targets(edges, source_id: str) -> set[str]:
    return {
        e.target
        for e in edges
        if e.edge_type == "depends_on" and e.source == source_id
    }


def _naive_lower_depends_count(capsules) -> int:
    """Reproduce the OLD exact-.lower() matching to measure attrition."""
    by_lower: dict[str, str] = {}
    for cap in capsules:
        for i, c in enumerate(cap.content.concepts):
            by_lower.setdefault(c.name.lower(), f"{cap.lesson_id}:concept:{i}")
    count = 0
    for cap in capsules:
        for i, c in enumerate(cap.content.concepts):
            src = f"{cap.lesson_id}:concept:{i}"
            for prereq in c.prerequisites:
                tgt = by_lower.get(prereq.lower())
                if tgt is not None and tgt != src:
                    count += 1
    return count


def test_canonical_matching_recovers_accent_case_and_whitespace_prereqs():
    """Prereq variants the exact-lower match drops are recovered canonically."""
    l1 = _capsule(
        "l1",
        [
            ConceptExtraction(name="Velocità di gruppo", status="introduced"),
            ConceptExtraction(name="Funzione Periodica", status="introduced"),
            ConceptExtraction(name="Trasformata di Fourier", status="introduced"),
        ],
    )
    l2 = _capsule(
        "l2",
        [
            # accent dropped: "velocita" vs concept "Velocità"
            # whitespace doubled: "funzione  periodica" vs "Funzione Periodica"
            # mixed case: "TRASFORMATA DI fourier" vs "Trasformata di Fourier"
            ConceptExtraction(
                name="Spettro",
                status="introduced",
                prerequisites=(
                    "velocita di gruppo",
                    "funzione  periodica",
                    "TRASFORMATA DI fourier",
                ),
            ),
        ],
    )

    _nodes, edges = build_path_graph([l1, l2])
    targets = _depends_targets(edges, "l2:concept:0")

    assert targets == {"l1:concept:0", "l1:concept:1", "l1:concept:2"}

    # Densification: exact-.lower() recovers ONLY the case-only variant
    # ("TRASFORMATA DI fourier"); the accent-dropped and double-space
    # variants are lost. Canonical matching recovers all three.
    assert _naive_lower_depends_count([l1, l2]) == 1
    depends = [e for e in edges if e.edge_type == "depends_on"]
    assert len(depends) == 3


def test_exact_lower_match_still_works():
    """Case-identical prereqs (already matched by .lower()) keep matching."""
    l1 = _capsule("l1", [ConceptExtraction(name="derivata", status="introduced")])
    l2 = _capsule(
        "l2",
        [
            ConceptExtraction(
                name="integrale",
                status="introduced",
                prerequisites=("derivata",),
            )
        ],
    )
    _nodes, edges = build_path_graph([l1, l2])
    assert _depends_targets(edges, "l2:concept:0") == {"l1:concept:0"}


def test_distinct_concepts_do_not_false_match():
    """Accent/whitespace folding must NOT merge genuinely distinct concepts."""
    l1 = _capsule(
        "l1",
        [
            ConceptExtraction(name="limite", status="introduced"),
            ConceptExtraction(name="limiti", status="introduced"),
        ],
    )
    l2 = _capsule(
        "l2",
        [
            ConceptExtraction(
                name="continuità",
                status="introduced",
                prerequisites=("limite",),
            )
        ],
    )
    _nodes, edges = build_path_graph([l1, l2])
    targets = _depends_targets(edges, "l2:concept:0")
    # 'limite' resolves ONLY to the 'limite' node, never to 'limiti'.
    assert targets == {"l1:concept:0"}
    assert "l1:concept:1" not in targets
    # No prereq named "limiti" → no edge to it at all.
    all_depends_targets = {e.target for e in edges if e.edge_type == "depends_on"}
    assert "l1:concept:1" not in all_depends_targets


def test_self_dependency_is_skipped():
    """A prereq canonicalising to the concept's own name yields no self-loop."""
    l1 = _capsule(
        "l1",
        [
            ConceptExtraction(
                name="Convoluzione",
                status="introduced",
                # whitespace variant of its own name → would self-match
                prerequisites=("convoluzione",),
            )
        ],
    )
    # Must not raise (a self-loop would break the DAG validation) and must
    # produce zero depends_on edges.
    _nodes, edges = build_path_graph([l1])
    assert [e for e in edges if e.edge_type == "depends_on"] == []


def test_mutual_prerequisites_do_not_raise_cycle():
    """Denser matching that would close a cycle drops the offending edge.

    'Velocità' (l1) declares prereq 'accelerazione'; 'Accelerazione' (l2)
    declares prereq 'velocita' (accent dropped). Exact .lower() matched
    neither cross-edge; canonical matching matches both, which would form a
    2-cycle and abort the DAG check. The builder must keep the first edge and
    drop the cycle-closing second one — never raise.
    """
    l1 = _capsule(
        "l1",
        [
            ConceptExtraction(
                name="Velocità",
                status="introduced",
                prerequisites=("accelerazione",),
            )
        ],
    )
    l2 = _capsule(
        "l2",
        [
            ConceptExtraction(
                name="Accelerazione",
                status="introduced",
                prerequisites=("velocita",),
            )
        ],
    )
    # Must not raise.
    _nodes, edges = build_path_graph([l1, l2])
    depends = [e for e in edges if e.edge_type == "depends_on"]
    # Exactly one of the two mutual edges survives (the first seen).
    assert len(depends) == 1
    assert depends[0].source == "l1:concept:0"
    assert depends[0].target == "l2:concept:0"


def test_first_occurrence_wins_for_prereq_target():
    """A repeated concept name resolves the prereq to its FIRST occurrence."""
    l1 = _capsule("l1", [ConceptExtraction(name="Segnale", status="introduced")])
    l2 = _capsule("l2", [ConceptExtraction(name="segnale", status="reinforced")])
    l3 = _capsule(
        "l3",
        [
            ConceptExtraction(
                name="Campionamento",
                status="introduced",
                prerequisites=("SEGNALE",),
            )
        ],
    )
    _nodes, edges = build_path_graph([l1, l2, l3])
    assert _depends_targets(edges, "l3:concept:0") == {"l1:concept:0"}
