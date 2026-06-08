"""Property-based tests for compute_scheduled_review_day (Hypothesis).

Invariants to verify:
1. Stability > 0 and 0 < target_retention < 1 always produce int >= 0
2. Higher stability ≈ longer or equal interval (monotonic)
3. Higher retention target ≈ shorter or equal interval (monotonic)
4. Deterministic: same inputs → same output
5. The inverse formula is correct: scheduled_day = floor(stability * (1/R - 1))
   such that retention at scheduled_day >= R using the direct power-law formula
"""

import math

from hypothesis import given, assume
from hypothesis.strategies import floats

from lessonos.graph.path_memory import compute_scheduled_review_day


@given(
    stability=floats(
        min_value=1e-10,
        max_value=1e6,
        allow_nan=False,
        allow_infinity=False,
    ),
    target_retention=floats(
        min_value=1e-10,
        max_value=1 - 1e-10,
        allow_nan=False,
        allow_infinity=False,
    ),
)
def test_invariant_valid_input_returns_non_negative_int(stability, target_retention):
    """For any valid stability > 0 and target_retention in (0, 1),
    the result is an int >= 0."""
    result = compute_scheduled_review_day(stability, target_retention=target_retention)
    assert isinstance(result, int)
    assert result >= 0


@given(
    higher=floats(min_value=0.1, max_value=1e6, allow_nan=False, allow_infinity=False),
    lower=floats(min_value=0.1, max_value=1e6, allow_nan=False, allow_infinity=False),
)
def test_higher_stability_gives_non_shorter_interval(higher, lower):
    """Higher stability should not produce a shorter interval
    than lower stability for the same target retention."""
    assume(higher > lower)
    r_higher = compute_scheduled_review_day(higher, target_retention=0.9)
    r_lower = compute_scheduled_review_day(lower, target_retention=0.9)
    assert r_higher >= r_lower


@given(
    stability=floats(
        min_value=1.0,
        max_value=1e4,
        allow_nan=False,
        allow_infinity=False,
    ),
    lower_ret=floats(min_value=0.01, max_value=0.5, allow_nan=False, allow_infinity=False),
    higher_ret=floats(min_value=0.51, max_value=0.99, allow_nan=False, allow_infinity=False),
)
def test_higher_retention_gives_non_longer_interval(
    stability, lower_ret, higher_ret
):
    """Higher target retention should not produce a longer interval
    than lower target retention for the same stability."""
    assume(lower_ret < higher_ret)
    r_low = compute_scheduled_review_day(stability, target_retention=lower_ret)
    r_high = compute_scheduled_review_day(stability, target_retention=higher_ret)
    assert r_high <= r_low


@given(
    stability=floats(
        min_value=0.1,
        max_value=1e4,
        allow_nan=False,
        allow_infinity=False,
    ),
    target_retention=floats(
        min_value=1e-9,
        max_value=1 - 1e-9,
        allow_nan=False,
        allow_infinity=False,
    ),
)
def test_inverse_formula_holds_at_bound(stability, target_retention):
    """Scheduled day = floor(S * (1/R - 1)).

    Verify: the product produces the correct int after floor.
    """
    expected_exact = stability * (1.0 / target_retention - 1.0)
    scheduled = compute_scheduled_review_day(stability, target_retention=target_retention)

    # The scheduled day must be floor(exact) or 0 if exact < 0 (shouldn't happen)
    expected_floor = max(int(math.floor(expected_exact)), 0)

    assert scheduled == expected_floor, (
        f"S={stability:.4g}, R={target_retention:.4g}: "
        f"exact={expected_exact:.6g}, expected_floor={expected_floor}, "
        f"got {scheduled}"
    )


@given(
    stability=floats(
        min_value=1.0,
        max_value=1e4,
        allow_nan=False,
        allow_infinity=False,
    ),
    target_retention=floats(
        min_value=0.1,
        max_value=0.99,
        allow_nan=False,
        allow_infinity=False,
    ),
)
def test_inverse_formula_retention_at_scheduled_day(stability, target_retention):
    """Verify that the inverse formula R = 1/(1 + t/S) holds at the scheduled day.

    scheduled_day = floor(S * (1/R - 1))
    At the scheduled day: R_scheduled = 1/(1 + scheduled/S) >= target_retention
    One lesson later: R_next = 1/(1 + (scheduled+1)/S) should be < target_retention
    """
    scheduled = compute_scheduled_review_day(stability, target_retention=target_retention)

    # Direct formula verification (not using compute_retention which has different semantics)
    r = 1.0 / (1.0 + scheduled / stability)
    assert r >= target_retention - 1e-12, (
        f"R={r:.6f} < target {target_retention:.4f} "
        f"at scheduled day {scheduled} (S={stability:.4g})"
    )

    # One lesson after scheduled
    r_next = 1.0 / (1.0 + (scheduled + 1) / stability)
    if scheduled >= 1:
        assert r_next <= target_retention + 1e-12, (
            f"R={r_next:.6f} at day {scheduled+1} should be ≤ target "
            f"{target_retention:.4f} (S={stability:.4g})"
        )


@given(
    stability=floats(
        min_value=0.1,
        max_value=1e6,
        allow_nan=False,
        allow_infinity=False,
    ),
)
def test_deterministic(stability):
    """Same inputs produce same output."""
    r1 = compute_scheduled_review_day(stability)
    r2 = compute_scheduled_review_day(stability)
    assert r1 == r2
