"""Galileo Brain — HuggingFace Space inference server.

Loads the fine-tuned galileo-brain GGUF and exposes a /classify endpoint.
The nanobot on Render calls this for intent routing.

Private Space — only accessible with HF token.
"""
import json
import os
import re
import time

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

import uvicorn

# llama-cpp-python for GGUF inference (no Ollama needed)
from llama_cpp import Llama

app = FastAPI(title="Galileo Brain", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model at startup — download from HF Hub if not cached
BRAIN_SECRET = os.environ.get("BRAIN_SECRET", "")
HF_TOKEN = os.environ.get("HF_TOKEN", "")

print("[Brain] Loading model via from_pretrained (downloads on first run)...")
llm = Llama.from_pretrained(
    repo_id="AIndrea/galileo-brain-gguf",
    filename="galileo-brain-v13.gguf",
    n_ctx=1024,
    n_threads=2,
    n_gpu_layers=0,
    verbose=False,
    token=HF_TOKEN or None,
)
print("[Brain] Model loaded.")


SYSTEM_PROMPT = (
    "Sei il cervello di Galileo, l'assistente AI di ELAB Tutor. "
    "Ricevi messaggi da studenti 10-14 anni. "
    "Rispondi SOLO in JSON valido con questi campi: "
    "intent, needs_llm, response, actions, entities."
)


class ClassifyRequest(BaseModel):
    message: str
    context: str = ""


class ClassifyResponse(BaseModel):
    intent: Optional[str] = None
    needs_llm: Optional[bool] = None
    response: Optional[str] = None
    actions: Optional[list] = None
    entities: Optional[dict] = None
    latency_ms: float = 0
    raw: Optional[str] = None


def _parse_json(content: str) -> Optional[dict]:
    """Extract JSON from Brain response, handling <think> tokens."""
    content = content.strip()
    content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()

    if content.startswith("{"):
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass

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
                        return json.loads(content[idx:i + 1])
                    except json.JSONDecodeError:
                        break
    return None


@app.get("/health")
async def health():
    return {"status": "ok", "model": "galileo-brain", "backend": "llama.cpp"}


@app.post("/classify", response_model=ClassifyResponse)
async def classify(
    req: ClassifyRequest,
    authorization: Optional[str] = Header(None),
):
    """Classify a user message — returns intent routing JSON."""
    # Optional API key check
    if BRAIN_SECRET:
        expected = f"Bearer {BRAIN_SECRET}"
        if authorization != expected:
            raise HTTPException(status_code=401, detail="Invalid API key")

    # Format input like the training dataset
    if req.context:
        user_content = f"{req.context}\n\n[MESSAGGIO]\n{req.message}"
    else:
        user_content = f"[MESSAGGIO]\n{req.message}"

    start = time.monotonic()

    # llama-cpp-python chat completion
    result = llm.create_chat_completion(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.1,
        top_p=0.95,
        max_tokens=512,
    )

    elapsed_ms = (time.monotonic() - start) * 1000
    raw_content = result["choices"][0]["message"]["content"]

    parsed = _parse_json(raw_content)

    if parsed:
        return ClassifyResponse(
            intent=parsed.get("intent"),
            needs_llm=parsed.get("needs_llm"),
            response=parsed.get("response"),
            actions=parsed.get("actions"),
            entities=parsed.get("entities"),
            latency_ms=round(elapsed_ms, 1),
            raw=raw_content[:500],
        )
    else:
        return ClassifyResponse(
            latency_ms=round(elapsed_ms, 1),
            raw=raw_content[:500],
        )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
