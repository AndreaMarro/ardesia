"""Property-based tests for predict_stability using Hypothesis.

Tests invariants of predict_stability that Claude Code review caught
manually in earlier iterations — formalised as generative properties.

Invariants tested:
    1. Non-decreasing on all-good histories (q >= 3)
    2. Higher per-review quality never leads to lower stability (element-wise)
    3. Any q < 3 resets stability to initial at that point
    4. Stability is bounded: cannot exceed a theoretical maximum
    5. Single review: q=5 >= q=4 >= q=3 > q=0 (reset)
    6. Length monotonicity: longer good history >= shorter good history
    7. Deterministic: same inputs -> same outputs
"""

import pytest
from hypothesis import given, assume, settings, strategies as st
from hypothesis.strategies import integers, lists, floats

# Import the function under test
try:
    from lessonos.graph.path_memory import predict_stability, compute_retention
except ImportError:
    pytestmark = pytest.mark.skip("lessonos not available")


# -- Strategies --

_valid_diff = floats(min_value=1.0, max_value=10.0, allow_nan=False, allow_infinity=False)
_valid_init = floats(min_value=0.001, max_value=100.0, allow_nan=False, allow_infinity=False)
_valid_mult = floats(min_value=1.0, max_value=100.0, allow_nan=False, allow_infinity=False)

# Quality in [0,5] as integer
_qualities = st.integers(min_value=0, max_value=5)

# All-good histories (every review >= 3) — stability should never decrease
_good_quality = st.integers(min_value=3, max_value=5)
_good_history = st.lists(_good_quality, min_size=1, max_size=20)


@given(
    history=_good_history,
    initial_stability=_valid_init,
    stability_multiplier=_valid_mult,
    difficulty=_valid_diff,
)
@settings(max_examples=200)
def test_stability_monotonic_non_decreasing(history, initial_stability, stability_multiplier, difficulty):
    """For any all-good history (q >= 3), stability never decreases.

    Each step should produce stability >= previous step.
    """
    s = initial_stability
    for q in history:
        next_s = predict_stability(
            [q], initial_stability=s, stability_multiplier=stability_multiplier,
            difficulty=difficulty,
        )
        assert next_s >= s, (
            f"Stability decreased: {s} -> {next_s} at q={q}, "
            f"mult={stability_multiplier}, D={difficulty}"
        )
        s = next_s


@given(
    history1=lists(_good_quality, min_size=1, max_size=10),
    history2=lists(_good_quality, min_size=1, max_size=10),
    initial_stability=_valid_init,
    stability_multiplier=_valid_mult,
    difficulty=_valid_diff,
)
@settings(max_examples=200)
def test_higher_paired_quality_never_lowers_stability(
    history1, history2, initial_stability, stability_multiplier, difficulty
):
    """If every review in history1 is >= the paired review in history2 (length-matched),
    then predict_stability(history1) >= predict_stability(history2).

    We pair histories element-wise by truncating to the shorter length.
    """
    n = min(len(history1), len(history2))
    assume(n > 0)
    h1 = history1[:n]
    h2 = history2[:n]

    # Only test when h1 is element-wise >= h2
    assume(all(h1[i] >= h2[i] for i in range(n)))

    s1 = predict_stability(h1, initial_stability=initial_stability,
                            stability_multiplier=stability_multiplier, difficulty=difficulty)
    s2 = predict_stability(h2, initial_stability=initial_stability,
                            stability_multiplier=stability_multiplier, difficulty=difficulty)
    assert s1 >= s2, (
        f"Higher quality history gave LOWER stability: "
        f"s1={s1}, s2={s2}, h1={h1}, h2={h2}, D={difficulty}"
    )


@given(
    pre_good=_good_quality,
    bad_q=st.integers(min_value=0, max_value=2),
    post_good=st.lists(_good_quality, min_size=0, max_size=5),
    initial_stability=_valid_init,
    stability_multiplier=_valid_mult,
    difficulty=_valid_diff,
)
@settings(max_examples=200)
def test_bad_review_resets_to_initial(
    pre_good, bad_q, post_good, initial_stability, stability_multiplier, difficulty
):
    """After any q < 3 review, stability resets to initial_stability.

    The concept was not retained, so growth should not persist through failure.
    """
    # Oracle: after the bad review (regardless of prior good review), stability
    # should be exactly initial_stability
    after_bad = predict_stability(
        [pre_good, bad_q], initial_stability=initial_stability,
        stability_multiplier=stability_multiplier, difficulty=difficulty,
    )
    assert after_bad == pytest.approx(initial_stability), (
        f"After bad review (q={bad_q}), stability={after_bad} != "
        f"initial={initial_stability}. pre_good={pre_good}, D={difficulty}"
    )

    # Then process the post_bad history starting from initial_stability
    if post_good:
        full = predict_stability(
            [pre_good, bad_q] + post_good,
            initial_stability=initial_stability,
            stability_multiplier=stability_multiplier, difficulty=difficulty,
        )
        expected = predict_stability(
            post_good, initial_stability=initial_stability,
            stability_multiplier=stability_multiplier, difficulty=difficulty,
        )
        assert full == pytest.approx(expected), (
            f"Full history vs post-only mismatch: {full} != {expected}. "
            f"history={[pre_good, bad_q] + post_good}, D={difficulty}"
        )
    else:
        full = predict_stability(
            [pre_good, bad_q], initial_stability=initial_stability,
            stability_multiplier=stability_multiplier, difficulty=difficulty,
        )
        assert full == pytest.approx(initial_stability), (
            f"Just bad review should equal initial: {full} != {initial_stability}"
        )


@given(
    history=lists(_qualities, min_size=1, max_size=10),
    initial_stability=_valid_init,
    stability_multiplier=_valid_mult,
    difficulty=_valid_diff,
)
@settings(max_examples=200)
def test_stability_bounded(history, initial_stability, stability_multiplier, difficulty):
    """Stability is bounded: max growth per step is limited.

    Even in an all-5 history with max multiplier, growth is finite.
    Maximum theoretical stability after k reviews:
        S_max = initial * (1 + (mult-1) * 1.0 * (11-1)/6)^k
    Since difficulty_scaling max (D=1) = (11-1)/6 = 1.667

    Minimum: stability never goes below initial_stability (for any valid inputs).
    """
    max_difficulty_scaling = (11.0 - 1.0) / 6.0  # = 1.667 for D=1

    s = predict_stability(
        history, initial_stability=initial_stability,
        stability_multiplier=stability_multiplier, difficulty=difficulty,
    )

    # Upper bound: all q=5, D=1.0, full growth each step
    max_growth_per_step = 1.0 + (stability_multiplier - 1.0) * 1.0 * max_difficulty_scaling
    upper_bound = initial_stability * (max_growth_per_step ** len(history))
    # Upper bound is an overestimate; actual growth depends on actual qualities.
    # Use a relative tolerance because values can span many orders of magnitude
    # (up to 10^10+), where the absolute 1e-6 was too tight for floating-point
    # multiplication order differences (actual: delta ~3.8e-6 at value 23e9).
    tol = 1e-6  # relative tolerance for floating-point at large values
    assert s <= upper_bound * (1.0 + tol), (
        f"Stability {s} exceeds theoretical upper bound {upper_bound}, "
        f"history={history}, D={difficulty}"
    )

    # Lower bound: stability never below initial_stability (for good reviews it grows,
    # for bad reviews it resets to initial_stability)
    assert s >= initial_stability - 1e-6, (
        f"Stability {s} below initial_stability={initial_stability}, "
        f"history={history}, D={difficulty}"
    )


@given(
    initial_stability=_valid_init,
    stability_multiplier=_valid_mult,
    difficulty=_valid_diff,
)
@settings(max_examples=100)
def test_single_review_ordering(initial_stability, stability_multiplier, difficulty):
    """Single good review: q=5 >= q=4 >= q=3 > q=0 (which resets)."""
    s5 = predict_stability(
        [5], initial_stability=initial_stability,
        stability_multiplier=stability_multiplier, difficulty=difficulty,
    )
    s4 = predict_stability(
        [4], initial_stability=initial_stability,
        stability_multiplier=stability_multiplier, difficulty=difficulty,
    )
    s3 = predict_stability(
        [3], initial_stability=initial_stability,
        stability_multiplier=stability_multiplier, difficulty=difficulty,
    )
    s0 = predict_stability(
        [0], initial_stability=initial_stability,
        stability_multiplier=stability_multiplier, difficulty=difficulty,
    )

    assert s5 >= s4 >= s3 >= initial_stability, (
        f"Expected q=5 >= q=4 >= q=3 >= initial, got s5={s5}, s4={s4}, s3={s3}, "
        f"init={initial_stability}, mult={stability_multiplier}, D={difficulty}"
    )
    # q=0 resets to initial, regardless of multiplier
    assert s0 == pytest.approx(initial_stability), (
        f"q=0 should reset to initial_stability={initial_stability}, "
        f"got s0={s0}, mult={stability_multiplier}, D={difficulty}"
    )
    # q>=3 is always >= q=0 (which resets to initial)
    assert s5 >= s0 and s4 >= s0 and s3 >= s0


@given(
    history=_good_history,
    initial_stability=_valid_init,
    stability_multiplier=_valid_mult,
    difficulty=_valid_diff,
)
@settings(max_examples=100)
def test_length_monotonicity(history, initial_stability, stability_multiplier, difficulty):
    """For all-good histories, longer history >= shorter prefix."""
    for length in range(1, len(history)):
        prefix = history[:length]
        shorter = predict_stability(
            prefix, initial_stability=initial_stability,
            stability_multiplier=stability_multiplier, difficulty=difficulty,
        )
        longer = predict_stability(
            history[:length + 1], initial_stability=initial_stability,
            stability_multiplier=stability_multiplier, difficulty=difficulty,
        )
        assert longer >= shorter, (
            f"Longer history ({length+1} reviews) gave LOWER stability "
            f"than shorter ({length}): {longer} < {shorter}, "
            f"history={history[:length+1]}, D={difficulty}"
        )


@given(
    history=lists(_qualities, min_size=1, max_size=10),
    initial_stability=_valid_init,
    stability_multiplier=_valid_mult,
    difficulty=_valid_diff,
)
@settings(max_examples=100)
def test_deterministic_invariant(history, initial_stability, stability_multiplier, difficulty):
    """Same inputs produce exactly same output (no randomness).

    Also verifies that repeated calls with the same args are stable.
    """
    s1 = predict_stability(
        history, initial_stability=initial_stability,
        stability_multiplier=stability_multiplier, difficulty=difficulty,
    )
    s2 = predict_stability(
        history, initial_stability=initial_stability,
        stability_multiplier=stability_multiplier, difficulty=difficulty,
    )
    assert s1 == s2


@given(
    history=lists(_qualities, min_size=1, max_size=10),
    difficulty=_valid_diff,
)
@settings(max_examples=100)
def test_stability_positive(history, difficulty):
    """predict_stability always returns positive finite values."""
    s = predict_stability(
        history, initial_stability=0.5, stability_multiplier=1.5,
        difficulty=difficulty,
    )
    assert s > 0.0
    assert s < float("inf")


@given(
    history=lists(_qualities, min_size=1, max_size=10),
    difficulty=_valid_diff,
)
@settings(max_examples=100)
def test_stability_integrates_with_retention(history, difficulty):
    """predict_stability output can be used in compute_retention and
    always yields a valid retention value."""
    stability = predict_stability(
        history, initial_stability=0.5, stability_multiplier=1.5,
        difficulty=difficulty,
    )
    retention = compute_retention(
        rep_count=len(history),
        lessons_since_review=1,
        initial_stability=stability,
        stability_multiplier=1.0,
    )
    assert 0.0 < retention <= 1.0
