"""Dense (semantic) retrieval over the method-graph corpus (PLAN §13 — hybrid).

The BM25/FTS layer (:mod:`lessonos.retrieval.fts`) matches *exact lexical*
tokens. It is blind to paraphrase: a query "analisi spettrale" never matches a
segment that only says "frequenze". The dense layer covers that blind spot by
ranking documents on **semantic** similarity instead of literal token overlap.

A production deployment swaps in a neural embedding model (sqlite-vec /
pgvector) behind the :class:`Embedder` protocol. This v0 ships a deterministic,
zero-dependency, zero-LLM embedder — :class:`LexiconEmbedder` — so the hybrid
fusion and its recall@k can be MEASURED in-gate without a model or network. The
embedder is the only swappable part; the retriever and the RRF fusion are model
agnostic.

Vectors are sparse ``dict[dimension -> weight]`` and similarity is plain cosine
— no numpy, no new dependency.
"""

from __future__ import annotations

import math
import re
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass
from typing import Protocol, runtime_checkable

from lessonos.graph.utils import canonical_match_key, content_tokens
from lessonos.retrieval.fts import SearchResult, _capsule_to_text
from lessonos.store.base import Store
from lessonos.store.sqlite import SQLiteStore

# Free text (unlike a concept *name*) carries punctuation: "frequenze." and
# "l'antitrasformata" must tokenise to {frequenze} and {antitrasformata}.
# content_tokens splits on whitespace only, so we first replace every run of
# non-word characters with a space before handing the text to it.
_PUNCT = re.compile(r"[^\w]+", re.UNICODE)


def _tokens(text: str) -> frozenset[str]:
    """Content tokens of free text: punctuation-stripped, IT-aware fold."""
    return content_tokens(_PUNCT.sub(" ", text))


@runtime_checkable
class Embedder(Protocol):
    """Maps text to a sparse vector ``{dimension: weight}``.

    The contract is intentionally tiny so any backend (lexicon, hashing,
    neural model behind an API) can implement it. An empty mapping means "no
    signal" — the document/query carries no embeddable content and will not
    match anything (cosine 0).
    """

    def embed(self, text: str) -> dict[str, float]: ...


@dataclass(frozen=True)
class CorpusDoc:
    """One retrievable unit of the method-graph corpus.

    ``source``/``source_id`` mirror :class:`SearchResult` so a dense hit fuses
    against the BM25 hit for the *same* document (same key space).
    """

    source: str  # 'segment' | 'capsule'
    source_id: str
    lesson_id: str
    text: str


class LexiconEmbedder:
    """Deterministic sparse embedder driven by a token→concept lexicon.

    Each *content token* (Italian-aware fold + stopword drop, reusing
    :func:`lessonos.graph.utils.content_tokens`) maps to one or more *concept
    dimensions* via ``lexicon``. Synonyms that share a dimension ("frequenze"
    and "spettrale" → ``spectrum``) become close in vector space even with zero
    lexical overlap — this is exactly the semantic reach BM25 lacks.

    ``fallback_to_token`` controls out-of-vocabulary handling:

    - ``True`` (default): an unknown token becomes its own dimension, so a
      lexicon-free embedder degrades to a usable bag-of-content-tokens dense
      baseline.
    - ``False``: unknown tokens contribute nothing. This models a real
      embedding's weakness on rare/OOV terms (codes, proper nouns, rare
      jargon) — useful to expose BM25's *complementary* strength on exact
      terms when measuring fusion value.

    Weights accumulate by count, so when several *distinct* tokens map to the
    same concept dimension that dimension is weighted higher (a content-token
    *set* is used, so an identical token repeated in the text counts once).
    Cosine normalises magnitude, so raw counts are fine.
    """

    def __init__(
        self,
        lexicon: Mapping[str, Sequence[str]] | None = None,
        *,
        fallback_to_token: bool = True,
    ) -> None:
        # Canonicalise lexicon keys so lookup matches content_tokens output.
        self._lexicon: dict[str, tuple[str, ...]] = {
            canonical_match_key(k): tuple(v) for k, v in (lexicon or {}).items()
        }
        self._fallback_to_token = fallback_to_token

    def embed(self, text: str) -> dict[str, float]:
        vec: dict[str, float] = {}
        for tok in _tokens(text):
            dims = self._lexicon.get(tok)
            if dims is None:
                if not self._fallback_to_token:
                    continue
                dims = (tok,)
            for dim in dims:
                vec[dim] = vec.get(dim, 0.0) + 1.0
        return vec


def cosine(a: Mapping[str, float], b: Mapping[str, float]) -> float:
    """Cosine similarity of two sparse vectors. 0.0 if either is empty.

    Iterates the smaller vector's keys for the dot product (sparse-friendly).
    """
    if not a or not b:
        return 0.0
    small, large = (a, b) if len(a) <= len(b) else (b, a)
    dot = sum(w * large[k] for k, w in small.items() if k in large)
    if dot == 0.0:
        return 0.0
    norm_a = math.sqrt(sum(w * w for w in a.values()))
    norm_b = math.sqrt(sum(w * w for w in b.values()))
    return dot / (norm_a * norm_b)


def corpus_from_store(store: Store) -> list[CorpusDoc]:
    """Extract the BM25/dense shared corpus from an SQLite store.

    Same two sources the FTS layer indexes — segments (raw transcript) and
    capsules (concept/topic/exercise text via :func:`_capsule_to_text`) — so
    the dense and BM25 retrievers see an identical document universe and their
    hits fuse on a common key space.
    """
    if not isinstance(store, SQLiteStore):
        raise TypeError(
            f"corpus_from_store requires an SQLiteStore, got {type(store).__name__}"
        )
    conn = store._conn  # type: ignore[reportPrivateUsage]
    docs: list[CorpusDoc] = []

    for row in conn.execute("SELECT seg_id, lesson_id, text FROM segments"):
        docs.append(
            CorpusDoc(
                source="segment",
                source_id=row["seg_id"],
                lesson_id=row["lesson_id"],
                text=row["text"] or "",
            )
        )

    for row in conn.execute("SELECT lesson_id, capsule_data FROM capsules"):
        text = _capsule_to_text(row["capsule_data"])
        if text.strip():
            docs.append(
                CorpusDoc(
                    source="capsule",
                    source_id=row["lesson_id"],
                    lesson_id=row["lesson_id"],
                    text=text,
                )
            )

    return docs


class DenseRetriever:
    """Cosine-ranked semantic retrieval over a fixed corpus.

    Document vectors are precomputed once at construction. ``search`` embeds the
    query and ranks docs by descending cosine; ties break deterministically by
    ``(source, source_id)`` so the order is reproducible (important for RRF and
    for the gate). Documents with zero similarity are dropped — a dense miss is
    a real signal (the query has no semantic neighbour here), not a low-ranked
    hit.
    """

    def __init__(self, corpus: Iterable[CorpusDoc], embedder: Embedder) -> None:
        self._embedder = embedder
        self._docs: tuple[CorpusDoc, ...] = tuple(corpus)
        self._vectors: list[dict[str, float]] = [
            embedder.embed(doc.text) for doc in self._docs
        ]

    @classmethod
    def from_store(cls, store: Store, embedder: Embedder) -> DenseRetriever:
        return cls(corpus_from_store(store), embedder)

    def search(self, query: str, *, top_k: int = 5) -> list[SearchResult]:
        if not query or not query.strip():
            return []
        q_vec = self._embedder.embed(query)
        if not q_vec:
            return []

        scored: list[tuple[float, CorpusDoc]] = []
        for doc, vec in zip(self._docs, self._vectors):
            sim = cosine(q_vec, vec)
            if sim > 0.0:
                scored.append((sim, doc))

        # Best first; deterministic tie-break by stable key.
        scored.sort(key=lambda s: (-s[0], s[1].source, s[1].source_id))

        return [
            SearchResult(
                source=doc.source,
                source_id=doc.source_id,
                lesson_id=doc.lesson_id,
                rank=-sim,  # lower = better, consistent with FTS convention
                excerpt=doc.text[:160],
                match_type="dense",
                metadata={"similarity": sim},
            )
            for sim, doc in scored[:top_k]
        ]
