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

DEFAULT_BASE_URL = "https://api.moonshot.ai/v1"
DEFAULT_MODEL = "kimi-k2-0905-preview"


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
        return LLMResponse(text=text, provider=self.name, model=used_model)
