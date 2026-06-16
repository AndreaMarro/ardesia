"""Shared graph utilities — pure functions, no I/O."""

import unicodedata


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
