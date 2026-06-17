"""Tests for compute_scheduled_review_day (scheduling from stability + retention)."""

import math

import pytest

from lessonos.graph.path_memory import compute_scheduled_review_day


class TestComputeScheduledReviewDayValidation:
    """Input validation: stability > 0, target_retention in (0, 1)."""

    def test_zero_stability_raises(self):
        """Stability of 0 is invalid (no concept retention)."""
        with pytest.raises(ValueError, match=r"stability must be > 0"):
            compute_scheduled_review_day(0.0)

    def test_negative_stability_raises(self):
        """Negative stability is physically meaningless."""
        with pytest.raises(ValueError, match=r"stability must be > 0"):
            compute_scheduled_review_day(-1.0)

    def test_retention_at_zero_raises(self):
        """target_retention=0 is not allowed (would ask: review already forgotten?)."""
        with pytest.raises(ValueError, match=r"target_retention must be in"):
            compute_scheduled_review_day(10.0, target_retention=0.0)

    def test_retention_at_one_raises(self):
        """target_retention=1.0 is not allowed (infinite delay)."""
        with pytest.raises(ValueError, match=r"target_retention must be in"):
            compute_scheduled_review_day(10.0, target_retention=1.0)

    def test_retention_above_one_raises(self):
        """target_retention > 1 is nonsensical."""
        with pytest.raises(ValueError, match=r"target_retention must be in"):
            compute_scheduled_review_day(10.0, target_retention=1.5)

    def test_retention_negative_raises(self):
        """Negative retention is invalid."""
        with pytest.raises(ValueError, match=r"target_retention must be in"):
            compute_scheduled_review_day(10.0, target_retention=-0.1)


class TestComputeScheduledReviewDayDeterministic:
    """Known values from the inverted power-law formula: t = S * (1/R - 1)."""

    def test_low_stability_gives_immediate_review(self):
        """Stability barely above 0 with 90% target gives 0 days."""
        result = compute_scheduled_review_day(1.0, target_retention=0.9)
        # t = 1.0 * (1/0.9 - 1) = 1.0 * 0.111... = 0.111... -> int floor = 0
        assert result == 0

    def test_stability_10_retention_90(self):
        """S=10, R=0.9: t = 10 * (1/0.9 - 1) = 10 * 0.111... = 1.111... -> 1"""
        result = compute_scheduled_review_day(10.0, target_retention=0.9)
        assert result == 1

    def test_stability_50_retention_90(self):
        """S=50, R=0.9: t = 50 * (1/0.9 - 1) = 50 * 0.111... = 5.555... -> 5"""
        result = compute_scheduled_review_day(50.0, target_retention=0.9)
        assert result == 5

    def test_default_retention_is_90(self):
        """Default target_retention=0.9 matches the explicit version."""
        assert compute_scheduled_review_day(50.0) == compute_scheduled_review_day(
            50.0, target_retention=0.9
        )

    def test_higher_retention_shorter_interval(self):
        """R=0.95 gives shorter interval than R=0.9 for same stability."""
        r90 = compute_scheduled_review_day(50.0, target_retention=0.9)
        r95 = compute_scheduled_review_day(50.0, target_retention=0.95)
        # t_95 = 50 * (1/0.95 - 1) = 50 * 0.0526 = 2.63 -> 2
        # t_90 = 50 * 0.1111 = 5.55 -> 5
        assert r95 < r90

    def test_lower_retention_longer_interval(self):
        """R=0.8 gives longer interval than R=0.9 for same stability."""
        r80 = compute_scheduled_review_day(50.0, target_retention=0.8)
        r90 = compute_scheduled_review_day(50.0, target_retention=0.9)
        # t_80 = 50 * (1/0.8 - 1) = 50 * 0.25 = 12.5 -> 12
        assert r80 > r90

    def test_very_high_stability_long_interval(self):
        """S=200, R=0.9: t = 200 * 0.111... = 22.22... -> 22 lessons."""
        result = compute_scheduled_review_day(200.0, target_retention=0.9)
        assert result == 22

    def test_retention_50(self):
        """S=10, R=0.5: t = 10 * (1/0.5 - 1) = 10 * 1.0 = 10 lessons."""
        result = compute_scheduled_review_day(10.0, target_retention=0.5)
        assert result == 10

    def test_result_is_integer(self):
        """Result is always an int, never a float."""
        result = compute_scheduled_review_day(1.234, target_retention=0.87)
        assert isinstance(result, int)

    def test_deterministic_round_trip(self):
        """Same inputs always give same outputs."""
        r1 = compute_scheduled_review_day(10.0)
        r2 = compute_scheduled_review_day(10.0)
        assert r1 == r2

    def test_immediate_review_for_near_zero_stability(self):
        """Very small stability produces 0 days."""
        result = compute_scheduled_review_day(0.001, target_retention=0.9)
        assert result == 0

    def test_retention_formula_verification(self):
        """Verify that the inverse formula is correct directly,
        without going through compute_retention (which has its own stability computation).

        scheduled_day = floor(S * (1/R - 1))
        Expected retention at scheduled_day using R = 1/(1 + t/S):
          R(scheduled) = 1 / (1 + scheduled / S) >= target
        """
        from lessonos.graph.path_memory import compute_retention

        stability = 50.0
        target = 0.9

        scheduled = compute_scheduled_review_day(stability, target_retention=target)

        # Direct formula: R = 1 / (1 + t / S)
        r_direct = 1.0 / (1.0 + scheduled / stability)
        assert r_direct >= target - 1e-12, (
            f"R={r_direct:.6f} < {target} at scheduled day {scheduled}"
        )

        # One lesson after: R = 1 / (1 + (scheduled+1) / S) should be < target
        r_next_direct = 1.0 / (1.0 + (scheduled + 1) / stability)
        assert r_next_direct <= target + 1e-12, (
            f"R={r_next_direct:.6f} at day {scheduled+1} should be <= {target}"
        )


class TestComputeScheduledReviewDayEdgeCases:
    """Boundary and edge cases."""

    def test_very_large_stability(self):
        """Very large stability does not overflow."""
        result = compute_scheduled_review_day(1e10, target_retention=0.9)
        # t = 1e10 * 0.111... = 1.111e9 -> int
        assert isinstance(result, int)
        assert result > 0

    def test_retention_099(self):
        """R=0.99 (aggressive retention target) gives interval ~ S/99."""
        # t = 10 * (1/0.99 - 1) = 10 * 0.0101 = 0.101 -> 0
        assert compute_scheduled_review_day(10.0, target_retention=0.99) == 0
        # With very high stability, even 99% gives a day
        # t = 1000 * (1/0.99 - 1) = 1000 * 0.0101 = 10.1 -> 10
        assert compute_scheduled_review_day(1000.0, target_retention=0.99) == 10

    def test_retention_001(self):
        """R=0.01 (very lenient) gives interval ~ S*99."""
        # t = 10 * (1/0.01 - 1) = 10 * 99 = 990
        result = compute_scheduled_review_day(10.0, target_retention=0.01)
        assert result == 990
