"""Galileo Brain — HuggingFace Space (Gradio SDK).

Loads the fine-tuned galileo-brain GGUF via llama-cpp-python
and exposes a Gradio interface + API endpoint for classification.
"""
import json
import os
import re
import time

import gradio as gr
from llama_cpp import Llama

# Download model from private repo
HF_TOKEN = os.environ.get("HF_TOKEN", "")

print("[Brain] Loading model via from_pretrained...")
llm = Llama.from_pretrained(
    repo_id="AIndrea/galileo-brain-gguf",
    filename="galileo-brain-v13.gguf",
    n_ctx=1024,
    n_threads=2,
    n_gpu_layers=0,
    verbose=False,
    token=HF_TOKEN or None,
)
print("[Brain] Model loaded!")

SYSTEM_PROMPT = (
    "Sei il cervello di Galileo, l'assistente AI di ELAB Tutor. "
    "Ricevi messaggi da studenti 10-14 anni. "
    "Rispondi SOLO in JSON valido con questi campi: "
    "intent, needs_llm, response, actions, entities."
)


def parse_json(content):
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


def classify(message, context=""):
    if context:
        user_content = f"{context}\n\n[MESSAGGIO]\n{message}"
    else:
        user_content = f"[MESSAGGIO]\n{message}"

    start = time.monotonic()
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

    raw = result["choices"][0]["message"]["content"]
    parsed = parse_json(raw)

    output = {
        "latency_ms": round(elapsed_ms, 1),
        "raw": raw[:500],
    }
    if parsed:
        output.update(parsed)

    return json.dumps(output, indent=2, ensure_ascii=False)


# Gradio interface
demo = gr.Interface(
    fn=classify,
    inputs=[
        gr.Textbox(label="Messaggio", placeholder="avvia la simulazione"),
        gr.Textbox(label="Contesto (opzionale)", placeholder="[CONTESTO]\ntab: simulator"),
    ],
    outputs=gr.JSON(label="Brain Response"),
    title="Galileo Brain — Intent Router",
    description="Fine-tuned Qwen3.5-2B per routing intent di ELAB Tutor",
    examples=[
        ["avvia la simulazione", ""],
        ["cos'e' un LED?", ""],
        ["metti un LED rosso", "[CONTESTO]\ntab: simulator\nesperimento: v1-cap6-esp1"],
    ],
    api_name="classify",
)

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
