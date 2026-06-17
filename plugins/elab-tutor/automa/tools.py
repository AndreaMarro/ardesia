"""
ELAB Automa — AI Tool Wrappers
Provides unified interface to external AI models and research APIs.
"""

import os
import json
import time
import urllib.request
import urllib.error
from pathlib import Path

# Load .env manually (no external deps)
_env_path = Path(__file__).parent / ".env"
if _env_path.exists():
    for line in _env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "").strip()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
KIMI_API_KEY = os.environ.get("KIMI_API_KEY", "").strip()
BRAIN_URL = os.environ.get("BRAIN_URL", "http://72.60.129.50:11434").strip()
NANOBOT_URL = os.environ.get("NANOBOT_URL", "https://elab-galileo.onrender.com").strip()
VERCEL_URL = os.environ.get("VERCEL_URL", "https://www.elabtutor.school").strip()


def _http_post(url: str, payload: dict, headers: dict, timeout: int = 60) -> dict:
    """Simple HTTP POST with JSON, no external deps."""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:500]
        return {"error": f"HTTP {e.code}", "detail": body}
    except Exception as e:
        return {"error": str(e)}


def _http_get(url: str, timeout: int = 15) -> dict:
    """Simple HTTP GET."""
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return {"error": str(e)}


# ─── DeepSeek R1 (reasoning/scoring) ───────────────────

def call_deepseek_reasoner(prompt: str, max_tokens: int = 2048) -> str:
    """Call DeepSeek R1 for reasoning tasks (scoring, judging)."""
    if not DEEPSEEK_API_KEY or "placeholder" in DEEPSEEK_API_KEY:
        return "[SKIP] DeepSeek API key not configured"

    resp = _http_post(
        "https://api.deepseek.com/v1/chat/completions",
        {
            "model": "deepseek-reasoner",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
        },
        {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        },
        timeout=120,
    )
    if "error" in resp:
        return f"[ERROR] DeepSeek: {resp['error']}"
    try:
        return resp["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        return f"[ERROR] Unexpected DeepSeek response: {json.dumps(resp)[:300]}"


# ─── Gemini 2.5 Pro (vision, thinking, research) ───────

def call_gemini(prompt: str, images: list = None, model: str = "gemini-2.5-pro") -> str:
    """Call Gemini for vision, research, or thinking tasks."""
    if not GEMINI_API_KEY or "placeholder" in GEMINI_API_KEY:
        return "[SKIP] Gemini API key not configured"

    parts = [{"text": prompt}]
    if images:
        for img_b64 in images:
            parts.append({
                "inline_data": {
                    "mime_type": "image/png",
                    "data": img_b64,
                }
            })

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
    resp = _http_post(
        url,
        {"contents": [{"parts": parts}]},
        {"Content-Type": "application/json"},
        timeout=90,
    )
    if "error" in resp:
        return f"[ERROR] Gemini: {resp.get('error', {})}"
    try:
        return resp["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        return f"[ERROR] Unexpected Gemini response: {json.dumps(resp)[:300]}"


# ─── Kimi K2.5 (review, second opinion) ─────────────────

def call_gemini_cli(prompt: str, model: str = "gemini-2.5-flash", timeout: int = 120) -> str:
    """Call Gemini via CLI (OAuth, no API key needed). Uses ermagician@gmail.com account."""
    import subprocess
    try:
        env = os.environ.copy()
        env["GOOGLE_GENAI_USE_GCA"] = "true"
        env["PATH"] = "/Users/andreamarro/.npm-global/bin:/opt/homebrew/bin:/usr/local/bin:" + env.get("PATH", "")
        result = subprocess.run(
            ["gemini", "-m", model, "-p", prompt],
            capture_output=True, text=True, timeout=timeout, env=env,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()[:2000]
        return f"[GEMINI-CLI-ERROR] exit={result.returncode} stderr={result.stderr[:200]}"
    except subprocess.TimeoutExpired:
        return "[GEMINI-CLI-TIMEOUT]"
    except Exception as e:
        return f"[GEMINI-CLI-CRASH] {str(e)[:200]}"


def call_kimi(prompt: str, max_tokens: int = 2048) -> str:
    """Call Kimi K2.5 for review and second opinions."""
    if not KIMI_API_KEY or "placeholder" in KIMI_API_KEY:
        return "[SKIP] Kimi API key not configured"

    resp = _http_post(
        "https://api.moonshot.ai/v1/chat/completions",
        {
            "model": "moonshot-v1-auto",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
        },
        {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {KIMI_API_KEY}",
        },
        timeout=90,
    )
    if "error" in resp:
        return f"[ERROR] Kimi: {resp['error']}"
    try:
        return resp["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        return f"[ERROR] Unexpected Kimi response: {json.dumps(resp)[:300]}"


def call_kimi_vision(prompt: str, image_path: str, max_tokens: int = 2048) -> str:
    """Call Kimi moonshot-v1-128k with image for visual analysis.
    image_path: local file path to PNG/JPG screenshot."""
    if not KIMI_API_KEY or "placeholder" in KIMI_API_KEY:
        return "[SKIP] Kimi API key not configured"

    import base64
    from pathlib import Path

    img_path = Path(image_path)
    if not img_path.exists():
        return f"[ERROR] Image not found: {image_path}"

    with open(img_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")

    mime = "image/png" if img_path.suffix == ".png" else "image/jpeg"

    resp = _http_post(
        "https://api.moonshot.ai/v1/chat/completions",
        {
            "model": "moonshot-v1-128k",
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{img_b64}"}},
                    {"type": "text", "text": prompt},
                ],
            }],
            "max_tokens": max_tokens,
        },
        {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {KIMI_API_KEY}",
        },
        timeout=120,
    )
    if "error" in resp:
        return f"[ERROR] Kimi Vision: {resp['error']}"
    try:
        return resp["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        return f"[ERROR] Unexpected Kimi Vision response: {json.dumps(resp)[:300]}"


# ─── Brain V13 (local routing) ──────────────────────────

def call_brain(message: str, context: str = "") -> dict:
    """Call Brain V13 on VPS for routing classification."""
    prompt = message
    if context:
        prompt = f"[CONTESTO: {context}]\n{message}"

    resp = _http_post(
        f"{BRAIN_URL}/api/chat",
        {
            "model": "galileo-brain-v13",
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
        },
        {"Content-Type": "application/json"},
        timeout=30,
    )
    if "error" in resp:
        return {"error": resp["error"], "raw": ""}

    text = resp.get("message", {}).get("content", "")
    return {"raw": text, "error": None}


def check_brain_health() -> dict:
    """Check if Brain VPS is reachable and model loaded."""
    resp = _http_get(f"{BRAIN_URL}/api/tags", timeout=10)
    if "error" in resp:
        return {"status": "down", "error": resp["error"]}
    models = [m["name"] for m in resp.get("models", [])]
    has_brain = any("galileo-brain" in m for m in models)
    return {"status": "ok" if has_brain else "no_model", "models": models}


# ─── Nanobot (Galileo) ──────────────────────────────────

def chat_galileo(message: str, experiment_id: str = "v1-cap6-esp1") -> dict:
    """Send a message to Galileo nanobot and get response."""
    resp = _http_post(
        f"{NANOBOT_URL}/chat",
        {
            "message": message,
            "session_id": f"automa-test-{int(time.time())}",
            "experiment_id": experiment_id,
        },
        {"Content-Type": "application/json"},
        timeout=60,
    )
    if "error" in resp:
        return {"response": "", "error": resp["error"], "tags": []}

    text = resp.get("response", resp.get("message", ""))
    # Extract action tags
    import re
    tags = re.findall(r'\[AZIONE:\w+\]|\[INTENT:\w+\]', text)
    return {"response": text, "error": None, "tags": tags}


def check_nanobot_health() -> dict:
    """Check nanobot health endpoint."""
    resp = _http_get(f"{NANOBOT_URL}/health", timeout=15)
    if "error" in resp:
        return {"status": "down", "error": resp["error"]}
    return {"status": "ok", "data": resp}


# ─── Vercel ─────────────────────────────────────────────

def check_vercel_health() -> dict:
    """Check if Vercel site loads."""
    try:
        req = urllib.request.Request(VERCEL_URL, method="HEAD")
        with urllib.request.urlopen(req, timeout=15) as resp:
            return {"status": "ok", "code": resp.status}
    except Exception as e:
        return {"status": "down", "error": str(e)}


# ─── Semantic Scholar ────────────────────────────────────

def search_papers(query: str, limit: int = 5) -> list:
    """Search Semantic Scholar for papers."""
    encoded = urllib.parse.quote(query)
    url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={encoded}&limit={limit}&fields=title,year,citationCount,abstract"
    resp = _http_get(url, timeout=20)
    if "error" in resp:
        return [{"error": resp["error"]}]
    return resp.get("data", [])


# ─── Gulpease Index ─────────────────────────────────────

def gulpease_index(text: str) -> float:
    """Calculate Gulpease readability index for Italian text.
    ≥80: easy for elementary school
    ≥60: easy for middle school (our target)
    ≥40: easy for high school
    <40: hard
    """
    if not text.strip():
        return 0.0

    # Count sentences (. ? ! … and newlines as sentence breaks)
    import re
    sentences = len(re.split(r'[.!?…]+|\n\n+', text.strip()))
    sentences = max(sentences, 1)

    # Count words
    words = text.split()
    n_words = len(words)
    if n_words == 0:
        return 0.0

    # Count letters (only alphabetic)
    n_letters = sum(1 for c in text if c.isalpha())

    # Gulpease formula
    return 89 + (300 * sentences - 10 * n_letters) / n_words


if __name__ == "__main__":
    # Quick self-test
    print("=== ELAB Automa Tools Self-Test ===")

    print("\n1. Brain VPS health:")
    print(json.dumps(check_brain_health(), indent=2))

    print("\n2. Nanobot health:")
    print(json.dumps(check_nanobot_health(), indent=2))

    print("\n3. Vercel health:")
    print(json.dumps(check_vercel_health(), indent=2))

    print("\n4. Brain routing test:")
    result = call_brain("avvia la simulazione")
    print(json.dumps(result, indent=2))

    print("\n5. Gulpease test:")
    test_text = "Il LED è un componente che emette luce quando la corrente lo attraversa. Ha due piedini: l'anodo e il catodo."
    print(f"  Text: {test_text}")
    print(f"  Gulpease: {gulpease_index(test_text):.1f}")

    print("\n6. DeepSeek status:", "configured" if DEEPSEEK_API_KEY and "placeholder" not in DEEPSEEK_API_KEY else "NOT configured")
    print("7. Gemini status:", "configured" if GEMINI_API_KEY and "placeholder" not in GEMINI_API_KEY else "NOT configured")
    print("8. Kimi status:", "configured" if KIMI_API_KEY and "placeholder" not in KIMI_API_KEY else "NOT configured")
