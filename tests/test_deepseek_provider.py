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

import json
import os
import tempfile
import urllib.error

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


# ---------------------------------------------------------------------------
# Mocked HTTP tests for DeepSeekProvider.complete()
# ---------------------------------------------------------------------------


class _MockResponse:
    """Minimal mock for urllib.request.urlopen return value."""

    def __init__(self, json_body: dict) -> None:
        self._body = json.dumps(json_body).encode("utf-8")

    def read(self) -> bytes:
        return self._body

    def __enter__(self) -> _MockResponse:
        return self

    def __exit__(self, *args) -> None:
        pass


def _make_mock_urlopen(json_body: dict, status: int = 200):
    """Factory: returns a callable that replaces urlopen for one call.

    When status >= 400, raises HTTPError so the provider's error-handling
    branch is exercised.
    """

    def _mock_urlopen(request, *, timeout=None):
        if status >= 400:
            raise urllib.error.HTTPError(
                url=request.full_url or "",
                code=status,
                msg="mocked error",
                hdrs={},
                fp=None,
            )
        return _MockResponse(json_body)

    return _mock_urlopen


class TestDeepSeekProviderCompleteMocked:
    """Test DeepSeekProvider.complete() with mocked HTTP (urllib).

    No live API calls — all responses are synthetic.

    DeepSeek API contract (v1/chat/completions):
    - Auth: Bearer token in Authorization header
    - Request: POST /chat/completions with {model, messages}
    - Success response: {"choices": [{"message": {"content": str}}], "usage": dict | None}
    - Error: HTTPError on 4xx/5xx with error body
    """

    SIMPLE_RESPONSE = {
        "choices": [{"message": {"content": "Ecco la risposta."}}],
        "usage": {"prompt_tokens": 50, "completion_tokens": 10},
    }

    def test_successful_complete(self, monkeypatch) -> None:
        """Normal response returns LLMResponse with correct fields."""
        monkeypatch.setattr(
            "urllib.request.urlopen",
            _make_mock_urlopen(self.SIMPLE_RESPONSE),
        )
        provider = DeepSeekProvider(api_key="sk-test")
        response = provider.complete("Ciao modello.")
        assert response.text == "Ecco la risposta."
        assert response.provider == "deepseek"
        assert response.model == "deepseek-chat"
        assert response.usage == {"prompt_tokens": 50, "completion_tokens": 10}

    def test_complete_with_custom_model(self, monkeypatch) -> None:
        """Custom model is passed through to the response."""
        monkeypatch.setattr(
            "urllib.request.urlopen",
            _make_mock_urlopen(self.SIMPLE_RESPONSE),
        )
        provider = DeepSeekProvider(api_key="sk-test", model="deepseek-reasoner")
        response = provider.complete("Ragiona.")
        assert response.model == "deepseek-reasoner"

    def test_complete_override_model(self, monkeypatch) -> None:
        """Per-call model override works."""
        monkeypatch.setattr(
            "urllib.request.urlopen",
            _make_mock_urlopen(self.SIMPLE_RESPONSE),
        )
        provider = DeepSeekProvider(api_key="sk-test")
        response = provider.complete("Ciao.", model="deepseek-reasoner")
        assert response.model == "deepseek-reasoner"

    def test_http_401_raises_runtime_error(self, monkeypatch) -> None:
        """HTTP 401 (unauthorized) raises RuntimeError with message."""
        monkeypatch.setattr(
            "urllib.request.urlopen",
            _make_mock_urlopen({}, status=401),
        )
        provider = DeepSeekProvider(api_key="sk-wrong")
        with pytest.raises(RuntimeError, match="401"):
            provider.complete("test")

    def test_missing_choices_key_raises_runtime_error(self, monkeypatch) -> None:
        """Malformed response (no 'choices' key) raises RuntimeError."""
        bad_body = {"not_choices": []}
        monkeypatch.setattr(
            "urllib.request.urlopen",
            _make_mock_urlopen(bad_body),
        )
        provider = DeepSeekProvider(api_key="sk-test")
        with pytest.raises(RuntimeError, match="missing expected fields"):
            provider.complete("test")

    def test_empty_choices_raises_runtime_error(self, monkeypatch) -> None:
        """Empty choices list raises RuntimeError."""
        bad_body = {"choices": [], "usage": {}}
        monkeypatch.setattr(
            "urllib.request.urlopen",
            _make_mock_urlopen(bad_body),
        )
        provider = DeepSeekProvider(api_key="sk-test")
        with pytest.raises(RuntimeError, match="missing expected fields"):
            provider.complete("test")

    def test_no_usage_returns_none(self, monkeypatch) -> None:
        """Response without usage dict returns usage=None."""
        no_usage = {
            "choices": [{"message": {"content": "ok"}}],
        }
        monkeypatch.setattr(
            "urllib.request.urlopen",
            _make_mock_urlopen(no_usage),
        )
        provider = DeepSeekProvider(api_key="sk-test")
        response = provider.complete("test")
        assert response.text == "ok"
        assert response.usage is None

    def test_router_integration_via_complete(self, monkeypatch) -> None:
        """Router dispatches to DeepSeekProvider.complete() correctly."""
        monkeypatch.setattr(
            "urllib.request.urlopen",
            _make_mock_urlopen(self.SIMPLE_RESPONSE),
        )
        router = Router()
        provider = DeepSeekProvider(api_key="sk-test")
        router.register(provider)
        response = router.complete("Ciao.", provider="deepseek")
        assert response.text == "Ecco la risposta."
        assert response.provider == "deepseek"
        assert response.usage == {"prompt_tokens": 50, "completion_tokens": 10}

    def test_http_500_raised_as_runtime_error(self, monkeypatch) -> None:
        """HTTP 500 (server error) raises RuntimeError."""
        monkeypatch.setattr(
            "urllib.request.urlopen",
            _make_mock_urlopen({}, status=500),
        )
        provider = DeepSeekProvider(api_key="sk-test")
        with pytest.raises(RuntimeError, match="500"):
            provider.complete("test")
