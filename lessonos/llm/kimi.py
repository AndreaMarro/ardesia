"""Kimi (Moonshot) LLM provider — wiring only, eval/integration-gated (PLAN §12).

Conforms to the `LLMProvider` protocol so the `Router` can dispatch to it like
any other provider. The API key is read from the environment (`KIMI_API_KEY`),
never hardcoded (AGENTS.md §5.2). Unit tests do NOT call it live: construction
and protocol conformance are checked with a fake key; any real round-trip is
skipped unless a key is present.

Uses the stdlib HTTP client to avoid an extra dependency (AGENTS.md §5.4).
Moonshot exposes an OpenAI-compatible chat-completions endpoint.
"""

from __future__ import annotations

import json
import os
import urllib.request

from lessonos.llm.router import LLMResponse

# Moonshot Kimi token pricing (per 1M tokens, USD).
# Source: https://platform.kimi.ai/docs/pricing/chat (2026-06-07)
# Kimi K2.5: input $0.60/M, output $3.00/M (cache miss).
# Kimi K2.6: input $0.95/M, output $4.00/M (cache miss).
# Default model kimi-k2-0905-preview uses K2.5 rates as a conservative estimate.
KIMI_PRICING: dict[str, tuple[float, float]] = {
    "kimi-k2.5": (0.60, 3.00),
    "kimi-k2-0905-preview": (0.60, 3.00),  # K2-class, K2.5 rates as estimate
    "kimi-k2.6": (0.95, 4.00),
}

DEFAULT_BASE_URL = "https://api.moonshot.ai/v1"
DEFAULT_MODEL = "kimi-k2-0905-preview"


def estimate_kimi_cost(usage: dict, *, input_price: float = 0.60, output_price: float = 3.00) -> float:
    """Estimate USD cost from a Kimi API usage dict.

    Args:
        usage: dict with ``prompt_tokens`` and ``completion_tokens`` keys
            (OpenAI-compatible format returned by Moonshot).
        input_price: USD per 1M input tokens (default K2.5 cache-miss rate).
        output_price: USD per 1M output tokens (default K2.5 rate).

    Returns:
        Estimated cost in USD, rounded to 6 decimal places.
        Returns 0.0 if usage is empty or missing required keys.
    """
    prompt_tokens = usage.get("prompt_tokens", 0)
    completion_tokens = usage.get("completion_tokens", 0)
    cost = (prompt_tokens * input_price + completion_tokens * output_price) / 1_000_000
    return round(cost, 6)


def _model_pricing(model: str) -> tuple[float, float]:
    """Return (input_price_per_M, output_price_per_M) for a model name."""
    return KIMI_PRICING.get(model, (0.60, 3.00))


class KimiAuthError(RuntimeError):
    """Raised when no Moonshot API key is available."""


class KimiProvider:
    name = "kimi"

    def __init__(
        self,
        *,
        api_key: str | None = None,
        model: str = DEFAULT_MODEL,
        base_url: str | None = None,
        timeout: float = 30.0,
    ) -> None:
        key = api_key or os.environ.get("KIMI_API_KEY")
        if not key:
            raise KimiAuthError(
                "KIMI_API_KEY not set; provide api_key= or export the env var "
                "(keys are never hardcoded)."
            )
        self._api_key = key
        self._model = model
        self._base_url = (base_url or os.environ.get("KIMI_BASE_URL") or DEFAULT_BASE_URL).rstrip("/")
        self._timeout = timeout

    def complete(self, prompt: str, *, model: str | None = None) -> LLMResponse:
        used_model = model or self._model
        payload = json.dumps(
            {
                "model": used_model,
                "messages": [{"role": "user", "content": prompt}],
            }
        ).encode("utf-8")
        request = urllib.request.Request(
            f"{self._base_url}/chat/completions",
            data=payload,
            method="POST",
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
        )
        with urllib.request.urlopen(request, timeout=self._timeout) as response:
            body = json.loads(response.read().decode("utf-8"))
        text = body["choices"][0]["message"]["content"]
        usage = body.get("usage")
        return LLMResponse(text=text, provider=self.name, model=used_model, usage=usage)
