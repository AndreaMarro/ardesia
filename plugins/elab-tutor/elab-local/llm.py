"""L3: LLM inference — cascata cloud API -> Ollama locale.

Cascade:
1. Cloud API (DeepSeek/Gemini) if keys configured → 1-3s
2. Local Ollama if running → 8-25s
3. Error fallback

Brain (local, proprietary) handles routing.
Cloud APIs handle the heavy lifting (text generation).
Ollama handles offline fallback.
"""
import asyncio
import json
import time
from typing import Optional

import httpx

from config import (
    OLLAMA_HOST, LLM_MODEL, LLM_TIMEOUT, MAX_TOKENS, TEMPERATURE,
    DEEPSEEK_API_KEY, GEMINI_API_KEY, CLOUD_LLM_MODEL,
)


# === CLOUD API BACKENDS ===

async def _call_deepseek(
    messages: list,
    temperature: float = TEMPERATURE,
    max_tokens: int = MAX_TOKENS,
) -> Optional[dict]:
    """Call DeepSeek API (OpenAI-compatible)."""
    if not DEEPSEEK_API_KEY:
        return None

    start = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": CLOUD_LLM_MODEL,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            elapsed_ms = (time.monotonic() - start) * 1000

            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                print(f"[LLM] DeepSeek | {len(content)} chars | {elapsed_ms:.0f}ms")
                return {
                    "response": content,
                    "latency_ms": round(elapsed_ms, 1),
                    "model": f"deepseek:{CLOUD_LLM_MODEL}",
                    "error": None,
                }
            else:
                print(f"[LLM] DeepSeek error {resp.status_code}: {resp.text[:100]}")
                return None

    except Exception as e:
        print(f"[LLM] DeepSeek failed: {e}")
        return None


async def _call_gemini(
    messages: list,
    images: Optional[list] = None,
    temperature: float = TEMPERATURE,
    max_tokens: int = MAX_TOKENS,
) -> Optional[dict]:
    """Call Gemini API (Google AI)."""
    if not GEMINI_API_KEY:
        return None

    # Convert OpenAI-style messages to Gemini format
    contents = []
    system_text = ""
    for msg in messages:
        if msg["role"] == "system":
            system_text = msg["content"]
        elif msg["role"] == "user":
            parts = [{"text": msg["content"]}]
            if images:
                for img_b64 in images:
                    parts.append({
                        "inline_data": {
                            "mime_type": "image/png",
                            "data": img_b64,
                        }
                    })
            contents.append({"role": "user", "parts": parts})
        elif msg["role"] == "assistant":
            contents.append({"role": "model", "parts": [{"text": msg["content"]}]})

    start = time.monotonic()
    try:
        model_name = "gemini-2.0-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            },
        }
        if system_text:
            payload["systemInstruction"] = {"parts": [{"text": system_text}]}

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            elapsed_ms = (time.monotonic() - start) * 1000

            if resp.status_code == 200:
                data = resp.json()
                content = data["candidates"][0]["content"]["parts"][0]["text"]
                print(f"[LLM] Gemini | {len(content)} chars | {elapsed_ms:.0f}ms")
                return {
                    "response": content,
                    "latency_ms": round(elapsed_ms, 1),
                    "model": f"gemini:{model_name}",
                    "error": None,
                }
            else:
                print(f"[LLM] Gemini error {resp.status_code}: {resp.text[:100]}")
                return None

    except Exception as e:
        print(f"[LLM] Gemini failed: {e}")
        return None


# === LOCAL OLLAMA BACKEND ===

async def _call_ollama(
    messages: list,
    images: Optional[list] = None,
    model: str = LLM_MODEL,
    temperature: float = TEMPERATURE,
    max_tokens: int = MAX_TOKENS,
) -> Optional[dict]:
    """Call local Ollama."""
    # Add images to last user message if present
    if images:
        for msg in reversed(messages):
            if msg["role"] == "user":
                msg["images"] = images
                break

    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens,
        },
    }

    start = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=LLM_TIMEOUT) as client:
            resp = await client.post(f"{OLLAMA_HOST}/api/chat", json=payload)
            elapsed_ms = (time.monotonic() - start) * 1000

            if resp.status_code != 200:
                print(f"[LLM] Ollama error {resp.status_code}: {resp.text[:100]}")
                return None

            data = resp.json()
            content = data.get("message", {}).get("content", "")
            print(f"[LLM] Ollama:{model} | {len(content)} chars | {elapsed_ms:.0f}ms")

            return {
                "response": content,
                "latency_ms": round(elapsed_ms, 1),
                "model": f"ollama:{model}",
                "error": None,
            }

    except Exception as e:
        print(f"[LLM] Ollama failed: {e}")
        return None


# === PUBLIC API (cascata) ===

def _build_messages(system_prompt: str, user_message: str, history: Optional[list] = None) -> list:
    """Build OpenAI-style message list."""
    messages = [{"role": "system", "content": system_prompt}]
    if history:
        for msg in history[-10:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_message})
    return messages


async def generate(
    system_prompt: str,
    user_message: str,
    history: Optional[list] = None,
    images: Optional[list] = None,
    model: str = LLM_MODEL,
    temperature: float = TEMPERATURE,
    max_tokens: int = MAX_TOKENS,
) -> dict:
    """Generate LLM response. Cascade: cloud API -> local Ollama -> error.

    Returns:
        {"response": str, "latency_ms": float, "model": str, "error": str|None}
    """
    messages = _build_messages(system_prompt, user_message, history)
    has_images = bool(images)

    # 1. Try cloud APIs (fast, 1-3s)
    if has_images and GEMINI_API_KEY:
        # Vision → Gemini only (DeepSeek doesn't support images)
        result = await _call_gemini(messages, images=images, temperature=temperature, max_tokens=max_tokens)
        if result:
            return result
    elif not has_images:
        # Text → DeepSeek first (cheaper, faster), then Gemini
        if DEEPSEEK_API_KEY:
            result = await _call_deepseek(messages, temperature=temperature, max_tokens=max_tokens)
            if result:
                return result
        if GEMINI_API_KEY:
            result = await _call_gemini(messages, temperature=temperature, max_tokens=max_tokens)
            if result:
                return result

    # 2. Fallback to local Ollama
    result = await _call_ollama(messages, images=images, model=model, temperature=temperature, max_tokens=max_tokens)
    if result:
        return result

    # 3. All failed
    return {
        "response": "",
        "latency_ms": 0,
        "model": "none",
        "error": "Nessun provider LLM disponibile (cloud API + Ollama)",
    }


async def generate_vision(
    system_prompt: str,
    user_message: str,
    image_base64: str,
    model: str = LLM_MODEL,
) -> dict:
    """Convenience wrapper for vision requests."""
    return await generate(
        system_prompt=system_prompt,
        user_message=user_message,
        images=[image_base64],
        model=model,
        max_tokens=2048,
    )


async def check_model_available(model: str = LLM_MODEL) -> bool:
    """Check if the LLM model is available in Ollama."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{OLLAMA_HOST}/api/tags")
            if resp.status_code == 200:
                models = [m["name"] for m in resp.json().get("models", [])]
                return any(model in m for m in models)
    except Exception:
        pass
    return False


async def list_models() -> list:
    """Return list of model names available in Ollama."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{OLLAMA_HOST}/api/tags")
            if resp.status_code == 200:
                return [m["name"] for m in resp.json().get("models", [])]
    except Exception:
        pass
    return []


def get_available_providers() -> list:
    """Return list of configured LLM providers."""
    providers = []
    if DEEPSEEK_API_KEY:
        providers.append("deepseek")
    if GEMINI_API_KEY:
        providers.append("gemini")
    providers.append("ollama")  # Always available as fallback
    return providers
