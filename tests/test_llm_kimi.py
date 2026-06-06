import os

import pytest

from lessonos.llm import KimiAuthError, KimiProvider, LLMResponse, Router
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
