"""Tests for DeepSeekProvider wiring and protocol conformance (no live calls).

Tests confirm:
- Construction with explicit key works.
- Construction without key raises ``DeepSeekAuthError``.
- The provider conforms to the ``LLMProvider`` protocol (``complete`` method).
- Router integration via ``register``.
- ``estimate_deepseek_cost`` produces correct estimates.
- ``_parse_env_file`` parses a minimal .env-like file.

Live API calls are NOT tested here (use the realtime eval for that).
"""

from __future__ import annotations

import os
import tempfile

import pytest

from lessonos.llm.deepseek import (
    DEEPSEEK_API_PRICING,
    DeepSeekAuthError,
    DeepSeekProvider,
    _parse_env_file,
    estimate_deepseek_api_cost,
    estimate_deepseek_cost,
)
from lessonos.llm.router import LLMProvider, Router


class TestDeepSeekProviderWiring:
    """Wiring tests only — no live API calls."""

    def test_construction_with_explicit_key(self) -> None:
        provider = DeepSeekProvider(api_key="test-key-123")
        assert provider.name == "deepseek"
        assert provider._api_key == "test-key-123"

    def test_construction_without_key_raises(self, monkeypatch) -> None:
        """Must raise when no key is available anywhere.

        We unset the env var AND chdir to an empty temp dir so the .env
        file in the project root is not found.
        """
        monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)
        with tempfile.TemporaryDirectory() as tmpdir:
            old_cwd = os.getcwd()
            try:
                os.chdir(tmpdir)
                with pytest.raises(DeepSeekAuthError, match="DEEPSEEK_API_KEY not set"):
                    DeepSeekProvider()
            finally:
                os.chdir(old_cwd)

    def test_conforms_to_protocol(self) -> None:
        provider = DeepSeekProvider(api_key="dummy")
        assert isinstance(provider, LLMProvider)

    def test_router_integration(self) -> None:
        router = Router()
        provider = DeepSeekProvider(api_key="dummy")
        router.register(provider)
        assert router.has_provider("deepseek")

    def test_default_model(self) -> None:
        provider = DeepSeekProvider(api_key="dummy")
        assert provider._model == "deepseek-chat"

    def test_custom_model(self) -> None:
        provider = DeepSeekProvider(api_key="dummy", model="deepseek-reasoner")
        assert provider._model == "deepseek-reasoner"


class TestEstimateDeepSeekAPICost:
    """Test the API product cost estimator (usage-dict-based)."""

    def test_basic_estimate(self) -> None:
        usage = {"prompt_tokens": 100_000, "completion_tokens": 10_000}
        cost = estimate_deepseek_api_cost(usage)
        # (100000*0.14 + 10000*0.28) / 1_000_000 = (14000 + 2800) / 1_000_000 = 0.0168
        assert cost == pytest.approx(0.0168, rel=1e-6)

    def test_reasoner_pricing(self) -> None:
        usage = {"prompt_tokens": 100_000, "completion_tokens": 10_000}
        cost = estimate_deepseek_api_cost(usage, model="deepseek-reasoner")
        # (100000*0.55 + 10000*2.19) / 1_000_000 = (55000 + 21900) / 1_000_000 = 0.0769
        assert cost == pytest.approx(0.0769, rel=1e-6)

    def test_empty_usage(self) -> None:
        assert estimate_deepseek_api_cost({}) == 0.0

    def test_zero_tokens(self) -> None:
        usage = {"prompt_tokens": 0, "completion_tokens": 0}
        assert estimate_deepseek_api_cost(usage) == 0.0

    def test_large_usage(self) -> None:
        usage = {"prompt_tokens": 1_000_000, "completion_tokens": 1_000_000}
        cost = estimate_deepseek_api_cost(usage)
        # (1_000_000*0.14 + 1_000_000*0.28) / 1_000_000 = 0.14 + 0.28 = 0.42
        assert cost == pytest.approx(0.42, rel=1e-6)

    def test_api_pricing_table_known_models(self) -> None:
        assert "deepseek-chat" in DEEPSEEK_API_PRICING
        assert "deepseek-reasoner" in DEEPSEEK_API_PRICING

    def test_api_pricing_table_positive(self) -> None:
        for model, (inp, out) in DEEPSEEK_API_PRICING.items():
            assert inp > 0, f"{model} input price must be > 0"
            assert out > 0, f"{model} output price must be > 0"


class TestParseEnvFile:
    """Test the minimal .env parser."""

    def test_basic_key_value(self) -> None:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".env", delete=False
        ) as f:
            f.write("DEEPSEEK_API_KEY=sk-test-123\n")
            f.write("KIMI_API_KEY=sk-kimi-abc\n")
            path = f.name
        try:
            result = _parse_env_file(path)
            assert result["DEEPSEEK_API_KEY"] == "sk-test-123"
            assert result["KIMI_API_KEY"] == "sk-kimi-abc"
        finally:
            os.unlink(path)

    def test_ignores_comments_and_blanks(self) -> None:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".env", delete=False
        ) as f:
            f.write("# this is a comment\n")
            f.write("\n")
            f.write("KEY=value\n")
            f.write("   \n")
            f.write("OTHER=val2\n")
            path = f.name
        try:
            result = _parse_env_file(path)
            assert result == {"KEY": "value", "OTHER": "val2"}
        finally:
            os.unlink(path)

    def test_quoted_value(self) -> None:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".env", delete=False
        ) as f:
            f.write('API_KEY="sk-test-quoted"\n')
            path = f.name
        try:
            result = _parse_env_file(path)
            assert result["API_KEY"] == "sk-test-quoted"
        finally:
            os.unlink(path)

    def test_trailing_whitespace(self) -> None:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".env", delete=False
        ) as f:
            f.write("   KEY = value   \n")
            path = f.name
        try:
            result = _parse_env_file(path)
            assert result["KEY"] == "value"
        finally:
            os.unlink(path)

    def test_file_not_found(self) -> None:
        result = _parse_env_file("/nonexistent/.env")
        assert result == {}
