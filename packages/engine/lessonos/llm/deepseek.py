"""DeepSeek model pricing, agent cost estimation, and API provider.

Two distinct use-cases are served by this module:

1. **Agent cost estimation** (``estimate_deepseek_agent_cost``) — rough USD
   estimate for Hermes orchestrator iterations, used in ``log.jsonl``.
   Pricing tuples are ``(cache_miss, cache_hit, output)`` because the
   DeepSeek brain (Hermes) does not expose per-call usage via the tool
   interface.  Source: https://api-docs.deepseek.com/quick_start/pricing

2. **API provider** (``DeepSeekProvider``) — product-level LLM calls via the
   DeepSeek API, conforming to the ``LLMProvider`` protocol so the
   ``Router`` can dispatch to it.  Uses stdlib HTTP client (no extras).
   Pricing via ``estimate_deepseek_api_cost`` (usage-dict → USD).

Design (COORDINATION.md § CLAUDE-SAYS 2026-06-08):
- DeepSeek is wired as an LLM provider for eval/integration-gated calls.
- ``run_realtime_eval`` in ``lessonos/eval/realtime.py`` uses this provider
  when ``DEEPSEEK_API_KEY`` is set.
- Unit tests use the mock provider (fast, free).
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

from lessonos.llm._retry import retry_on_timeout
from lessonos.llm.router import LLMResponse

DEFAULT_BASE_URL = "https://api.deepseek.com/v1"
DEFAULT_MODEL = "deepseek-chat"

# ---------------------------------------------------------------------------
# Agent cost estimation — used in log.jsonl for Hermes orchestrator iterations
# ---------------------------------------------------------------------------
# Format: {model: (input_cache_miss, input_cache_hit, output)} — all per 1M tokens
# Cache-hit rates are ~50x cheaper; cache-miss rates used as conservative estimate.
DEEPSEEK_PRICING: dict[str, tuple[float, float, float]] = {
    "deepseek-v4-flash": (0.14, 0.0028, 0.28),
    "deepseek-v4-pro": (0.435, 0.003625, 0.87),
}

DEFAULT_INPUT_PRICE = 0.14  # per 1M, cache miss
DEFAULT_OUTPUT_PRICE = 0.28  # per 1M


def estimate_deepseek_cost(
    input_tokens: int = 1_000,
    output_tokens: int = 500,
    *,
    input_price: float = DEFAULT_INPUT_PRICE,
    output_price: float = DEFAULT_OUTPUT_PRICE,
) -> float:
    """Estimate USD cost for a DeepSeek agent iteration.

    This is the **agent** estimator (Hermes orchestrator brain), NOT the
    API-product estimator.  It takes raw token counts because the Hermes tool
    interface does not expose per-call usage.

    Defaults (1K input + 500 output) are a rough per-iteration baseline based
    on typical tool-use sessions (1--2 tool calls, moderate context fitting).
    Use cache-miss rates as a conservative upper bound.

    Args:
        input_tokens: Estimated input tokens for the iteration.
        output_tokens: Estimated output tokens for the iteration.
        input_price: USD per 1M input tokens (default cache-miss rate).
        output_price: USD per 1M output tokens (full rate).

    Returns:
        Estimated cost in USD, rounded to 6 decimal places.

    Raises:
        ValueError: If any token count is negative.
    """
    if input_tokens < 0 or output_tokens < 0:
        raise ValueError(
            f"token counts must be >= 0, got input={input_tokens}, output={output_tokens}"
        )
    cost = (input_tokens * input_price + output_tokens * output_price) / 1_000_000
    return round(cost, 6)


# ---------------------------------------------------------------------------
# API product pricing — used in CostLedger for product-level LLM calls
# ---------------------------------------------------------------------------
# Format: {model: (input_price_per_M, output_price_per_M)}
DEEPSEEK_API_PRICING: dict[str, tuple[float, float]] = {
    "deepseek-chat": (0.14, 0.28),
    "deepseek-reasoner": (0.55, 2.19),
}


def estimate_deepseek_api_cost(usage: dict, *, model: str = "deepseek-chat") -> float:
    """Estimate USD cost from a DeepSeek API usage dict.

    This is the **product** estimator (CostLedger for API calls).
    Takes an OpenAI-compatible ``usage`` dict from a DeepSeek response.

    Args:
        usage: dict with ``prompt_tokens`` and ``completion_tokens`` keys.
        model: Model name for pricing lookup (default: ``deepseek-chat``).

    Returns:
        Estimated cost in USD, rounded to 6 decimal places.
        Returns 0.0 if usage is empty or missing required keys.
    """
    prompt_tokens = usage.get("prompt_tokens", 0)
    completion_tokens = usage.get("completion_tokens", 0)
    input_price, output_price = DEEPSEEK_API_PRICING.get(
        model, (0.14, 0.28)
    )
    cost = (prompt_tokens * input_price + completion_tokens * output_price) / 1_000_000
    return round(cost, 6)


# ---------------------------------------------------------------------------
# .env file parser
# ---------------------------------------------------------------------------


def _parse_env_file(path: str = ".env") -> dict[str, str]:
    """Minimal ``.env`` file parser — no python-dotenv dependency.

    Reads key=value lines, trimming whitespace.  Ignores comments (``#``)
    and blank lines.  Values may be quoted.

    Returns a dict of {key: value} from the file.
    """
    result: dict[str, str] = {}
    try:
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                key, _, val = line.partition("=")
                key = key.strip()
                val = val.strip().strip("\"'")
                if key:
                    result[key] = val
    except FileNotFoundError:
        pass
    return result


# ---------------------------------------------------------------------------
# Provider
# ---------------------------------------------------------------------------


class DeepSeekAuthError(RuntimeError):
    """Raised when no DeepSeek API key is available."""


class DeepSeekProvider:
    """LLM provider for DeepSeek API (OpenAI-compatible chat completions).

    Args:
        api_key: Optional explicit key.  If not provided, tries
            ``DEEPSEEK_API_KEY`` from the environment, then from ``.env``
            in the current working directory.
        model: Model name (default: ``deepseek-chat``).
        base_url: API base URL (default: ``https://api.deepseek.com/v1``).
        timeout: HTTP request timeout in seconds.
        temperature: Optional sampling temperature. ``None`` (default) omits
            the field so the API default applies; pass ``0.0`` for
            deterministic classification passes (e.g. concept resolution).
    """

    name = "deepseek"

    def __init__(
        self,
        *,
        api_key: str | None = None,
        model: str = DEFAULT_MODEL,
        base_url: str | None = None,
        timeout: float = 120.0,
        temperature: float | None = None,
    ) -> None:
        key = api_key or os.environ.get("DEEPSEEK_API_KEY")
        if not key:
            env_lookup = _parse_env_file(".env")
            key = env_lookup.get("DEEPSEEK_API_KEY")
        if not key:
            raise DeepSeekAuthError(
                "DEEPSEEK_API_KEY not set; provide api_key=, export the env var, "
                "or add DEEPSEEK_API_KEY= in the project root "
                "(keys are never hardcoded)."
            )
        self._api_key = key
        self._model = model
        self._base_url = (base_url or DEFAULT_BASE_URL).rstrip("/")
        self._timeout = timeout
        self._temperature = temperature

    def complete(self, prompt: str, *, model: str | None = None) -> LLMResponse:
        """Send a chat-completion request to DeepSeek.

        Args:
            prompt: The user message (full system/user prompt bundled).
            model: Override the default model for this call.

        Returns:
            An ``LLMResponse`` with the generated text and usage info.

        Raises:
            RuntimeError: If the API returns an error or the response is
                malformed.
            urllib.error.URLError: On network failure.
        """
        used_model = model or self._model
        body: dict = {
            "model": used_model,
            "messages": [{"role": "user", "content": prompt}],
            # Senza max_tokens DeepSeek applica il default 4096 e TRONCA gli
            # output lunghi a meta' JSON (incidente macinata: summary con
            # excerpt coalesced -> "Unterminated string"). 8192 = max chat.
            "max_tokens": 8192,
        }
        if self._temperature is not None:
            body["temperature"] = self._temperature
        payload = json.dumps(body).encode("utf-8")
        request = urllib.request.Request(
            f"{self._base_url}/chat/completions",
            data=payload,
            method="POST",
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
        )
        try:
            _urlopen = retry_on_timeout(urllib.request.urlopen, max_attempts=3, backoff_base=1.0)
            with _urlopen(request, timeout=self._timeout) as response:
                body = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(
                f"DeepSeek API returned HTTP {exc.code}: {error_body[:500]}"
            ) from exc
        try:
            text = body["choices"][0]["message"]["content"]
            usage = body.get("usage")
        except (KeyError, IndexError) as exc:
            raise RuntimeError(
                f"DeepSeek API response missing expected fields: {exc}. "
                f"Response: {json.dumps(body, indent=2, default=str)[:500]}"
            ) from exc
        return LLMResponse(
            text=text, provider=self.name, model=used_model, usage=usage
        )
