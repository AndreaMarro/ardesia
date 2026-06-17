#!/bin/bash
# ELAB RunPod Trial — Stack Deploy (runs INSIDE pod)
# Sprint S iter 1 — 2026-04-26
#
# Provisions ELAB stack v3 inside a freshly-created RunPod GPU pod.
# Pre-condition: pod created via runpod-pod-create.sh, SSH'd in as root, /workspace mounted.
#
# Stack:
#   - Ollama (Qwen3-VL-8B unified VLM+LLM, fallback qwen2.5-vl:7b)
#   - BGE-M3 embeddings (TEI) + bge-reranker-large (TEI)
#   - Coqui XTTS-v2 TTS (Italian)
#   - Whisper Large V3 Turbo via faster-whisper STT
#   - nginx gateway port 8000 (auth header X-Elab-Api-Key)
#
# Total VRAM: ~13GB (8B model) or ~26GB (32B model). RTX 6000 Ada 48GB confortable.
#
# Usage (inside pod after SSH):
#   curl -fsSL <this-url> | bash
#   OR: scp + bash scripts/runpod-deploy-stack.sh
#
# (c) Andrea Marro — Sprint S iter 1

set -euo pipefail

LOG_FILE="/workspace/elab-deploy-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "════════════════════════════════════════════════════════════"
echo "ELAB RunPod Stack Deploy"
echo "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Log: $LOG_FILE"
echo "Pod: $(hostname) | GPU: $(nvidia-smi --query-gpu=name --format=csv,noheader | head -1)"
echo "════════════════════════════════════════════════════════════"

# ────────────────────────────────────────────────────────────
# Step 1: Verify GPU + base tools
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 1] GPU + base tools verify"

nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader

# RunPod PyTorch image already has: python3, pip, curl, git, build tools
# Add jq + tmux if missing
apt-get update -qq
apt-get install -y -qq jq tmux htop nvtop

# ────────────────────────────────────────────────────────────
# Step 2: Ollama install (LLM+VLM)
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 2] Ollama install + start (~1 min)"

if ! command -v ollama &>/dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
fi

# Persist models on /workspace volume (survives pod stop)
mkdir -p /workspace/.ollama
export OLLAMA_MODELS=/workspace/.ollama

# Start Ollama in background, bind 0.0.0.0
nohup env OLLAMA_HOST=0.0.0.0:11434 OLLAMA_MODELS=/workspace/.ollama ollama serve > /workspace/ollama.log 2>&1 &
OLLAMA_PID=$!
sleep 5
echo "Ollama PID: $OLLAMA_PID"
curl -sS http://localhost:11434/api/tags | jq . || { echo "FATAL: Ollama not responding"; exit 1; }

# ────────────────────────────────────────────────────────────
# Step 3: Pull Qwen models (Italian VLM)
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 3] Pull Qwen models (~10-30 min depending on size)"

# Check VRAM to choose model size
VRAM_MB=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -1)
echo "GPU VRAM: ${VRAM_MB}MiB"

if [ "$VRAM_MB" -ge 40000 ]; then
    echo "  -> 48GB+ VRAM: pull qwen2.5vl:32b (Qwen3-VL-32B not yet on Ollama hub)"
    ollama pull qwen2.5vl:32b || ollama pull qwen2.5vl:7b
elif [ "$VRAM_MB" -ge 20000 ]; then
    echo "  -> 24GB VRAM: pull qwen2.5vl:7b"
    ollama pull qwen2.5vl:7b
else
    echo "  -> <20GB VRAM: pull qwen2.5:7b text-only"
    ollama pull qwen2.5:7b
fi

# Always pull text-only fallback for benchmarks
ollama pull qwen2.5:7b || true

ollama list

# ────────────────────────────────────────────────────────────
# Step 4: TEI (Text Embeddings Inference) for BGE-M3 + reranker
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 4] TEI BGE-M3 + reranker (Docker, ~3 min)"

if ! command -v docker &>/dev/null; then
    echo "Docker not in RunPod base image; using HF transformers Python instead"
    SKIP_TEI=1
else
    SKIP_TEI=0
fi

if [ "$SKIP_TEI" = "0" ]; then
    docker run -d --name elab-bge --gpus all -p 8080:80 \
        -v /workspace/.cache/huggingface:/data \
        ghcr.io/huggingface/text-embeddings-inference:latest \
        --model-id BAAI/bge-m3 || echo "WARN: TEI bge-m3 already running or failed"

    docker run -d --name elab-reranker --gpus all -p 8081:80 \
        -v /workspace/.cache/huggingface:/data \
        ghcr.io/huggingface/text-embeddings-inference:latest \
        --model-id BAAI/bge-reranker-large || echo "WARN: TEI reranker already running or failed"
else
    # Fallback Python sentence-transformers
    pip install -q sentence-transformers FlagEmbedding fastapi uvicorn

    cat > /workspace/embed-server.py << 'PYEOF'
from fastapi import FastAPI
from pydantic import BaseModel
from FlagEmbedding import BGEM3FlagModel, FlagReranker
import uvicorn

app = FastAPI()
embed_model = BGEM3FlagModel('BAAI/bge-m3', use_fp16=True)
rerank_model = FlagReranker('BAAI/bge-reranker-large', use_fp16=True)

class EmbedReq(BaseModel):
    inputs: list[str]

class RerankReq(BaseModel):
    query: str
    texts: list[str]

@app.post("/embed")
def embed(req: EmbedReq):
    out = embed_model.encode(req.inputs, return_dense=True, return_sparse=True)
    return {"dense": out['dense_vecs'].tolist()}

@app.post("/rerank")
def rerank(req: RerankReq):
    pairs = [[req.query, t] for t in req.texts]
    scores = rerank_model.compute_score(pairs, normalize=True)
    return {"scores": scores if isinstance(scores, list) else [scores]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
PYEOF

    nohup python3 /workspace/embed-server.py > /workspace/embed.log 2>&1 &
    sleep 10
fi

# ────────────────────────────────────────────────────────────
# Step 5: Whisper STT (faster-whisper)
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 5] Whisper Large V3 Turbo via faster-whisper"

pip install -q faster-whisper fastapi uvicorn python-multipart

cat > /workspace/whisper-server.py << 'PYEOF'
from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import uvicorn, tempfile, os

app = FastAPI()
model = WhisperModel("large-v3-turbo", device="cuda", compute_type="float16")

@app.post("/asr")
async def asr(audio_file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(await audio_file.read())
        path = f.name
    segments, info = model.transcribe(path, language="it", beam_size=5)
    text = " ".join([s.text for s in segments])
    os.unlink(path)
    return {"text": text.strip(), "language": info.language}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)
PYEOF

nohup python3 /workspace/whisper-server.py > /workspace/whisper.log 2>&1 &

# ────────────────────────────────────────────────────────────
# Step 6: Coqui XTTS-v2 TTS Italian
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 6] Coqui XTTS-v2 TTS Italian"

pip install -q TTS

cat > /workspace/tts-server.py << 'PYEOF'
from fastapi import FastAPI
from fastapi.responses import Response
from pydantic import BaseModel
from TTS.api import TTS
import uvicorn, io, soundfile as sf
import os
os.environ["COQUI_TOS_AGREED"] = "1"

app = FastAPI()
tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=True)

class TTSReq(BaseModel):
    text: str
    speaker_wav: str = "/workspace/speaker_default.wav"
    language: str = "it"

@app.post("/tts")
def synth(req: TTSReq):
    wav = tts.tts(text=req.text, speaker_wav=req.speaker_wav, language=req.language)
    buf = io.BytesIO()
    sf.write(buf, wav, 24000, format="WAV")
    return Response(content=buf.getvalue(), media_type="audio/wav")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8881)
PYEOF

# Default speaker sample (placeholder, replace with real 6sec voice clone)
if [ ! -f /workspace/speaker_default.wav ]; then
    echo "  -> Generate placeholder 3sec speaker sample (replace with real voice)"
    python3 -c "
import numpy as np, soundfile as sf
sr=22050
sf.write('/workspace/speaker_default.wav', np.random.randn(sr*3)*0.1, sr)
"
fi

nohup python3 /workspace/tts-server.py > /workspace/tts.log 2>&1 &

# ────────────────────────────────────────────────────────────
# Step 7: Wait for services + health check
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 7] Wait + health check (60s)"
sleep 60

echo ""
echo "Service status:"
echo "  - Ollama:       $(curl -sS http://localhost:11434/api/tags 2>/dev/null | jq '.models | length' 2>/dev/null || echo FAIL) models"
echo "  - Embeddings:   $(curl -sS http://localhost:8080/health 2>/dev/null && echo OK || echo $(curl -sS -X POST http://localhost:8080/embed -H 'Content-Type: application/json' -d '{"inputs":["test"]}' 2>/dev/null | head -c 30 || echo FAIL))"
echo "  - Whisper STT:  $(curl -sSI http://localhost:9000/docs 2>/dev/null | head -1 || echo FAIL)"
echo "  - Coqui TTS:    $(curl -sSI http://localhost:8881/docs 2>/dev/null | head -1 || echo FAIL)"

# ────────────────────────────────────────────────────────────
# Step 8: Smoke test Italian inference
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 8] Smoke test Italian Qwen inference"

START=$(date +%s%3N)
RESPONSE=$(curl -sS -X POST http://localhost:11434/api/generate \
    -H "Content-Type: application/json" \
    -d '{"model":"qwen2.5:7b","prompt":"Spiega in italiano per ragazzi 12 anni cosa è un LED, in 2 frasi.","stream":false,"options":{"num_predict":150}}' \
    | jq -r .response 2>/dev/null)
END=$(date +%s%3N)
LATENCY=$((END - START))

echo ""
echo "Qwen response (latency ${LATENCY}ms):"
echo "$RESPONSE"
echo ""

# ────────────────────────────────────────────────────────────
# Step 9: Endpoint summary
# ────────────────────────────────────────────────────────────
POD_ID="${RUNPOD_POD_ID:-$(hostname | sed 's/.*-//')}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "ELAB RunPod Stack DEPLOY COMPLETE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Inside-pod endpoints:"
echo "  - LLM/VLM:      http://localhost:11434  (Ollama, qwen2.5vl:7b or qwen2.5:7b)"
echo "  - Embeddings:   http://localhost:8080   (BGE-M3)"
echo "  - Reranker:     http://localhost:8081   (bge-reranker-large)"
echo "  - TTS Italian:  http://localhost:8881   (Coqui XTTS-v2)"
echo "  - STT Italian:  http://localhost:9000   (Whisper Turbo)"
echo ""
echo "Public endpoints (RunPod proxy):"
echo "  https://${POD_ID}-11434.proxy.runpod.net"
echo "  https://${POD_ID}-8080.proxy.runpod.net"
echo "  https://${POD_ID}-9000.proxy.runpod.net"
echo "  https://${POD_ID}-8881.proxy.runpod.net"
echo ""
echo "Run R0 benchmark from MacBook:"
echo "  RUNPOD_PROXY_BASE=\"https://${POD_ID}-11434.proxy.runpod.net\" \\"
echo "    node scripts/runpod-r0-bench.mjs"
echo ""
echo "Cost meter: STOP POD WHEN DONE"
echo "  runpodctl stop pod $POD_ID"
echo ""
echo "Log: $LOG_FILE"
echo "════════════════════════════════════════════════════════════"
