"""Test TaskPolicy: routing policy dataclass + route_for_task (P1, PLAN §12)."""

from __future__ import annotations

import pytest

from lessonos.llm.router import MockProvider, Router
from lessonos.llm.task_policy import TaskPolicy, route_for_task


class TestTaskPolicyConstruction:
    """TaskPolicy frozen dataclass construction and defaults."""

    def test_minimal_policy_has_sensible_defaults(self) -> None:
        """A minimal TaskPolicy has False/None defaults for optional fields."""
        p = TaskPolicy(name="extraction", primary="kimi")
        # Verify that optional constraints are disabled by default
        assert p.require_json is False
        assert p.require_citations is False
        assert p.max_cost_usd is None
        assert p.fallback is None
        assert p.preferred_model is None
        assert p.fallback_model is None
        # With require_json=False, validation should pass even for a plain provider
        router = Router()

        class KimiProviderStub:
            name = "kimi"

            def complete(self, prompt, *, model=None):
                from lessonos.llm.router import LLMResponse
                return LLMResponse(text="", provider="kimi", model=model or "kimi-model")

        router.register(KimiProviderStub())  # type: ignore[arg-type]
        p.validate(router)  # should not raise — require_json=False

    def test_require_json_default_rejected(self) -> None:
        """A policy with require_json=True but default 'mock' model fails validation."""
        router = Router()
        router.register(MockProvider({}))
        p = TaskPolicy(
            name="json_task",
            primary="mock",
            require_json=True,
        )
        with pytest.raises(ValueError, match="not in JSON-capable"):
            p.validate(router)

    def test_require_json_ok_with_explicit_preferred_model(self) -> None:
        """require_json=True passes if preferred_model is JSON-capable."""
        router = Router()
        router.register(MockProvider({}, model="kimi-k2.6"))
        p = TaskPolicy(
            name="segmentation",
            primary="mock",
            require_json=True,
            preferred_model="kimi-k2.6",
        )
        p.validate(router)  # Should not raise

    def test_json_capable_override(self) -> None:
        """Custom json_capable_models allows specifying models not in global list."""
        router = Router()
        router.register(MockProvider({}))
        p = TaskPolicy(
            name="custom_json",
            primary="mock",
            require_json=True,
            preferred_model="mock-1",
            json_capable_models=("mock-1",),
        )
        p.validate(router)  # Should not raise — "mock-1" is in the custom list


class TestTaskPolicyValidation:
    """TaskPolicy.validate() checks provider registration + JSON capability."""

    def test_primary_not_registered(self) -> None:
        """validate() raises if primary provider is not registered."""
        router = Router()
        p = TaskPolicy(name="bad", primary="nonexistent")
        with pytest.raises(KeyError, match="not registered"):
            p.validate(router)

    def test_fallback_not_registered(self) -> None:
        """validate() raises if fallback provider is not registered."""
        router = Router()
        router.register(MockProvider({}))
        p = TaskPolicy(name="bad_fallback", primary="mock", fallback="imaginary")
        with pytest.raises(KeyError, match="not registered"):
            p.validate(router)


class TestRouteForTask:
    """route_for_task resolves provider name from policy + router."""

    def test_returns_primary(self) -> None:
        """Default returns primary provider."""
        router = Router()
        router.register(MockProvider({}))
        p = TaskPolicy(name="t", primary="mock")
        provider = route_for_task(p, router)
        assert provider == "mock"

    def test_returns_fallback_when_preferred(self) -> None:
        """prefer_fallback=True returns fallback provider."""
        router = Router()

        class KimiMock:
            name = "kimi"

            def complete(self, prompt, *, model=None):
                from lessonos.llm.router import LLMResponse
                return LLMResponse(text="", provider="kimi", model=model or "kimi-model")

        router.register(MockProvider({}))
        router.register(KimiMock())  # type: ignore[arg-type]
        p = TaskPolicy(name="t", primary="mock", fallback="kimi")
        provider = route_for_task(p, router, prefer_fallback=True)
        assert provider == "kimi"

    def test_prefer_fallback_without_fallback(self) -> None:
        """prefer_fallback=True but no fallback set — still returns primary."""
        router = Router()
        router.register(MockProvider({}))
        p = TaskPolicy(name="t", primary="mock")
        provider = route_for_task(p, router, prefer_fallback=True)
        assert provider == "mock"

    def test_unregistered_provider_raises(self) -> None:
        """route_for_task raises KeyError if provider not registered."""
        router = Router()
        p = TaskPolicy(name="bad", primary="ghost")
        with pytest.raises(KeyError, match="not registered"):
            route_for_task(p, router)

    def test_unregistered_fallback_raises(self) -> None:
        """route_for_task raises KeyError if fallback not registered."""
        router = Router()
        router.register(MockProvider({}))
        p = TaskPolicy(name="bad", primary="mock", fallback="ghost")
        with pytest.raises(KeyError, match="not registered"):
            route_for_task(p, router)

    def test_require_json_fails_on_plain_mock(self) -> None:
        """route_for_task raises ValueError if require_json but model not capable."""
        router = Router()
        router.register(MockProvider({}))  # model="mock-1" by default
        p = TaskPolicy(name="json_task", primary="mock", require_json=True)
        with pytest.raises(ValueError, match="not in JSON-capable"):
            route_for_task(p, router)

    def test_routing_with_json_capable_mock(self) -> None:
        """route_for_task works with JSON-capable model."""
        router = Router()
        router.register(MockProvider({}, model="deepseek-v4-flash"))
        p = TaskPolicy(
            name="json_ok",
            primary="mock",
            require_json=True,
            preferred_model="deepseek-v4-flash",
        )
        provider = route_for_task(p, router)
        assert provider == "mock"
