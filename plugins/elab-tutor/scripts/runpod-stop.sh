#!/bin/bash
# ELAB RunPod Stop — pause pod for cost savings
# Sprint S iter 1 — 2026-04-26
# Usage: bash scripts/runpod-stop.sh <pod_id>
# Volume persists at $0.20/GB/mo (~$0.33/mo for 50GB).

set -euo pipefail
POD_ID="${1:-${ELAB_RUNPOD_POD_ID:-}}"
[ -z "$POD_ID" ] && { echo "Usage: $0 <pod_id> OR export ELAB_RUNPOD_POD_ID=..."; exit 1; }
[ -z "${RUNPOD_API_KEY:-}" ] && source ~/.elab-credentials/sprint-s-tokens.env

curl -sS -X POST "https://api.runpod.io/graphql" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $RUNPOD_API_KEY" \
    -d "$(jq -n --arg id "$POD_ID" '{"query":("mutation { podStop(input:{podId:\"" + $id + "\"}) { id desiredStatus } }")}')" \
    | python3 -m json.tool

echo ""
echo "Pod $POD_ID stopped. Storage cost ~\$0.33/mo (50GB × \$0.20/GB/mo)."
echo "Resume: bash scripts/runpod-resume.sh $POD_ID"
