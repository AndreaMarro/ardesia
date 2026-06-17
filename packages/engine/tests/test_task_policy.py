"""Tests for LLM TaskPolicy routing (P1 router prodotto multi-provider).

TaskPolicy sits *above* the Router: it decides *which* provider to use
for each product-level task (extraction, segmentation, etc.), while the
Router dispatches to a named provider.

See lessonos/llm/task_policy.py for the implementation.
"""

from __future__ import annotations

import pytest

from lessonos.llm.router import MockProvider, Router
from lessonos.llm.task_policy import TaskPolicy, route_for_task


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _router_with(*providers: str) -> Router:
    """Create a Router with one MockProvider per given name."""
    r = Router()
    for name in providers:
        r.register(MockProvider({}, model=f"mock-{name}", name=name))
    return r


# ---------------------------------------------------------------------------
# TaskPolicy.validate — provider registration
# ---------------------------------------------------------------------------

class TestValidateRegistration:
    def test_primary_registered(self) -> None:
        """validate() passes when primary is registered."""
        router = _router_with("mock", "deepseek")
        policy = TaskPolicy(name="extraction", primary="deepseek")
        policy.validate(router)  # no error

    def test_primary_not_registered(self) -> None:
        """validate() raises KeyError when primary is missing."""
        router = _router_with("mock")
        policy = TaskPolicy(name="extraction", primary="deepseek")
        with pytest.raises(KeyError, match="deepseek.*not registered"):
            policy.validate(router)

    def test_fallback_registered(self) -> None:
        """validate() passes when both primary and fallback are registered."""
        router = _router_with("deepseek", "kimi")
        policy = TaskPolicy(name="segmentation", primary="deepseek", fallback="kimi")
        policy.validate(router)  # no error

    def test_fallback_not_registered(self) -> None:
        """validate() raises KeyError when fallback is missing but specified."""
        router = _router_with("deepseek")
        policy = TaskPolicy(name="segmentation", primary="deepseek", fallback="kimi")
        with pytest.raises(KeyError, match="kimi.*not registered"):
            policy.validate(router)

    def test_fallback_none_does_not_require_registration(self) -> None:
        """validate() passes when fallback is None and only primary exists."""
        router = _router_with("mock")
        policy = TaskPolicy(name="test", primary="mock")
        policy.validate(router)  # no error


# ---------------------------------------------------------------------------
# TaskPolicy.validate — require_json
# ---------------------------------------------------------------------------

class TestRequireJson:
    def test_json_capable_model_passes(self) -> None:
        """require_json=True with a JSON-capable model passes."""
        router = _router_with("deepseek")
        policy = TaskPolicy(
            name="extraction",
            primary="deepseek",
            require_json=True,
            preferred_model="deepseek-v4-flash",
        )
        policy.validate(router)  # no error

    def test_json_incapable_model_raises(self) -> None:
        """require_json=True with a model NOT in the capable list raises ValueError."""
        router = _router_with("mock")
        policy = TaskPolicy(
            name="extraction",
            primary="mock",
            require_json=True,
            preferred_model="mock-1",
        )
        with pytest.raises(ValueError, match="require_json.*not in JSON-capable"):
            policy.validate(router)

    def test_json_uses_override_list(self) -> None:
        """json_capable_models override allows custom models to pass."""
        router = _router_with("custom")
        policy = TaskPolicy(
            name="custom-task",
            primary="custom",
            require_json=True,
            preferred_model="custom-json-v1",
            json_capable_models=("custom-json-v1",),
        )
        policy.validate(router)  # no error — override includes the model

    def test_json_defaults_to_global_list(self) -> None:
        """Without json_capable_models, uses _JSON_CAPABLE_MODELS global."""
        router = _router_with("deepseek")
        policy = TaskPolicy(
            name="extraction",
            primary="deepseek",
            require_json=True,
        )
        # preferred_model is None, so route_for_task falls back to primary name
        # "deepseek" is NOT in _JSON_CAPABLE_MODELS (those are "deepseek-v4-flash" etc.)
        with pytest.raises(ValueError, match="require_json"):
            policy.validate(router)


# ---------------------------------------------------------------------------
# route_for_task — provider resolution
# ---------------------------------------------------------------------------

class TestRouteForTask:
    def test_routes_to_primary_by_default(self) -> None:
        """route_for_task returns primary provider name by default."""
        router = _router_with("deepseek")
        policy = TaskPolicy(name="extraction", primary="deepseek")
        assert route_for_task(policy, router) == "deepseek"

    def test_routes_to_fallback_when_preferred(self) -> None:
        """route_for_task returns fallback when prefer_fallback=True."""
        router = _router_with("deepseek", "kimi")
        policy = TaskPolicy(name="extraction", primary="deepseek", fallback="kimi")
        assert route_for_task(policy, router, prefer_fallback=True) == "kimi"

    def test_prefer_fallback_no_fallback_returns_primary(self) -> None:
        """When prefer_fallback=True but no fallback, returns primary."""
        router = _router_with("mock")
        policy = TaskPolicy(name="test", primary="mock")
        assert route_for_task(policy, router, prefer_fallback=True) == "mock"

    def test_route_validates_before_returning(self) -> None:
        """route_for_task raises if primary not registered (validation runs first)."""
        router = _router_with("kimi")
        policy = TaskPolicy(name="extraction", primary="deepseek")
        with pytest.raises(KeyError, match="deepseek"):
            route_for_task(policy, router)

    def test_route_with_model_hints(self) -> None:
        """Model hints are carried through but do not affect the provider name."""
        router = _router_with("deepseek")
        policy = TaskPolicy(
            name="extraction",
            primary="deepseek",
            preferred_model="deepseek-chat",
        )
        assert route_for_task(policy, router) == "deepseek"

    def test_route_fallback_with_model_hint(self) -> None:
        """Fallback model hint works alongside fallback provider."""
        router = _router_with("deepseek", "kimi")
        policy = TaskPolicy(
            name="segmentation",
            primary="deepseek",
            fallback="kimi",
            fallback_model="kimi-k2.6",
        )
        assert route_for_task(policy, router, prefer_fallback=True) == "kimi"

    def test_route_with_max_cost(self) -> None:
        """max_cost_usd is validated as a field but enforcement is caller-side."""
        router = _router_with("mock")
        policy = TaskPolicy(name="cheap", primary="mock", max_cost_usd=0.01)
        # route-time should not reject based on cost alone
        assert route_for_task(policy, router) == "mock"

    def test_route_with_require_citations(self) -> None:
        """require_citations is a hint, does not block routing."""
        router = _router_with("deepseek")
        policy = TaskPolicy(name="extraction", primary="deepseek", require_citations=True)
        assert route_for_task(policy, router) == "deepseek"


# ---------------------------------------------------------------------------
# TaskPolicy — dataclass invariants
# ---------------------------------------------------------------------------

class TestTaskPolicyInvariants:
    def test_frozen(self) -> None:
        """TaskPolicy is a frozen dataclass — cannot mutate after creation."""
        policy = TaskPolicy(name="test", primary="mock")
        with pytest.raises(AttributeError):
            policy.name = "changed"  # type: ignore[misc]

    def test_default_max_cost_is_none(self) -> None:
        """max_cost_usd defaults to None (no cap)."""
        policy = TaskPolicy(name="test", primary="mock")
        assert policy.max_cost_usd is None

    def test_default_require_json_is_false(self) -> None:
        """require_json defaults to False."""
        policy = TaskPolicy(name="test", primary="mock")
        assert policy.require_json is False

    def test_default_require_citations_is_false(self) -> None:
        """require_citations defaults to False."""
        policy = TaskPolicy(name="test", primary="mock")
        assert policy.require_citations is False

    def test_minimal_policy(self) -> None:
        """A policy with only name+primary works with all defaults."""
        policy = TaskPolicy(name="test", primary="mock")
        assert policy.name == "test"
        assert policy.primary == "mock"
        assert policy.fallback is None
        assert policy.preferred_model is None
        assert policy.json_capable_models is None

    def test_equality_by_value(self) -> None:
        """Two TaskPolicy with same fields are equal (frozen dataclass)."""
        a = TaskPolicy(name="x", primary="mock", require_json=True)
        b = TaskPolicy(name="x", primary="mock", require_json=True)
        assert a == b

    def test_inequality(self) -> None:
        """Different fields produce unequal policies."""
        a = TaskPolicy(name="x", primary="mock")
        b = TaskPolicy(name="y", primary="mock")
        assert a != b


# ---------------------------------------------------------------------------
# Corner cases
# ---------------------------------------------------------------------------

class TestEdgeCases:
    def test_validate_called_before_route(self) -> None:
        """route_for_task calls validate internally — double-rejection not needed."""
        router = _router_with()
        policy = TaskPolicy(name="orphan", primary="ghost")
        with pytest.raises(KeyError, match="ghost"):
            route_for_task(policy, router)

    def test_route_with_empty_router_and_default_provider(self) -> None:
        """An empty router causes KeyError for any provider."""
        router = _router_with()
        policy = TaskPolicy(name="any", primary="anything")
        with pytest.raises(KeyError):
            route_for_task(policy, router)

    def test_json_override_empty_raises(self) -> None:
        """An empty json_capable_models overrides the global — everything fails."""
        router = _router_with("deepseek")
        policy = TaskPolicy(
            name="extraction",
            primary="deepseek",
            require_json=True,
            preferred_model="deepseek-v4-flash",
            json_capable_models=(),
        )
        with pytest.raises(ValueError, match="require_json"):
            policy.validate(router)

    def test_route_for_task_preserves_require_json_check(self) -> None:
        """route_for_task propagates validate failure for require_json."""
        router = _router_with("mock")
        policy = TaskPolicy(
            name="json-task",
            primary="mock",
            require_json=True,
            preferred_model="mock-1",
        )
        with pytest.raises(ValueError, match="require_json"):
            route_for_task(policy, router)

    def test_require_json_with_prefer_fallback(self) -> None:
        """require_json=True with prefer_fallback=True checks the fallback model."""
        router = _router_with("mock", "kimi")
        # primary=mock non-JSON (mock-1 not in _JSON_CAPABLE_MODELS),
        # fallback=kimi with model not in JSON-capable list
        policy = TaskPolicy(
            name="json-task",
            primary="mock",
            fallback="kimi",
            require_json=True,
            preferred_model="deepseek-v4-flash",
            fallback_model="kimi-old",
            json_capable_models=("deepseek-v4-flash",),
        )
        # route_for_task with prefer_fallback=True should check fallback model
        # kimi-old not in json_capable_models => ValueError
        with pytest.raises(ValueError, match="require_json"):
            policy.validate(router)
