"""Tests for the T6R anti-false-verde grounding policy (graph/grounding.py).

A citation is VERIFIED iff it carries a non-empty verbatim excerpt. These tests
lock the policy that the Terza-lezione false-verde (80/80 NULL excerpts passed
as genuine) can never recur silently:

  * ``is_verified_excerpt`` — present non-empty excerpt ⟺ verified.
  * ``grounding_ratio`` — counts unverified citations.
  * ``assert_grounding_threshold`` — acceptance FAILS above 20% unverified
    (strict ``>``, so exactly 20% passes).
"""

from __future__ import annotations

import pytest

from lessonos.graph.grounding import (
    MAX_UNVERIFIED_RATIO,
    assert_grounding_threshold,
    claim_badge,
    grounding_ratio,
    is_verified_excerpt,
)

# Expected badge glyphs. Compared against the live ``claim_badge`` return, so a
# change to a production glyph (or a state collapsing onto the wrong one) fails.
_VERIFIED = "✅"
_REPAIRED = "\U0001f527"  # 🔧
_UNVERIFIED = "✗"


class TestIsVerifiedExcerpt:
    def test_present_excerpt_verified(self) -> None:
        assert is_verified_excerpt("rate of change") is True

    def test_none_excerpt_unverified(self) -> None:
        assert is_verified_excerpt(None) is False

    def test_empty_excerpt_unverified(self) -> None:
        assert is_verified_excerpt("") is False

    @pytest.mark.parametrize("blank", ["   ", "\t", "\n", " \t\n ", " "])
    def test_whitespace_only_excerpt_unverified(self, blank: str) -> None:
        # A blank run quotes nothing yet is a substring of most segment text,
        # so it passes verify_citation; the policy primitive must still reject
        # it. Without the .strip() in is_verified_excerpt this returns True.
        assert is_verified_excerpt(blank) is False


class TestGroundingRatio:
    def test_empty_is_zero(self) -> None:
        assert grounding_ratio([]) == (0, 0, 0.0)

    def test_all_verified(self) -> None:
        total, unverified, ratio = grounding_ratio(["a", "b", "c"])
        assert (total, unverified, ratio) == (3, 0, 0.0)

    def test_all_unverified(self) -> None:
        total, unverified, ratio = grounding_ratio([None, None, ""])
        assert (total, unverified, ratio) == (3, 3, 1.0)

    def test_mixed(self) -> None:
        total, unverified, ratio = grounding_ratio(["a", None, "b", "", "c"])
        assert total == 5
        assert unverified == 2
        assert ratio == pytest.approx(0.4)


class TestAssertGroundingThreshold:
    def test_fully_grounded_passes(self) -> None:
        assert_grounding_threshold(["a", "b", "c"], "l1")  # no raise

    def test_exactly_threshold_passes(self) -> None:
        # 1/5 = 20% == threshold → strict '>' means it PASSES
        assert_grounding_threshold(["a", "b", "c", "d", None], "l1")

    def test_above_threshold_fails(self) -> None:
        # 2/5 = 40% > 20% → raise
        with pytest.raises(ValueError, match="unverified"):
            assert_grounding_threshold(["a", "b", "c", None, None], "l1")

    def test_terza_lezione_shape_fails(self) -> None:
        # The real Terza false-verde: 80/80 NULL → 100% unverified → must fail.
        with pytest.raises(ValueError, match="100%"):
            assert_grounding_threshold([None] * 80, "terza_lezione")

    def test_empty_fails_closed(self) -> None:
        """ZERO citations must FAIL: 'nothing to verify' is not a pass.
        (The old 0/0=PASS semantics was a false-green hole cemented by its
        own test — deepreview finding.)"""
        with pytest.raises(ValueError, match="zero citations"):
            assert_grounding_threshold([], "l1")

    def test_threshold_constant_is_twenty_percent(self) -> None:
        assert MAX_UNVERIFIED_RATIO == 0.20


class TestClaimBadge:
    """Direct contract for ``claim_badge`` (M2-3 R1 per-claim badge).

    Four renderers (dispensa, summarizer, teacher_book, obsidian_vault) call
    this to label each claim. None of them passes ``dropped=True``, so the
    drop branch and its precedence over ``repaired`` were exercised by no
    test or caller — the exact silent-mislabel class behind the false-verde.
    These tests pin the precedence ``dropped > repaired > verified`` and the
    glyph mapping so a renderer can never present an unverified claim as ✅.
    """

    def test_verified_excerpt_is_check(self) -> None:
        assert claim_badge("rate of change") == _VERIFIED

    def test_absent_excerpt_is_cross(self) -> None:
        assert claim_badge(None) == _UNVERIFIED

    def test_empty_excerpt_is_cross(self) -> None:
        assert claim_badge("") == _UNVERIFIED

    def test_repaired_is_wrench_even_with_excerpt(self) -> None:
        assert claim_badge("quoted", repaired=True) == _REPAIRED

    def test_repaired_beats_verified(self) -> None:
        # A present excerpt would be ✅, but a repaired flag downgrades it to 🔧.
        assert claim_badge("quoted", repaired=False) == _VERIFIED
        assert claim_badge("quoted", repaired=True) == _REPAIRED

    def test_dropped_is_cross_even_with_excerpt(self) -> None:
        assert claim_badge("quoted", dropped=True) == _UNVERIFIED

    def test_dropped_beats_repaired(self) -> None:
        # Precedence: a dropped claim is ✗ even when also flagged repaired.
        assert claim_badge("quoted", repaired=True, dropped=True) == _UNVERIFIED

    def test_dropped_beats_verified(self) -> None:
        assert claim_badge("quoted", repaired=False, dropped=True) == _UNVERIFIED

    def test_three_states_map_to_distinct_glyphs(self) -> None:
        # Calls the production function for each state — guards against a
        # collapse of two states onto one glyph (not a literal-only check).
        badges = {
            claim_badge("quoted"),                 # verified
            claim_badge("quoted", repaired=True),  # repaired
            claim_badge("quoted", dropped=True),   # unverified
        }
        assert len(badges) == 3
