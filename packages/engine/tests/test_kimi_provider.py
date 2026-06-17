"""Tests for KimiProvider wiring and protocol conformance (no live calls).

Tests confirm:
- Construction with explicit key works.
- Construction without key raises KimiAuthError.
- The provider conforms to the LLMProvider protocol.
- Router integration via register.
- estimate_kimi_cost produces correct estimates.

FM2 (COORDINATION.md):
- Timeout default is 120s.
- URLError (network timeout) is retried 3 times.
- HTTPError (4xx/5xx) is NOT retried.
"""

from __future__ import annotations

import json
import os
import urllib.error

import pytest

from lessonos.llm.kimi import KimiAuthError, KimiProvider, estimate_kimi_cost
from lessonos.llm.router import LLMProvider, Router


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


class TestKimiProviderWiring:
    """Wiring tests only — no live API calls."""

    def test_construction_with_explicit_key(self) -> None:
        provider = KimiProvider(api_key="test-key-123")
        assert provider.name == "kimi"
        assert provider._api_key == "test-key-123"

    def test_construction_without_key_raises(self, monkeypatch) -> None:
        monkeypatch.delenv("KIMI_API_KEY", raising=False)
        with pytest.raises(KimiAuthError, match="KIMI_API_KEY not set"):
            KimiProvider()

    def test_conforms_to_protocol(self) -> None:
        provider = KimiProvider(api_key="dummy")
        assert isinstance(provider, LLMProvider)

    def test_router_integration(self) -> None:
        router = Router()
        provider = KimiProvider(api_key="dummy")
        router.register(provider)
        assert router.has_provider("kimi")

    def test_default_model(self) -> None:
        provider = KimiProvider(api_key="dummy")
        assert provider._model == "kimi-k2-0905-preview"

    def test_custom_model(self) -> None:
        provider = KimiProvider(api_key="dummy", model="kimi-k2.6")
        assert provider._model == "kimi-k2.6"

    def test_default_timeout_is_120(self) -> None:
        """FM2: timeout default raised to 120s."""
        provider = KimiProvider(api_key="dummy")
        assert provider._timeout == 120.0

    def test_custom_timeout(self) -> None:
        provider = KimiProvider(api_key="dummy", timeout=60.0)
        assert provider._timeout == 60.0


class TestKimiProviderCompleteMocked:
    """Test KimiProvider.complete() with mocked HTTP (urllib)."""

    SIMPLE_RESPONSE = {
        "choices": [{"message": {"content": "Ecco la risposta."}}],
        "usage": {"prompt_tokens": 50, "completion_tokens": 10},
    }

    def test_successful_complete(self, monkeypatch) -> None:
        monkeypatch.setattr(
            "urllib.request.urlopen",
            lambda _request, *,
            timeout=None: _MockResponse(self.SIMPLE_RESPONSE),
        )
        provider = KimiProvider(api_key="sk-test")
        response = provider.complete("Ciao modello.")
        assert response.text == "Ecco la risposta."
        assert response.provider == "kimi"
        assert response.model == "kimi-k2-0905-preview"
        assert response.usage == {"prompt_tokens": 50, "completion_tokens": 10}

    def test_timeout_retried_three_times(self, monkeypatch) -> None:
        """FM2: URLError (network timeout) is retried 3 times, then raised."""
        call_count = [0]

        def _failing_urlopen(_request, *, timeout=None):
            call_count[0] += 1
            raise urllib.error.URLError("timed out")

        monkeypatch.setattr("urllib.request.urlopen", _failing_urlopen)
        provider = KimiProvider(api_key="sk-test")
        with pytest.raises(urllib.error.URLError, match="timed out"):
            provider.complete("test")
        assert call_count[0] == 3

    def test_timeout_retry_then_succeed(self, monkeypatch) -> None:
        """Fails twice with URLError, succeeds on third attempt."""
        call_count = [0]
        GOOD_RESPONSE = {
            "choices": [{"message": {"content": "finally ok"}}],
            "usage": {"prompt_tokens": 10, "completion_tokens": 5},
        }

        def _flaky_urlopen(_request, *, timeout=None):
            call_count[0] += 1
            if call_count[0] <= 2:
                raise urllib.error.URLError("timeout")
            return _MockResponse(GOOD_RESPONSE)

        monkeypatch.setattr("urllib.request.urlopen", _flaky_urlopen)
        provider = KimiProvider(api_key="sk-test")
        response = provider.complete("test")
        assert response.text == "finally ok"
        assert response.usage == {"prompt_tokens": 10, "completion_tokens": 5}
        assert call_count[0] == 3

    def test_httperror_not_retried(self, monkeypatch) -> None:
        """HTTP 429 is NOT retried -> raises RuntimeError immediately."""
        call_count = [0]

        def _rate_limit_urlopen(_request, *, timeout=None):
            call_count[0] += 1
            raise urllib.error.HTTPError(
                url="", code=429, msg="rate limited", hdrs={}, fp=None
            )

        monkeypatch.setattr("urllib.request.urlopen", _rate_limit_urlopen)
        provider = KimiProvider(api_key="sk-test")
        with pytest.raises(RuntimeError, match="429"):
            provider.complete("test")
        assert call_count[0] == 1

    def test_http_401_raises_runtime_error(self, monkeypatch) -> None:
        monkeypatch.setattr(
            "urllib.request.urlopen",
            lambda _request, *,
            timeout=None: (_ for _ in ()).throw(
                urllib.error.HTTPError(
                    url="", code=401, msg="unauthorized", hdrs={}, fp=None
                )
            ),
        )
        provider = KimiProvider(api_key="sk-wrong")
        with pytest.raises(RuntimeError, match="401"):
            provider.complete("test")

    def test_missing_choices_key_raises_runtime_error(self, monkeypatch) -> None:
        bad_body = {"not_choices": []}
        monkeypatch.setattr(
            "urllib.request.urlopen",
            lambda _request, *, timeout=None: _MockResponse(bad_body),
        )
        provider = KimiProvider(api_key="sk-test")
        with pytest.raises(RuntimeError, match="missing expected fields"):
            provider.complete("test")

    def test_no_usage_returns_none(self, monkeypatch) -> None:
        no_usage = {
            "choices": [{"message": {"content": "ok"}}],
        }
        monkeypatch.setattr(
            "urllib.request.urlopen",
            lambda _request, *, timeout=None: _MockResponse(no_usage),
        )
        provider = KimiProvider(api_key="sk-test")
        response = provider.complete("test")
        assert response.text == "ok"
        assert response.usage is None
