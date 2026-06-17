#!/usr/bin/env bash
# Verify Supabase Edge Function reachable with canonical JWT auth pattern.
# Usage: bash scripts/cli-autonomous/verify-edge-function.sh [function_name]
# Default function: unlim-chat
# Env: SUPABASE_ANON_KEY required (public key, client-safe)
# ADR reference: docs/architectures/ADR-003-jwt-401-edge-function-auth.md

set -euo pipefail

FN="${1:-unlim-chat}"
PROJECT_REF="${SUPABASE_PROJECT_REF:-euqpdueopmlllqjmqnyb}"
URL="https://${PROJECT_REF}.supabase.co/functions/v1/${FN}"

if [[ -z "${SUPABASE_ANON_KEY:-}" ]]; then
  echo "[verify-edge-function] ERROR: SUPABASE_ANON_KEY env var not set" >&2
  echo "[verify-edge-function] Set it in .env.local or shell before running." >&2
  exit 2
fi

PAYLOAD='{"message":"ping — verify-edge-function smoke"}'

HTTP_CODE=$(curl -s -o /tmp/verify-edge-fn-body.txt -w "%{http_code}" \
  -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d "$PAYLOAD" \
  --max-time 20)

echo "[verify-edge-function] function=$FN http=$HTTP_CODE"

if [[ "$HTTP_CODE" == "200" ]]; then
  echo "[verify-edge-function] PASS — body first 200 chars:"
  head -c 200 /tmp/verify-edge-fn-body.txt
  echo ""
  exit 0
else
  echo "[verify-edge-function] FAIL — body:"
  cat /tmp/verify-edge-fn-body.txt
  exit 1
fi
