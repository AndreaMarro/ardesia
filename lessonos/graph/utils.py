"""Shared graph utilities — pure functions, no I/O."""

import unicodedata
from collections.abc import Iterable

# Italian function words (articles, prepositions, simple/articulated
# prepositions, coordinating conjunctions). They carry no discriminative
# meaning, so a prereq "la trasformata di Fourier" and the concept
# "Trasformata di Fourier" must compare equal on their CONTENT tokens
# ({trasformata, fourier}). Kept deliberately small: only closed-class
# function words, never domain terms.
_MATCH_STOPWORDS = frozenset(
    {
        "di", "del", "dello", "della", "dei", "degli", "delle", "dell",
        "il", "lo", "la", "i", "gli", "le", "l",
        "un", "uno", "una",
        "a", "ad", "da", "in", "con", "su", "per", "tra", "fra",
        "e", "ed", "o", "od",
    }
)

# Default Jaccard threshold for the prereq→concept FUZZY fallback in
# build_path_graph. Tunable per-call. The default is 1.0 = content-token-set
# EQUALITY: it recovers ONLY word-order and article/preposition variants
# ("la trasformata di Fourier" / "Fourier trasformata" ≡ "Trasformata di
# Fourier"), which carry the same content words. It deliberately REJECTS
# subset/superset overlaps — a bare generic prereq ("funzione") is NOT evidence
# of a dependency on a specialisation ("Funzione Periodica"), so accepting such
# a subset (J=0.5) would inject FALSE depends_on edges. The spec's hard
# constraint is ZERO false matches, so precision wins: a lower threshold can be
# passed explicitly when a caller accepts the recall/precision trade-off.
DEFAULT_DEPENDS_FUZZY_THRESHOLD = 1.0


def normalize_name(name: str) -> str:
    """Normalise a concept name for deduplication: NFC, casefold, strip.

    Single source of truth for name normalisation across the graph layer.
    Both *aggregator* and *resolution* must use this instead of duplicating
    the logic. ``casefold()`` is used instead of ``lower()`` to handle
    language-agnostic case folding (e.g. German 'ß' → 'ss').
    """
    return unicodedata.normalize('NFC', name.strip()).casefold()


def canonical_match_key(name: str) -> str:
    """Canonical key for matching a prerequisite *string* to a concept name.

    More aggressive than :func:`normalize_name`: on top of casefolding it
    folds away accents (NFKD decomposition, dropping combining marks) and
    collapses internal whitespace runs to a single space. This recovers
    prereq→concept matches that an exact ``.lower()`` comparison loses when
    the LLM emits a prerequisite with a different accent encoding, a missing
    accent, extra spacing, or different case than the concept's own name.

    Accent folding trades a small false-merge risk for recall. In practice
    concept names are distinctive multi-word noun phrases, so collisions are
    rare; the residual risk is stress-position homographs (e.g. ``princìpi``
    vs ``prìncipi``), which almost never co-occur as STEM concept names. The
    matching only adds ``depends_on`` edges (it never deletes data) and edges
    that would close a cycle are dropped downstream, so a stray false merge
    cannot corrupt the DAG. Tests pin that distinct concepts
    ("limite"/"limiti") do NOT collapse.
    """
    decomposed = unicodedata.normalize('NFKD', name)
    without_accents = ''.join(c for c in decomposed if not unicodedata.combining(c))
    collapsed = ' '.join(without_accents.split())
    return collapsed.casefold()


def content_tokens(name: str) -> frozenset[str]:
    """Significant (content) tokens of a concept/prerequisite name.

    Canonicalises the name (accent/case/whitespace fold via
    :func:`canonical_match_key`), splits on whitespace, and drops Italian
    function words (:data:`_MATCH_STOPWORDS`). The result is the token *set*
    used for Jaccard overlap in the fuzzy prereq matcher. Being a set, it is
    word-order invariant; dropping stopwords makes it article/preposition
    invariant. An empty result (name was blank or all function words) carries
    no signal and never matches.
    """
    return frozenset(
        t for t in canonical_match_key(name).split() if t and t not in _MATCH_STOPWORDS
    )


def prereq_matches_label(
    prereq: str,
    label: str,
    threshold: float = DEFAULT_DEPENDS_FUZZY_THRESHOLD,
) -> bool:
    """True iff *prereq* still supports a ``depends_on`` edge to a *label*.

    Pairwise re-validation of ONE persisted edge against its CURRENT target
    label (GS-3 reconciliation): exact canonical-key equality, else content-token
    Jaccard ``>= threshold`` (same metric as :func:`fuzzy_prereq_match`). Unlike
    that function this is deliberately pairwise — no corpus-wide uniqueness — so
    an edge whose prereq genuinely matches its target stays even when a duplicate
    concept now exists elsewhere in the corpus. Keeping a genuinely-matching edge
    is never a false match, while a target whose label changed (reorder/removal)
    fails the check and the stale edge is dropped. Empty token sets → False.
    """
    if canonical_match_key(prereq) == canonical_match_key(label):
        return True
    prereq_tokens = content_tokens(prereq)
    label_tokens = content_tokens(label)
    if not prereq_tokens or not label_tokens:
        return False
    inter = len(prereq_tokens & label_tokens)
    if inter == 0:
        return False
    return inter / len(prereq_tokens | label_tokens) >= threshold


def fuzzy_prereq_match(
    prereq: str,
    candidates: Iterable[tuple[str, frozenset[str]]],
    threshold: float = DEFAULT_DEPENDS_FUZZY_THRESHOLD,
) -> tuple[str, float] | None:
    """Best UNIQUE concept key whose content tokens overlap the prereq's.

    ``candidates`` is an iterable of ``(concept_key, content_tokens)`` (one
    entry per distinct concept). Returns ``(concept_key, jaccard_score)`` for
    the single best match whose Jaccard token overlap is ``>= threshold``
    **and** is strictly greater than every other candidate's score.

    At the default ``threshold`` (1.0) only an exact content-token-SET match
    qualifies, i.e. order/article variants of the same content words; subset
    and superset overlaps are rejected (see
    :data:`DEFAULT_DEPENDS_FUZZY_THRESHOLD`).

    Precision over recall: if the best score is tied between two or more
    distinct concepts the prereq is ambiguous (e.g. two concepts with the same
    content tokens but different word order) and we return ``None`` — a wrong
    dependency edge is worse than a missing one. An empty prereq token set also
    returns ``None``.

    Pure function: no node objects, no I/O — keys only, so it is trivially
    testable on a labelled precision set.
    """
    prereq_tokens = content_tokens(prereq)
    if not prereq_tokens:
        return None

    scored: list[tuple[float, str]] = []
    for key, toks in candidates:
        if not toks:
            continue
        inter = len(prereq_tokens & toks)
        if inter == 0:
            continue
        score = inter / len(prereq_tokens | toks)
        if score >= threshold:
            scored.append((score, key))

    if not scored:
        return None

    scored.sort(key=lambda s: (-s[0], s[1]))
    best_score, best_key = scored[0]
    # Tie on the top score between distinct concepts ⇒ ambiguous ⇒ drop.
    if len(scored) > 1 and scored[1][0] == best_score:
        return None
    return best_key, best_score
