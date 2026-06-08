"""Task-level LLM routing policy (P1, PLAN §12).

TaskPolicy defines per-task routing preferences: which provider should handle
it, a fallback if the primary fails, cost caps, and format constraints.

This is the "router prodotto multi-provider" — the product-level decision layer
that sits *above* the router. The router dispatches to a named provider;
TaskPolicy decides *which* provider name to use for each product task.
"""

from __future__ import annotations

from dataclasses import dataclass

from lessonos.llm.router import Router


_JSON_CAPABLE_MODELS: tuple[str, ...] = (
    "kimi-k2.5",
    "kimi-k2.6",
    "deepseek-v4-flash",
    "deepseek-v4-pro",
)
"""Global default list of models known to support structured JSON output."""


@dataclass(frozen=True)
class TaskPolicy:
    """Routing policy for one product-level LLM task.

    Attributes:
        name: Human-readable task name (e.g. "extraction", "segmentation").
        primary: Primary provider name (registered in the Router).
        fallback: Optional fallback provider name if primary fails.
        max_cost_usd: Maximum acceptable cost in USD for this task.
            The caller should check cost after the call and reject/retry if exceeded.
        require_json: If True, the provider MUST be capable of structured JSON output.
            Raise ``ValueError`` at route-time if the chosen provider cannot do JSON.
        require_citations: If True, the task expects citation-grounded output.
            This is a hint for fallback decisions (prefer citation-capable models).
        preferred_model: Optional preferred model name for the primary provider.
        fallback_model: Optional fallback model name for the fallback provider.
            If unset, the provider's default model (or the router-level default) is used.
        json_capable_models: Optional override of JSON-capable model names.
            Falls back to the global ``_JSON_CAPABLE_MODELS`` default.
    """

    name: str
    primary: str
    fallback: str | None = None
    max_cost_usd: float | None = None
    require_json: bool = False
    require_citations: bool = False
    preferred_model: str | None = None
    fallback_model: str | None = None
    json_capable_models: tuple[str, ...] | None = None

    def validate(self, router: Router) -> None:
        """Validate that this policy is satisfiable with the given router.

        Checks:
        - Primary provider is registered
        - If ``require_json``, the chosen model is JSON-capable
        - Fallback provider is registered (if specified)

        Raises:
            ValueError: If any constraint is violated.
            KeyError: If the provider is not registered.
        """
        # Primary must be registered
        if not router.has_provider(self.primary):
            raise KeyError(
                f"TaskPolicy '{self.name}': primary provider {self.primary!r} "
                f"not registered"
            )

        if self.fallback and not router.has_provider(self.fallback):
            raise KeyError(
                f"TaskPolicy '{self.name}': fallback provider "
                f"{self.fallback!r} not registered"
            )

        if self.require_json:
            capable = self.json_capable_models if self.json_capable_models is not None else _JSON_CAPABLE_MODELS
            # Determine the actual model that would be used:
            # 1. preferred_model if explicitly set
            # 2. Provider's model attribute if available (MockProvider._model)
            # 3. Fall back to the provider name (external providers carry model info in their name)
            model = self.preferred_model or self.primary
            if model not in capable:
                raise ValueError(
                    f"TaskPolicy '{self.name}': require_json=True but "
                    f"primary model {model!r} not in JSON-capable models "
                    f"{capable}"
                )
            # Also validate fallback model if present
            if self.fallback_model and self.fallback_model not in capable:
                raise ValueError(
                    f"TaskPolicy '{self.name}': require_json=True but "
                    f"fallback model {self.fallback_model!r} not in "
                    f"JSON-capable models {capable}"
                )


def route_for_task(
    policy: TaskPolicy,
    router: Router,
    *,
    prefer_fallback: bool = False,
) -> str:
    """Resolve the provider name to use for a task given its policy.

    Args:
        policy: The TaskPolicy for this task.
        router: The Router (used to validate the policy).
        prefer_fallback: If True, use the fallback provider. Default False.

    Returns:
        Provider name to dispatch to.

    Raises:
        ValueError: If no suitable provider can be determined.
        KeyError: If the chosen provider is not registered.
    """
    policy.validate(router)

    if prefer_fallback and policy.fallback:
        return policy.fallback
    return policy.primary
