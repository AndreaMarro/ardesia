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
