"""Tests for predict_stability — FSRS-style stability prediction from review quality history."""

import pytest


# --- Basic stability computation ---


def test_single_good_review():
    """A single good review (q=4) produces default stability."""
    from lessonos.graph.path_memory import predict_stability

    # q=4 with D=5.0 (neutral): effective_mult = 1 + (1.5-1) * 0.8 * 1.0 = 1.4
    # stability = 0.5 * 1.4 = 0.7
    s = predict_stability([4], initial_stability=0.5, stability_multiplier=1.5)
    assert s == pytest.approx(0.7)


def test_two_good_reviews():
    """Two good reviews produce stability growth."""
    from lessonos.graph.path_memory import predict_stability

    s = predict_stability([4, 5], initial_stability=0.5, stability_multiplier=1.5)
    # q=4: 0.5 * 1.4 = 0.7; q=5: 0.7 * 1.5 = 1.05
    assert s == pytest.approx(1.05)


def test_three_good_reviews_multiplicative_growth():
    """Three good reviews show multiplicative stability growth (exponential in rep_count)."""
    from lessonos.graph.path_memory import predict_stability

    s = predict_stability([4, 4, 5], initial_stability=0.5, stability_multiplier=2.0)
    # q=4: 0.5 * (1+(2-1)*0.8*1) = 0.5 * 1.8 = 0.9
    # q=4: 0.9 * 1.8 = 1.62
    # q=5: 1.62 * (1+(2-1)*1.0*1) = 1.62 * 2.0 = 3.24
    assert s == pytest.approx(3.24)


# --- Quality-weighting: better reviews → higher stability ---


def test_higher_quality_gives_higher_stability():
    """All-good reviews produce higher stability than mixed reviews."""
    from lessonos.graph.path_memory import predict_stability

    all_good = predict_stability(
        [5, 5, 5], initial_stability=0.5, stability_multiplier=1.5
    )
    mixed = predict_stability(
        [3, 3, 5], initial_stability=0.5, stability_multiplier=1.5
    )
    assert all_good > mixed


def test_poor_reviews_reset_stability():
    """Poor reviews (q=0,1,2) reset to initial_stability (no growth from failures)."""
    from lessonos.graph.path_memory import predict_stability

    # q=0: reset to 0.5. No growth even after sequence of failures.
    s = predict_stability([0, 0, 0], initial_stability=0.5, stability_multiplier=1.5)
    assert s == pytest.approx(0.5)

    # Good-then-fail: good growth then reset
    good_then_fail = predict_stability([5, 0], initial_stability=0.5, stability_multiplier=1.5)
    # After q=5: 0.5 * 1.5 = 0.75; after q=0: reset to 0.5
    assert good_then_fail == pytest.approx(0.5)


# --- Edge cases ---


def test_empty_history_raises_valueerror():
    """Empty review history raises ValueError."""
    from lessonos.graph.path_memory import predict_stability

    with pytest.raises(ValueError, match="review_history must not be empty"):
        predict_stability([], initial_stability=0.5)


def test_single_zero_quality():
    """Single worst-possible review (q=0) resets stability to initial."""
    from lessonos.graph.path_memory import predict_stability

    # q=0: reset to initial_stability (concept not retained)
    s = predict_stability([0], initial_stability=0.5, stability_multiplier=1.5)
    assert s == pytest.approx(0.5)  # reset to initial stability


def test_max_quality_five():
    """Quality 5 (perfect) should be handled and produce positive stability."""
    from lessonos.graph.path_memory import predict_stability

    s = predict_stability([5], initial_stability=0.5, stability_multiplier=1.5)
    assert s > 0.0


def test_multiplier_below_one_raises_valueerror():
    """stability_multiplier < 1.0 causes stability decay on good reviews (bug found
    via Hypothesis property testing)."""
    from lessonos.graph.path_memory import predict_stability, compute_retention

    with pytest.raises(ValueError, match="stability_multiplier must be >= 1.0"):
        predict_stability([5], stability_multiplier=0.5)

    with pytest.raises(ValueError, match="stability_multiplier must be >= 1.0"):
        compute_retention(rep_count=1, lessons_since_review=1, stability_multiplier=0.5)

    # Edge: exactly 1.0 should work
    s = predict_stability([5], stability_multiplier=1.0)
    assert s > 0.0


def test_varied_history_lengths():
    """Different history lengths produce different stability."""
    from lessonos.graph.path_memory import predict_stability

    s1 = predict_stability([4], initial_stability=0.5, stability_multiplier=1.5)
    s2 = predict_stability([4, 4], initial_stability=0.5, stability_multiplier=1.5)
    s3 = predict_stability([4, 4, 4, 4], initial_stability=0.5, stability_multiplier=1.5)

    assert s1 < s2 < s3  # More reviews = higher stability


# --- Determinism ---


def test_deterministic():
    """Same inputs produce same output (no randomness)."""
    from lessonos.graph.path_memory import predict_stability

    s1 = predict_stability([4, 5, 3], initial_stability=0.5, stability_multiplier=1.5)
    s2 = predict_stability([4, 5, 3], initial_stability=0.5, stability_multiplier=1.5)
    assert s1 == s2


# --- Integration: predict_stability + compute_retention ---


def test_predict_stability_integrates_with_compute_retention():
    """predict_stability output can be used as stability input to compute_retention."""
    from lessonos.graph.path_memory import predict_stability, compute_retention

    history = [4, 5, 4]
    stability = predict_stability(history, initial_stability=0.5, stability_multiplier=1.5)

    # Use the predicted stability as initial_stability in compute_retention
    retention = compute_retention(
        rep_count=len(history),
        lessons_since_review=1,
        initial_stability=stability,
        stability_multiplier=1.0,  # No further growth from rep_count
    )

    assert 0.0 < retention <= 1.0
