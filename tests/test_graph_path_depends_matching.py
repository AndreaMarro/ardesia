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
from lessonos.graph.utils import content_tokens, fuzzy_prereq_match


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


# ---------------------------------------------------------------------------
# GRAPH-SUGGEST-2 — fuzzy (token-overlap) prereq→concept fallback.
#
# The exact canonical match (GS-1) still misses prereqs that differ from the
# concept label only by WORD ORDER or an ARTICLE/preposition. A Jaccard
# fallback recovers those — but the DEFAULT threshold is 1.0 (content-token-SET
# equality), so subset/superset overlaps are REJECTED: a bare generic prereq
# ("funzione") is NOT a dependency on its specialisation ("Funzione Periodica").
# The fixture below is a *labelled* precision set: every depends_on edge is
# ground-truth-correct, and the assertion pins the EXACT edge set, so a single
# false match turns the test RED. The hard spec constraint is ZERO false
# matches; recall is secondary.
# ---------------------------------------------------------------------------

def _build_labelled_fuzzy_fixture() -> list[LessonCapsule]:
    """Targets + prereqs with KNOWN ground truth (positives and negatives).

    Targets (l1, no prereqs):
        0: "Trasformata di Fourier"
        1: "Trasformata di Laplace"   (distinct: must never be matched here)
        2: "Sistema LTI"

    "Spettro" (l2) prereqs:
        "la trasformata di Fourier"  POSITIVE fuzzy → l1:0 (article variant, J=1.0)
        "trasformata"                NEGATIVE → tie Fourier/Laplace ⇒ drop
        "trasformata di hilbert"     NEGATIVE → tied 0.33, concept absent ⇒ drop

    "Modulazione" (l3) prereqs:
        "fourier"      NEGATIVE (subset, J=0.5 < 1.0) ⇒ NO edge
        "sistema lti"  POSITIVE exact → l1:2 (canonical, NOT fuzzy)
    """
    l1 = _capsule(
        "l1",
        [
            ConceptExtraction(name="Trasformata di Fourier", status="introduced"),
            ConceptExtraction(name="Trasformata di Laplace", status="introduced"),
            ConceptExtraction(name="Sistema LTI", status="introduced"),
        ],
    )
    l2 = _capsule(
        "l2",
        [
            ConceptExtraction(
                name="Spettro",
                status="introduced",
                prerequisites=(
                    "la trasformata di Fourier",
                    "trasformata",
                    "trasformata di hilbert",
                ),
            )
        ],
    )
    l3 = _capsule(
        "l3",
        [
            ConceptExtraction(
                name="Modulazione",
                status="introduced",
                prerequisites=("fourier", "sistema lti"),
            )
        ],
    )
    return [l1, l2, l3]


def test_fuzzy_recovers_order_and_article_prereqs_only():
    """Fuzzy recovers exactly the ground-truth edges (order/article), zero false."""
    caps = _build_labelled_fuzzy_fixture()
    _nodes, edges = build_path_graph(caps)

    depends = {(e.source, e.target) for e in edges if e.edge_type == "depends_on"}
    # EXACT ground-truth edge set. The subset prereq "fourier"→Fourier and the
    # ambiguous "trasformata" produce NO edge; any spurious edge breaks this.
    assert depends == {
        ("l2:concept:0", "l1:concept:0"),  # "la trasformata di Fourier" (fuzzy J=1.0)
        ("l3:concept:0", "l1:concept:2"),  # "sistema lti" (exact canonical)
    }
    # ZERO false match to the distinct "Trasformata di Laplace" concept.
    all_targets = {e.target for e in edges if e.edge_type == "depends_on"}
    assert "l1:concept:1" not in all_targets


def test_fuzzy_before_after_recall_count():
    """Before/after on the labelled fixture: naive .lower()=1 → with fuzzy=2."""
    caps = _build_labelled_fuzzy_fixture()
    _nodes, edges = build_path_graph(caps)
    new_count = len([e for e in edges if e.edge_type == "depends_on"])
    # Naive exact-.lower() matches only "sistema lti" → "Sistema LTI".
    assert _naive_lower_depends_count(caps) == 1
    # Fuzzy (set-equality) recovers ONE more — the article variant of Fourier —
    # WITHOUT matching the subset "fourier", the ambiguous "trasformata", or the
    # absent "hilbert".
    assert new_count == 2


def test_subset_prereq_is_not_matched_to_specialisation():
    """A generic prereq that is a strict token SUBSET of one concept ⇒ NO edge.

    'funzione' (the generic notion) must NOT bind to 'Funzione Periodica':
    a subset is not evidence of a dependency on the specialisation. This is the
    precision leak the default threshold (1.0) closes; it would be a FALSE edge
    at threshold 0.5.
    """
    l1 = _capsule(
        "l1",
        [
            ConceptExtraction(name="Funzione Periodica", status="introduced"),
            ConceptExtraction(name="Trasformata di Fourier", status="introduced"),
        ],
    )
    l2 = _capsule(
        "l2",
        [
            ConceptExtraction(
                name="Limite",
                status="introduced",
                prerequisites=("funzione",),  # subset of "Funzione Periodica"
            )
        ],
    )
    _nodes, edges = build_path_graph([l1, l2])
    assert [e for e in edges if e.edge_type == "depends_on"] == []


def test_fuzzy_edges_carry_distinct_provenance_and_confidence():
    """Fuzzy edges are labelled so consumers can tell them from exact ones."""
    caps = _build_labelled_fuzzy_fixture()
    _nodes, edges = build_path_graph(caps)
    by_pair = {
        (e.source, e.target): e for e in edges if e.edge_type == "depends_on"
    }

    fuzzy_full = by_pair[("l2:concept:0", "l1:concept:0")]
    assert fuzzy_full.metadata["provenance"] == "auto-suggested-fuzzy"
    assert fuzzy_full.metadata["confidence"] == "1.00"  # J=1.0 (order/article)

    exact = by_pair[("l3:concept:0", "l1:concept:2")]
    assert exact.metadata["provenance"] == "auto-suggested"
    assert exact.metadata["confidence"] == "0.8"


def test_fuzzy_ambiguous_prereq_is_dropped_not_guessed():
    """A prereq tied between two concepts yields NO edge (precision > recall)."""
    l1 = _capsule(
        "l1",
        [
            ConceptExtraction(name="Trasformata di Fourier", status="introduced"),
            ConceptExtraction(name="Trasformata di Laplace", status="introduced"),
        ],
    )
    l2 = _capsule(
        "l2",
        [
            ConceptExtraction(
                name="Analisi",
                status="introduced",
                prerequisites=("trasformata",),  # bare → tie 0.5/0.5
            )
        ],
    )
    _nodes, edges = build_path_graph([l1, l2])
    assert [e for e in edges if e.edge_type == "depends_on"] == []


def test_fuzzy_does_not_match_distinct_transform_below_threshold():
    """'Trasformata di Laplace' prereq never matches 'Trasformata di Fourier'."""
    l1 = _capsule(
        "l1", [ConceptExtraction(name="Trasformata di Fourier", status="introduced")]
    )
    l2 = _capsule(
        "l2",
        [
            ConceptExtraction(
                name="Stabilità",
                status="introduced",
                # share only "trasformata" of 3 union tokens → J=0.33 < 1.0
                prerequisites=("trasformata di laplace",),
            )
        ],
    )
    _nodes, edges = build_path_graph([l1, l2])
    assert [e for e in edges if e.edge_type == "depends_on"] == []


# --- pure-function unit tests for the fuzzy matcher --------------------------

def test_content_tokens_strips_articles_and_folds_order():
    assert content_tokens("la Trasformata di Fourier") == frozenset(
        {"trasformata", "fourier"}
    )
    # word-order invariance
    assert content_tokens("Fourier Trasformata") == content_tokens(
        "Trasformata di Fourier"
    )
    # all-stopwords / blank → empty (no signal)
    assert content_tokens("di la il") == frozenset()
    assert content_tokens("   ") == frozenset()


def test_fuzzy_prereq_match_default_is_set_equality():
    candidates = [
        ("trasformata fourier", frozenset({"trasformata", "fourier"})),
        ("trasformata laplace", frozenset({"trasformata", "laplace"})),
        ("sistema lti", frozenset({"sistema", "lti"})),
    ]
    # exact content-token set (order/article variant) → J=1.0 unique winner
    assert fuzzy_prereq_match("la trasformata di fourier", candidates) == (
        "trasformata fourier",
        1.0,
    )
    # subset → J=0.5 < default 1.0 → rejected (precision)
    assert fuzzy_prereq_match("fourier", candidates) is None
    # ambiguous tie at lower threshold → None
    assert fuzzy_prereq_match("trasformata", candidates, threshold=0.5) is None
    # empty prereq → None
    assert fuzzy_prereq_match("di la", candidates) is None


def test_fuzzy_prereq_match_threshold_only_rejection_no_tie():
    """A UNIQUE candidate below threshold is rejected — isolates the threshold.

    Single candidate, no tie possible; superset prereq scores J=2/3 < 1.0 and
    is dropped at the default, but accepted once the threshold drops below it.
    """
    candidates = [("trasformata fourier", frozenset({"trasformata", "fourier"}))]
    # superset prereq: {trasformata, fourier, continua} vs {trasformata, fourier}
    assert fuzzy_prereq_match("trasformata di fourier continua", candidates) is None
    key, score = fuzzy_prereq_match(
        "trasformata di fourier continua", candidates, threshold=0.6
    )
    assert key == "trasformata fourier"
    assert abs(score - 2 / 3) < 1e-9
