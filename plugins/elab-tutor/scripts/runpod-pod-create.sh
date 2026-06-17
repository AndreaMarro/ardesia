#!/bin/bash
# ELAB RunPod Trial — Pod Creation via REST API
# Sprint S iter 1 — 2026-04-26
#
# Creates on-demand RunPod GPU pod for ELAB stack v3 trial.
# Stack: Qwen3-VL + BGE-M3 + bge-reranker + Coqui XTTS-v2 + Whisper Turbo
#
# Usage (MacBook):
#   export RUNPOD_API_KEY="..."   # from RunPod console -> Settings -> API Keys
#   bash scripts/runpod-pod-create.sh [gpu_type]
#
# gpu_type options:
#   "RTX 6000 Ada"  (default, 48GB VRAM, ~$0.79/h, fits Qwen3-VL-32B full stack)
#   "RTX A6000"     (Ampere, 48GB, ~$0.49/h, slightly slower, -38% cost)
#   "RTX 4090"      (24GB, ~$0.34/h, only Qwen-8B + minimal stack)
#   "H100 80GB"     (~$2.39/h, max performance)
#
# (c) Andrea Marro — Sprint S iter 1

set -euo pipefail

GPU_TYPE="${1:-RTX 6000 Ada}"
POD_NAME="elab-trial-$(date +%Y%m%d-%H%M%S)"
DISK_GB=80
VOLUME_GB=50

if [ -z "${RUNPOD_API_KEY:-}" ]; then
    echo "ERROR: RUNPOD_API_KEY env var not set."
    echo "Get key: runpod.io/console/user/settings -> API Keys -> Create"
    echo "Then: export RUNPOD_API_KEY=\"...\""
    exit 1
fi

# Map friendly name -> RunPod gpuTypeId (verify via API in production)
case "$GPU_TYPE" in
    "RTX 6000 Ada") GPU_TYPE_ID="NVIDIA RTX 6000 Ada Generation" ;;
    "RTX A6000")    GPU_TYPE_ID="NVIDIA RTX A6000" ;;
    "RTX 4090")     GPU_TYPE_ID="NVIDIA GeForce RTX 4090" ;;
    "H100 80GB")    GPU_TYPE_ID="NVIDIA H100 80GB HBM3" ;;
    *) echo "ERROR: unknown gpu_type '$GPU_TYPE'"; exit 1 ;;
esac

echo "════════════════════════════════════════════════════════════"
echo "ELAB RunPod Trial Pod Create"
echo "Pod name:    $POD_NAME"
echo "GPU type:    $GPU_TYPE ($GPU_TYPE_ID)"
echo "Disk:        ${DISK_GB}GB container + ${VOLUME_GB}GB persistent volume"
echo "Image:       runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04"
echo "════════════════════════════════════════════════════════════"

# RunPod GraphQL API (REST also available at rest.runpod.io/v1)
GRAPHQL_QUERY=$(cat <<EOF
mutation {
  podFindAndDeployOnDemand(
    input: {
      cloudType: SECURE
      gpuCount: 1
      volumeInGb: $VOLUME_GB
      containerDiskInGb: $DISK_GB
      minVcpuCount: 8
      minMemoryInGb: 32
      gpuTypeId: "$GPU_TYPE_ID"
      name: "$POD_NAME"
      imageName: "runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04"
      dockerArgs: "bash -c 'sleep infinity'"
      ports: "8000/http,11434/http,8080/http,8081/http,8881/http,9000/http,22/tcp"
      volumeMountPath: "/workspace"
      env: [
        { key: "OLLAMA_HOST", value: "0.0.0.0:11434" }
        { key: "HF_HOME", value: "/workspace/.cache/huggingface" }
      ]
    }
  ) {
    id
    machineId
    desiredStatus
    machine { podHostId }
  }
}
EOF
)

JSON_BODY=$(jq -n --arg q "$GRAPHQL_QUERY" '{query: $q}')

echo ""
echo "Creating pod via RunPod API..."
RESPONSE=$(curl -sS -X POST "https://api.runpod.io/graphql" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $RUNPOD_API_KEY" \
    -d "$JSON_BODY")

echo ""
echo "Response:"
echo "$RESPONSE" | jq .

POD_ID=$(echo "$RESPONSE" | jq -r '.data.podFindAndDeployOnDemand.id // empty')

if [ -z "$POD_ID" ]; then
    echo ""
    echo "ERROR: pod creation failed. Check response above."
    echo "Common issues:"
    echo "  - GPU type unavailable in selected region (try: RTX A6000 or RTX 4090)"
    echo "  - Insufficient credit (add at runpod.io/console/billing)"
    echo "  - API key permissions (check Settings -> API Keys -> scope)"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "POD CREATED: $POD_ID"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Save Pod ID for next steps:"
echo "  export ELAB_RUNPOD_POD_ID=\"$POD_ID\""
echo ""
echo "Wait ~2 min for pod ready, then:"
echo "  - SSH:        runpodctl ssh $POD_ID"
echo "  - Web shell:  runpod.io/console/pods/$POD_ID"
echo "  - HTTP proxy: https://$POD_ID-8000.proxy.runpod.net (per port)"
echo ""
echo "Next: bash scripts/runpod-deploy-stack.sh   # runs INSIDE pod"
echo ""
echo "Cost meter: ~\$0.79/h ($GPU_TYPE) — STOP pod when done!"
echo "  Stop:     runpodctl stop pod $POD_ID    (storage \$0.10/GB/mo persists)"
echo "  Terminate: runpodctl remove pod $POD_ID  (deletes volume)"
echo "════════════════════════════════════════════════════════════"
