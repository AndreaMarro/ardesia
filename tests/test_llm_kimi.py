import os

import pytest

from lessonos.llm import KimiAuthError, KimiProvider, LLMResponse, Router
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
