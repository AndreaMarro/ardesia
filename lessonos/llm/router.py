"""Abstract LLM router with a deterministic mock provider (PLAN §12).

v0 providers: `mock` (fixture-backed, used by all unit tests) and later `kimi`
(Moonshot, eval-gated). The router dispatches a completion request to a named
provider so callers never bind to a single model.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol, runtime_checkable


@dataclass(frozen=True)
class LLMResponse:
    text: str
    provider: str
    model: str
    usage: dict | None = None


@runtime_checkable
class LLMProvider(Protocol):
    name: str

    def complete(self, prompt: str, *, model: str | None = None) -> LLMResponse: ...


class MockProvider:
    """Deterministic provider: returns the fixture registered for an exact prompt.

    Unknown prompts raise KeyError rather than fabricating output, so tests stay
    reproducible and groundedness is never faked.
    """

    name = "mock"

    def __init__(self, fixtures: dict[str, str], *, model: str = "mock-1") -> None:
        self._fixtures = dict(fixtures)
        self._model = model

    def complete(self, prompt: str, *, model: str | None = None) -> LLMResponse:
        if prompt not in self._fixtures:
            raise KeyError(f"mock fixture not found for prompt: {prompt!r}")
        return LLMResponse(
            text=self._fixtures[prompt],
            provider=self.name,
            model=model or self._model,
        )


class Router:
    def __init__(self) -> None:
        self._providers: dict[str, LLMProvider] = {}

    def has_provider(self, name: str) -> bool:
        """Check if a provider is registered by name."""
        return name in self._providers

    def register(self, provider: LLMProvider) -> None:
        self._providers[provider.name] = provider

    def complete(
        self, prompt: str, *, provider: str, model: str | None = None
    ) -> LLMResponse:
        if provider not in self._providers:
            raise KeyError(f"provider not registered: {provider!r}")
        return self._providers[provider].complete(prompt, model=model)
