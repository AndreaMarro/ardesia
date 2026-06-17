"""Method-graph query expansion for single-teacher recap retrieval (PLAN §13).

A recap query names the concept a teacher wants to revisit, but the lessons
that *ground* that recap are often the foundational ones the concept builds on
(its prerequisites) or the central concept that links it to the rest of the
method. The persisted method graph (:func:`serve_method_graph`) already knows
this structure: ``dependencies`` are concept→concept prerequisite edges and
``bridges`` rank every concept by betweenness centrality — exactly the
"where teaching effort pays off most" concepts.

:func:`expand_query_with_bridges` reads that graph to widen a query with the
**bridge concepts adjacent to the queried concept**, ranked by centrality so the
highest-leverage neighbour is added first. It is a pure, deterministic,
ZERO-LLM projection: no embeddings, no model call, just the persisted graph.

:func:`retrieve_teacher_context_with_bridges` wires the expansion in front of
the single-teacher hybrid retriever. Crucially the retrieval stays
teacher-scoped (:func:`retrieve_teacher_context`): the only thing the global
method graph contributes is concept *labels* (method-level metadata, never
lesson content or PII), and an added term that the teacher never taught simply
matches nothing in their corpus — so the CRM teacher boundary is unaffected.
"""

from __future__ import annotations

from dataclasses import dataclass

from lessonos.graph.suggest import MethodGraph, serve_method_graph
from lessonos.graph.utils import content_tokens
from lessonos.retrieval.dense import Embedder
from lessonos.retrieval.fts import SearchResult
from lessonos.retrieval.hybrid import DEFAULT_RRF_K, reciprocal_rank_fusion
from lessonos.retrieval.teacher import build_teacher_retriever
from lessonos.store.base import Store


@dataclass(frozen=True)
class ExpandedQuery:
    """The bridge concepts selected to widen a recap query.

    - ``matched_concepts``: canonical keys of the graph concepts the original
      query mentions (the anchors expansion grew from), sorted.
    - ``bridge_terms``: concept labels selected, best (most central) first.
    - ``text``: the original query with the bridge labels appended on
      whitespace — a human-readable artifact for display/logging. It is **not**
      used for retrieval: appended terms are issued as independent ranked passes
      (:func:`retrieve_teacher_context_with_bridges`), not concatenated into one
      FTS5 ``MATCH`` (where multi-token terms AND together and an operator-like
      label would error). Equals the original query when nothing was added.
    """

    text: str
    matched_concepts: tuple[str, ...]
    bridge_terms: tuple[str, ...]


def expand_query_with_bridges(
    query: str,
    method_graph: MethodGraph,
    *,
    max_bridges: int = 3,
) -> ExpandedQuery:
    """Widen *query* with bridge concepts adjacent to the concepts it mentions.

    1. **Anchor**: a graph concept is *mentioned* when all of its content tokens
       (accent/case/stopword folded, :func:`content_tokens`) appear in the
       query's content tokens. This is subset containment, so "ripasso della
       trasformata di Fourier" anchors on the concept "Trasformata di Fourier".
    2. **Neighbourhood**: collect every concept directly linked to an anchor by a
       ``depends_on`` edge, in *either* direction (a prerequisite the anchor
       builds on, or a concept that builds on the anchor). Anchors themselves are
       excluded.
    3. **Rank + cut**: order the neighbours by betweenness centrality (the graph
       ``bridges`` ranking) descending, canonical key ascending for a
       deterministic tiebreak, and keep the first ``max_bridges``. A neighbour
       whose label has no content tokens carries no retrieval signal and is
       skipped.

    The appended labels are the graph's own display labels. When no concept is
    mentioned, or an anchor has no qualifying neighbour, ``text`` is the
    unchanged query and ``bridge_terms`` is empty — expansion never removes
    signal, it only adds grounded context.

    Raises:
        ValueError: if *query* is blank or *max_bridges* is negative.
    """
    if not query.strip():
        raise ValueError("query must be non-empty")
    if max_bridges < 0:
        raise ValueError(f"max_bridges must be non-negative, got {max_bridges}")

    query_tokens = content_tokens(query)

    label_for_key = {c.key: c.label for c in method_graph.concepts}
    tokens_for_key = {c.key: content_tokens(c.label) for c in method_graph.concepts}
    centrality_for_key = {b.key: b.centrality for b in method_graph.bridges}

    matched = tuple(
        sorted(
            key
            for key, toks in tokens_for_key.items()
            if toks and toks <= query_tokens
        )
    )
    if not matched or max_bridges == 0:
        return ExpandedQuery(text=query, matched_concepts=matched, bridge_terms=())

    matched_set = set(matched)
    neighbours: set[str] = set()
    for dep in method_graph.dependencies:
        if dep.source_key in matched_set:
            neighbours.add(dep.target_key)
        if dep.target_key in matched_set:
            neighbours.add(dep.source_key)
    neighbours -= matched_set

    ordered = sorted(
        neighbours,
        key=lambda k: (-centrality_for_key.get(k, 0.0), k),
    )

    bridge_terms: list[str] = []
    for key in ordered:
        if len(bridge_terms) >= max_bridges:
            break
        label = label_for_key.get(key)
        if label is None:
            continue
        # A label with no content tokens (blank / all stopwords) carries no
        # retrieval signal — skip it rather than pad the query with noise.
        if not tokens_for_key[key]:
            continue
        bridge_terms.append(label)

    text = query if not bridge_terms else f"{query} {' '.join(bridge_terms)}"
    return ExpandedQuery(
        text=text,
        matched_concepts=matched,
        bridge_terms=tuple(bridge_terms),
    )


def retrieve_teacher_context_with_bridges(
    store: Store,
    teacher_id: str,
    query: str,
    *,
    method_graph: MethodGraph | None = None,
    max_bridges: int = 3,
    embedder: Embedder | None = None,
    top_k: int = 5,
    candidate_k: int = 20,
    rrf_k: int = DEFAULT_RRF_K,
) -> list[SearchResult]:
    """Teacher-scoped hybrid retrieval widened by method-graph bridge concepts.

    Serves the persisted method graph (or reuses *method_graph* when given —
    pass it to avoid re-projecting the store per query), selects the adjacent
    bridge concepts with :func:`expand_query_with_bridges`, then issues the
    original query **and each bridge term as an independent ranked pass** over
    the single-teacher hybrid retriever, fusing them with Reciprocal Rank
    Fusion.

    Independent passes (rather than one concatenated string) are deliberate:
    each hybrid pass already AND-combines its own multi-token query inside FTS5,
    so concatenating a multi-word bridge label into the anchor query would
    *shrink* the BM25 result set (only docs containing every token survive), and
    an operator-like label (``C++``, ``A* search``) would raise an FTS5 syntax
    error. As separate passes a bridge term can only *add* evidence: a term that
    matches nothing — or errors inside FTS5, which the retriever swallows to
    ``[]`` — leaves the anchor query's ranking untouched.

    Results stay grounded **only** in *teacher_id*'s lessons
    (:func:`build_teacher_retriever` scopes both rankers at the source); the
    method graph only contributes extra query terms, never widens the retrieval
    scope, so the CRM teacher boundary holds. ``match_type="hybrid"``,
    ``metadata`` carries the fused score plus the bridge terms / matched anchors.
    ZERO-LLM.
    """
    graph = method_graph if method_graph is not None else serve_method_graph(store)
    expanded = expand_query_with_bridges(query, graph, max_bridges=max_bridges)

    retriever = build_teacher_retriever(
        store, teacher_id, embedder=embedder, rrf_k=rrf_k
    )

    ranked_lists: list[list[tuple[str, str]]] = []
    reps: dict[tuple[str, str], SearchResult] = {}
    for q in (query, *expanded.bridge_terms):
        hits = retriever.search(q, top_k=candidate_k, candidate_k=candidate_k)
        ranked_lists.append([(h.source, h.source_id) for h in hits])
        for h in hits:
            reps.setdefault((h.source, h.source_id), h)

    fused = reciprocal_rank_fusion(ranked_lists, k=rrf_k)

    results: list[SearchResult] = []
    for key, score in fused[:top_k]:
        rep = reps[key]  # type: ignore[index]
        results.append(
            SearchResult(
                source=rep.source,
                source_id=rep.source_id,
                lesson_id=rep.lesson_id,
                rank=-score,
                excerpt=rep.excerpt,
                match_type="hybrid",
                metadata={
                    "rrf_score": score,
                    "bridge_terms": expanded.bridge_terms,
                    "matched_concepts": expanded.matched_concepts,
                },
            )
        )
    return results
