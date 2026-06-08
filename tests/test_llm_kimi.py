import os

import pytest

from lessonos.llm import KimiAuthError, KimiProvider, LLMResponse, Router
from lessonos.llm.deepseek import (
    DEEPSEEK_PRICING,
    estimate_deepseek_cost,
)
from lessonos.llm.kimi import estimate_kimi_cost, KIMI_PRICING
from lessonos.llm.router import LLMProvider


def test_missing_key_raises_not_silent(monkeypatch) -> None:
    monkeypatch.delenv("KIMI_API_KEY", raising=False)
    with pytest.raises(KimiAuthError):
        KimiProvider()


def test_reads_key_from_env(monkeypatch) -> None:
    monkeypatch.setenv("KIMI_API_KEY", "env-secret")
    provider = KimiProvider()
    assert provider._api_key == "env-secret"


def test_explicit_key_overrides_env(monkeypatch) -> None:
    monkeypatch.setenv("KIMI_API_KEY", "env-secret")
    provider = KimiProvider(api_key="explicit")
    assert provider._api_key == "explicit"


def test_conforms_to_provider_protocol() -> None:
    provider = KimiProvider(api_key="fake")
    assert provider.name == "kimi"
    assert isinstance(provider, LLMProvider)


def test_registers_in_router() -> None:
    router = Router()
    router.register(KimiProvider(api_key="fake"))
    assert "kimi" in router._providers


@pytest.mark.skipif(
    not os.environ.get("KIMI_API_KEY"),
    reason="no KIMI_API_KEY: live Moonshot call skipped (wiring only)",
)
def test_live_completion() -> None:
    provider = KimiProvider()
    resp = provider.complete("Reply with exactly: ok")
    assert isinstance(resp, LLMResponse)
    assert resp.provider == "kimi"
    assert resp.text


# --- cost tracking ---


class TestEstimateKimiCost:
    """estimate_kimi_cost — USD cost from Moonshot usage dict."""

    def test_basic_calculation(self) -> None:
        """100K prompt + 10K completion at K2.5 rates."""
        usage = {"prompt_tokens": 100_000, "completion_tokens": 10_000}
        cost = estimate_kimi_cost(usage)
        # (100000 * 0.60 + 10000 * 3.00) / 1_000_000 = 0.06 + 0.03 = 0.09
        assert cost == pytest.approx(0.09, rel=1e-6)

    def test_no_usage_returns_zero(self) -> None:
        assert estimate_kimi_cost({}) == 0.0

    def test_missing_keys_return_zero(self) -> None:
        assert estimate_kimi_cost({"unknown_field": 100}) == 0.0

    def test_custom_rates(self) -> None:
        """K2.6 rates: input $0.95/M, output $4.00/M."""
        usage = {"prompt_tokens": 100_000, "completion_tokens": 10_000}
        cost = estimate_kimi_cost(usage, input_price=0.95, output_price=4.00)
        # (100000 * 0.95 + 10000 * 4.00) / 1_000_000 = 0.095 + 0.04 = 0.135
        assert cost == pytest.approx(0.135, rel=1e-6)

    def test_large_usage_rounding(self) -> None:
        """1M tokens of each at K2.5 rates = exactly $3.60."""
        usage = {"prompt_tokens": 1_000_000, "completion_tokens": 1_000_000}
        cost = estimate_kimi_cost(usage)
        assert cost == pytest.approx(3.60, rel=1e-6)


class TestKimiPricing:
    """KIMI_PRICING table covers known models."""

    def test_has_k2_5(self) -> None:
        assert "kimi-k2.5" in KIMI_PRICING

    def test_has_k2_6(self) -> None:
        assert "kimi-k2.6" in KIMI_PRICING

    def test_has_default_model(self) -> None:
        assert "kimi-k2-0905-preview" in KIMI_PRICING

    def test_prices_positive(self) -> None:
        for model, (inp, out) in KIMI_PRICING.items():
            assert inp > 0, f"{model}: input price must be > 0"
            assert out > 0, f"{model}: output price must be > 0"
            assert inp < out, f"{model}: output ({out}) must cost more than input ({inp})"


# --- DeepSeek agent cost estimation ---


class TestEstimateDeepSeekCost:
    """estimate_deepseek_cost — USD cost for DeepSeek brain iterations."""

    def test_defaults_estimate(self) -> None:
        """Default (1K input + 500 output) at cache-miss rates."""
        cost = estimate_deepseek_cost()
        # (1000 * 0.14 + 500 * 0.28) / 1_000_000 = 0.00014 + 0.00014 = 0.00028
        assert cost == pytest.approx(0.00028, rel=1e-6)

    def test_exact_counts(self) -> None:
        """10K input + 2K output at cache-miss rates."""
        cost = estimate_deepseek_cost(input_tokens=10_000, output_tokens=2_000)
        # (10000 * 0.14 + 2000 * 0.28) / 1_000_000 = 0.0014 + 0.00056 = 0.00196
        assert cost == pytest.approx(0.00196, rel=1e-6)

    def test_zero_tokens_zero_cost(self) -> None:
        assert estimate_deepseek_cost(input_tokens=0, output_tokens=0) == 0.0

    def test_negative_input_raises(self) -> None:
        with pytest.raises(ValueError):
            estimate_deepseek_cost(input_tokens=-1, output_tokens=500)

    def test_negative_output_raises(self) -> None:
        with pytest.raises(ValueError):
            estimate_deepseek_cost(input_tokens=100, output_tokens=-50)

    def test_custom_rates(self) -> None:
        """Custom per-model rates (e.g. deepseek-v4-pro)."""
        cost = estimate_deepseek_cost(
            input_tokens=10_000,
            output_tokens=2_000,
            input_price=0.435,
            output_price=0.87,
        )
        # (10000 * 0.435 + 2000 * 0.87) / 1_000_000 = 0.00435 + 0.00174 = 0.00609
        assert cost == pytest.approx(0.00609, rel=1e-6)

    def test_large_iteration(self) -> None:
        """Large iteration: 50K input + 10K output (heavy analysis)."""
        cost = estimate_deepseek_cost(input_tokens=50_000, output_tokens=10_000)
        # (50000 * 0.14 + 10000 * 0.28) / 1_000_000 = 0.007 + 0.0028 = 0.0098
        assert cost == pytest.approx(0.0098, rel=1e-6)


class TestDeepSeekPricing:
    """DEEPSEEK_PRICING table invariants."""

    def test_prices_positive_and_ordered(self) -> None:
        for model, (cache_miss, cache_hit, out) in DEEPSEEK_PRICING.items():
            assert cache_miss > 0, f"{model}: cache_miss must be > 0"
            assert cache_hit > 0, f"{model}: cache_hit must be > 0"
            assert out > 0, f"{model}: output must be > 0"
            # Cache hit should be cheaper than cache miss
            assert cache_hit < cache_miss, (
                f"{model}: cache_hit ({cache_hit}) must be cheaper than "
                f"cache_miss ({cache_miss})"
            )
            # Output is always more expensive than input (cache miss)
            assert out > cache_miss, (
                f"{model}: output ({out}) must cost more than input ({cache_miss})"
            )
