"""L1: Galileo Brain — Ollama-based intent router.

Sends user message + simulator context to the fine-tuned Brain model.
Returns JSON with intent, needs_llm, response, actions.
When needs_llm=false, the Brain handles the request directly (~100ms).
When needs_llm=true, the response is passed to the LLM specialist (~3-8s).
"""
import asyncio
import json
import re
import time
from typing import Optional

import httpx

from config import OLLAMA_HOST, BRAIN_MODEL, BRAIN_TIMEOUT

BRAIN_SYSTEM_PROMPT = (
    "Sei il cervello di Galileo, l'assistente AI di ELAB Tutor. "
    "Ricevi messaggi da studenti 10-14 anni. "
    "Rispondi SOLO in JSON valido con questi campi: "
    "intent, needs_llm, response, actions, entities. "
    "Se needs_llm e' false, response contiene la risposta diretta e actions le azioni."
)


class GalileoBrain:
    """Local Brain router via Ollama API."""

    def __init__(self):
        self.url = f"{OLLAMA_HOST}/api/chat"
        self.model = BRAIN_MODEL
        self.timeout = BRAIN_TIMEOUT
        self._available: Optional[bool] = None

    async def is_available(self) -> bool:
        """Check if Ollama is running and the Brain model is loaded."""
        if self._available is not None:
            return self._available
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{OLLAMA_HOST}/api/tags")
                if resp.status_code == 200:
                    models = [m["name"] for m in resp.json().get("models", [])]
                    self._available = any(self.model in m for m in models)
                    if self._available:
                        print(f"[BRAIN] Model '{self.model}' available via Ollama")
                    else:
                        print(f"[BRAIN] Model '{self.model}' not found. Available: {models}")
                else:
                    self._available = False
        except Exception as e:
            print(f"[BRAIN] Ollama not reachable: {e}")
            self._available = False
        return self._available

    def reset_availability(self):
        """Force re-check on next call (e.g. after model install)."""
        self._available = None

    async def classify(self, message: str, context: str = "") -> Optional[dict]:
        """Send message to Brain, get JSON routing response.

        Args:
            message: User message text
            context: Formatted [CONTESTO] block from simulator

        Returns:
            Parsed JSON dict with intent/needs_llm/response/actions, or None on failure.
        """
        if not await self.is_available():
            return None

        # Format input like the training dataset
        if context:
            user_content = f"{context}\n\n[MESSAGGIO]\n{message}"
        else:
            user_content = f"[MESSAGGIO]\n{message}"

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": BRAIN_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            "stream": False,
            "options": {
                "temperature": 0.1,
                "top_p": 0.95,
                "num_predict": 512,
            },
        }

        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(self.url, json=payload)
                elapsed_ms = (time.monotonic() - start) * 1000

                if resp.status_code != 200:
                    print(f"[BRAIN] Ollama error {resp.status_code}: {resp.text[:100]}")
                    return None

                content = resp.json().get("message", {}).get("content", "")
                parsed = self._parse_json(content)

                if parsed:
                    parsed["_brain_latency_ms"] = round(elapsed_ms, 1)
                    print(
                        f"[BRAIN] intent={parsed.get('intent')} "
                        f"| needs_llm={parsed.get('needs_llm')} "
                        f"| {elapsed_ms:.0f}ms"
                    )

                return parsed

        except (asyncio.TimeoutError, httpx.TimeoutException):
            elapsed_ms = (time.monotonic() - start) * 1000
            print(f"[BRAIN] Timeout after {elapsed_ms:.0f}ms")
            return None
        except Exception as e:
            print(f"[BRAIN] Error: {e}")
            return None

    def _parse_json(self, content: str) -> Optional[dict]:
        """Extract JSON from Brain response, handling <think> tokens."""
        content = content.strip()

        # Remove <think>...</think> blocks (Qwen3 thinking tokens)
        content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()

        # Direct JSON
        if content.startswith("{"):
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                pass

        # Find first { in response (skip any preamble)
        idx = content.find("{")
        if idx >= 0:
            brace_count = 0
            for i in range(idx, len(content)):
                if content[i] == "{":
                    brace_count += 1
                elif content[i] == "}":
                    brace_count -= 1
                    if brace_count == 0:
                        try:
                            return json.loads(content[idx : i + 1])
                        except json.JSONDecodeError:
                            break

        print(f"[BRAIN] JSON parse failed: {content[:200]}...")
        return None

    def format_brain_response(self, brain_result: dict) -> str:
        """Format Brain's direct response with action tags for the frontend.

        When needs_llm=false, Brain provides response + actions.
        This formats them into the same format the frontend expects.
        """
        response = brain_result.get("response") or ""
        actions = brain_result.get("actions") or []

        # Normalize action tags
        normalized = [self._normalize_tag(a) for a in actions if a]

        if normalized:
            tags = " ".join(normalized)
            if response:
                return f"{response}\n\n{tags}"
            return tags

        return response

    _TAG_NORMALIZE = {
        "play": "play", "avvia": "play", "start": "play",
        "pause": "pause", "pausa": "pause", "stop": "pause", "ferma": "pause",
        "reset": "reset",
        "clearall": "clearall", "removeall": "clearall", "clear": "clearall",
        "compile": "compile", "compila": "compile",
        "loadexp": "loadexp",
        "opentab": "opentab",
        "highlight": "highlight",
        "quiz": "quiz",
        "undo": "undo", "redo": "redo",
        "nextstep": "nextstep", "prevstep": "prevstep",
        "openeditor": "openeditor", "closeeditor": "closeeditor",
        "switcheditor": "switcheditor",
        "showbom": "showbom", "showserial": "showserial",
        "resetcode": "resetcode",
        "notebook": "notebook",
    }

    def _normalize_tag(self, tag: str) -> str:
        """Normalize a Brain action tag to the exact frontend format."""
        m = re.match(r"\[AZIONE:(\w+(?::\w+)?)\]", tag, re.IGNORECASE)
        if m:
            raw = m.group(1).lower()
            # Handle compound tags like switcheditor:scratch
            parts = raw.split(":", 1)
            base = self._TAG_NORMALIZE.get(parts[0], parts[0])
            if len(parts) > 1:
                return f"[AZIONE:{base}:{parts[1]}]"
            return f"[AZIONE:{base}]"
        # Already formatted or unknown — return as-is
        if tag.startswith("[AZIONE:"):
            return tag
        # Bare action name
        normalized = self._TAG_NORMALIZE.get(tag.lower(), tag.lower())
        return f"[AZIONE:{normalized}]"


# Singleton
_brain: Optional[GalileoBrain] = None


def get_brain() -> GalileoBrain:
    global _brain
    if _brain is None:
        _brain = GalileoBrain()
    return _brain
