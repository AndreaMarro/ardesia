#!/usr/bin/env bash
# guard-deploy-unlim-chat — PreToolUse hook block deploy unlim-chat senza --no-verify-jwt
# Created: 2026-05-16 iter 67 PHASE 4 (prevent regression iter 67 PHASE 2 401 warmup_cron)
# Root cause: redeploy `supabase functions deploy unlim-chat` SENZA `--no-verify-jwt` → Gateway verify_jwt=true default reset → cron pg_net 401
# Fix: this hook blocks deploy command + asks confirmation if --no-verify-jwt missing
#
# Hook contract (PreToolUse):
# - reads JSON from stdin: {"tool_input":{"command":"..."}}
# - returns JSON to stdout: {"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny|ask|allow","permissionDecisionReason":"..."}}
# - exit 0 = decision honored
# - timeout 5s

set -euo pipefail

# Read tool_input.command from stdin JSON
COMMAND=$(cat | jq -r '.tool_input.command // empty' 2>/dev/null)

# Check if command contains supabase functions deploy unlim-chat
if [[ "$COMMAND" =~ supabase.*functions.*deploy.*unlim-chat ]]; then
  # Check if --no-verify-jwt flag present
  if [[ "$COMMAND" =~ --no-verify-jwt ]]; then
    # Flag present — allow
    echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"DEPLOY OK: --no-verify-jwt flag present (warmup_cron compat verified iter 67 PHASE 3)"}}'
  else
    # Flag MISSING — block + warn (iter 67 PHASE 2 regression prevention)
    echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"WARNING: deploy unlim-chat SENZA --no-verify-jwt flag → CAUSA warmup_cron 401 regression iter 67 PHASE 2 (24+ wasted invocations/30s)! Aggiungi --no-verify-jwt OPPURE conferma SE intenzionale (es. canary infra ratify Andrea iter 68+ dedicated)."}}'
  fi
else
  # Not a deploy unlim-chat command — allow
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
fi
