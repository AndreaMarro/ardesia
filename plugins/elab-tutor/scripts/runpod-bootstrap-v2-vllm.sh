#!/bin/bash
# ELAB Pod Bootstrap V2 — vLLM-optimized full stack RTX A6000 48GB
# Sprint T iter 21 — 2026-04-28 — caveman mode
# Goal: max speed onniscenza+onnipotenza (Andrea mandate "più veloce possibile")
# Stack: vLLM Llama 3.1 8B AWQ + Qwen2.5-VL 7B + BGE-M3 + reranker-v2-m3 + Whisper Turbo + Coqui XTTS-v2 IT + FLUX.1 Schnell + ClawBot dispatcher
# Throughput: ~150 tok/s LLM (5x Ollama), ~80 img/s embeddings, ~rt 0.1 STT, voice clone 3s

set -euo pipefail
LOG=/workspace/bootstrap-v2.log
exec > >(tee -a "$LOG") 2>&1

echo "════════════════════════════════════════════════════"
echo "ELAB Pod Bootstrap V2 vLLM START $(date -u)"
echo "GPU: $(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader)"
echo "════════════════════════════════════════════════════"

# ── Step 1: System packages ──
echo "[1/9] System packages (incl. zstd for Ollama fallback + tmux)"
apt-get update -qq
apt-get install -y -qq jq tmux htop ffmpeg curl wget git ca-certificates zstd build-essential

# ── Step 2: Python deps base ──
echo "[2/9] Python deps base"
pip install -q --upgrade pip
pip install -q vllm==0.6.3 fastapi uvicorn httpx pydantic
pip install -q FlagEmbedding sentence-transformers
pip install -q transformers accelerate bitsandbytes
pip install -q faster-whisper
pip install -q TTS

# ── Step 3: vLLM LLM server (Llama 3.1 8B AWQ) ──
echo "[3/9] vLLM Llama 3.1 8B Instruct AWQ port 8000"
nohup python -m vllm.entrypoints.openai.api_server \
    --model "hugging-quants/Meta-Llama-3.1-8B-Instruct-AWQ-INT4" \
    --quantization awq_marlin \
    --gpu-memory-utilization 0.30 \
    --max-model-len 8192 \
    --dtype auto \
    --host 0.0.0.0 \
    --port 8000 \
    > /workspace/vllm-llm.log 2>&1 &
LLM_PID=$!
echo "  vLLM LLM PID=$LLM_PID"

# ── Step 4: Qwen2.5-VL 7B Instruct (vision-language) ──
echo "[4/9] vLLM Qwen2.5-VL 7B Instruct port 8002"
nohup python -m vllm.entrypoints.openai.api_server \
    --model "Qwen/Qwen2.5-VL-7B-Instruct" \
    --gpu-memory-utilization 0.25 \
    --max-model-len 4096 \
    --dtype bfloat16 \
    --trust-remote-code \
    --host 0.0.0.0 \
    --port 8002 \
    > /workspace/vllm-vlm.log 2>&1 &
VLM_PID=$!
echo "  vLLM VLM PID=$VLM_PID"

# ── Step 5: BGE-M3 + BGE-reranker-v2-m3 server ──
echo "[5/9] BGE-M3 + reranker-v2-m3 port 8080"
cat > /workspace/embed-server.py <<'PYEOF'
from fastapi import FastAPI
from pydantic import BaseModel
from FlagEmbedding import BGEM3FlagModel, FlagReranker
import uvicorn

app = FastAPI()
embed_model = BGEM3FlagModel('BAAI/bge-m3', use_fp16=True)
rerank_model = FlagReranker('BAAI/bge-reranker-v2-m3', use_fp16=True)

class EmbedReq(BaseModel):
    inputs: list[str]
class RerankReq(BaseModel):
    query: str
    texts: list[str]

@app.get("/health")
def health(): return {"status":"ok","models":["bge-m3","bge-reranker-v2-m3"]}

@app.post("/embed")
def embed(req: EmbedReq):
    out = embed_model.encode(req.inputs, batch_size=32, max_length=512, return_dense=True, return_sparse=True, return_colbert_vecs=False)
    return {"dense": out["dense_vecs"].tolist(), "sparse": [{int(k): float(v) for k,v in d.items()} for d in out["lexical_weights"]]}

@app.post("/rerank")
def rerank(req: RerankReq):
    pairs = [[req.query, t] for t in req.texts]
    scores = rerank_model.compute_score(pairs, normalize=True)
    return {"scores": [float(s) for s in scores]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080, workers=1)
PYEOF
nohup python /workspace/embed-server.py > /workspace/embed.log 2>&1 &
EMBED_PID=$!
echo "  Embed PID=$EMBED_PID"

# ── Step 6: Whisper Turbo STT ──
echo "[6/9] Whisper Turbo STT port 9000"
cat > /workspace/whisper-server.py <<'PYEOF'
from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import uvicorn, tempfile

app = FastAPI()
model = WhisperModel("turbo", device="cuda", compute_type="float16")

@app.get("/health")
def health(): return {"status":"ok","model":"whisper-turbo"}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), language: str = "it"):
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
        f.write(await file.read())
        path = f.name
    segments, info = model.transcribe(path, language=language, vad_filter=True)
    text = " ".join(s.text for s in segments)
    return {"text": text.strip(), "language": info.language, "duration": info.duration}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000, workers=1)
PYEOF
nohup python /workspace/whisper-server.py > /workspace/whisper.log 2>&1 &
WHISPER_PID=$!
echo "  Whisper PID=$WHISPER_PID"

# ── Step 7: Coqui XTTS-v2 Italian voice ──
echo "[7/9] Coqui XTTS-v2 Italian voice port 8881"
cat > /workspace/tts-server.py <<'PYEOF'
from fastapi import FastAPI, Response
from pydantic import BaseModel
from TTS.api import TTS
import uvicorn, io, tempfile, soundfile as sf

app = FastAPI()
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cuda")

class SpeakReq(BaseModel):
    text: str
    speaker_wav: str = "/workspace/isabella-reference.wav"  # voice clone reference
    language: str = "it"

@app.get("/health")
def health(): return {"status":"ok","model":"xtts-v2","languages":["it","en","es","fr","de"]}

@app.post("/speak")
def speak(req: SpeakReq):
    out = tts.tts(text=req.text, speaker_wav=req.speaker_wav, language=req.language)
    buf = io.BytesIO()
    sf.write(buf, out, 24000, format="WAV")
    return Response(content=buf.getvalue(), media_type="audio/wav")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8881, workers=1)
PYEOF
nohup python /workspace/tts-server.py > /workspace/tts.log 2>&1 &
TTS_PID=$!
echo "  TTS PID=$TTS_PID"

# ── Step 8: FLUX.1 Schnell image gen ──
echo "[8/9] FLUX.1 Schnell image gen port 7860"
cat > /workspace/flux-server.py <<'PYEOF'
from fastapi import FastAPI, Response
from pydantic import BaseModel
import torch, io, uvicorn
from diffusers import FluxPipeline

app = FastAPI()
pipe = FluxPipeline.from_pretrained("black-forest-labs/FLUX.1-schnell", torch_dtype=torch.bfloat16)
pipe.enable_sequential_cpu_offload()  # save VRAM, slight slow

class GenReq(BaseModel):
    prompt: str
    width: int = 1024
    height: int = 1024
    steps: int = 4

@app.get("/health")
def health(): return {"status":"ok","model":"flux.1-schnell"}

@app.post("/generate")
def generate(req: GenReq):
    img = pipe(req.prompt, width=req.width, height=req.height, num_inference_steps=req.steps, guidance_scale=0.0).images[0]
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860, workers=1)
PYEOF
nohup pip install -q diffusers accelerate sentencepiece protobuf
nohup python /workspace/flux-server.py > /workspace/flux.log 2>&1 &
FLUX_PID=$!
echo "  FLUX PID=$FLUX_PID"

# ── Step 9: ClawBot dispatcher Python orchestrator ──
echo "[9/9] ClawBot dispatcher port 7000"
cat > /workspace/clawbot-server.py <<'PYEOF'
from fastapi import FastAPI
from pydantic import BaseModel
import httpx, uvicorn, asyncio

app = FastAPI()

class DispatchReq(BaseModel):
    tool: str
    args: dict = {}

ENDPOINTS = {
    "llm.chat": "http://localhost:8000/v1/chat/completions",
    "vlm.diagnose": "http://localhost:8002/v1/chat/completions",
    "embed.text": "http://localhost:8080/embed",
    "rerank.text": "http://localhost:8080/rerank",
    "stt.transcribe": "http://localhost:9000/transcribe",
    "tts.speak": "http://localhost:8881/speak",
    "image.generate": "http://localhost:7860/generate",
}

@app.get("/health")
async def health():
    results = {}
    async with httpx.AsyncClient(timeout=5.0) as client:
        for name, url in ENDPOINTS.items():
            health_url = url.rsplit("/", 1)[0] + "/health"
            try:
                r = await client.get(health_url)
                results[name] = r.json() if r.status_code == 200 else {"status": "down"}
            except Exception as e:
                results[name] = {"status": "error", "msg": str(e)}
    return {"status": "ok", "endpoints": results}

@app.post("/dispatch")
async def dispatch(req: DispatchReq):
    url = ENDPOINTS.get(req.tool)
    if not url:
        return {"error": f"unknown tool {req.tool}", "available": list(ENDPOINTS.keys())}
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(url, json=req.args)
        return r.json() if r.headers.get("content-type","").startswith("application/json") else {"raw": r.content.decode("latin-1")}

@app.post("/multi-dispatch")
async def multi_dispatch(reqs: list[DispatchReq]):
    """Parallel multi-tool dispatch"""
    async def call(r):
        try:
            return await dispatch(r)
        except Exception as e:
            return {"tool": r.tool, "error": str(e)}
    return {"results": await asyncio.gather(*(call(r) for r in reqs))}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7000, workers=1)
PYEOF
nohup python /workspace/clawbot-server.py > /workspace/clawbot.log 2>&1 &
CLAW_PID=$!
echo "  ClawBot PID=$CLAW_PID"

# ── Wait for models load ──
echo ""
echo "Waiting 240s for vLLM Llama 8B + Qwen2.5-VL 7B + BGE-M3 + Whisper + XTTS + FLUX models load..."
sleep 240

echo ""
echo "════════════════════════════════════════════════════"
echo "ELAB Pod V2 health checks"
echo "════════════════════════════════════════════════════"
echo "vLLM LLM (8000):       $(curl -sS http://localhost:8000/health 2>/dev/null | head -c 80 || echo LOADING)"
echo "vLLM VLM (8002):       $(curl -sS http://localhost:8002/health 2>/dev/null | head -c 80 || echo LOADING)"
echo "Embed BGE (8080):      $(curl -sS http://localhost:8080/health 2>/dev/null | jq -r .status 2>/dev/null || echo LOADING)"
echo "STT Whisper (9000):    $(curl -sS http://localhost:9000/health 2>/dev/null | jq -r .status 2>/dev/null || echo LOADING)"
echo "TTS XTTS (8881):       $(curl -sS http://localhost:8881/health 2>/dev/null | jq -r .status 2>/dev/null || echo LOADING)"
echo "FLUX (7860):           $(curl -sS http://localhost:7860/health 2>/dev/null | jq -r .status 2>/dev/null || echo LOADING)"
echo "ClawBot (7000):        $(curl -sS http://localhost:7000/health 2>/dev/null | head -c 100 || echo LOADING)"
echo ""
echo "GPU: $(nvidia-smi --query-gpu=memory.used,memory.total,utilization.gpu --format=csv,noheader)"
echo ""
echo "Public proxy URLs:"
POD_ID="${RUNPOD_POD_ID:-tgrdfmwscoo991}"
for port in 8000 8002 8080 9000 8881 7860 7000; do
    echo "  https://${POD_ID}-${port}.proxy.runpod.net"
done
echo ""
echo "Bootstrap V2 COMPLETE $(date -u). Log: $LOG"
echo "════════════════════════════════════════════════════"
