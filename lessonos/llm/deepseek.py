"""DeepSeek model pricing and agent cost estimation.

Unlike ``lessonos/llm/kimi.py`` (which handles Moonshot API interaction),
this module only defines pricing constants and an estimator for the DeepSeek
brain (Hermes orchestrator). The DeepSeek brain is used for agent iterations,
not for product-level LLM calls — so the estimator lives here rather than
in a provider module.

Pricing source: https://api-docs.deepseek.com/quick_start/pricing (2026-06-08)
"""

from __future__ import annotations

# DeepSeek v4-flash token pricing (per 1M tokens, USD).
# Cache-miss rates used as conservative estimate (Hermes brain rarely hits
# the system prompt cache across sessions). Cache-hit rates are ~50x cheaper.
# Output is always charged at full rate.
# Tuple format: (input_cache_miss, input_cache_hit, output) — all per 1M tokens
DEEPSEEK_PRICING: dict[str, tuple[float, float, float]] = {
    "deepseek-v4-flash": (0.14, 0.0028, 0.28),
    "deepseek-v4-pro": (0.435, 0.003625, 0.87),
}

# Default conservative estimate: cache-miss input + output.
DEEPSEEK_DEFAULT_INPUT_PRICE = 0.14  # per 1M, cache miss
DEEPSEEK_DEFAULT_OUTPUT_PRICE = 0.28  # per 1M


def estimate_deepseek_cost(
    input_tokens: int = 1_000,
    output_tokens: int = 500,
    *,
    input_price: float = DEEPSEEK_DEFAULT_INPUT_PRICE,
    output_price: float = DEEPSEEK_DEFAULT_OUTPUT_PRICE,
) -> float:
    """Estimate USD cost for a DeepSeek agent iteration.

    Unlike the Kimi estimator (``estimate_kimi_cost``) which extracts token
    counts from an API ``usage`` dict, this estimator takes raw token counts
    because the DeepSeek brain (Hermes) does not expose per-call usage via
    the Hermes tool interface.

    Defaults (1K input + 500 output) are a rough per-iteration baseline based
    on typical tool-use sessions (1--2 tool calls, moderate context fitting).
    Use cache-miss rates as a conservative upper bound (the system prompt
    rarely persists across sessions).

    Args:
        input_tokens: Estimated input tokens for the iteration.
        output_tokens: Estimated output tokens for the iteration.
        input_price: USD per 1M input tokens (default cache-miss rate).
        output_price: USD per 1M output tokens (full rate).

    Returns:
        Estimated cost in USD, rounded to 6 decimal places.
    """
    if input_tokens < 0 or output_tokens < 0:
        raise ValueError(
            f"token counts must be >= 0, got input={input_tokens}, output={output_tokens}"
        )
    cost = (input_tokens * input_price + output_tokens * output_price) / 1_000_000
    return round(cost, 6)
