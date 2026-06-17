#!/bin/bash
# ELAB Pod Bootstrap — full stack inside RunPod RTX 6000 Ada
# Sprint S iter 1 — 2026-04-26
# Stack: Ollama + Qwen2.5-VL + BGE-M3 + reranker + Coqui XTTS-v2 + Whisper Turbo + FLUX.1 Schnell + ClawBot dispatcher

set -euo pipefail
LOG=/workspace/bootstrap.log
exec > >(tee -a "$LOG") 2>&1

echo "════════════════════════════════════════════════════"
echo "ELAB Pod Bootstrap START $(date -u)"
echo "GPU: $(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader)"
echo "════════════════════════════════════════════════════"

# ── Step 1: System packages ──
echo "[1/8] System packages"
apt-get update -qq
apt-get install -y -qq jq tmux htop nvtop ffmpeg curl wget git ca-certificates

# ── Step 2: Ollama install + start ──
echo "[2/8] Ollama install + start"
if ! command -v ollama &>/dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
fi
mkdir -p /workspace/.ollama
nohup env OLLAMA_HOST=0.0.0.0:11434 OLLAMA_MODELS=/workspace/.ollama ollama serve > /workspace/ollama.log 2>&1 &
sleep 8
curl -sS http://localhost:11434/api/tags >/dev/null || { echo "FATAL ollama not up"; exit 1; }
echo "  Ollama OK"

# ── Step 3: Pull Qwen models ──
echo "[3/8] Pull Qwen models (LLM+VLM)"
ollama pull qwen2.5vl:7b &
QWEN_VL_PID=$!
ollama pull qwen2.5:7b &
QWEN_TXT_PID=$!
wait $QWEN_VL_PID $QWEN_TXT_PID || true
ollama list

# ── Step 4: BGE-M3 + reranker via Python ──
echo "[4/8] Embed + reranker server (port 8080+8081)"
pip install -q FlagEmbedding fastapi uvicorn sentence-transformers
cat > /workspace/embed-server.py <<'PYEOF'
from fastapi import FastAPI
from pydantic import BaseModel
from FlagEmbedding import BGEM3FlagModel, FlagReranker
import uvicorn, threading

app = FastAPI()
embed_model = BGEM3FlagModel('BAAI/bge-m3', use_fp16=True)
rerank_model = FlagReranker('BAAI/bge-reranker-large', use_fp16=True)

class EmbedReq(BaseModel):
    inputs: list[str]
class RerankReq(BaseModel):
    query: str
    texts: list[str]

@app.get("/health")
def health(): return {"status":"ok","models":["bge-m3","bge-reranker-large"]}

@app.post("/embed")
def embed(req: EmbedReq):
    out = embed_model.encode(req.inputs, return_dense=True, return_sparse=True)
    return {"dense": [v.tolist() for v in out['dense_vecs']]}

@app.post("/rerank")
def rerank(req: RerankReq):
    pairs = [[req.query, t] for t in req.texts]
    scores = rerank_model.compute_score(pairs, normalize=True)
    if not isinstance(scores, list): scores = [scores]
    return {"scores": scores}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
PYEOF
nohup python3 /workspace/embed-server.py > /workspace/embed.log 2>&1 &
echo "  Embed server starting..."

# ── Step 5: Whisper Turbo STT ──
echo "[5/8] Whisper Large V3 Turbo STT (port 9000)"
pip install -q faster-whisper python-multipart
cat > /workspace/whisper-server.py <<'PYEOF'
from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import uvicorn, tempfile, os

app = FastAPI()
model = WhisperModel("large-v3-turbo", device="cuda", compute_type="float16")

@app.get("/health")
def health(): return {"status":"ok","model":"whisper-large-v3-turbo"}

@app.post("/asr")
async def asr(audio_file: UploadFile = File(...), language: str = "it"):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(await audio_file.read()); path = f.name
    segments, info = model.transcribe(path, language=language, beam_size=5)
    text = " ".join([s.text for s in segments])
    os.unlink(path)
    return {"text": text.strip(), "language": info.language, "duration": info.duration}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)
PYEOF
nohup python3 /workspace/whisper-server.py > /workspace/whisper.log 2>&1 &

# ── Step 6: Coqui XTTS-v2 TTS Italian ──
echo "[6/8] Coqui XTTS-v2 TTS (port 8881)"
export COQUI_TOS_AGREED=1
pip install -q TTS soundfile
cat > /workspace/tts-server.py <<'PYEOF'
import os
os.environ["COQUI_TOS_AGREED"] = "1"
from fastapi import FastAPI
from fastapi.responses import Response
from pydantic import BaseModel
from TTS.api import TTS
import uvicorn, io, soundfile as sf, numpy as np

app = FastAPI()
tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=True)

class TTSReq(BaseModel):
    text: str
    language: str = "it"
    speaker_wav: str = "/workspace/speaker_default.wav"

@app.get("/health")
def health(): return {"status":"ok","model":"xtts_v2","langs":["it","en","es","fr","de","pt","pl","tr","ru","nl","cs","ar","zh-cn","ja","hu","ko"]}

@app.post("/tts")
def synth(req: TTSReq):
    wav = tts.tts(text=req.text, speaker_wav=req.speaker_wav, language=req.language)
    buf = io.BytesIO()
    sf.write(buf, wav, 24000, format="WAV")
    return Response(content=buf.getvalue(), media_type="audio/wav")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8881)
PYEOF
# Placeholder speaker (replace with real 6sec Andrea/Tea voice clone)
if [ ! -f /workspace/speaker_default.wav ]; then
  python3 -c "
import numpy as np, soundfile as sf
# 3sec sine wave 220Hz envelope (placeholder for voice clone reference)
sr=22050; t=np.linspace(0,3,sr*3)
audio = np.sin(2*np.pi*220*t) * np.exp(-t/2) * 0.3
sf.write('/workspace/speaker_default.wav', audio, sr)
"
fi
nohup python3 /workspace/tts-server.py > /workspace/tts.log 2>&1 &

# ── Step 7: FLUX.1 Schnell image gen (Gradio port 7860) ──
echo "[7/8] FLUX.1 Schnell image gen (port 7860, lazy load)"
pip install -q diffusers transformers accelerate gradio
cat > /workspace/flux-server.py <<'PYEOF'
import torch, gradio as gr
from diffusers import FluxPipeline

# Lazy load: only init when first generation requested
_pipe = None
def get_pipe():
    global _pipe
    if _pipe is None:
        _pipe = FluxPipeline.from_pretrained(
            "black-forest-labs/FLUX.1-schnell",
            torch_dtype=torch.bfloat16
        ).to("cuda")
        _pipe.enable_model_cpu_offload()
    return _pipe

def generate(prompt, num_steps=4, seed=42):
    pipe = get_pipe()
    g = torch.Generator(device="cuda").manual_seed(int(seed))
    img = pipe(prompt, num_inference_steps=int(num_steps),
               guidance_scale=0.0, generator=g, height=512, width=512).images[0]
    return img

demo = gr.Interface(
    fn=generate,
    inputs=[gr.Textbox(label="Prompt"), gr.Slider(1,8,4,step=1,label="Steps"), gr.Number(42,label="Seed")],
    outputs=gr.Image(type="pil"),
    title="ELAB FLUX.1 Schnell — Image Gen Trial",
    description="Sprint S — image gen for ELAB fumetto report illustrations"
)

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860, share=False)
PYEOF
nohup python3 /workspace/flux-server.py > /workspace/flux.log 2>&1 &

# ── Step 8: ClawBot 80-tool dispatcher stub (port 8000) ──
echo "[8/8] ClawBot dispatcher stub (port 8000)"
cat > /workspace/clawbot-server.py <<'PYEOF'
"""
ELAB ClawBot 80-tool dispatcher stub
Sprint 6 Day 39 skeleton — wires OpenClaw Sett-5 tools-registry into HTTP endpoint
Real production wires src/services/openclaw/* into Edge Function unlim-chat
This stub demonstrates routing pattern for end-to-end test
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any
import uvicorn, time, json, httpx

app = FastAPI(title="ELAB ClawBot Dispatcher", version="0.1-stub")

# Stub registry: 12 representative tools out of 80 (from openclaw/tools-registry.ts)
TOOLS = {
    "simulator.highlight": {"params":["component_id"],"effect":"frontend"},
    "simulator.loadexp": {"params":["exp_id"],"effect":"frontend"},
    "simulator.delta": {"params":["operations"],"effect":"frontend"},
    "wiki.query": {"params":["concept"],"effect":"backend"},
    "rag.retrieve": {"params":["query","top_k"],"effect":"backend"},
    "rag.rerank": {"params":["query","candidates"],"effect":"backend"},
    "memory.read_class": {"params":["class_id"],"effect":"backend"},
    "memory.write_class": {"params":["class_id","fact"],"effect":"backend"},
    "tts.speak": {"params":["text","lang"],"effect":"frontend"},
    "stt.transcribe": {"params":["audio_url"],"effect":"frontend"},
    "vision.diagnose": {"params":["screenshot_url"],"effect":"backend"},
    "image.generate": {"params":["prompt"],"effect":"backend"},
}

class DispatchReq(BaseModel):
    tool: str
    args: dict[str, Any] = {}

@app.get("/health")
def health(): return {"status":"ok","tools_registered":len(TOOLS),"sprint":"6-day-39-stub"}

@app.get("/tools")
def list_tools(): return {"tools": TOOLS}

@app.post("/dispatch")
async def dispatch(req: DispatchReq):
    if req.tool not in TOOLS:
        raise HTTPException(404, f"Tool not registered: {req.tool}")
    spec = TOOLS[req.tool]
    start = time.time()
    # Real impl routes to backend endpoint OR returns frontend action JSON
    if spec["effect"] == "frontend":
        result = {"action_type":"frontend","tag": f"[AZIONE:{req.tool.split('.')[1]}:{json.dumps(req.args)}]"}
    else:
        result = await _backend_call(req.tool, req.args)
    return {"tool": req.tool, "result": result, "latency_ms": int((time.time()-start)*1000)}

async def _backend_call(tool, args):
    async with httpx.AsyncClient(timeout=30) as c:
        if tool == "wiki.query":
            return {"stub":"wiki retriever returns concept md","query":args.get("concept")}
        if tool == "rag.retrieve":
            return {"stub":"top-k chunks returned","query":args.get("query"),"top_k":args.get("top_k",5)}
        if tool == "rag.rerank":
            r = await c.post("http://localhost:8081/rerank", json={"query":args["query"],"texts":args["candidates"][:5]})
            return r.json()
        if tool == "memory.read_class":
            return {"stub":"class memory markdown","class_id":args.get("class_id")}
        if tool == "memory.write_class":
            return {"status":"ok","wrote":args}
        if tool == "vision.diagnose":
            return {"stub":"qwen2.5vl analyzes screenshot","input_url":args.get("screenshot_url")}
        if tool == "image.generate":
            return {"stub":"flux.1 schnell 4-step gen","prompt":args.get("prompt"),"hint":"call port 7860 directly"}
    return {"stub":"backend tool not impl","tool":tool}

@app.post("/multi-dispatch")
async def multi_dispatch(reqs: list[DispatchReq]):
    """Sprint 6 Day 39 stretch: parallel multi-tool dispatch (10 sequential calls test)"""
    results = []
    for r in reqs:
        try:
            res = await dispatch(r)
            results.append(res)
        except Exception as e:
            results.append({"tool": r.tool, "error": str(e)})
    return {"results": results, "count": len(results)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
PYEOF
nohup python3 /workspace/clawbot-server.py > /workspace/clawbot.log 2>&1 &

# ── Wait + health check ──
echo ""
echo "Waiting 90s for all servers to load models (BGE/Whisper/Coqui/FLUX.1 download ~10GB total)..."
sleep 90

echo ""
echo "════════════════════════════════════════════════════"
echo "ELAB Pod Bootstrap — health checks"
echo "════════════════════════════════════════════════════"
echo "Ollama (LLM+VLM):  $(curl -sS http://localhost:11434/api/tags 2>/dev/null | jq '.models | length' 2>/dev/null || echo FAIL) models"
echo "Embeddings:        $(curl -sS http://localhost:8080/health 2>/dev/null | jq -r .status 2>/dev/null || echo LOADING)"
echo "Reranker:          shares port 8080 (FlagReranker in same server)"
echo "TTS Coqui:         $(curl -sS http://localhost:8881/health 2>/dev/null | jq -r .status 2>/dev/null || echo LOADING)"
echo "STT Whisper:       $(curl -sS http://localhost:9000/health 2>/dev/null | jq -r .status 2>/dev/null || echo LOADING)"
echo "FLUX.1 image gen:  $(curl -sS http://localhost:7860 2>/dev/null | head -c 30 || echo LOADING)"
echo "ClawBot dispatch:  $(curl -sS http://localhost:8000/health 2>/dev/null | jq -r .status 2>/dev/null || echo LOADING)"
echo ""
echo "All logs: /workspace/{ollama,embed,whisper,tts,flux,clawbot}.log"
echo ""
echo "Public proxy URLs (RunPod auto-routed):"
POD_ID="${RUNPOD_POD_ID:-3w1qzszkgkzcz3}"
for port in 11434 8080 8881 9000 7860 8000 8888; do
    echo "  https://${POD_ID}-${port}.proxy.runpod.net"
done
echo ""
echo "Bootstrap COMPLETE $(date -u). Log: $LOG"
echo "════════════════════════════════════════════════════"
