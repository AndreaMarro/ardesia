"""Tests for lessonos.style — StyleProfile derivation helpers (M1-4).

The core functions tested here are pure (no store dependency):
  * ``_register_from_segments`` — heuristic register detection
  * ``_extract_tics`` — n-gram frequency extraction

End-to-end ``derive_style_profile`` is tested via the LIVE run in Phase F.
"""

from __future__ import annotations

from lessonos.style import _extract_tics, _register_from_segments


# ── _register_from_segments  ──────────────────────────────────────────


class TestRegisterFromSegments:
    def test_colloquiale(self) -> None:
        """High filler density → colloquiale."""
        texts = [
            "Allora, diciamo che un attimino il segnale è praticamente una grandezza fisica.",
            "Ecco, insomma, un attimino diciamo che varia nel tempo.",
            "Praticamente, un attimino diciamo che l'energia è l'integrale.",
        ]
        assert _register_from_segments(texts) == "colloquiale"

    def test_formale(self) -> None:
        """High formal marker density → formale."""
        texts = [
            "Il segnale è pertanto una grandezza fisica. Dunque varia nel tempo.",
            "Conseguentemente, l'energia è definita come l'integrale del modulo quadro.",
            "Tuttavia, la potenza media richiede un approccio differente. Inoltre, il teorema stabilisce che.",
        ]
        assert _register_from_segments(texts) == "formale"

    def test_misto(self) -> None:
        """Balanced filler/formal → misto."""
        texts = [
            "Allora, il segnale è pertanto una grandezza fisica.",
            "Dunque, un attimino, l'energia è l'integrale. Inoltre, la potenza.",
            "Ecco, diciamo che tuttavia il teorema vale.",
        ]
        assert _register_from_segments(texts) == "misto"

    def test_empty_texts(self) -> None:
        """Empty texts → misto (no data to decide)."""
        assert _register_from_segments([]) == "misto"

    def test_empty_strings(self) -> None:
        """All empty strings → misto."""
        assert _register_from_segments(["", "  "]) == "misto"


# ── _extract_tics  ────────────────────────────────────────────────────


class TestExtractTics:
    def test_basic_extraction(self) -> None:
        """Frequent n-grams surface as tics."""
        texts = [
            "un attimino vediamo questo segnale un attimino",
            "prendiamo un attimino l'integrale un attimino",
            "calcoliamo un attimino l'energia un attimino",
            "un attimino definiamo la trasformata un attimino",
        ]
        tics = _extract_tics(texts, min_occurrences=3)
        assert "un attimino" in tics or "attimino" in tics

    def test_min_occurrences_filter(self) -> None:
        """Expressions below threshold are excluded."""
        texts = [
            "una sola volta questa espressione rara",
            "altre cose normali",
            "ancora testo normale",
        ]
        tics = _extract_tics(texts, min_occurrences=3)
        assert len(tics) == 0

    def test_stopwords_excluded(self) -> None:
        """Common stopwords are not returned as tics."""
        texts = [
            "il segnale e la potenza il segnale e la potenza il segnale e la potenza",
        ]
        tics = _extract_tics(texts, min_occurrences=2, max_tics=10)
        for bad in ("il", "e", "la"):
            assert bad not in tics

    def test_max_tics_limit(self) -> None:
        """At most max_tics items returned."""
        texts = [
            "esprimiamo calcoliamo definiamo verifichiamo dimostriamo analizziamo",
            "esprimiamo calcoliamo definiamo verifichiamo dimostriamo analizziamo",
            "esprimiamo calcoliamo definiamo verifichiamo dimostriamo analizziamo",
        ]
        tics = _extract_tics(texts, min_occurrences=2, max_tics=3)
        assert len(tics) <= 3

    def test_empty_texts(self) -> None:
        """Empty input → empty tuple."""
        assert _extract_tics([]) == ()
