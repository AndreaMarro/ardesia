#!/bin/bash
# ELAB RunPod Resume — wake pod, models cached on volume
# Sprint S iter 1 — 2026-04-26
# Usage: bash scripts/runpod-resume.sh <pod_id>
# Boot time ~2min (models already on /workspace volume).

set -euo pipefail
POD_ID="${1:-${ELAB_RUNPOD_POD_ID:-}}"
[ -z "$POD_ID" ] && { echo "Usage: $0 <pod_id> OR export ELAB_RUNPOD_POD_ID=..."; exit 1; }
[ -z "${RUNPOD_API_KEY:-}" ] && source ~/.elab-credentials/sprint-s-tokens.env

curl -sS -X POST "https://api.runpod.io/graphql" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $RUNPOD_API_KEY" \
    -d "$(jq -n --arg id "$POD_ID" '{"query":("mutation { podResume(input:{podId:\"" + $id + "\", gpuCount:1}) { id desiredStatus } }")}')" \
    | python3 -m json.tool

echo ""
echo "Pod $POD_ID resuming. Wait ~2min for SSH + services."
echo "Status: bash scripts/runpod-status.sh $POD_ID"
