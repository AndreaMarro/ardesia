import pytest

from lessonos.llm import LLMResponse, MockProvider, Router


def _router() -> Router:
    router = Router()
    router.register(MockProvider({"ping": "pong"}))
    return router


def test_router_returns_fixture() -> None:
    router = _router()
    resp = router.complete("ping", provider="mock")
    assert isinstance(resp, LLMResponse)
    assert resp.text == "pong"
    assert resp.provider == "mock"
    assert resp.model == "mock-1"


def test_router_is_deterministic() -> None:
    router = _router()
    first = router.complete("ping", provider="mock")
    second = router.complete("ping", provider="mock")
    assert first == second


def test_model_override_is_recorded() -> None:
    router = _router()
    resp = router.complete("ping", provider="mock", model="mock-xl")
    assert resp.model == "mock-xl"
    assert resp.text == "pong"


def test_unknown_prompt_raises_not_fabricates() -> None:
    router = _router()
    with pytest.raises(KeyError):
        router.complete("unknown", provider="mock")


def test_unknown_provider_raises() -> None:
    router = _router()
    with pytest.raises(KeyError):
        router.complete("ping", provider="kimi")
