#!/bin/bash
# ELAB RunPod Status — pod state + costs + endpoints
# Sprint S iter 1 — 2026-04-26
# Usage: bash scripts/runpod-status.sh [pod_id]

set -euo pipefail
POD_ID="${1:-${ELAB_RUNPOD_POD_ID:-}}"
[ -z "${RUNPOD_API_KEY:-}" ] && source ~/.elab-credentials/sprint-s-tokens.env

if [ -z "$POD_ID" ]; then
    # List all pods for this account
    curl -sS -X POST "https://api.runpod.io/graphql" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $RUNPOD_API_KEY" \
        -d '{"query":"query { myself { pods { id name desiredStatus machine { gpuDisplayName } costPerHr } } }"}' \
        | python3 -m json.tool
    exit 0
fi

curl -sS -X POST "https://api.runpod.io/graphql" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $RUNPOD_API_KEY" \
    -d "$(jq -n --arg id "$POD_ID" '{"query":("query { pod(input:{podId:\"" + $id + "\"}) { id name desiredStatus costPerHr machine { gpuDisplayName } runtime { uptimeInSeconds ports { ip isIpPublic privatePort publicPort type } } } }")}')" \
    | python3 -m json.tool
