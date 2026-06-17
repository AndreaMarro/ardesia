"""
Galileo Brain — Local Qwen3-4B routing via Ollama.

Modes:
  - "off":    Brain disabled
  - "shadow": runs in parallel with regex classifier, logs predictions,
              does NOT control routing
  - "active": Brain controls routing. If needs_llm=false, responds directly.
              Double-check: LLM is called in background to compare.

Usage:
    brain = GalileoBrain()
    result = await brain.classify(message)
    # result = {"intent": "circuit", "entities": [...], "actions": [...], ...}
"""
import os
import json
import time
import asyncio
import httpx
from datetime import datetime

# ── Configuration ────────────────────────────────────────
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
BRAIN_MODEL = os.environ.get("BRAIN_MODEL", "galileo-brain")
BRAIN_MODE = os.environ.get("BRAIN_MODE", "shadow")  # "shadow" | "active" | "off"
BRAIN_TIMEOUT = float(os.environ.get("BRAIN_TIMEOUT", "30.0"))  # seconds (first call may cold-start model)

# ── System prompt (matches training dataset format) ──────
BRAIN_SYSTEM_PROMPT = (
    "Sei il Galileo Brain, il cervello di routing dell'assistente AI ELAB Tutor.\n"
    "Ricevi il messaggio dello studente + contesto del simulatore.\n"
    "Rispondi SOLO in JSON valido con questa struttura esatta:\n"
    "{\n"
    '  "intent": "action|circuit|code|tutor|vision|navigation",\n'
    '  "entities": ["componente1", "pin1"],\n'
    '  "actions": ["[AZIONE:tag1]", "[AZIONE:tag2]"],\n'
    '  "needs_llm": true/false,\n'
    '  "response": "risposta breve se needs_llm=false, null altrimenti",\n'
    '  "llm_hint": "contesto per il modello grande se needs_llm=true, null altrimenti"\n'
    "}"
)

# Logs (in-memory, last 1000 entries)
_shadow_log = []
_active_log = []
_MAX_LOG = 1000


class GalileoBrain:
    """Local Brain router via Ollama API."""

    def __init__(self):
        self.url = f"{OLLAMA_URL}/api/chat"
        self.model = BRAIN_MODEL
        self.mode = BRAIN_MODE
        self.timeout = BRAIN_TIMEOUT
        self._available = None  # None = not checked yet

    async def is_available(self) -> bool:
        """Check if Ollama is running and model is loaded."""
        if self._available is not None:
            return self._available
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{OLLAMA_URL}/api/tags")
                if resp.status_code == 200:
                    models = [m["name"] for m in resp.json().get("models", [])]
                    self._available = any(self.model in m for m in models)
                    if self._available:
                        print(f"[BRAIN] ✅ Model '{self.model}' available via Ollama")
                    else:
                        print(f"[BRAIN] ❌ Model '{self.model}' not found. Available: {models}")
                else:
                    self._available = False
        except Exception as e:
            print(f"[BRAIN] Ollama not reachable: {e}")
            self._available = False
        return self._available

    def reset_availability(self):
        """Force re-check of Ollama availability on next call."""
        self._available = None

    async def classify(self, message: str, context: str = "") -> dict | None:
        """Send message to Brain, get JSON routing response.

        Args:
            message: User message text
            context: Simulator context (tab, experiment, components, etc.)

        Returns parsed JSON dict or None on failure.
        Enforced timeout ensures this never blocks the main routing path.
        """
        if self.mode == "off":
            return None

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
                    print(f"[BRAIN] {self.mode} | intent={parsed.get('intent')} "
                          f"| needs_llm={parsed.get('needs_llm')} | {elapsed_ms:.0f}ms")

                return parsed

        except asyncio.TimeoutError:
            elapsed_ms = (time.monotonic() - start) * 1000
            print(f"[BRAIN] Timeout after {elapsed_ms:.0f}ms")
            return None
        except Exception as e:
            print(f"[BRAIN] Error: {e}")
            return None

    def _parse_json(self, content: str) -> dict | None:
        """Extract JSON from Brain response, handling thinking tokens."""
        content = content.strip()

        # Remove <think>...</think> blocks from Qwen3
        import re
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
            # Find matching closing brace
            brace_count = 0
            for i in range(idx, len(content)):
                if content[i] == "{":
                    brace_count += 1
                elif content[i] == "}":
                    brace_count -= 1
                    if brace_count == 0:
                        try:
                            return json.loads(content[idx:i + 1])
                        except json.JSONDecodeError:
                            break

        print(f"[BRAIN] JSON parse failed: {content[:200]}...")
        return None

    # Map Brain's sometimes-varied tag names to the exact frontend tags
    _TAG_NORMALIZE = {
        "play": "play", "avvia": "play", "start": "play",
        "pause": "pause", "pausa": "pause", "stop": "pause", "ferma": "pause",
        "reset": "reset",
        "clearall": "clearall", "removeall": "clearall", "clear": "clearall",
        "compile": "compile", "compila": "compile", "compile_code": "compile",
        "loadexp": "loadexp", "loadexperiment": "loadexp", "load_experiment": "loadexp",
        "opentab": "opentab", "open_tab": "opentab",
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
        """Normalize a Brain action tag to the exact frontend format.
        E.g. '[AZIONE:loadExperiment]' → '[AZIONE:loadexp]'
        """
        import re
        m = re.match(r"\[AZIONE:(\w+)\]", tag, re.IGNORECASE)
        if not m:
            return tag
        raw = m.group(1).lower()
        normalized = self._TAG_NORMALIZE.get(raw, raw)
        return f"[AZIONE:{normalized}]"

    def format_brain_response(self, brain_result: dict) -> str:
        """Format Brain's direct response with action tags for the frontend.

        When needs_llm=false, Brain provides response + actions.
        This formats them into the same format the frontend expects from the LLM.
        """
        response = brain_result.get("response") or ""
        actions = brain_result.get("actions") or []

        # Normalize action tags to exact frontend format
        normalized = [self._normalize_tag(a) for a in actions]

        # Append action tags to response
        if normalized:
            tags = " ".join(normalized)
            if response:
                return f"{response}\n\n{tags}"
            return tags

        return response

    # ── Shadow Mode ──────────────────────────────────────

    async def shadow_classify(self, message: str, regex_intent: str, context: str = "") -> dict | None:
        """Shadow mode: classify and log comparison with regex classifier.

        Does NOT affect routing — only logs for monitoring.
        """
        if self.mode != "shadow":
            return None

        brain_result = await self.classify(message, context)
        if brain_result is None:
            return None

        brain_intent = brain_result.get("intent", "?")
        match = brain_intent == regex_intent

        entry = {
            "ts": datetime.utcnow().isoformat(),
            "message": message[:100],
            "regex_intent": regex_intent,
            "brain_intent": brain_intent,
            "brain_needs_llm": brain_result.get("needs_llm"),
            "match": match,
            "latency_ms": brain_result.get("_brain_latency_ms", 0),
        }

        _shadow_log.append(entry)
        if len(_shadow_log) > _MAX_LOG:
            _shadow_log.pop(0)

        if not match:
            print(f"[BRAIN] ⚠️  MISMATCH: regex={regex_intent} brain={brain_intent} "
                  f"msg='{message[:50]}...'")

        return brain_result

    # ── Active Mode (Double-Check) ───────────────────────

    def log_active_decision(self, message: str, brain_result: dict,
                            brain_responded: bool, llm_response: str = None):
        """Log an active mode decision for double-check comparison.

        Called both when Brain responds directly (needs_llm=false)
        and when Brain routes to LLM (needs_llm=true).
        """
        entry = {
            "ts": datetime.utcnow().isoformat(),
            "message": message[:100],
            "brain_intent": brain_result.get("intent", "?"),
            "brain_needs_llm": brain_result.get("needs_llm"),
            "brain_actions": brain_result.get("actions", []),
            "brain_response": (brain_result.get("response") or "")[:200],
            "brain_responded": brain_responded,  # True = Brain answered directly
            "llm_response": (llm_response or "")[:200] if llm_response else None,
            "latency_ms": brain_result.get("_brain_latency_ms", 0),
        }

        # Compare: did Brain's action tags match what LLM would have said?
        if llm_response and brain_responded:
            brain_tags = set(brain_result.get("actions") or [])
            # Extract [AZIONE:...] tags from LLM response
            import re
            llm_tags = set(re.findall(r"\[AZIONE:\w+\]", llm_response))
            entry["tags_match"] = brain_tags == llm_tags if (brain_tags or llm_tags) else True
            entry["brain_tags"] = list(brain_tags)
            entry["llm_tags"] = list(llm_tags)

        _active_log.append(entry)
        if len(_active_log) > _MAX_LOG:
            _active_log.pop(0)

        # Log divergences
        if entry.get("tags_match") is False:
            print(f"[BRAIN] ⚠️  DOUBLE-CHECK DIVERGENCE: brain_tags={entry['brain_tags']} "
                  f"llm_tags={entry['llm_tags']} msg='{message[:50]}...'")

    # ── Stats ────────────────────────────────────────────

    def get_shadow_stats(self) -> dict:
        """Get shadow mode comparison statistics."""
        if not _shadow_log:
            return {"total": 0, "match_rate": 0, "mismatches": []}

        total = len(_shadow_log)
        matches = sum(1 for e in _shadow_log if e["match"])
        avg_latency = sum(e["latency_ms"] for e in _shadow_log) / total
        mismatches = [e for e in _shadow_log if not e["match"]][-10:]

        return {
            "total": total,
            "matches": matches,
            "match_rate": round(100 * matches / total, 1),
            "avg_latency_ms": round(avg_latency, 1),
            "recent_mismatches": mismatches,
            "mode": self.mode,
        }

    def get_active_stats(self) -> dict:
        """Get active mode double-check statistics."""
        if not _active_log:
            return {"total": 0, "brain_direct": 0, "brain_routed": 0,
                    "divergences": [], "mode": self.mode}

        total = len(_active_log)
        brain_direct = sum(1 for e in _active_log if e["brain_responded"])
        brain_routed = total - brain_direct
        avg_latency = sum(e["latency_ms"] for e in _active_log) / total

        # Double-check stats (only entries where LLM comparison exists)
        checked = [e for e in _active_log if "tags_match" in e]
        checked_total = len(checked)
        tags_matched = sum(1 for e in checked if e["tags_match"])
        divergences = [e for e in _active_log if e.get("tags_match") is False][-10:]

        return {
            "total": total,
            "brain_direct": brain_direct,
            "brain_routed": brain_routed,
            "avg_latency_ms": round(avg_latency, 1),
            "double_check_total": checked_total,
            "double_check_match": tags_matched,
            "double_check_rate": round(100 * tags_matched / checked_total, 1) if checked_total else 0,
            "recent_divergences": divergences,
            "mode": self.mode,
        }


# ── Singleton ────────────────────────────────────────────
_brain_instance = None


def get_brain() -> GalileoBrain:
    """Get or create singleton Brain instance."""
    global _brain_instance
    if _brain_instance is None:
        _brain_instance = GalileoBrain()
    return _brain_instance
