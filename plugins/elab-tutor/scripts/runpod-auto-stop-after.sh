#!/bin/bash
# ELAB RunPod Auto-Stop after task completion — max cost saving discipline
# Sprint S iter 1 — 2026-04-26
#
# Usage:
#   bash scripts/runpod-auto-stop-after.sh <pod_id> <success_marker_file_on_pod>
# Example:
#   bash scripts/runpod-auto-stop-after.sh felby5z84fk3ly /workspace/.bench-done
#
# Polls pod for marker file. When found, stops pod (container exits, volume persists).

set -euo pipefail
POD_ID="${1:?need pod_id}"
MARKER="${2:-/workspace/.task-done}"
SSH_HOST="${POD_SSH_HOST:?need POD_SSH_HOST}"
SSH_PORT="${POD_SSH_PORT:?need POD_SSH_PORT}"

[ -z "${RUNPOD_API_KEY:-}" ] && source ~/.elab-credentials/sprint-s-tokens.env

echo "Watching pod $POD_ID for marker $MARKER..."
START=$(date +%s)
until ssh -o BatchMode=yes -o ConnectTimeout=5 -i ~/.ssh/id_ed25519_runpod \
    root@$SSH_HOST -p $SSH_PORT "test -f $MARKER" 2>/dev/null; do
    NOW=$(date +%s)
    ELAPSED=$((NOW - START))
    echo "  [$(date +%H:%M:%S)] waiting... (${ELAPSED}s elapsed, ~\$$(echo "scale=2; $ELAPSED * 0.74 / 3600" | bc)/cost)"
    sleep 60
done

echo ""
echo "Marker found. Stopping pod $POD_ID..."
curl -sS -X POST "https://api.runpod.io/graphql" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $RUNPOD_API_KEY" \
    -d "$(jq -n --arg id "$POD_ID" '{"query":("mutation { podStop(input:{podId:\"" + $id + "\"}) { id desiredStatus } }")}')" \
    | python3 -m json.tool

echo ""
echo "Pod stopped. Storage cost ~\$0.33/mo (50GB)."
