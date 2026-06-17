#!/bin/bash
# ELAB VPS GPU Trial — Scaleway L4 FR Deploy Script
# Usage: SSH into fresh Scaleway L4 24GB FR VPS as root, then:
#   curl -fsSL <this-url> | bash
# OR scp this file + bash vps-gpu-trial-scaleway.sh
#
# Goal: deploy Qwen3-VL-8B + BGE-M3 + Coqui XTTS-v2 + Whisper Turbo
# Trial duration: 4-6h, cost €3.40-€5
# Output: bench results vs Gemini Flash, decision GO/NO-GO Hetzner mensile
#
# Prerequisites Andrea side:
# - Scaleway L4 FR VPS provisioned (Ubuntu 22.04, 200GB SSD, 96GB RAM)
# - SSH access via Scaleway console-injected key OR id_ed25519_elab from MacBook (.scw key)
# - Cloudflare account ready for tunnel (optional Sprint VPS-1)
#
# (c) Andrea Marro — Sprint VPS-1 — 2026-04-26

set -euo pipefail

LOG_FILE="/var/log/elab-vps-trial-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "════════════════════════════════════════════════════════════"
echo "ELAB VPS GPU Trial — Scaleway L4 FR Deploy"
echo "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Log: $LOG_FILE"
echo "════════════════════════════════════════════════════════════"

# ────────────────────────────────────────────────────────────
# Step 1: System update + base tools
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 1] System update + base tools (~2 min)"

export DEBIAN_FRONTEND=noninteractive
apt update -qq
apt upgrade -y -qq
apt install -y -qq \
    curl wget git htop nvtop tmux vim \
    ca-certificates gnupg lsb-release \
    python3 python3-pip python3-venv \
    jq yq

# ────────────────────────────────────────────────────────────
# Step 2: NVIDIA driver verification
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 2] NVIDIA driver verification"

if ! command -v nvidia-smi &> /dev/null; then
    echo "ERROR: nvidia-smi not found. Scaleway L4 should have driver pre-installed."
    echo "Install manually: apt install nvidia-driver-535"
    exit 1
fi

nvidia-smi --query-gpu=name,memory.total,driver_version,cuda_version --format=csv

# Verify GPU is L4 24GB
GPU_MEM=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -1)
if [ "$GPU_MEM" -lt "20000" ]; then
    echo "WARNING: GPU memory $GPU_MEM MiB < expected 24GB. Verify L4 instance."
fi

# ────────────────────────────────────────────────────────────
# Step 3: Docker + NVIDIA Container Toolkit
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 3] Docker + NVIDIA Container Toolkit (~3 min)"

# Docker
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# NVIDIA Container Toolkit
distribution=$(. /etc/os-release; echo $ID$VERSION_ID)
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

apt update -qq
apt install -y -qq nvidia-container-toolkit
systemctl restart docker

# Verify GPU accessible from Docker
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi || {
    echo "ERROR: Docker cannot access GPU"
    exit 1
}

# ────────────────────────────────────────────────────────────
# Step 4: ELAB stack workspace
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 4] ELAB stack workspace setup"

mkdir -p /opt/elab-vps/{config,data/ollama,data/whisper,data/coqui,data/bge,data/qwen}
cd /opt/elab-vps

# Generate API key
ELAB_GPU_API_KEY=$(openssl rand -hex 32)
echo "ELAB_GPU_API_KEY=$ELAB_GPU_API_KEY" > .env
echo ""
echo "════════════════════════════════════════════════════════════"
echo "API KEY GENERATED (save this in Andrea password manager):"
echo "$ELAB_GPU_API_KEY"
echo "════════════════════════════════════════════════════════════"
echo ""

# ────────────────────────────────────────────────────────────
# Step 5: Docker Compose stack file
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 5] Write docker-compose.yml"

cat > /opt/elab-vps/docker-compose.yml << 'COMPOSE_EOF'
version: '3.8'

services:
  # Primary unified VLM+LLM: Qwen3-VL-8B (Italian + vision)
  ollama:
    image: ollama/ollama:latest
    container_name: elab-ollama
    restart: unless-stopped
    volumes:
      - ./data/ollama:/root/.ollama
    ports:
      - "127.0.0.1:11434:11434"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Embeddings: BGE-M3 multilingual (1024-dim dense + sparse + multi-vector)
  bge-embeddings:
    image: ghcr.io/huggingface/text-embeddings-inference:1.5
    container_name: elab-bge
    restart: unless-stopped
    command: --model-id=BAAI/bge-m3 --port=8080 --max-batch-tokens=16384
    ports:
      - "127.0.0.1:8080:8080"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # Reranker: bge-reranker-large for cross-encoder rerank
  bge-reranker:
    image: ghcr.io/huggingface/text-embeddings-inference:1.5
    container_name: elab-reranker
    restart: unless-stopped
    command: --model-id=BAAI/bge-reranker-large --port=8081
    ports:
      - "127.0.0.1:8081:8081"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # TTS: Coqui XTTS-v2 (Italian + voice cloning)
  coqui-tts:
    image: ghcr.io/coqui-ai/tts-cuda:latest
    container_name: elab-tts
    restart: unless-stopped
    environment:
      - COQUI_TOS_AGREED=1
    volumes:
      - ./data/coqui:/root/.local/share/tts
    ports:
      - "127.0.0.1:8881:8000"
    command: |
      tts-server --model_name "tts_models/multilingual/multi-dataset/xtts_v2" \
                 --port 8000

  # STT: Whisper Turbo (multilingual)
  whisper:
    image: onerahmet/openai-whisper-asr-webservice:latest
    container_name: elab-whisper
    restart: unless-stopped
    environment:
      - ASR_MODEL=turbo
      - ASR_ENGINE=faster_whisper
    ports:
      - "127.0.0.1:9000:9000"

  # API gateway: nginx with auth
  nginx-gateway:
    image: nginx:alpine
    container_name: elab-gateway
    restart: unless-stopped
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "127.0.0.1:9443:9443"
    environment:
      - ELAB_GPU_API_KEY=${ELAB_GPU_API_KEY}
    depends_on:
      - ollama
      - bge-embeddings
      - bge-reranker
      - coqui-tts
      - whisper
COMPOSE_EOF

# ────────────────────────────────────────────────────────────
# Step 6: nginx config
# ────────────────────────────────────────────────────────────
echo "[STEP 6] Write nginx.conf"

cat > /opt/elab-vps/config/nginx.conf << 'NGINX_EOF'
worker_processes auto;
events { worker_connections 1024; }

http {
    upstream ollama { server elab-ollama:11434; }
    upstream bge { server elab-bge:8080; }
    upstream reranker { server elab-reranker:8081; }
    upstream tts { server elab-tts:8000; }
    upstream stt { server elab-whisper:9000; }

    log_format elab '$remote_addr - $request_time - "$request" $status';

    server {
        listen 9443;
        server_name _;
        access_log /var/log/nginx/elab.log elab;

        # Auth check (shared API key)
        if ($http_x_elab_api_key = "") { return 401; }
        # Note: nginx doesn't compare env vars at request time without lua;
        # rely on iptables/CF-Tunnel for transport security + Edge Function
        # validates X-Elab-Api-Key header upstream

        location /chat {
            proxy_pass http://ollama/api/generate;
            proxy_buffering off;
            proxy_read_timeout 60s;
        }

        location /v1/chat/completions {
            proxy_pass http://ollama/v1/chat/completions;
            proxy_buffering off;
            proxy_read_timeout 60s;
        }

        location /embed {
            proxy_pass http://bge/embed;
        }

        location /rerank {
            proxy_pass http://reranker/rerank;
        }

        location /tts {
            proxy_pass http://tts/api/tts;
        }

        location /stt {
            proxy_pass http://stt/asr;
        }

        location /health {
            return 200 '{"status":"ok","stack":"elab-vps-gpu-trial"}\n';
            add_header Content-Type application/json;
        }
    }
}
NGINX_EOF

# ────────────────────────────────────────────────────────────
# Step 7: Pull images + start stack
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 7] Pull Docker images (~5 min for ~15GB total)"

cd /opt/elab-vps
docker compose pull

echo ""
echo "[STEP 7b] Start stack"
docker compose up -d

echo "Waiting 30s for services to initialize..."
sleep 30

# ────────────────────────────────────────────────────────────
# Step 8: Pull Ollama models
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 8] Pull Qwen3-VL-8B + Qwen3 14B fallback (~30 min, ~12GB)"

# Primary: Qwen3-VL-8B (unified VLM+LLM, Italian)
docker exec elab-ollama ollama pull qwen3-vl:8b || {
    echo "WARN: qwen3-vl:8b not yet on Ollama hub, fallback to qwen2.5-vl:7b"
    docker exec elab-ollama ollama pull qwen2.5-vl:7b
}

# Fallback: Qwen 3 14B text-only
docker exec elab-ollama ollama pull qwen3:14b || {
    echo "WARN: qwen3:14b fallback to qwen2.5:14b"
    docker exec elab-ollama ollama pull qwen2.5:14b
}

# ────────────────────────────────────────────────────────────
# Step 9: Health check all endpoints
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 9] Health check endpoints"

echo "  - nginx gateway: $(curl -s http://localhost:9443/health | jq .status 2>/dev/null || echo FAIL)"
echo "  - ollama: $(curl -s http://localhost:11434/api/tags | jq '.models | length' 2>/dev/null || echo FAIL) models"
echo "  - bge embeddings: $(curl -s http://localhost:8080/health 2>/dev/null && echo OK || echo FAIL)"
echo "  - reranker: $(curl -s http://localhost:8081/health 2>/dev/null && echo OK || echo FAIL)"
echo "  - coqui TTS: $(curl -s http://localhost:8881/api/tts -X POST -H 'Content-Type: application/json' -d '{}' 2>/dev/null | head -c 50 || echo CHECK_LATER)"
echo "  - whisper: $(curl -s http://localhost:9000/asr -X POST 2>/dev/null | head -c 50 || echo CHECK_LATER)"

# ────────────────────────────────────────────────────────────
# Step 10: Smoke test inference
# ────────────────────────────────────────────────────────────
echo ""
echo "[STEP 10] Smoke test Qwen Italian inference"

QWEN_RESPONSE=$(curl -s -X POST http://localhost:11434/api/generate \
    -H "Content-Type: application/json" \
    -d '{"model":"qwen2.5-vl:7b","prompt":"Cosa è un LED? Risposta in 2 frasi italiano per ragazzi 12 anni.","stream":false}' \
    | jq -r .response 2>/dev/null)

echo ""
echo "Qwen response (Italian test):"
echo "$QWEN_RESPONSE"
echo ""

# ────────────────────────────────────────────────────────────
# Step 11: Benchmark output summary
# ────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════"
echo "ELAB VPS GPU Trial Setup COMPLETE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Services running on localhost:"
echo "  - Gateway: http://localhost:9443/health"
echo "  - Ollama (LLM+VLM): http://localhost:11434"
echo "  - BGE Embeddings: http://localhost:8080"
echo "  - BGE Reranker: http://localhost:8081"
echo "  - Coqui TTS: http://localhost:8881"
echo "  - Whisper STT: http://localhost:9000"
echo ""
echo "API key for ELAB integration: $ELAB_GPU_API_KEY"
echo "(Save this in Andrea password manager AND Supabase env ELAB_GPU_API_KEY)"
echo ""
echo "Next steps for trial:"
echo "  1. Run benchmark: bash benchmark.sh (TODO: write benchmark script)"
echo "  2. Compare latency vs Gemini Flash"
echo "  3. Compare Italian quality (5 prompts ELAB tutor)"
echo "  4. Test TTS Italian voice quality"
echo "  5. Test BGE-M3 embeddings on 549 RAG chunks"
echo "  6. Decide GO/NO-GO Hetzner GEX130 mensile (€838/mo OR €1.34/h hourly)"
echo ""
echo "Trial cost: monitor Scaleway billing (~€0.85/h, ~€5 for 6h)"
echo "Cleanup post-trial: docker compose down + Scaleway terminate VPS"
echo ""
echo "Log saved: $LOG_FILE"
echo "════════════════════════════════════════════════════════════"
