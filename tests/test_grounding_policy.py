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
    grounding_ratio,
    is_verified_excerpt,
)


class TestIsVerifiedExcerpt:
    def test_present_excerpt_verified(self) -> None:
        assert is_verified_excerpt("rate of change") is True

    def test_none_excerpt_unverified(self) -> None:
        assert is_verified_excerpt(None) is False

    def test_empty_excerpt_unverified(self) -> None:
        assert is_verified_excerpt("") is False


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
